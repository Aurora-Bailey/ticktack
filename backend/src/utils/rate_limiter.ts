type QueueItem<T> = {
  payload: T;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

export class RateLimiter<T> {
  #intervalMs: number;
  #capacity: number;
  #queue: QueueItem<T>[] = [];
  #active = 0;
  #timer?: number;
  #handler: (payload: T) => Promise<unknown>;

  constructor(options: { intervalMs: number; capacity: number; handler: (payload: T) => Promise<unknown> }) {
    this.#intervalMs = options.intervalMs;
    this.#capacity = options.capacity;
    this.#handler = options.handler;
  }

  enqueue(payload: T): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.#queue.push({ payload, resolve, reject });
      this.#schedule();
    });
  }

  #schedule() {
    if (this.#active >= this.#capacity) return;
    const item = this.#queue.shift();
    if (!item) return;

    this.#active += 1;
    this.#handler(item.payload)
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        this.#active -= 1;
        this.#timer = setTimeout(() => this.#schedule(), this.#intervalMs) as unknown as number;
      });
  }
}
