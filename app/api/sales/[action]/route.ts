import { NextResponse } from "next/server";
import { asObject, moneyKinds, parsePence, pipeline, trimmed, uuid, validEmail } from "@/lib/acquisition";
import { activeCampaign } from "@/lib/campaigns";
import { acquisitionEnabled } from "@/lib/sales-config";
import { database, transaction } from "@/lib/sales-db";
import { recordEvent, updateStage } from "@/lib/sales-leads";
import { csvCell, validDate } from "@/lib/sales-reports";
import { beginSession, endSession, passwordMatches, readJson, sameOrigin, secureCookie, session, withinIdentifierLimit, withinLimit } from "@/lib/sales-security";

type Context = { params: Promise<{ action: string }> };
const reply = (status: number, error?: string) => NextResponse.json(error ? { error } : { ok: true }, { status });

export async function GET(request: Request, { params }: Context) {
  if (!acquisitionEnabled || (await params).action !== "trello") return reply(404, "Unavailable");
  if ((await session())?.role !== "sales") return reply(403, "Access denied.");
  const includeContact = new URL(request.url).searchParams.get("contact") === "yes";
  const { rows } = await database().query(
    `SELECT id,business,stage,campaign,created_at${includeContact ? ",name,email" : ""} FROM leads ORDER BY created_at DESC`,
  );
  const headings = ["Name", "List", "Lead reference", "Campaign", "Created"];
  if (includeContact) headings.push("Contact name", "Contact email");
  const csv = [headings, ...rows.map((row) => [row.business, row.stage, row.id, row.campaign, row.created_at.toISOString(),
    ...(includeContact ? [row.name, row.email] : [])])].map((row) => row.map(csvCell).join(",")).join("\r\n");
  return new Response(csv, { headers: {
    "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="trello-pipeline.csv"',
    "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex",
  } });
}

export async function POST(request: Request, { params }: Context) {
  if (!acquisitionEnabled) return reply(404, "Unavailable");
  if (!sameOrigin(request)) return reply(403, "Invalid origin.");
  const { action } = await params;
  try {
    if (action === "logout") { await endSession(); return reply(200); }
    if (action === "login") {
      if (!await withinLimit(request, "sales-login", 20, 900)) return reply(429, "Please try again later.");
      let input;
      try { input = asObject(await readJson(request, 2500)); } catch { return reply(400, "Invalid request."); }
      const email = trimmed(input.email, 254).toLowerCase();
      const password = typeof input.password === "string" && input.password.length <= 256 ? input.password : "";
      if (!validEmail.test(email) || !password) return reply(401, "Incorrect email or password.");
      if (!await withinIdentifierLimit(email, "sales-login-account", 10, 900)) return reply(429, "Please try again later.");
      const { rows: [user] } = await database().query("SELECT id,email,role,password_hash FROM sales_users WHERE email=$1 AND active", [email]);
      if (!await passwordMatches(password, user?.password_hash ?? "") || !user) return reply(401, "Incorrect email or password.");
      await beginSession(user, secureCookie(request));
      return reply(200);
    }

    const user = await session();
    if (user?.role !== "sales") return reply(403, "Access denied.");
    let input;
    try { input = asObject(await readJson(request, 4000)); } catch { return reply(400, "Invalid request."); }
    const leadId = typeof input.lead === "string" && uuid.test(input.lead) ? input.lead : null;

    if (action === "stage" || action === "attended" || action === "delete") {
      const stage = pipeline.find((value) => value === input.stage);
      if (!leadId || (action === "stage" && !stage)) return reply(400, "Invalid lead or stage.");
      const result = await transaction(async (client) => {
        const { rows: [lead] } = await client.query("SELECT id,campaign,stage FROM leads WHERE id=$1 FOR UPDATE", [leadId]);
        if (!lead) return 404;
        if (action === "delete") {
          await client.query("DELETE FROM leads WHERE id=$1", [leadId]);
        } else if (action === "attended") {
          const booked = await client.query("SELECT 1 FROM acquisition_events WHERE lead_id=$1 AND kind='discovery_booked'", [leadId]);
          if (!booked.rowCount) return 409;
          await recordEvent(client, "appointment_attended", lead.campaign, lead.id, user.id);
        } else if (stage !== lead.stage) {
          await updateStage(client, lead, stage!, user.id);
        }
        return 200;
      });
      return reply(result, result === 404 ? "Lead not found." : result === 409 ? "Record a discovery booking first." : undefined);
    }

    if (action === "ledger") {
      const kind = moneyKinds.find((value) => value === input.kind);
      const amount = parsePence(input.amount);
      if (!kind || !amount || !validDate(input.date) || typeof input.id !== "string" || !uuid.test(input.id)) return reply(400, "Check the amount, date and category.");
      const campaign = activeCampaign(input.campaign);
      if (kind === "ad_spend" ? (!campaign && input.campaign !== "unattributed") : !leadId) return reply(400, "Choose a campaign or lead.");
      const saved = await transaction(async (client) => {
        const lead = kind === "ad_spend" ? null : (await client.query("SELECT campaign FROM leads WHERE id=$1 FOR UPDATE", [leadId])).rows[0];
        if (kind !== "ad_spend" && !lead) return false;
        await client.query(
          "INSERT INTO sales_ledger (id,occurred_on,kind,amount_pence,campaign,lead_id,actor) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING",
          [input.id, input.date, kind, amount, kind === "ad_spend" ? campaign ?? null : lead.campaign, kind === "ad_spend" ? null : leadId, user.id],
        );
        return true;
      });
      return reply(saved ? 200 : 404, saved ? undefined : "Lead not found.");
    }
    if (action === "void-entry") {
      if (typeof input.id !== "string" || !uuid.test(input.id)) return reply(400, "Invalid entry.");
      const { rowCount } = await database().query("UPDATE sales_ledger SET voided_at=now(),voided_by=$2 WHERE id=$1 AND voided_at IS NULL", [input.id, user.id]);
      return reply(rowCount ? 200 : 404, rowCount ? undefined : "Entry not found.");
    }
    return reply(404, "Unavailable");
  } catch {
    console.error("Sales request failed", action);
    return reply(503, "Sales service temporarily unavailable.");
  }
}
