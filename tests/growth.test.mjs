import assert from "node:assert/strict";
import test from "node:test";
import { calculateGrowth } from "../lib/growth.ts";

test("equal 10% gains compound to the example 33.1% growth", () => {
  const result = calculateGrowth(250000, 10, 10, 10);
  assert.equal(Math.round(result.projected), 332750);
  assert.equal(Math.round(result.additional), 82750);
  assert.equal(result.percentage.toFixed(1), "33.1");
});

test("zero and fractional input gains work", () => {
  assert.deepEqual(calculateGrowth(100000, 0, 0, 0), { projected: 100000, additional: 0, percentage: 0 });
  assert.equal(calculateGrowth(1000, 2.5, 0, 0).projected.toFixed(2), "1025.00");
});

test("invalid and overflowing scenarios do not produce projections", () => {
  for (const inputs of [[0, 10, 10, 10], [-1, 10, 10, 10], [100, -10, 10, 10], [100, NaN, 10, 10], [100, Infinity, 10, 10], [Number.MAX_VALUE, 100, 100, 100]]) {
    assert.equal(calculateGrowth(...inputs), null);
  }
});
