import assert from "node:assert/strict";
import test from "node:test";
import { activeCampaign, campaigns } from "../lib/campaigns.ts";
import { budgetBands, parseApplication, parsePence, parseTouch, profitability } from "../lib/acquisition.ts";

test("only the agreed profitability campaign is active", () => {
  assert.equal(Object.keys(campaigns).length, 4);
  assert.deepEqual(Object.keys(campaigns).filter(activeCampaign), ["profitability"]);
  for (const slug of ["ai-automation", "owner-dependency", "three-multipliers", "__proto__"]) assert.equal(activeCampaign(slug), undefined);
});

test("application validation requires acknowledgement but allows marketing refusal", () => {
  const application = {
    name: "Test Contact", email: " TEST@EXAMPLE.TEST ", business: "Example", industry: "Retail", employees: "1–9",
    turnover: "Under £250,000", budget: budgetBands[1], timescale: "Exploring options", challenge: "Pricing", goal: "Margin",
    privacyAcknowledged: true, marketing: false,
  };
  const parsed = parseApplication(application);
  assert.equal(parsed.email, "test@example.test");
  assert.equal(parsed.marketing, false);
  for (const changes of [{ privacyAcknowledged: false }, { website: "spam" }, { budget: "50000000" }, { challenge: " " }, { email: "not an email" }]) {
    assert.equal(parseApplication({ ...application, ...changes }), null);
  }
});

test("attribution accepts named UTM fields and rejects arbitrary keys and email values", () => {
  const touch = parseTouch({ utm_source: "google", utm_medium: "cpc", utm_campaign: "profitability", utm_content: "name@example.test", private: "1000" });
  assert.deepEqual(touch, { utm_source: "google", utm_medium: "cpc", utm_campaign: "profitability", campaign: "profitability", source: "direct" });
});

test("reporting stores exact GBP pence and calculates acquisition cost and contribution", () => {
  assert.equal(parsePence("250.05"), 25005);
  for (const invalid of ["0", "1.234", "-1", "1e99", "£100", "1000000000"]) assert.equal(parsePence(invalid), null);
  assert.deepEqual(profitability({ spend: 25005, won: 2, revenue: 1000000, delivery: 300000 }), { cac: 12502.5, contribution: 674995, contributionMargin: 0.674995 });
  assert.deepEqual(profitability({ spend: 25005, won: 0, revenue: 0, delivery: 0 }), { cac: null, contribution: -25005, contributionMargin: null });
});
