import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { caseStudies, caseStudyPaths } from "../lib/site.ts";

test("each client case study has a distinct page and a real PDF download", () => {
  assert.equal(caseStudies.length, 4);
  assert.equal(new Set(caseStudyPaths).size, 4);
  for (const study of caseStudies) {
    assert.match(study.slug, /^[a-z0-9-]+$/);
    const pdf = readFileSync(new URL(`../public/downloads/${study.slug}.pdf`, import.meta.url));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.ok(pdf.length > 1000, study.name);
    assert.ok(study.context && study.result && study.stage, study.name);
    assert.ok(study.work.length && study.deliverables.length, study.name);
  }
});

test("approved client names and delivery stages are preserved", () => {
  assert.doesNotMatch(JSON.stringify(caseStudies), /Stamford/);
  assert.equal(caseStudies.find(({ slug }) => slug === "mindfulness-business-expansion").client, "Darren | Mindfulness business");
  assert.match(caseStudies.find(({ slug }) => slug === "mindfulness-business-expansion").stage, /target, not an achieved result/);
  assert.match(caseStudies.find(({ slug }) => slug === "sensitive-project-ai").stage, /Initial prototype/);
});
