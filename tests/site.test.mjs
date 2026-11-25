import assert from "node:assert/strict";
import test from "node:test";
import { approvedUrl, getVatNote, multipliers, offers, pages, routes, services } from "../lib/site.ts";

test("the five paid programmes meet the minimum engagement value", () => {
  assert.equal(offers.length, 5);
  assert.equal(new Set(offers.map(({ id }) => id)).size, 5);
  for (const offer of offers) {
    assert.ok(offer.minimum > 2500, offer.name);
    for (const property of ["audience", "scope", "deliverables", "outcome"]) {
      assert.ok(offer[property], `${offer.name} has no ${property}`);
    }
  }
  assert.equal(offers.find(({ id }) => id === "fractional").duration, "Monthly · Three-month minimum");
  assert.equal(offers.find(({ id }) => id === "transformation").duration, "90 days");
});

test("all internal routes and linked offers are represented", () => {
  assert.equal(new Set(routes).size, 13);
  assert.equal(routes.length, Object.keys(pages).length + services.length);
  for (const service of services) assert.ok(offers.some(({ id }) => id === service.offer));
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
