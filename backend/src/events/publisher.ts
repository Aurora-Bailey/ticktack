import { createLogger } from "../utils/logger.ts";
import { collections, type Tier } from "../db/mongo.ts";
import { publish } from "./bus.ts";
import type { OutgoingMessage } from "../types/messages.ts";

const logger = createLogger("events.publisher");

export type EventPayload = {
  tier: Tier;
  message: string;
  createdAt: Date;
  meta?: Record<string, unknown>;
};

export async function publishEvent(type: string, payload: EventPayload) {
  const message: OutgoingMessage = { type: "event", eventType: type, payload };
  publish(message);
  await collections.events.insertOne({
    type,
    tier: payload.tier,
    message: payload.message,
    createdAt: payload.createdAt,
    meta: payload.meta,
  });
  logger.debug(`Published event ${type}`);
}
