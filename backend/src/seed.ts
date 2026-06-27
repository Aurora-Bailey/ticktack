import { ensureIndexes } from "./db/setup.ts";
import { collections } from "./db/mongo.ts";

const API_URL = "https://api.robinhood.com/instruments/?active_instruments_only=true";
const REQUEST_THROTTLE_MS = 1000;

const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;

interface RobinhoodInstrument {
  url?: string;
  id?: string;
  symbol?: string;
  [key: string]: unknown;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function normaliseSymbol(symbol?: string | null): string | undefined {
  return symbol ? symbol.toUpperCase() : undefined;
}

function instrumentKey(instrument: RobinhoodInstrument): string {
  if (instrument.url) return instrument.url;
  if (instrument.id) return instrument.id;
  if (instrument.symbol) return instrument.symbol;
  throw new Error("Instrument missing unique identifier");
}

let total = await collections.robinhood.countDocuments({});
let inserted = 0;
let updated = 0;

await ensureIndexes();

let pageUrl: string | null = API_URL;
let page = 1;

while (pageUrl) {
  console.log(`${cyan("[SEED]")} fetching page ${page} ${pageUrl}`);
  const response = await fetch(pageUrl, { headers: { accept: "application/json" } });
  if (!response.ok) {
    console.error(`${yellow("[SEED]")} request failed ${response.status} ${response.statusText}`);
    break;
  }

  const payload = await response.json() as {
    results?: RobinhoodInstrument[];
    next?: string | null;
  };
  const items = payload.results ?? [];

  for (const instrument of items) {
    let key: string;
    try {
      key = instrumentKey(instrument);
    } catch (error) {
      console.warn(`${yellow("[SEED]")} skipped instrument without identifier:`, error);
      continue;
    }

    const now = new Date();
    const symbol = normaliseSymbol(instrument.symbol);
    const updateResult = await collections.robinhood.updateOne(
      { url: key },
      {
        $set: {
          url: key,
          symbol,
          data: instrument,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    if (updateResult.upsertedId) {
      total += 1;
      inserted += 1;
      console.log(`${green("[SEED]")} ${total} ${symbol ?? key}`);
    } else if (updateResult.modifiedCount) {
      updated += 1;
    }
  }

  page += 1;
  pageUrl = payload.next ?? null;
  if (pageUrl) await sleep(REQUEST_THROTTLE_MS);
}

console.log(
  `${cyan("[SEED]")} completed: ${total} total, ${inserted} inserted, ${updated} updated`,
);
