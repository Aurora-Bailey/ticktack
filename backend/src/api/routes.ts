import { serve } from "std/http/server.ts";
import { collections } from "../db/mongo.ts";
import { config } from "../config/mod.ts";
import { createLogger } from "../utils/logger.ts";

const logger = createLogger("http.server");

export function startHttpServer(signal: AbortSignal): AbortController {
  const controller = new AbortController();
  const { signal: httpSignal } = controller;

  serve(async (req) => {
    const url = new URL(req.url);
    const meta = { method: req.method, path: url.pathname };

    if (url.pathname === "/health") {
      logger.action("HTTP", "Health check", meta);
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/rankings/current" && req.method === "GET") {
      const docs = await collections.rankings.find().toArray();
      logger.action("HTTP", "Served rankings snapshot", { ...meta, count: docs.length });
      return new Response(JSON.stringify({ rankings: docs }), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname.startsWith("/stocks/") && req.method === "GET") {
      const symbol = url.pathname.split("/")[2];
      const history = await collections.snapshots.find({ symbol }).sort({ scrapedAt: -1 }).limit(
        500,
      ).toArray();
      logger.action("HTTP", "Served stock history", { ...meta, symbol, count: history.length });
      return new Response(JSON.stringify({ symbol, history }), {
        headers: { "content-type": "application/json" },
      });
    }

    logger.action("HTTP", "Route not found", meta);
    return new Response("Not Found", { status: 404 });
  }, { port: config.HTTP_PORT, signal: httpSignal });

  signal.addEventListener("abort", () => controller.abort());
  logger.info(`HTTP server running on http://localhost:${config.HTTP_PORT}`);
  return controller;
}
