import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";
import { routes } from "../../lib/site.ts";

const baseURL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

async function launch() {
  return chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium" });
}

test("all 12 pages render and the production preview is noindex", async (context) => {
  const browser = await launch();
  context.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(baseURL);
  assert.match(await page.locator("h1").innerText(), /Think Bigger\.\s*Lead Better\.\s*Grow Smarter\./);
  assert.equal((await page.request.get(new URL("/hero.webp", baseURL).href)).status(), 200);
  assert.equal((await page.request.get(new URL("/social-card.jpg", baseURL).href)).status(), 200);
  for (const slug of ["", ...routes]) {
    const path = `/${slug}`;
    const response = await page.goto(new URL(path, baseURL).href);
    assert.equal(response.status(), 200, path);
    assert.equal(await page.locator("main h1").count(), 1, path);
    assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex/);
    assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute("href")).href, `https://gavinferns.com${path}`);
    assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
    assert.equal(await page.locator('a[href*="instagram.com"], a[href*="youtube.com"]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, path);
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
  await page.locator(".mobile-nav summary").click();
  await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Book a Strategic Discovery Call" }).click();
  await page.waitForURL("**/contact");
  assert.equal(await page.locator(".mobile-nav").getAttribute("open"), null);

  for (const [name, value] of [
    ["Annual turnover", "£1m–£4.99m"],
    ["Investment budget", "£9,997–£14,999"],
    ["When do you want to start?", "Within a month"],
  ]) await page.getByLabel(name).selectOption(value);
  await page.getByLabel("What challenge").fill("Manual customer handoffs");
  await page.getByLabel("What would you like").fill("Reduce processing delays");
  const requests = [];
  page.on("request", (request) => requests.push(request));
  await page.getByRole("button", { name: "Prepare my brief" }).click();
  const brief = await page.getByLabel("Your discovery brief").inputValue();
  assert.match(brief, /Manual customer handoffs/);
  assert.match(brief, /Reduce processing delays/);
  assert.match(brief, /£9,997–£14,999/);
  await page.getByRole("button", { name: "Copy brief" }).click();
  await page.getByText("Brief copied.", { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), brief);
  assert.equal(await page.getByRole("link", { name: "Continue to Calendly" }).getAttribute("href"), "https://calendly.com/gavinferns");
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
  await page.getByRole("combobox", { name: "Investment budget" }).selectOption("Below £2,997");
  assert.equal(await page.getByLabel("Your discovery brief").count(), 0);
  await page.getByRole("button", { name: "Prepare my brief" }).click();
  await page.getByText("Programmes start at £2,997.", { exact: false }).waitFor();
});

test("without JavaScript the discovery brief does not submit answers to the server", async (context) => {
  const browser = await launch();
  context.after(() => browser.close());
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto(new URL("/contact", baseURL).href);
  await page.getByLabel("Annual turnover").selectOption("£1m–£4.99m");
  await page.getByLabel("Investment budget").selectOption("£9,997–£14,999");
  await page.getByLabel("When do you want to start?").selectOption("Within a month");
  await page.getByLabel("What challenge").fill("Private challenge");
  await page.getByLabel("What would you like").fill("Private goal");
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.getByRole("button", { name: "Prepare my brief" }).click();
  assert.equal(new URL(page.url()).search, "");
  assert.deepEqual(requests, []);
});
