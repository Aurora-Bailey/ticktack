import { createLogger } from "../../utils/logger.ts";
import type { Quote } from "../types.ts";

const log = createLogger("adapter.stooq");
const endpoint = "https://stooq.com/q/l/";
const normalize = (symbol: string) => `${symbol.replace(/\.us$/i, "").toLowerCase()}.us`;
const parse = (csv: string) =>
  csv.trim().split(/\r?\n/).filter(Boolean).find((line) => !line.startsWith("Symbol"))?.split(
    ",",
  ) ?? [];

export const fetchQuote = async (symbol: string): Promise<Quote | null> => {
  const stooqSymbol = normalize(symbol);
  const url = `${endpoint}?s=${encodeURIComponent(stooqSymbol)}&i=d&f=sd2t2ohlcv`;
  log.action("NET", "fetch", { symbol: stooqSymbol, url });

  const started = performance.now();
  const response = await fetch(url, { headers: { accept: "text/csv" } }).catch((error) => {
    log.error("request error", error);
    return null;
  });
  if (!response || !response.ok) {
    return log.warning("bad response", { status: response?.status ?? "n/a" }), null;
  }

  const [rawSymbol, date, time, openStr, , , closeStr, volumeStr] = parse(await response.text());
  if (!rawSymbol || !closeStr || closeStr === "N/D") {
    return log.warning("invalid payload", { rawSymbol, closeStr }), null;
  }

  const latencyMs = Number((performance.now() - started).toFixed(2));
  const price = Number(closeStr);
  const open = Number(openStr);
  const volume = Number(volumeStr);
  const changePct = open ? ((price - open) / open) * 100 : 0;

  log.action("NET", "received", { symbol: rawSymbol, latencyMs, price });

  return {
    symbol: rawSymbol.toUpperCase(),
    price,
    changePct,
    volume,
    fiftyDayAverage: price,
    twoHundredDayAverage: price,
    averageVolume: volume,
    timestamp: new Date(`${date}T${time || "00:00:00"}Z`),
    raw: { source: "stooq" },
  };
};
