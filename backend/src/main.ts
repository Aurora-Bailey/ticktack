import { config } from "./config/mod.ts";
import { createLogger } from "./utils/logger.ts";
import "./db/mongo.ts";
import { ensureIndexes } from "./db/setup.ts";
import { startHttpServer } from "./api/routes.ts";
import { startWebSocketServer } from "./websocket/server.ts";
import { startScheduler } from "./orchestration/scheduler.ts";

const logger = createLogger("main");

async function bootstrap() {
  logger.info(`Booting ${config.APP_NAME}`);
  await ensureIndexes();
  const abortController = new AbortController();
  const { signal } = abortController;

  startHttpServer(signal);
  startWebSocketServer(signal);
  startScheduler(signal);

  const handleShutdown = () => {
    logger.info("Shutting down...");
    abortController.abort();
    setTimeout(() => Deno.exit(), 500);
  };

  addEventListener("SIGINT", handleShutdown);
  addEventListener("SIGTERM", handleShutdown);
}

await bootstrap();
