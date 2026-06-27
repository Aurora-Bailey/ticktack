import { MongoClient } from "mongo";
import { config } from "../config/mod.ts";
import { createLogger } from "../utils/logger.ts";

const logger = createLogger("db");

const client = new MongoClient();
await client.connect(config.MONGO_URI);

export const db = client.database(config.MONGO_DB);

logger.info(`Connected to MongoDB at ${config.MONGO_URI}/${config.MONGO_DB}`);

export const collections = {
  stocks: db.collection<StockDocument>("stocks"),
  rankings: db.collection<RankingDocument>("rankings"),
  snapshots: db.collection<SnapshotDocument>("snapshots"),
  events: db.collection<EventDocument>("events"),
  robinhood: db.collection<RobinhoodInstrumentDocument>("robinhood"),
  fundamentals: db.collection<FundamentalsDocument>("fundamentals"),
};

export type Tier = "weekly" | "daily" | "hourly" | "minute";

export interface StockDocument {
  _id: { $oid: string } | undefined;
  symbol: string;
  name?: string;
  sector?: string;
  tier: Tier;
  fundamentals?: Record<string, unknown>;
  lastSynced?: Date;
  interestScore?: number;
  interestBucket?: Tier;
  lastInterestUpdate?: Date;
  tierLastShift?: Date;
  scrapeEligible?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnapshotDocument {
  _id?: { $oid: string };
  symbol: string;
  window: Tier;
  score: number;
  price: number;
  changePct: number;
  volume: number;
  interest: number;
  scrapedAt: Date;
}

export interface RankingRow {
  symbol: string;
  score: number;
  price: number;
  changePct: number;
  interest: number;
  sector?: string;
}

export interface RankingDocument {
  _id?: { $oid: string };
  window: Tier;
  generatedAt: Date;
  items: RankingRow[];
}

export interface EventDocument {
  _id?: { $oid: string };
  type: "job" | "alert" | "error";
  tier: Tier;
  symbol?: string;
  message: string;
  createdAt: Date;
  meta?: Record<string, unknown>;
}

export interface RobinhoodInstrumentDocument {
  _id?: { $oid: string };
  symbol?: string;
  url: string;
  data: Record<string, unknown>;
  fun_pull?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FundamentalsDocument {
  _id?: { $oid: string };
  symbol: string;
  sourceUrl: string;
  fetchedAt: Date;
  payload: Record<string, unknown>;
}
