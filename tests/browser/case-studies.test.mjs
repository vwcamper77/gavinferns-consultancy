import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright-core";
import { caseStudies } from "../../lib/site.ts";

const baseURL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

test("case study cards, pages and PDF downloads work on desktop and mobile", async (context) => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium" });
  context.after(() => browser.close());
  for (const width of [1440, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(new URL("/case-studies", baseURL).href);
    assert.equal(await page.locator(".case-study-card").count(), 4);
    assert.equal(await page.locator(".project-card").count(), 2);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    for (const study of caseStudies) {
      await page.goto(new URL("/case-studies", baseURL).href);
      await page.getByRole("link", { name: `Read case study: ${study.name}`, exact: true }).click();
      await page.waitForURL(`**/case-studies/${study.slug}`);
      assert.equal(await page.locator("main h1").innerText(), study.title);
      assert.match(await page.locator("main").innerText(), /The challenge/);
      assert.doesNotMatch(await page.locator("main").innerText(), /Stamford/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute("href")).pathname, `/case-studies/${study.slug}`);
      const link = page.getByRole("link", { name: "Download case study (PDF)", exact: true }).first();
      assert.equal(await link.getAttribute("download"), "");
      const response = await page.request.get(new URL(await link.getAttribute("href"), baseURL).href);
      assert.equal(response.status(), 200);
      assert.match(response.headers()["content-type"], /application\/pdf/);
      assert.equal((await response.body()).subarray(0, 5).toString(), "%PDF-");
    }
    assert.equal((await page.goto(new URL("/case-studies/missing-case-study", baseURL).href)).status(), 404);
    await page.close();
  }
});
