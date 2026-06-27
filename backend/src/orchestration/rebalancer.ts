import { collections, type StockDocument, type Tier } from "../db/mongo.ts";
import { createLogger } from "../utils/logger.ts";
import { config } from "../config/mod.ts";
import { mapInterestScore } from "../utils/interest.ts";
import { publishEvent } from "../events/publisher.ts";

const logger = createLogger("tier.rebalance");

const TIER_CAPS: Record<"minute" | "hourly" | "daily", { cap: number; fallback: Tier }> = {
  minute: { cap: 20, fallback: "hourly" },
  hourly: { cap: 100, fallback: "daily" },
  daily: { cap: 1000, fallback: "weekly" },
};

async function evaluateStock(doc: StockDocument): Promise<void> {
  if (doc.interestScore === undefined) return;
  const suggested = mapInterestScore(doc.interestScore);
  if (suggested === doc.tier) return;

  const now = new Date();
  const lastShift = doc.tierLastShift ?? doc.createdAt;
  if (now.getTime() - lastShift.getTime() < config.INTEREST_COOLDOWN_MS) return;

  await collections.stocks.updateOne(
    { symbol: doc.symbol },
    {
      $set: {
        tier: suggested,
        tierLastShift: now,
        interestBucket: suggested,
        updatedAt: now,
      },
    },
  );

  logger.action("BAL", "Adjusted tier", {
    symbol: doc.symbol,
    from: doc.tier,
    to: suggested,
    score: doc.interestScore,
  });
  await publishEvent("tier.adjusted", {
    tier: suggested,
    message: `${doc.symbol} moved from ${doc.tier} to ${suggested}`,
    createdAt: now,
    meta: { score: doc.interestScore },
  });
}

async function enforceTierCaps(): Promise<void> {
  for (
    const [tier, { cap, fallback }] of Object.entries(TIER_CAPS) as [
      Tier,
      { cap: number; fallback: Tier },
    ][]
  ) {
    const docs = await collections.stocks.find({ tier }).sort({ interestScore: 1 }).toArray();
    if (docs.length <= cap) continue;
    const overflow = docs.length - cap;
    const demote = docs.slice(0, overflow);
    for (const doc of demote) {
      const now = new Date();
      await collections.stocks.updateOne(
        { symbol: doc.symbol },
        {
          $set: {
            tier: fallback,
            interestBucket: fallback,
            tierLastShift: now,
            updatedAt: now,
          },
        },
      );
      logger.action("BAL", "Cap demotion", {
        symbol: doc.symbol,
        from: tier,
        to: fallback,
        score: doc.interestScore ?? null,
      });
      await publishEvent("tier.capped", {
        tier: fallback,
        message: `${doc.symbol} capped from ${tier} to ${fallback}`,
        createdAt: now,
        meta: { score: doc.interestScore },
      });
    }
  }
}

export async function rebalanceOnce(): Promise<void> {
  const cursor = collections.stocks.find({ interestScore: { $exists: true } });
  for await (const doc of cursor) {
    await evaluateStock(doc as StockDocument);
  }
  await enforceTierCaps();
}

export function startRebalancer(signal: AbortSignal): void {
  const handler = () => {
    rebalanceOnce().catch((error) => logger.error("Rebalance failed", error));
  };

  const interval = setInterval(handler, config.INTEREST_COOLDOWN_MS / 2);
  handler();
  signal.addEventListener("abort", () => clearInterval(interval));
  logger.info("Interest-based tier rebalancer active");
}
