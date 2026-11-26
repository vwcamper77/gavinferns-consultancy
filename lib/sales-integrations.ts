import { randomUUID, timingSafeEqual } from "node:crypto";
import type { PoolClient } from "pg";
import { database } from "./sales-db";
import { mailEnabled, metaPixelId } from "./sales-config";
import { approvedUrl, site } from "./site";

export function secretMatches(actual: string, expected: string) {
  const comparison = Buffer.from(actual);
  const target = Buffer.from(expected);
  return comparison.length === target.length && timingSafeEqual(comparison, target);
}
const hasBooking = Boolean(approvedUrl(process.env.SITE_BOOKING_URL, ["calendly.com", "calendar.google.com", "calendar.app.google"]));
const publicOrigin = process.env.SITE_ACQUISITION_ORIGIN ?? site.url;
const nurtureDelay = /^\d{1,2}$/.test(process.env.SITE_ZOHO_NURTURE_DELAY_DAYS ?? "") ? Number(process.env.SITE_ZOHO_NURTURE_DELAY_DAYS) : 1;
export async function queueMail(client: PoolClient, leadId: string, template: "acknowledgement" | "qualified" | "nurture") {
  if (!mailEnabled || !process.env.SITE_ZOHO_TEMPLATES?.split(",").includes(template)) return;
  await client.query(
    `INSERT INTO sales_mail (id,lead_id,template,available_at)
     VALUES ($1,$2,$3,now() + make_interval(days => $4))
     ON CONFLICT (lead_id,template) DO NOTHING`, [randomUUID(), leadId, template, template === "nurture" ? nurtureDelay : 0],
  );
}
const zohoRegions = { eu: "eu", us: "com", uk: "uk", in: "in", au: "com.au", ca: "ca", jp: "jp" } as const;
function zohoSettings() {
  const { ZOHO_REGION, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_MAIL_ACCOUNT_ID, ZOHO_FROM_EMAIL } = process.env;
  const region = ZOHO_REGION && Object.hasOwn(zohoRegions, ZOHO_REGION) ? zohoRegions[ZOHO_REGION as keyof typeof zohoRegions] : undefined;
  if (!region || !ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN || !/^\d+$/.test(ZOHO_MAIL_ACCOUNT_ID ?? "") || !ZOHO_FROM_EMAIL) return;
  return { region, id: ZOHO_CLIENT_ID, secret: ZOHO_CLIENT_SECRET, refresh: ZOHO_REFRESH_TOKEN, account: ZOHO_MAIL_ACCOUNT_ID!, from: ZOHO_FROM_EMAIL };
}

export async function deliverMail() {
  const settings = mailEnabled ? zohoSettings() : undefined;
  if (!settings) return null;
  const response = await fetch(`https://accounts.zoho.${settings.region}/oauth/v2/token`, {
    method: "POST", body: new URLSearchParams({ grant_type: "refresh_token", client_id: settings.id,
      client_secret: settings.secret, refresh_token: settings.refresh }), signal: AbortSignal.timeout(6000),
  });
  const token = response.ok ? (await response.json()).access_token : null;
  if (typeof token !== "string") throw new Error("Zoho authentication failed");

  const { rows } = await database().query<{ id: string; template: string; email: string; marketing_consent: boolean; marketing_withdrawal_token: string }>(`
    WITH next_mail AS (
      SELECT id FROM sales_mail WHERE status='pending' AND available_at<=now()
      ORDER BY available_at FOR UPDATE SKIP LOCKED LIMIT 4
    )
    UPDATE sales_mail m SET status='sending',updated_at=now() FROM next_mail n,leads l
    WHERE m.id=n.id AND l.id=m.lead_id RETURNING m.id,m.template,l.email,l.marketing_consent,l.marketing_withdrawal_token`);
  for (const job of rows) {
    let status = "failed";
    try {
      const templates = process.env.SITE_ZOHO_TEMPLATES?.split(",") ?? [];
      const { rows: [consent] } = await database().query<{ marketing_consent: boolean; stage: string; booking_token: string | null; booking_valid: boolean }>(
        "SELECT marketing_consent,stage,booking_token,qualified_at>now()-interval '30 days' AS booking_valid FROM leads WHERE marketing_withdrawal_token=$1", [job.marketing_withdrawal_token],
      );
      if (!consent || !templates.includes(job.template) || (job.template === "nurture" && (!consent.marketing_consent || consent.stage !== "nurture")) ||
        (job.template === "qualified" && (!consent.booking_valid || consent.stage !== "qualified" || !hasBooking))) {
        status = "cancelled";
      } else {
        const messages: Record<string, [string, string]> = {
          acknowledgement: ["We received your consulting application", "Thank you for getting in touch. We’ll review your application and respond about the next step."],
          qualified: ["Your consulting discovery call", `Your application is ready for booking. Choose a discovery time at ${publicOrigin}/booking?ref=${consent.booking_token}`],
          nurture: ["Resources from Gavin Ferns Consulting", `Explore practical growth and profitability resources at ${publicOrigin}/insights. End marketing emails at ${publicOrigin}/marketing-preferences?ref=${job.marketing_withdrawal_token}`],
        };
        const [subject, content] = messages[job.template];
        const delivery = await fetch(`https://mail.zoho.${settings.region}/api/accounts/${settings.account}/messages`, {
          method: "POST", headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ fromAddress: settings.from, toAddress: job.email, subject, content, mailFormat: "plaintext" }),
          signal: AbortSignal.timeout(6000),
        });
        if (delivery.ok && (await delivery.json()).status?.code === 200) status = "sent";
      }
    } catch { /* Delivery state may be ambiguous. Reconcile with Zoho before retrying. */ }
    await database().query("UPDATE sales_mail SET status=$2,updated_at=now() WHERE id=$1", [job.id, status]);
  }
  return rows.length;
}

export async function sendMetaLead(eventId: string, request: Request) {
  const token = process.env.META_CONVERSIONS_ACCESS_TOKEN;
  const version = process.env.META_GRAPH_VERSION;
  if (!metaPixelId || !token || !/^v\d+\.\d+$/.test(version ?? "")) return;
  const rawCookies = request.headers.get("cookie") ?? "";
  const fbp = /(?:^|;\s*)_fbp=(fb\.\d+\.\d+\.\d+)(?:;|$)/.exec(rawCookies)?.[1];
  const fbc = /(?:^|;\s*)_fbc=(fb\.\d+\.\d+\.[a-zA-Z0-9_-]{1,200})(?:;|$)/.exec(rawCookies)?.[1];
  const agent = request.headers.get("user-agent")?.slice(0, 512);
  if (!agent || (!fbp && !fbc)) return;
  try {
    const res = await fetch(`https://graph.facebook.com/${version}/${metaPixelId}/events`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: [{
        event_name: "Lead", event_id: eventId, event_time: Math.floor(Date.now() / 1000),
        action_source: "website", event_source_url: site.url + "/application-received", user_data: { fbp, fbc, client_user_agent: agent },
      }] }), signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) console.error("Meta Lead delivery failed", res.status);
  } catch { console.error("Meta Lead delivery unavailable"); }
}
