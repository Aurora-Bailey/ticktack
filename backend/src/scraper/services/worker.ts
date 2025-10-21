import { createLogger } from "../../utils/logger.ts";
import type { Job } from "../types.ts";
import { fetchQuote } from "../adapters/quotes.ts";
import { persistQuote, updateRanking } from "../../persistence/updater.ts";
import { publishEvent } from "../../events/publisher.ts";

const logger = createLogger("scraper.worker");

export async function handleJob(job: Job) {
  logger.action("SCRAPE", "Executing job", { symbol: job.symbol, tier: job.tier });
  const quote = await fetchQuote(job.symbol);
  if (!quote) {
    await publishEvent("scrape.error", {
      tier: job.tier,
      message: `No quote data for ${job.symbol}`,
      createdAt: new Date(),
    });
    return;
  }

  await persistQuote(job.tier, quote);
  const items = await updateRanking(job.tier);
  logger.action("SCRAPE", "Completed job", {
    symbol: job.symbol,
    tier: job.tier,
    score: items.find((item) => item.symbol === job.symbol)?.score ?? null,
  });
  await publishEvent("ranking.updated", {
    tier: job.tier,
    message: `${job.symbol} refreshed. Top count: ${items.length}`,
    createdAt: new Date(),
    meta: { symbol: job.symbol },
  });
}
