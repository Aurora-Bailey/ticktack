import type { Tier } from "../db/mongo.ts";
import { config } from "../config/mod.ts";

export function mapInterestScore(score: number): Tier {
  if (score >= config.INTEREST_MINUTE_THRESHOLD) return "minute";
  if (score >= config.INTEREST_HOURLY_THRESHOLD) return "hourly";
  if (score >= config.INTEREST_DAILY_THRESHOLD) return "daily";
  return "weekly";
}
