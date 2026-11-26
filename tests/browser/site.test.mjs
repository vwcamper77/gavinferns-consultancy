import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";
import { caseStudyPaths, offers, routes } from "../../lib/site.ts";

const baseURL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const acquisitionEnabled = process.env.TEST_ACQUISITION === "true";
const discoveryPath = acquisitionEnabled ? "/apply" : "/contact";

async function launch() {
  return chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium" });
}

test("all core pages and case studies render and the production preview is noindex", async (context) => {
  const browser = await launch();
  context.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(baseURL);
  assert.match(await page.locator("h1").innerText(), /Build a more profitable business\.\s*Not just a bigger one\./);
  assert.deepEqual(await page.locator(".offers-grid h3").allTextContents(), offers.map(({ name }) => name));
  assert.match(await page.locator(".hero-background").innerText(), /Executive MBA · Imperial College Business School/);
  assert.match(await page.locator(".proof-band").innerText(), /Venture Capital modules/);
  assert.match(await page.locator('meta[name="description"]').getAttribute("content"), /Private consulting engagements from £3,000\./);
  assert.equal((await page.request.get(new URL("/gfc-logo.svg", baseURL).href)).status(), 200);
  assert.equal((await page.request.get(new URL("/social-card.jpg", baseURL).href)).status(), 200);
  const links = new Set();
  for (const slug of ["", ...routes, ...caseStudyPaths]) {
    const path = `/${slug}`;
    const response = await page.goto(new URL(path, baseURL).href);
    assert.equal(response.status(), 200, path);
    assert.equal(await page.locator("main h1").count(), 1, path);
    assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex/);
    assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute("href")).href, `https://gavinferns.com${path}`);
    assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
    assert.equal(await page.locator('a[href^="https://calendly.com/"], a[href^="https://calendar.google.com/"], a[href^="https://calendar.app.google/"]').count(), 0, path);
    assert.doesNotMatch(await response.text(), /£(?:2,997|4,997|9,997)/, path);
    assert.equal(await page.locator('a[href*="instagram.com"], a[href*="youtube.com"]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, path);
    for (const url of await page.locator('a[href^="/"]:not([download])').evaluateAll((items) => items.map((item) => item.getAttribute("href")))) links.add(url);
  }
  for (const link of links) {
    const target = new URL(link, baseURL);
    assert.ok(["", ...routes, ...caseStudyPaths, ...(acquisitionEnabled ? ["apply"] : [])].includes(target.pathname.slice(1)), link);
    if (target.hash) {
      await page.goto(target.href);
      assert.equal(await page.locator(target.hash).count(), 1, link);
    }
  }
  assert.equal((await page.goto(new URL("/missing-page", baseURL).href)).status(), 404);
  const robots = await page.request.get(new URL("/robots.txt", baseURL).href);
  const sitemap = await page.request.get(new URL("/sitemap.xml", baseURL).href);
  assert.equal(robots.status(), 200);
  assert.equal(sitemap.status(), 200);
  assert.doesNotMatch(await robots.text(), /^Sitemap:/m);
  assert.doesNotMatch(await sitemap.text(), /<loc>/);
});

