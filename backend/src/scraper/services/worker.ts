import { createLogger } from "../../utils/logger.ts";
import type { Job } from "../types.ts";
import { fetchQuote } from "../adapters/quotes.ts";
import { persistQuote, updateRanking } from "../../persistence/updater.ts";
import { publishEvent } from "../../events/publisher.ts";

const logger = createLogger("scraper.worker");

const THROTTLE_MS = 1000;
let throttleChain: Promise<void> = Promise.resolve();
let lastFetchAt = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function enforceThrottle() {
  throttleChain = throttleChain.then(async () => {
    const now = Date.now();
    const wait = Math.max(0, THROTTLE_MS - (now - lastFetchAt));
    if (wait > 0) {
      logger.action("NET", "Throttle pause", { waitMs: wait });
      await sleep(wait);
    }
    lastFetchAt = Date.now();
  });
  await throttleChain;
}

export async function handleJob(job: Job) {
  logger.action("SCRAPE", "Executing job", { symbol: job.symbol, tier: job.tier });
  await enforceThrottle();
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
