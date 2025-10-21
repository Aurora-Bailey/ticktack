import { config } from "../config/mod.ts";
import type { Tier } from "../db/mongo.ts";
import { createLogger } from "../utils/logger.ts";
import { JobQueue } from "./job_queue.ts";
import { getSymbolsByTier } from "./symbol_loader.ts";
import { handleJob } from "../scraper/services/worker.ts";
import { publishEvent } from "../events/publisher.ts";

const logger = createLogger("scheduler");

const queue = new JobQueue(config.API_REQUEST_CONCURRENCY, handleJob);

const tierConfig: Record<Tier, { interval: number; batchSize: number; defaultLimit: number }> = {
  weekly: { interval: config.REFRESH_INTERVALS.weekly, batchSize: config.SCRAPE_BATCH_SIZE, defaultLimit: 10000 },
  daily: { interval: config.REFRESH_INTERVALS.daily, batchSize: Math.min(1000, config.SCRAPE_BATCH_SIZE), defaultLimit: 1000 },
  hourly: { interval: config.REFRESH_INTERVALS.hourly, batchSize: Math.min(300, config.SCRAPE_BATCH_SIZE), defaultLimit: 300 },
  minute: { interval: config.REFRESH_INTERVALS.minute, batchSize: Math.min(50, config.SCRAPE_BATCH_SIZE), defaultLimit: 50 },
};

function jitter(ms: number): number {
  const delta = ms * 0.1;
  return ms + (Math.random() * delta - delta / 2);
}

async function scheduleTier(tier: Tier) {
  const { batchSize, defaultLimit } = tierConfig[tier];
  const symbols = await getSymbolsByTier(tier, defaultLimit);
  if (!symbols.length) {
    await publishEvent("scheduler.warning", {
      tier,
      message: `No symbols registered for ${tier}`,
      createdAt: new Date(),
    });
    return;
  }

  const chosen = symbols.sort(() => Math.random() - 0.5).slice(0, batchSize);
  logger.debug(`Scheduling ${chosen.length} jobs for ${tier}`);
  queue.enqueueMany(chosen.map((symbol) => ({ symbol, tier })));
}

export function startScheduler(signal: AbortSignal) {
  const controllers: number[] = [];
  (Object.keys(tierConfig) as Tier[]).forEach((tier) => {
    const run = () => scheduleTier(tier).catch((err) => logger.error(err));
    run();
    const id = setInterval(run, jitter(tierConfig[tier].interval));
    controllers.push(id as unknown as number);
  });

  signal.addEventListener("abort", () => {
    for (const id of controllers) clearInterval(id as unknown as number);
  });

  logger.info("Scheduler started");
}
