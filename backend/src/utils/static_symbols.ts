import type { Tier } from "../db/mongo.ts";

export const DEFAULT_SYMBOLS: { symbol: string; tier: Tier; name?: string }[] = [
  { symbol: "AAPL", tier: "minute", name: "Apple" },
  { symbol: "MSFT", tier: "minute", name: "Microsoft" },
  { symbol: "GOOGL", tier: "hourly", name: "Alphabet" },
  { symbol: "TSLA", tier: "hourly", name: "Tesla" },
  { symbol: "NVDA", tier: "daily", name: "NVIDIA" },
  { symbol: "AMZN", tier: "daily", name: "Amazon" },
  { symbol: "META", tier: "weekly", name: "Meta Platforms" },
];
