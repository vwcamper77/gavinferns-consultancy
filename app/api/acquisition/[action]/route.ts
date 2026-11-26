import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { asObject, parseApplication, publicEvents, uuid } from "@/lib/acquisition";
import { activeCampaign } from "@/lib/campaigns";
import { acquisitionEnabled, attributionEnabled } from "@/lib/sales-config";
import { database, transaction } from "@/lib/sales-db";
import { deliverMail, secretMatches, sendMetaLead } from "@/lib/sales-integrations";
import { createLead, updateStage } from "@/lib/sales-leads";
import { readJson, sameOrigin, withinIdentifierLimit, withinLimit } from "@/lib/sales-security";

type Context = { params: Promise<{ action: string }> };
const response = (status: number, error?: string) => NextResponse.json(error ? { error } : { ok: true }, { status });

async function calendly(request: Request) {
  const secret = process.env.CALENDLY_WEBHOOK_SECRET;
  if (!secret) return response(404, "Unavailable");
  const entries = Object.fromEntries((request.headers.get("calendly-webhook-signature") ?? "").split(",").map((item) => item.trim().split("=")));
  const timestamp = Number(entries.t);
  if (!Number.isSafeInteger(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300 || !entries.v1) return response(401, "Invalid signature");
  // Bound the signed payload without re-serialising the request.
  const reader = request.body?.getReader();
  if (!reader) return response(400, "Invalid body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 64000) { await reader.cancel(); return response(413, "Invalid body"); }
    chunks.push(value);
  }
  const raw = Buffer.concat(chunks);
  const signature = createHmac("sha256", secret).update(entries.t + ".").update(raw).digest("hex");
  if (!secretMatches(entries.v1, signature)) return response(401, "Invalid signature");
  let event;
  try { event = asObject(JSON.parse(raw.toString("utf8"))); } catch { return response(400, "Invalid body"); }
  if (event.event !== "invitee.created") return response(200);
  const payload = asObject(event.payload);
  const ref = asObject(payload.tracking).utm_content;
  const email = payload.email;
  if (typeof ref !== "string" || !uuid.test(ref) || typeof email !== "string") return response(200);
  await transaction(async (client) => {
    const { rows: [lead] } = await client.query("SELECT id,campaign,stage FROM leads WHERE booking_token=$1 AND email=$2 FOR UPDATE", [ref, email.trim().toLowerCase()]);
    if (!lead || !["qualified", "appointment"].includes(lead.stage)) return;
    await updateStage(client, lead, "appointment");
  });
  return response(200);
}

export async function POST(request: Request, { params }: Context) {
  if (!acquisitionEnabled) return response(404, "Unavailable");
  const { action } = await params;
  try {
    if (action === "calendly") return await calendly(request);
    if (action === "mail") {
      const secret = process.env.SALES_JOB_SECRET;
      if (!secret || secret.length < 32 || !secretMatches(request.headers.get("authorization") ?? "", "Bearer " + secret)) return response(401, "Unauthorised");
      const processed = await deliverMail();
      return processed === null ? response(503, "Email automation unavailable") : NextResponse.json({ processed });
    }
    if (!sameOrigin(request)) return response(403, "Invalid origin");
    if (action === "telemetry" && !attributionEnabled) return response(404, "Unavailable");
    if (!["apply", "telemetry"].includes(action)) return response(404, "Unavailable");
    if (!await withinLimit(request, action, action === "telemetry" ? 240 : 20, 900)) return response(429, "Please try again later.");
    let input;
    try { input = asObject(await readJson(request)); } catch { return response(400, "Invalid request."); }

    if (typeof input.id !== "string" || !uuid.test(input.id)) return response(400, "Invalid request.");
    const campaign = activeCampaign(input.campaign);
    const choices = request.headers.get("cookie")?.split(";").map((value) => value.trim()) ?? [];
    if (action === "telemetry") {
      if (!choices.includes("gf-measurement=1")) return response(403, "Consent required");
      if (!publicEvents.some((event) => event === input.event)) return response(400, "Invalid event.");
      await database().query(
        "INSERT INTO acquisition_events (id,kind,campaign) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
        [input.id, input.event, campaign ?? null],
      );
      return response(200);
    }

    const application = parseApplication(input.application);
    if (!application) return response(400, "Check your application and complete the required fields.");
    if (!await withinIdentifierLimit(application.email, "applications-email", 5, 3600)) return response(429, "Please try again later.");
    const consent = choices.includes("gf-measurement=1");
    const created = await createLead(input.id, application, { campaign: consent ? campaign : undefined, first: consent ? input.first : undefined, last: consent ? input.last : undefined });
    if (created && choices.includes("gf-advertising=1")) await sendMetaLead(input.id, request);
    return NextResponse.json({ ok: true, eventId: input.id });
  } catch {
    console.error("Acquisition request failed", action);
    return response(503, "This service is temporarily unavailable. Please try again.");
  }
}
