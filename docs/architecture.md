# TickTack Architecture

## Runtime Overview

```
┌─────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│  Scheduler  │──────▶│ Scraper Workers      │──────▶│ MongoDB Persistent Store│
└─────────────┘       └──────────────────────┘       └─────────┬───────────────┘
        ▲                         │                              │
        │                         ▼                              │
        │             ┌────────────────────┐                     │
        │             │ Analytics & Ranking│                     │
        │             └─────────┬──────────┘                     │
        │                       │                                │
        │                       ▼                                ▼
        │             ┌────────────────────┐           ┌──────────────────────┐
        │             │ Broadcast Channel  │──────────▶│ WebSocket Server     │
        │             └────────────────────┘           └─────────┬────────────┘
        │                                                        │
        ▼                                                        ▼
┌──────────────────┐                                  ┌────────────────────────┐
│ Cron-style Timers │                                  │ SvelteKit Frontend SPA│
└──────────────────┘                                  └────────────────────────┘
```

- Scheduler seeds jobs per tier (minute/hourly/daily/weekly), distributing symbols through a concurrency-limited job queue.
- Scraper workers fetch quotes (Yahoo adapter today, pluggable for additional vendors), normalize payloads, and persist results.
- Persistence layer computes analytics, stores snapshots, emits ranking documents, and pushes events to the broadcast channel.
- WebSocket server fans out broadcast messages to connected clients; HTTP server exposes bootstrap and history endpoints.
- Frontend consumes bootstrap REST + WS streams to keep the UI live without polling.

## Key Modules

| Module | Purpose |
| --- | --- |
| `src/config/` | Typed environment handling, refresh intervals, rate limits |
| `src/db/` | Mongo connection, collections, index management |
| `src/analytics/metrics.ts` | Score computation (momentum, trend, volume ratios) |
| `src/orchestration/` | Job queue, scheduler, symbol seeding |
| `src/scraper/` | Data adapters, worker executor |
| `src/persistence/` | Snapshot storage, ranking aggregation, broadcast |
| `src/websocket/` | HTTP upgrade server, bootstrap, client broadcast |
| `frontend/src/lib/stores/` | Ranking/event stores shared across UI |
| `frontend/src/lib/websocket.ts` | Lifecycle-managed client connection |

## Data Model Highlights

- **stocks**: canonical symbol metadata + tier assignment.
- **snapshots**: rolling historical documents keyed by `symbol` + `window`; TTL index trims old minute-level data.
- **rankings**: top N ranking per window for fast bootstrap.
- **events**: operational and alert messages for audit/replay.

## Operational Flow

1. `JobQueue` receives tier jobs and executes workers respecting concurrency.
2. Worker fetches quotes, computes score and component breakdown.
3. Persistence writes to `stocks` + `snapshots`, recomputes ranking via aggregation pipeline.
4. Ranking + event messages broadcast to `stockpulse-events` channel, picked up by WebSocket server and any other subscribers.
5. Frontend store applies incoming messages and updates UI reactively.

## Extensibility Hooks

- Add new adapters under `src/scraper/adapters/` implementing `fetchQuote` signature.
- Extend analytics by adding component functions in `src/analytics` and updating `computeScore` weights.
- Subscribe to broadcast channel from CLI or service workers for notifications/alerting.
- Replace static symbol seeding with ingestion pipeline (CSV loader, Robinhood symbol API, etc.).
- Introduce cached derived datasets (sector momentum, volatility buckets) with new Mongo collections.
