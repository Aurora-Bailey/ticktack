import { collections } from "./mongo.ts";
import { createLogger } from "../utils/logger.ts";

const logger = createLogger("db.setup");

export async function ensureIndexes(): Promise<void> {
  await collections.stocks.createIndexes({
    indexes: [
      { key: { symbol: 1 }, name: "symbol_unique", unique: true },
      { key: { tier: 1 }, name: "tier_idx" },
    ],
  });

  await collections.snapshots.createIndexes({
    indexes: [
      { key: { symbol: 1, window: 1, scrapedAt: -1 }, name: "snapshot_lookup" },
      {
        key: { scrapedAt: 1 },
        name: "snapshot_ttl",
        expireAfterSeconds: 60 * 60 * 24 * 30,
      },
    ],
  });

  await collections.rankings.createIndexes({
    indexes: [
      { key: { window: 1, generatedAt: -1 }, name: "ranking_window" },
    ],
  });

  await collections.events.createIndexes({
    indexes: [
      { key: { createdAt: -1 }, name: "events_recent" },
      { key: { tier: 1, type: 1 }, name: "events_filter" },
    ],
  });

  logger.info("Ensured MongoDB indexes");
}
