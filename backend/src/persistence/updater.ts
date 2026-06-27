import { collections, type RankingRow, type Tier } from "../db/mongo.ts";
import type { Quote } from "../scraper/types.ts";
import { computeScore } from "../analytics/metrics.ts";
import { createLogger } from "../utils/logger.ts";
import type { OutgoingMessage } from "../types/messages.ts";
import { publish } from "../events/bus.ts";
import { mapInterestScore } from "../utils/interest.ts";

const logger = createLogger("persistence.updater");

export async function persistQuote(tier: Tier, quote: Quote) {
  const breakdown = computeScore(quote);
  const now = new Date();
  const suggestedTier = mapInterestScore(breakdown.interest);

  await collections.stocks.updateOne(
    { symbol: quote.symbol },
    {
      $set: {
        symbol: quote.symbol,
        tier,
        lastSynced: now,
        updatedAt: now,
        price: quote.price,
        changePct: quote.changePct,
        interestScore: breakdown.interest,
        interestBucket: suggestedTier,
        lastInterestUpdate: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  await collections.snapshots.insertOne({
    symbol: quote.symbol,
    window: tier,
    score: breakdown.score,
    price: quote.price,
    changePct: quote.changePct,
    volume: quote.volume,
    interest: breakdown.interest,
    scrapedAt: quote.timestamp,
  });

  logger.action("DB", "Persisted quote snapshot", {
    tier,
    symbol: quote.symbol,
    score: Number(breakdown.score.toFixed(2)),
    interest: breakdown.interest,
    suggestedTier,
  });

  return breakdown;
}

export async function updateRanking(tier: Tier): Promise<RankingRow[]> {
  const cursor = collections.snapshots.aggregate<RankingRow>([
    { $match: { window: tier } },
    { $sort: { scrapedAt: -1 } },
    {
      $group: {
        _id: "$symbol",
        symbol: { $first: "$symbol" },
        score: { $first: "$score" },
        price: { $first: "$price" },
        changePct: { $first: "$changePct" },
        interest: { $first: "$interest" },
      },
    },
    { $sort: { score: -1 } },
    { $limit: 200 },
  ]);

  const items = await cursor.toArray();
  const now = new Date();

  await collections.rankings.updateOne(
    { window: tier },
    { $set: { window: tier, generatedAt: now, items } },
    { upsert: true },
  );

  const message: OutgoingMessage = {
    type: "ranking.update",
    window: tier,
    generatedAt: now.toISOString(),
    items,
  };
  publish(message);
  logger.action("DB", "Updated ranking window", { tier, count: items.length });

  return items;
}
