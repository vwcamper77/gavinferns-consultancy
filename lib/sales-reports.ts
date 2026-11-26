import { profitability } from "./acquisition";
import { database } from "./sales-db";

export const reportEvents = [
  ["website_visit", "Website visits"], ["landing_visit", "Landing page visits"],
  ["calculator_interaction", "Calculator interactions"], ["application_start", "Applications started"],
  ["application_completed", "Applications completed"], ["qualified", "Qualified leads"],
  ["booking_link_opened", "Booking handoffs"], ["discovery_booked", "Discovery bookings"],
  ["appointment_attended", "Appointments attended"], ["proposal_issued", "Proposals issued"],
  ["contract_signed", "Contracts signed"], ["payment_received", "Payments received"],
] as const;

export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export async function campaignReport(from: string, to: string) {
  const { rows } = await database().query<{ campaign: string; kind: string; total: string }>(
    `SELECT COALESCE(campaign,'unattributed') AS campaign, kind, SUM(total) AS total FROM (
      SELECT campaign,kind,COUNT(*) AS total FROM acquisition_events
       WHERE occurred_at>=($1::date::timestamp AT TIME ZONE 'Europe/London')
         AND occurred_at<(($2::date+1)::timestamp AT TIME ZONE 'Europe/London') AND kind<>'payment_received'
       GROUP BY campaign,kind
      UNION ALL
      SELECT campaign,'payment_received',COUNT(*) FROM sales_ledger WHERE occurred_on BETWEEN $1 AND $2 AND voided_at IS NULL AND kind='payment_received' GROUP BY campaign
      UNION ALL
      SELECT campaign,'money_' || kind,SUM(amount_pence) FROM sales_ledger WHERE occurred_on BETWEEN $1 AND $2 AND voided_at IS NULL GROUP BY campaign,kind

    ) totals GROUP BY 1,2 ORDER BY 1,2`, [from, to],
  );
  const byCampaign = new Map<string, Record<string, number>>();
  for (const row of rows) {
    if (!byCampaign.has(row.campaign)) byCampaign.set(row.campaign, {});
    byCampaign.get(row.campaign)![row.kind] = Number(row.total);
  }
  return [...byCampaign].map(([campaign, metrics]) => ({
    campaign, metrics, ...profitability({
      spend: metrics.money_ad_spend ?? 0, won: metrics.contract_signed ?? 0, revenue: metrics.money_contract_revenue ?? 0,
      delivery: metrics.money_delivery_cost ?? 0,
    }),
  }));
}

export function csvCell(value: unknown) {
  const text = String(value ?? "");
  const safe = /^[\s\u0000-\u001F]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? "'" + text : text;
  return '"' + safe.replace(/"/g, '""') + '"';
}

const channel = `CASE
  WHEN touch IS NULL THEN 'Unavailable'
  WHEN lower(touch->>'utm_medium') IN ('cpc','ppc','paid','paid_search','paid_social','display') THEN 'Paid'
  WHEN lower(touch->>'utm_medium') = 'email' THEN 'Email'
  WHEN lower(touch->>'utm_medium') IN ('organic','organic_search') THEN 'Organic search'
  WHEN lower(touch->>'utm_medium') IN ('social','organic_social') THEN 'Organic social'
  WHEN touch->>'utm_source' IS NOT NULL THEN 'Other tagged campaign'
  WHEN touch->>'source' = 'direct' THEN 'Direct'
  WHEN touch->>'source' IS NOT NULL THEN 'Referral'
  ELSE 'Unavailable' END`;

export async function attributionReport(from: string, to: string) {
  const { rows } = await database().query<{ campaign: string; touch_name: string; channel: string; total: number }>(`
    SELECT COALESCE(campaign,'unattributed') campaign, touch_name, ${channel} AS channel, COUNT(*)::int AS total
    FROM leads CROSS JOIN LATERAL (VALUES ('First touch',first_touch),('Last touch',last_touch)) source(touch_name,touch)
    WHERE created_at>=($1::date::timestamp AT TIME ZONE 'Europe/London')
      AND created_at<(($2::date+1)::timestamp AT TIME ZONE 'Europe/London')
    GROUP BY 1,2,3 ORDER BY 1,2,3`, [from, to]);
  return rows;
}
