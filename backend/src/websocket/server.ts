import { serve } from "std/http/server.ts";
import { createLogger } from "../utils/logger.ts";
import { config } from "../config/mod.ts";
import { collections } from "../db/mongo.ts";
import type { OutgoingMessage } from "../types/messages.ts";
import { subscribe } from "../events/bus.ts";

const logger = createLogger("ws.server");

export function startWebSocketServer(signal: AbortSignal): AbortController {
  const controller = new AbortController();
  const { signal: wsSignal } = controller;

  serve(async (req) => {
    const { socket, response } = Deno.upgradeWebSocket(req);
    let unsubscribe: (() => void) | undefined;
    const clientMeta = {
      origin: req.headers.get("origin") ?? "unknown",
      protocol: req.headers.get("sec-websocket-protocol") ?? "ws",
    };

    socket.onopen = async () => {
      logger.action("WS", "Client connected", clientMeta);
      const docs = await collections.rankings.find().toArray();
      const payload: OutgoingMessage = {
        type: "bootstrap",
        rankings: docs,
      };
      socket.send(JSON.stringify(payload));
      logger.action("WS", "Sent bootstrap payload", { ...clientMeta, tiers: docs.length });
      unsubscribe = subscribe((message) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(message));
          if (message.type === "ranking.update") {
            logger.action("WS", `Pushed ranking update (${message.window})`, {
              ...clientMeta,
              count: message.items.length,
            });
          } else if (message.type === "event") {
            logger.action("WS", `Pushed event ${message.eventType}`, {
              ...clientMeta,
              tier: message.payload.tier,
            });
          }
        }
      });
    };

    socket.onclose = () => {
      unsubscribe?.();
      logger.action("WS", "Client disconnected", clientMeta);
    };

    socket.onerror = (err) => {
      logger.error(`WebSocket error: ${JSON.stringify(err)}`);
      logger.action("WS", "Socket error", { ...clientMeta, error: JSON.stringify(err) });
    };

    return response;
  }, { port: config.WS_PORT, signal: wsSignal });

  signal.addEventListener("abort", () => {
    controller.abort();
  });

  logger.info(`WebSocket server running on ws://localhost:${config.WS_PORT}`);
  return controller;
}
