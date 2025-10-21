import { assertAlmostEquals } from "std/testing/asserts.ts";
import { computeScore } from "../src/analytics/metrics.ts";

Deno.test("computeScore blends momentum and trend", () => {
  const breakdown = computeScore({
    symbol: "TEST",
    price: 110,
    changePct: 5,
    volume: 200,
    fiftyDayAverage: 100,
    twoHundredDayAverage: 95,
    averageVolume: 100,
    timestamp: new Date(),
    raw: {},
  });

  assertAlmostEquals(breakdown.score, 5 * 0.5 + ((110 - 100) / 100) * 100 * 0.35 + ((200 / 100 - 1) * 10) * 0.15);
});