test("mobile menu and discovery brief support a private handoff", async (context) => {
  const browser = await launch();
  context.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 375, height: 810 }, permissions: ["clipboard-read", "clipboard-write"] });
  await page.goto(baseURL);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  if (acquisitionEnabled) await page.getByRole("button", { name: "Decline optional tracking" }).click();
  await page.locator(".mobile-nav summary").click();
  await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Start Your Discovery Brief" }).click();
  await page.waitForURL("**" + discoveryPath);
  if (acquisitionEnabled) await page.goto(new URL("/contact", baseURL).href);
  const calendarLink = page.locator('a[href^="https://calendly.com/"]');
  assert.equal(await calendarLink.count(), 0);
  assert.equal(await page.locator(".mobile-nav").getAttribute("open"), null);

  for (const [name, value] of [
    ["Annual turnover", "£1m–£4.99m"],
    ["Investment budget", "Over £5,000–£10,000"],
    ["When do you want to start?", "Within a month"],
  ]) await page.getByLabel(name).selectOption(value);
  await page.getByLabel("Business name").fill("Example SME");
  await page.getByLabel("Industry").fill("Manufacturing");
  await page.getByLabel("Number of employees").selectOption("10–49");
  await page.getByLabel("What challenge").fill("Manual customer handoffs");
  await page.getByLabel("What would you like").fill("Reduce processing delays");
  const requests = [];
  page.on("request", (request) => requests.push(request));
  await page.getByRole("button", { name: "Prepare my brief" }).click();
  const brief = await page.getByLabel("Your discovery brief").inputValue();
  assert.match(brief, /Business name: Example SME/);
  assert.match(brief, /Number of employees: 10–49/);
  assert.match(brief, /Manual customer handoffs/);
  assert.match(brief, /Reduce processing delays/);
  assert.match(brief, /Over £5,000–£10,000/);
  await page.getByRole("button", { name: "Copy brief" }).click();
  await page.getByText("Brief copied.", { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), brief);
  const handoff = page.getByRole("link", { name: "Continue to Calendly" });
  if (acquisitionEnabled) assert.equal(await handoff.count(), 0);
  else assert.equal(await handoff.getAttribute("href"), "https://calendly.com/gavinferns");
  assert.equal(await page.getByRole("link", { name: "Open WhatsApp" }).getAttribute("href"), "https://wa.me/447545810870");
  for (const request of requests) {
    const url = new URL(request.url());
    assert.equal(url.origin, new URL(baseURL).origin);
    assert.equal(request.method(), "GET");
    assert.equal(request.postData(), null);
    assert.ok([...url.searchParams.keys()].every((key) => key === "_rsc"));
    assert.doesNotMatch(decodeURIComponent(url.href), /Manual customer handoffs|Reduce processing delays/);
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.getByRole("combobox", { name: "Investment budget" }).selectOption("Below £3,000");
  assert.equal(await page.getByLabel("Your discovery brief").count(), 0);
  assert.equal(await calendarLink.count(), 0);
  await page.getByRole("button", { name: "Prepare my brief" }).click();
  await page.locator(".summary").getByText("Private consulting engagements from £3,000.", { exact: false }).waitFor();
  assert.equal(await handoff.count(), 0);
  await page.getByRole("combobox", { name: "Investment budget" }).selectOption("To be agreed");
  await page.getByRole("button", { name: "Prepare my brief" }).click();
  await page.getByLabel("Your discovery brief").waitFor();
  assert.equal(await handoff.count(), 0);
  assert.equal(await page.getByRole("link", { name: "Open WhatsApp" }).count(), 1);
});

test("without JavaScript the discovery brief does not submit answers to the server", async (context) => {
  const browser = await launch();
  context.after(() => browser.close());
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto(new URL("/contact", baseURL).href);
  await page.getByLabel("Annual turnover").selectOption("£1m–£4.99m");
  await page.getByLabel("Investment budget").selectOption("Over £5,000–£10,000");
  await page.getByLabel("When do you want to start?").selectOption("Within a month");
  await page.getByLabel("Business name").fill("Example SME");
  await page.getByLabel("Industry").fill("Manufacturing");
  await page.getByLabel("Number of employees").selectOption("10–49");
  await page.getByLabel("What challenge").fill("Private challenge");
  await page.getByLabel("What would you like").fill("Private goal");
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.getByRole("button", { name: "Prepare my brief" }).click();
  assert.equal(new URL(page.url()).search, "");
  assert.deepEqual(requests, []);
});

test("calculator compounds the three inputs and stays usable across viewport sizes", async (context) => {
  const browser = await launch();
  context.after(() => browser.close());
  const page = await browser.newPage();
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(baseURL);
    if (acquisitionEnabled && width === 320) await page.getByRole("button", { name: "Decline optional tracking" }).click();
    await page.locator(".hero-actions").getByRole("link", { name: "Calculate Your Business Growth Potential" }).click();
    assert.equal(await page.getByRole("link", { name: "Discuss your growth opportunities" }).getAttribute("href"), discoveryPath);
    const results = page.getByRole("status");
    await results.getByText("£332,750", { exact: true }).first().waitFor();
    assert.match(await results.innerText(), /£82,750/);
    assert.match(await results.innerText(), /33\.1%/);
    assert.match(await results.innerText(), /Current\s*£250,000/);
    await page.getByRole("spinbutton", { name: "Increase in purchase frequency (%)" }).fill("0");
    await results.getByText("£302,500", { exact: true }).first().waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.getByRole("spinbutton", { name: "Current annual turnover (£)" }).fill("-1");
    await results.getByText("Enter a positive turnover", { exact: false }).waitFor();
  }
});


