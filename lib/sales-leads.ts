import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { consentVersion, parseApplication, parseTouch } from "./acquisition";
import { attributionEnabled } from "./sales-config";
import { transaction } from "./sales-db";
import { queueMail } from "./sales-integrations";

export async function recordEvent(client: PoolClient, kind: string, campaign: string | null, leadId: string | null, actor?: string, eventId = randomUUID()) {
  await client.query(
    "INSERT INTO acquisition_events (id,kind,campaign,lead_id,actor) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",
    [eventId, kind, campaign, leadId, actor ?? null],
  );
}

export async function createLead(id: string, application: NonNullable<ReturnType<typeof parseApplication>>, options: {
  campaign?: string; first?: unknown; last?: unknown;
}) {
  const first = attributionEnabled && options.first ? parseTouch(options.first) : null;
  const last = attributionEnabled && options.last ? parseTouch(options.last) : null;
  const campaign = last?.campaign ?? first?.campaign ?? options.campaign ?? null;
  return transaction(async (client) => {
    const lead = randomUUID();
    const { rowCount } = await client.query(
      `INSERT INTO leads (id,submission_id,name,email,business,industry,employees,turnover,budget,timescale,challenge,goal,campaign,
        first_touch,last_touch,privacy_version,marketing_consent,marketing_withdrawal_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (submission_id) DO NOTHING`,
      [lead, id, application.name, application.email, application.business, application.industry, application.employees,
        application.turnover, application.budget, application.timescale, application.challenge, application.goal,
        campaign, first, last, consentVersion, application.marketing, randomUUID()],
    );
    if (!rowCount) return false;
    await recordEvent(client, "application_completed", campaign, lead);
    await queueMail(client, lead, "acknowledgement");
    return true;
  });
}

export async function updateStage(client: PoolClient, lead: { id: string; campaign: string | null }, stage: string, actor?: string) {
  await client.query(
    `UPDATE leads SET stage=$2,
      qualified_at=CASE WHEN $2='qualified' THEN COALESCE(qualified_at,now()) ELSE qualified_at END,
      booking_token=CASE WHEN $2='qualified' THEN COALESCE(booking_token,$3) ELSE booking_token END
      WHERE id=$1`, [lead.id, stage, randomUUID()],
  );
  const event = ({ qualified: "qualified", appointment: "discovery_booked", proposal: "proposal_issued", won: "contract_signed" } as Record<string,string>)[stage];
  if (event) await recordEvent(client, event, lead.campaign, lead.id, actor);
  if (stage === "qualified" || stage === "nurture") await queueMail(client, lead.id, stage);
}
