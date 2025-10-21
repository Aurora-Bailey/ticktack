import type { RankingDocument, RankingRow, Tier } from "../db/mongo.ts";

export interface RankingUpdateMessage {
  type: "ranking.update";
  window: Tier;
  generatedAt: string;
  items: RankingRow[];
}

export interface EventMessage {
  type: "event";
  eventType: string;
  payload: {
    tier: Tier;
    message: string;
    createdAt: string;
    meta?: Record<string, unknown>;
  };
}

export interface BootstrapMessage {
  type: "bootstrap";
  rankings: RankingDocument[];
}

export type OutgoingMessage = RankingUpdateMessage | EventMessage | BootstrapMessage;
