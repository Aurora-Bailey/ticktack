# TickTack – Local StockPulse Stack

TickTack is a localhost-first market radar composed of a Deno backend, MongoDB store, and SvelteKit dashboard. The backend continuously scrapes and ranks equities, publishes updates over WebSockets, and exposes REST endpoints for history retrieval. The frontend renders those updates live with a static, deploy-anywhere Svelte SPA.

## Repository Layout

```
backend/    # Deno runtime: scheduler, scraper, Mongo persistence, WebSocket + HTTP servers
frontend/   # SvelteKit SPA that listens to live WebSocket streams and renders dashboards
docs/       # Architecture notes and diagrams (coming soon)
```

## Backend (Deno)

- Scheduler (`backend/src/orchestration/`) orchestrates tiered refresh cadence (minute/hour/daily/weekly).
- Scraper workers (`backend/src/scraper/`) fetch quotes (Yahoo adapter), compute scores (momentum + trend + volume), and write snapshots to MongoDB.
- Persistence layer (`backend/src/persistence/`) upserts stock metadata, stores historical snapshots, recalculates rankings, and pushes broadcast messages.
- Event bus uses `BroadcastChannel` so rankings + system events reach WebSocket clients and observers.
- HTTP server supplies bootstrap REST endpoints: `GET /rankings/current`, `GET /stocks/:symbol`, `GET /health`.
- WebSocket server streams live ranking updates and events to connected frontends.
- Interest-aware rebalancer promotes or demotes tickers across tiers based on an auto-computed 1–100 activity score, keeping the hot movers on the minute cadence while enforcing tier caps (20 minute, 100 hourly, 1000 daily, 10k weekly) so the queue scales cleanly to ~10k symbols.

### Running the Backend

Requirements: Deno 1.40+, MongoDB (prefer replica set for change streams, but not required thanks to broadcast channel).

```bash
cd backend
deno task seed:robinhood  # crawl Robinhood catalog into the raw instrumentation collection
deno task dev    # starts HTTP on :8080 and WS on :8081
```

The seeding utility hydrates roughly 10,000 tickers by paging through Robinhood’s public `/instruments/` API at one request per second, filtering for active US-tradable symbols, and streaming green `[SEED]` logs (with the running total) as each new entry lands in Mongo. The `robinhood` collection also stores lossless instrument payloads for reference.

Environment variables (see `backend/src/config/mod.ts`):

| Variable | Default | Note |
| --- | --- | --- |
| `HTTP_PORT` | 8080 | REST API port |
| `WS_PORT` | 8081 | WebSocket server port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017` | Connection string |
| `MONGO_DB` | `stockpulse` | Database name |
| `SCRAPE_BATCH_SIZE` | 100 | Max symbols processed per cadence |
| `API_REQUESTS_PER_MINUTE` | 600 | Rate-limiter budget |
| `INTEREST_MINUTE_THRESHOLD` | 75 | Score needed to watch a symbol every minute |
| `INTEREST_HOURLY_THRESHOLD` | 55 | Score needed for the hourly cadence |
| `INTEREST_DAILY_THRESHOLD` | 35 | Score needed for the daily cadence |
| `INTEREST_COOLDOWN_MS` | 600000 | Minimum time between automatic tier shifts |

Put overrides in `.env` within `backend/`.

## Frontend (SvelteKit)

- Static adapter builds to `/frontend/build`.
- Live store (`src/lib/stores/liveRankings.ts`) manages tiered rankings and event log.
- WebSocket client (`src/lib/websocket.ts`) handles reconnect logic and dispatching to stores.
- Dashboard (`src/routes/+page.svelte`) renders top movers, combined highlights, and event feed.
- Detail view (`src/routes/stocks/[symbol]/`) shows price sparkline + snapshot history pulled via REST.

### Running the Frontend

```bash
cd frontend
npm install
npm run dev      # default port 5173
npm run build    # builds static SPA into build/
```

To serve the static build with Deno:

```bash
deno run -A https://deno.land/std@0.224.0/http/file_server.ts build
```

## Development Notes

- Configure Mongo indexes with `deno task seed` (invokes `ensureIndexes` automatically).
- Use `deno task test` to run backend unit tests (currently focused on analytics scoring).
- WebSocket and REST both expect the backend to be running locally; adjust URLs in the frontend store if you redeploy elsewhere.
- The backend’s broadcast channel allows additional consumers—build CLI dashboards or notifier services by listening to `stockpulse-events`.

## Next Steps

1. Build additional scraper adapters (Polygon, AlphaVantage) and plug into `scraper/services`.
2. Extend analytics with RSI/MACD metrics in `backend/src/analytics`.
3. Containerize stack for reproducible deployment.
4. Add docs in `docs/` directory (sequence diagrams, operational runbooks).
