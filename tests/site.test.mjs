import assert from "node:assert/strict";
import test from "node:test";
import { approvedUrl, consultancyStartingInvestment, getVatNote, multipliers, offers, pages, routes, services, specialistEngagements } from "../lib/site.ts";

test("the three consulting routes publish the agreed investment terms", () => {
  assert.equal(consultancyStartingInvestment, 3000);
  assert.deepEqual(offers.map(({ id, price }) => [id, price]), [
    ["strategy", "From £3,000"],
    ["transformation", "Investment tailored to your business"],
    ["fractional", "Bespoke monthly investment"],
  ]);
  for (const offer of offers) {
    for (const property of ["audience", "scope", "deliverables", "outcome"]) {
      assert.ok(offer[property], `${offer.name} has no ${property}`);
    }
  }
  assert.equal(offers.find(({ id }) => id === "fractional").duration, "Monthly · Three-month minimum");
  assert.equal(offers.find(({ id }) => id === "transformation").duration, "90 days");
});

test("all internal routes and linked offers are represented", () => {
  assert.equal(new Set(routes).size, 14);
  assert.equal(routes.length, Object.keys(pages).length + services.length);
  for (const service of services) assert.ok([...offers, ...specialistEngagements].some(({ id }) => id === service.offer));
  for (const engagement of specialistEngagements) assert.ok(services.some(({ slug }) => slug === engagement.slug));
  assert.deepEqual(multipliers.map(({ name }) => name), ["Customers", "Purchase frequency", "Average order value"]);
});

test("VAT treatment requires an explicit supported value", () => {
  for (const input of [undefined, "", "pending", "toString", "__proto__"]) {
    assert.equal(getVatNote(input), undefined);
  }
  assert.equal(getVatNote("inclusive"), "Prices include VAT.");
  assert.equal(getVatNote("exclusive"), "Prices exclude VAT.");
  assert.equal(getVatNote("no-vat"), "No VAT is charged.");
});

test("configured destinations accept HTTPS on exact allowlisted hosts", () => {
  const hosts = ["calendly.com", "calendar.app.google"];
  assert.equal(approvedUrl("https://calendar.app.google/example", hosts), "https://calendar.app.google/example");
  for (const input of ["https://evil.example/calendar.app.google", "https://calendar.app.google.evil.example/", "http://calendly.com/example", "https://user:pass@calendly.com/example", "https://calendly.com:8443/example", "some text"]) {
    assert.equal(approvedUrl(input, hosts), undefined);
  }
});
