import { ensureIndexes } from "../db/setup.ts";
import { seedSymbols } from "../orchestration/symbol_loader.ts";
import { DEFAULT_SYMBOLS } from "../utils/static_symbols.ts";
import { createLogger } from "../utils/logger.ts";
import { config } from "../config/mod.ts";
import "../db/mongo.ts";

const logger = createLogger("scripts.seed");

await ensureIndexes();
await seedSymbols(DEFAULT_SYMBOLS);
logger.info(`Seeded ${DEFAULT_SYMBOLS.length} symbols into ${config.MONGO_DB}`);
