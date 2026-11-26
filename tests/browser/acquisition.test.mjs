import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import test from "node:test";
import { chromium } from "playwright-core";
import pg from "pg";

const baseURL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const enabled = process.env.TEST_ACQUISITION === "true";
const origin = new URL(baseURL).origin;

test("profitability campaign renders across viewports and other campaigns are inactive", async (context) => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium" });
  context.after(() => browser.close());
  const page = await browser.newPage();
  await page.goto(baseURL + "/campaign/profitability");
  await page.getByRole("heading", { name: "Build a more profitable business. Not just a bigger one." }).waitFor();
  await page.locator(".page-hero").getByText("Private consulting engagements from £3,000.", { exact: false }).waitFor();
  assert.match(await page.locator('meta[name="description"]').getAttribute("content"), /Private consulting engagements from £3,000\./);
  const cta = page.getByRole("link", { name: "Start your profitability application" }).first();
  assert.equal(await cta.getAttribute("href"), enabled ? "/apply?campaign=profitability" : "/contact");
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  for (const path of ["three-multipliers", "ai-automation", "owner-dependency"]) {
    assert.equal((await page.goto(baseURL + "/campaign/" + path)).status(), 404);
  }
});

test("consented attribution, qualification, booking, revenue and role boundaries work against PostgreSQL", { skip: !enabled }, async (context) => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium" });
  context.after(() => browser.close());
  const db = new pg.Pool({ connectionString: process.env.ACQUISITION_DATABASE_URL });
  context.after(() => db.end());
  const page = await browser.newPage({ viewport: { width: 375, height: 870 } });
  const email = `applicant-${randomUUID()}@example.test`;
  const business = "Sample Confidential Business " + email.slice(10, 18);
  const requestSubmit = (action, body, browserPage = page, path = "sales") => browserPage.request.post(baseURL + `/api/${path}/${action}`, {
    headers: { origin, "content-type": "application/json" }, data: body,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(baseURL + "/campaign/profitability?utm_source=search&utm_medium=cpc&utm_campaign=profitability");
  await page.getByRole("button", { name: "Allow measurement" }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem("gavinferns-attribution")), null);
  assert.equal((await requestSubmit("telemetry", { id: randomUUID(), event: "website_visit" }, page, "acquisition")).status(), 403);
  await page.getByRole("button", { name: "Allow measurement" }).click();
  await page.waitForFunction(() => localStorage.getItem("gavinferns-attribution")?.includes("search"));
  await page.goto(baseURL + "/campaign/profitability?utm_source=newsletter&utm_medium=email&utm_campaign=profitability");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("gavinferns-attribution") || "{}").last?.utm_source === "newsletter");
  const calculator = page.locator("#estimate");
  await calculator.getByRole("spinbutton", { name: "Consulting investment (£)" }).fill("5000");
  await calculator.getByText("100%", { exact: true }).waitFor();

  await page.getByRole("link", { name: "Start your profitability application" }).first().click();
  await page.getByLabel("Business name").fill(business);
  await page.getByLabel("Industry").fill("Manufacturing");
  await page.getByLabel("Number of employees").selectOption("10–49");
  await page.getByLabel("Annual turnover").selectOption("£250,000–£999,999");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Consulting budget").selectOption("£3,000–£5,000");
  await page.getByLabel("When would you like to start?").selectOption("Within a month");
  await page.getByLabel("What challenge").fill("Confidential margin challenge");
  await page.getByLabel("What would you like").fill("Improve operational profitability");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Back" }).click();
  assert.equal(await page.getByLabel("What challenge").inputValue(), "Confidential margin challenge");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Your name").fill("Example Applicant");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("I’ve read the privacy notice.").check();
  assert.equal(await page.getByLabel("Email me occasional").isChecked(), false);
  const submitted = page.waitForRequest((request) => request.url().endsWith("/api/acquisition/apply"));
  await page.getByRole("button", { name: "Send application" }).click();
  const savedRequest = await submitted;
  await page.getByRole("heading", { name: "Application received" }).waitFor();
  assert.equal((await requestSubmit("apply", savedRequest.postDataJSON(), page, "acquisition")).status(), 200);
  const { rows: [lead] } = await db.query("SELECT * FROM leads WHERE email=$1", [email]);
  assert.equal(lead.first_touch.utm_source, "search");
  assert.equal(lead.last_touch.utm_source, "newsletter");
  assert.equal(lead.campaign, "profitability");
  assert.equal(lead.marketing_consent, false);
  assert.equal((await db.query("SELECT 1 FROM leads WHERE email=$1", [email])).rowCount, 1);
  assert.equal((await db.query("SELECT 1 FROM sales_mail WHERE lead_id=$1 AND template='acknowledgement'", [lead.id])).rowCount, 1);
  assert.equal((await requestSubmit("stage", { lead: lead.id, stage: "qualified" })).status(), 403);

  await page.goto(baseURL + "/sales");
  await page.getByLabel("Email", { exact: true }).fill("sales@example.test");
  await page.getByLabel("Password", { exact: true }).fill(process.env.TEST_SALES_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("link", { name: business }).click();
  await page.locator('select[name="stage"]').selectOption("qualified");
  await page.getByRole("button", { name: "Update stage" }).click();
  const bookingLink = page.getByLabel("Private booking link");
  await bookingLink.waitFor();
  const bookingUrl = await bookingLink.inputValue();
  const ref = new URL(bookingUrl).searchParams.get("ref");
  assert.ok(ref);
  const booking = await browser.newPage();
  await booking.route("https://calendly.com/**", (route) => route.fulfill({ body: "Booking calendar intercepted by regression test" }));
  await booking.goto(bookingUrl);
  await booking.getByRole("button", { name: "Continue to Calendly" }).click();
  await booking.getByText("Booking calendar intercepted by regression test").waitFor();
  assert.equal(new URL(booking.url()).searchParams.get("utm_content"), ref);

  const payload = JSON.stringify({ event: "invitee.created", payload: { email, tracking: { utm_content: ref } } });
  const timestamp = Math.floor(Date.now() / 1000);
  const signed = createHmac("sha256", process.env.CALENDLY_WEBHOOK_SECRET).update(timestamp + "." + payload).digest("hex");
  const postWebhook = (signature) => page.request.post(baseURL + "/api/acquisition/calendly", {
    data: payload, headers: { "Content-Type": "application/json", "calendly-webhook-signature": `t=${timestamp},v1=${signature}` },
  });
  assert.equal((await postWebhook("invalid")).status(), 401);
  assert.equal((await postWebhook(signed)).status(), 200);
  assert.equal((await postWebhook(signed)).status(), 200);
  await page.reload();
  await page.getByRole("button", { name: "Mark appointment attended" }).click();
  await page.getByRole("button", { name: "Mark appointment attended" }).waitFor({ state: "hidden" });
  for (const stage of ["proposal", "won"]) {
    assert.equal((await requestSubmit("stage", { lead: lead.id, stage })).status(), 200);
  }
  const date = await page.locator("input[name=date]").first().inputValue();
  for (const [kind, amount] of [["ad_spend", "500"], ["contract_revenue", "6000"], ["payment_received", "3000"], ["delivery_cost", "2000"]]) {
    const ledger = { id: randomUUID(), lead: lead.id, kind, amount, date, campaign: "profitability" };
    assert.equal((await requestSubmit("ledger", ledger)).status(), 200);
    assert.equal((await requestSubmit("ledger", ledger)).status(), 200);
  }
  await page.reload();
  const report = page.getByRole("heading", { name: "Business Profitability Consulting", exact: true }).locator("..");
  assert.match(await report.innerText(), /Advertising contribution\s*£3,500\.00/);
  assert.match(await report.innerText(), /Customer acquisition cost\s*£500\.00/);
  assert.match(await report.innerText(), /Payments received\s*1/);
  const csv = await page.request.get(baseURL + "/api/sales/trello");
  assert.equal(csv.status(), 200);
  assert.match(await csv.text(), /Sample Confidential Business/);
  assert.doesNotMatch(await csv.text(), /@example\.test|Confidential margin challenge/);
  const { rows: events } = await db.query(
    "SELECT kind,COUNT(*)::int AS count FROM acquisition_events WHERE lead_id=$1 GROUP BY kind", [lead.id],
  );
  assert.deepEqual(Object.fromEntries(events.map(({ kind, count }) => [kind, count])), {
    application_completed: 1, qualified: 1, booking_link_opened: 1, discovery_booked: 1, appointment_attended: 1, proposal_issued: 1, contract_signed: 1,
  });
  assert.equal((await db.query("SELECT 1 FROM acquisition_events WHERE kind='calculator_interaction' AND campaign='profitability'")).rowCount >= 1, true);

  const partner = await browser.newPage();
  await partner.goto(baseURL + `/sales?lead=${lead.id}`);
  await partner.getByLabel("Email", { exact: true }).fill("advertising@example.test");
  await partner.getByLabel("Password", { exact: true }).fill(process.env.TEST_PARTNER_PASSWORD);
  await partner.getByRole("button", { name: "Sign in" }).click();
  await partner.getByRole("heading", { name: "Campaign reporting" }).waitFor();
  await partner.goto(baseURL + `/sales?lead=${lead.id}`);
  assert.doesNotMatch(await partner.locator("main").innerText(), /Sample Confidential Business|Example Applicant|Confidential margin challenge|Sales pipeline|£6,000\.00|£3,500\.00/);
  await partner.getByRole("heading", { name: "Application attribution by channel" }).waitFor();
  assert.equal((await partner.request.get(baseURL + "/api/sales/trello")).status(), 403);
  assert.equal((await requestSubmit("ledger", { lead: lead.id }, partner)).status(), 403);
  const marketingEmail = `marketing-${randomUUID()}@example.test`;
  const marketingSubmission = savedRequest.postDataJSON();
  marketingSubmission.id = randomUUID();
  marketingSubmission.application.email = marketingEmail;
  marketingSubmission.application.marketing = true;
  assert.equal((await requestSubmit("apply", marketingSubmission, page, "acquisition")).status(), 200);
  const { rows: [subscriber] } = await db.query("SELECT id,marketing_withdrawal_token FROM leads WHERE email=$1", [marketingEmail]);
  assert.equal((await requestSubmit("stage", { lead: subscriber.id, stage: "nurture" })).status(), 200);
  const preference = await browser.newPage();
  await preference.goto(baseURL + "/marketing-preferences?ref=" + subscriber.marketing_withdrawal_token);
  await preference.getByRole("button", { name: "Unsubscribe from marketing emails" }).click();
  await preference.getByRole("heading", { name: "Email preferences updated" }).waitFor();
  const { rows: [withdrawal] } = await db.query("SELECT marketing_consent,marketing_withdrawn_at FROM leads WHERE id=$1", [subscriber.id]);
  assert.equal(withdrawal.marketing_consent, false);
  assert.ok(withdrawal.marketing_withdrawn_at);
  assert.equal((await db.query("SELECT status FROM sales_mail WHERE lead_id=$1 AND template='nurture'", [subscriber.id])).rows[0].status, "cancelled");
  assert.deepEqual(errors, []);
});
