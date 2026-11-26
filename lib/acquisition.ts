import { activeCampaign } from "./campaigns.ts";
import { belowConsultingBudget, consultingBudgetToAgree, firstConsultingBudgetBand } from "./consulting-pricing.ts";

export const consentVersion = "2026-11-25";
export const pipeline = ["new", "qualified", "appointment", "proposal", "won", "lost", "nurture"] as const;
export const pipelineLabels = {
  new: "New leads", qualified: "Qualified leads", appointment: "Appointments", proposal: "Proposals",
  won: "Won clients", lost: "Lost clients", nurture: "Nurture",
};
export const publicEvents = ["website_visit", "landing_visit", "calculator_interaction", "application_start"] as const;
export const milestones = ["qualified", "booking_link_opened", "discovery_booked", "appointment_attended", "proposal_issued", "contract_signed", "payment_received"] as const;
export const moneyKinds = ["ad_spend", "contract_revenue", "payment_received", "delivery_cost"] as const;
export const turnoverBands = ["Pre-revenue", "Under £250,000", "£250,000–£999,999", "£1m–£4.99m", "£5m or more", "Prefer to discuss"];
export const budgetBands = [belowConsultingBudget, firstConsultingBudgetBand, "Over £5,000–£10,000", "Over £10,000", consultingBudgetToAgree];
export const startBands = ["Within a month", "In one to three months", "In three to six months", "Exploring options"];
export const employeeBands = ["Owner only", "1–9", "10–49", "50–249", "250 or more"];
export const uuid = /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
export const validEmail = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
export function trimmed(value: unknown, limit: number) {
  return typeof value === "string" && value.trim().length <= limit ? value.trim() : "";
}
export function parseTouch(input: unknown) {
  const data = asObject(input);
  const utm = Object.fromEntries(utmKeys.flatMap((key) => {
    const value = trimmed(data[key], 100);
    return /^[a-z0-9][a-z0-9_.~-]*$/i.test(value) ? [[key, value]] : [];
  }));
  const campaign = activeCampaign(data.campaign) ?? activeCampaign(utm.utm_campaign);
  const source = trimmed(data.source, 120);
  return { ...utm, campaign, source: /^[a-z0-9.-]+$/i.test(source) ? source : "direct" };
}
export function parseApplication(input: unknown) {
  const details = asObject(input);
  const fields = {
    name: trimmed(details.name, 120), email: trimmed(details.email, 254).toLowerCase(),
    business: trimmed(details.business, 120), industry: trimmed(details.industry, 120),
    employees: trimmed(details.employees, 40), turnover: trimmed(details.turnover, 40),
    budget: trimmed(details.budget, 40), timescale: trimmed(details.timescale, 40),
    challenge: trimmed(details.challenge, 1000), goal: trimmed(details.goal, 1000),
  };
  if (!Object.values(fields).every(Boolean) || !validEmail.test(fields.email) ||
      ![employeeBands.includes(fields.employees), turnoverBands.includes(fields.turnover),
        budgetBands.includes(fields.budget), startBands.includes(fields.timescale)].every(Boolean) ||
      details.privacyAcknowledged !== true || trimmed(details.website, 300)) return null;
  return { ...fields, marketing: details.marketing === true };
}
export function parsePence(input: unknown) {
  if (typeof input !== "string" || !/^\d{1,9}(?:\.\d{1,2})?$/.test(input)) return null;
  const [pounds, fraction = ""] = input.split(".");
  const pence = Number(pounds) * 100 + Number(fraction.padEnd(2, "0"));
  return pence > 0 ? pence : null;
}
export function profitability(totals: { spend: number; won: number; revenue: number; delivery: number }) {
  const contribution = totals.revenue - totals.delivery - totals.spend;
  return {
    cac: totals.won > 0 ? totals.spend / totals.won : null,
    contribution,
    contributionMargin: totals.revenue > 0 ? contribution / totals.revenue : null,
  };
}
