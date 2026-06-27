import { derived, writable } from 'svelte/store';

export type Tier = 'weekly' | 'daily' | 'hourly' | 'minute';

export interface RankingRow {
  symbol: string;
  score: number;
  price: number;
  changePct: number;
  interest: number;
  sector?: string;
}

export interface RankingPayload {
  type: 'ranking.update';
  window: Tier;
  generatedAt: string;
  items: RankingRow[];
}

export interface EventPayload {
  type: 'event';
  eventType: string;
  payload: {
    tier: Tier;
    message: string;
    createdAt: string;
    meta?: Record<string, unknown>;
  };
}

export interface BootstrapPayload {
  type: 'bootstrap';
  rankings: { window: Tier; generatedAt: string; items: RankingRow[] }[];
}

type Message = RankingPayload | EventPayload | BootstrapPayload;

export const rankings = writable<Record<Tier, RankingRow[]>>({
  weekly: [],
  daily: [],
  hourly: [],
  minute: []
});

export const events = writable<EventPayload['payload'][]>([]);

export function applyMessage(message: Message) {
  if (message.type === 'bootstrap') {
    const map: Record<Tier, RankingRow[]> = { weekly: [], daily: [], hourly: [], minute: [] };
    for (const doc of message.rankings) {
      map[doc.window] = doc.items;
    }
    rankings.set(map);
    return;
  }

  if (message.type === 'ranking.update') {
    rankings.update((current) => ({ ...current, [message.window]: message.items }));
    return;
  }

  if (message.type === 'event') {
    events.update((list) => [message.payload, ...list].slice(0, 100));
  }
}

export const topCombined = derived(rankings, ($rankings) => {
  return [
    ...$rankings.minute,
    ...$rankings.hourly.filter((row) => !$rankings.minute.find((m) => m.symbol === row.symbol)),
    ...$rankings.daily.filter((row) => !$rankings.minute.find((m) => m.symbol === row.symbol)),
  ]
    .sort((a, b) => b.interest - a.interest)
    .slice(0, 50);
});
