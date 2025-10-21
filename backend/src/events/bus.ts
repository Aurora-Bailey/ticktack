import type { OutgoingMessage } from "../types/messages.ts";

type Listener = (message: OutgoingMessage) => void;

const listeners = new Set<Listener>();

export function publish(message: OutgoingMessage) {
  for (const listener of listeners) {
    try {
      listener(message);
    } catch (error) {
      console.error("event bus listener error", error);
    }
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
