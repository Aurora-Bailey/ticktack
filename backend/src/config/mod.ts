import { load } from "std/dotenv/mod.ts";
import { z } from "zod";

const envFromFile = await load({ envPath: ".env", defaultsPath: undefined });
for (const [key, value] of Object.entries(envFromFile)) {
  if (value !== undefined) {
    Deno.env.set(key, value);
  }
}
const env = { ...envFromFile, ...Deno.env.toObject() };

const ConfigSchema = z.object({
  APP_NAME: z.string().default("stockpulse"),
  HTTP_PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  WS_PORT: z.coerce.number().int().min(1).max(65535).default(8081),
  MONGO_URI: z.string().default("mongodb://127.0.0.1:27017"),
  MONGO_DB: z.string().default("stockpulse"),
  LOG_LEVEL: z.enum(["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]).default("INFO"),
  SCRAPE_BATCH_SIZE: z.coerce.number().int().min(1).max(1000).default(100),
  API_REQUEST_CONCURRENCY: z.coerce.number().int().min(1).max(50).default(8),
  API_REQUESTS_PER_MINUTE: z.coerce.number().int().min(10).max(5000).default(600),
  API_KEY_YAHOO: z.string().optional(),
  API_KEY_POLYGON: z.string().optional(),
  ENABLE_CHANGE_STREAMS: z.coerce.boolean().default(false),
});

const DEFAULT_REFRESH_INTERVALS = {
  weekly: 1000 * 60 * 60 * 24 * 7,
  daily: 1000 * 60 * 60 * 24,
  hourly: 1000 * 60 * 60,
  minute: 1000 * 60,
};

type Config = z.infer<typeof ConfigSchema> & {
  REFRESH_INTERVALS: typeof DEFAULT_REFRESH_INTERVALS;
};

const parsed = ConfigSchema.parse(env);

export const config: Config = {
  ...parsed,
  REFRESH_INTERVALS: DEFAULT_REFRESH_INTERVALS,
};

type IntervalKey = keyof typeof DEFAULT_REFRESH_INTERVALS;

export function getRefreshInterval(interval: IntervalKey): number {
  return config.REFRESH_INTERVALS[interval];
}