test("premium programmes model profit and lead to the qualification brief", async (context) => {
  const browser = await launch();
  context.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 320, height: 850 } });
  await page.goto(new URL("/premium-programmes", baseURL).href);
  if (acquisitionEnabled) await page.getByRole("button", { name: "Decline optional tracking" }).click();
  const main = page.locator("main");
  await main.getByText("How much does consulting cost?", { exact: true }).click();
  await main.locator(".programme-faqs").getByText("Private consulting engagements from £3,000.", { exact: false }).waitFor();
  assert.match(await page.locator('meta[name="description"]').getAttribute("content"), /Private consulting engagements from £3,000\./);
  const offers = main.locator(".offer-card");
  assert.deepEqual(await offers.locator("h3").allTextContents(), [
    "Business Growth & Profitability Review",
    "90-Day Profitability & Growth Programme",
    "Fractional Business & Transformation Partner",
  ]);
  const ctas = await main.getByRole("link", { name: "Start Your Discovery Brief" }).evaluateAll(
    (links) => links.map((link) => link.getAttribute("href")),
  );
  assert.deepEqual(ctas, Array(5).fill(discoveryPath));

  await main.getByRole("link", { name: "Estimate your consulting ROI" }).click();
  await page.waitForURL("**/premium-programmes#consultancy-roi");
  const calculator = page.locator("#consultancy-roi");
  const results = calculator.getByRole("status");
  await results.getByText("£10,000", { exact: true }).waitFor();
  assert.match(await results.innerText(), /233\.33%/);
  assert.match(await results.innerText(), /3\.6 months/);
  await calculator.getByRole("spinbutton", { name: "Consulting investment (£)" }).fill("5000");
  await results.getByText("100%", { exact: true }).waitFor();
  await results.getByText("6 months", { exact: true }).waitFor();
  await calculator.getByRole("spinbutton", { name: "Current gross profit margin (%)" }).fill("40");
  await calculator.getByRole("spinbutton", { name: "Current annual operating costs (£)" }).fill("150000");
  await calculator.getByRole("spinbutton", { name: "Estimated one-off implementation expenditure (£)" }).fill("5000");
  await results.getByText("0%", { exact: true }).waitFor();
  await results.getByText("12 months", { exact: true }).waitFor();
  assert.match(await results.innerText(), /Current annual operating profit\s*£50,000/);
  assert.match(await results.innerText(), /Annual operating profit at 42% margin\s*£60,000/);
  await calculator.getByRole("spinbutton", { name: "Estimated one-off implementation expenditure (£)" }).fill("-1");
  await results.getByText("Enter a positive turnover", { exact: false }).waitFor();
  await calculator.getByRole("spinbutton", { name: "Estimated one-off implementation expenditure (£)" }).fill("0");
  await calculator.getByRole("spinbutton", { name: "Potential margin improvement (percentage points)" }).fill("0");
  await results.getByText("No payback at this margin").waitFor();
  await calculator.getByRole("spinbutton", { name: "Annual turnover (£)" }).fill("-1");
  await results.getByText("Enter a positive turnover", { exact: false }).waitFor();

  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  await offers.first().getByRole("link", { name: "Start Your Discovery Brief" }).click();
  await page.waitForURL("**" + discoveryPath);
  assert.equal(await page.getByRole("link", { name: "Continue to Calendly" }).count(), 0);
  if (acquisitionEnabled) await page.getByRole("heading", { name: "Apply for private consulting" }).waitFor();
  else await page.getByRole("button", { name: "Prepare my brief" }).waitFor();
});

test("the footer brand pack exposes working ZIP, SVG and image downloads", async (context) => {
  const browser = await launch();
  context.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 375, height: 850 } });
  await page.goto(new URL("/premium-programmes", baseURL).href);
  if (acquisitionEnabled) await page.getByRole("button", { name: "Decline optional tracking" }).click();
  await page.locator("footer").getByRole("link", { name: "Brand Pack" }).click();
  await page.getByRole("heading", { name: "Brand Pack", exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const downloads = page.locator("main a[download]");
  assert.ok(await downloads.count() >= 60);
  const links = await downloads.evaluateAll((items) => items.map((item) => item.href));
  for (const link of links) {
    const response = await page.request.get(link);
    assert.equal(response.status(), 200, link);
    assert.ok((await response.body()).length > 0, link);
  }
  const zip = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download full ZIP" }).click();
  assert.equal((await zip).suggestedFilename(), "gavin-ferns-brand-pack.zip");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  assert.ok(og.endsWith("/brand-pack/open-graph-dark.jpg"));
});
