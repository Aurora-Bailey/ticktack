import { ensureIndexes } from "./db/setup.ts";
import { collections } from "./db/mongo.ts";

const FUNDAMENTALS_BASE = "https://api.robinhood.com/fundamentals/";
const REQUEST_THROTTLE_MS = 1000;
const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchNextInstrument() {
  return await collections.robinhood.findOne(
    { "data.tradeable": true },
    {
      sort: {
        fun_pull: 1,
        updatedAt: 1,
      },
    },
  );
}

async function updateFunPull(id: unknown) {
  await collections.robinhood.updateOne({ _id: id }, { $set: { fun_pull: new Date() } });
}

async function upsertFundamentals(symbol: string, url: string, payload: Record<string, unknown>) {
  await collections.fundamentals.updateOne(
    { symbol },
    {
      $set: {
        symbol,
        sourceUrl: url,
        payload,
        fetchedAt: new Date(),
      },
    },
    { upsert: true },
  );
}

async function fetchFundamentals(symbol: string) {
  const url = `${FUNDAMENTALS_BASE}${symbol}/`;
  console.log(`${cyan("[FUND]")} fetching ${url}`);
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    console.error(`${red("[FUND]")} request failed ${response.status} ${response.statusText}`);
    return null;
  }
  const data = (await response.json()) as Record<string, unknown> | { detail?: unknown } | null;
  if (!data || "detail" in data) {
    console.warn(`${yellow("[FUND]")} fundamentals unavailable for ${symbol}`);
    return null;
  }
  return data as Record<string, unknown>;
}

async function run() {
  await ensureIndexes();
  console.log(`${cyan("[FUND]")} starting fundamentals crawler`);

  while (true) {
    const instrument = await fetchNextInstrument();
    if (!instrument) {
      console.log(`${yellow("[FUND]")} no tradable instruments found, sleeping...`);
      await sleep(REQUEST_THROTTLE_MS);
      continue;
    }

    const symbol = instrument.symbol?.toUpperCase();
    if (!symbol) {
      await collections.robinhood.updateOne(
        { _id: instrument._id },
        { $set: { "data.tradable": false, fun_pull: new Date() } },
      );
      continue;
    }

    await updateFunPull(instrument._id);

    const payload = await fetchFundamentals(symbol);
    if (payload) {
      await upsertFundamentals(symbol, instrument.url, payload);
      console.log(`${green("[FUND]")} stored fundamentals for ${symbol}`);
    }

    await sleep(REQUEST_THROTTLE_MS);
  }
}

await run();
