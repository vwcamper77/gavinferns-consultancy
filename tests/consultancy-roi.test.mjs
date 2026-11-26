import assert from "node:assert/strict";
import test from "node:test";
import { calculateConsultancyRoi } from "../lib/consultancy-roi.ts";

test("models profit, net first-year ROI and payback at constant turnover", () => {
  const result = calculateConsultancyRoi(500000, 10, 2, 3000);
  assert.equal(result.improvedMargin, 12);
  assert.equal(result.currentProfit, 50000);
  assert.equal(result.improvedProfit, 60000);
  assert.equal(result.additionalProfit, 10000);
  assert.equal(result.roi.toFixed(2), "233.33");
  assert.equal(result.paybackMonths.toFixed(1), "3.6");
});

test("handles a loss-making baseline, zero uplift and payback beyond a year", () => {
  const noImprovement = calculateConsultancyRoi(500000, -10, 0, 3000);
  assert.equal(noImprovement.currentProfit, -50000);
  assert.equal(noImprovement.roi, -100);
  assert.equal(noImprovement.paybackMonths, null);

  const modestImprovement = calculateConsultancyRoi(100000, -3, 2, 3000);
  assert.equal(modestImprovement.improvedProfit, -1000);
  assert.equal(modestImprovement.additionalProfit, 2000);
  assert.equal(modestImprovement.paybackMonths, 18);
});

test("rejects invalid and non-finite scenarios", () => {
  for (const inputs of [[0, 10, 2, 3000], [250000, 10, 2, 0], [250000, 10, -2, 3000], [250000, 99, 2, 3000], [Infinity, 10, 2, 3000]]) {
    assert.equal(calculateConsultancyRoi(...inputs), null);
  }
});

test("deducts operating costs once and includes implementation in ROI and payback", () => {
  const result = calculateConsultancyRoi(500000, 40, 2, 3000, 150000, 2000);
  assert.equal(result.currentGrossProfit, 200000);
  assert.equal(result.currentProfit, 50000);
  assert.equal(result.improvedProfit, 60000);
  assert.equal(result.additionalProfit, 10000);
  assert.equal(result.totalInvestment, 5000);
  assert.equal(result.netReturn, 5000);
  assert.equal(result.roi, 100);
  assert.equal(result.paybackMonths, 6);
});

test("rejects invalid costs and out-of-range margins without hiding loss-making businesses", () => {
  for (const costs of [-1, Infinity, NaN, 1e13]) {
    assert.equal(calculateConsultancyRoi(500000, 40, 2, 3000, costs), null);
    assert.equal(calculateConsultancyRoi(500000, 40, 2, 3000, 0, costs), null);
  }
  assert.equal(calculateConsultancyRoi(500000, -101, 2, 3000), null);
  assert.equal(calculateConsultancyRoi(500000, 101, 0, 3000), null);
  assert.equal(calculateConsultancyRoi(500000, 10, 2, 3000, 100000).improvedProfit, -40000);
});
