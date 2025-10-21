import { createLogger } from "../utils/logger.ts";
import type { Job } from "../scraper/types.ts";

const logger = createLogger("job.queue");

type Handler = (job: Job) => Promise<void>;

export class JobQueue {
  #queue: Job[] = [];
  #running = false;
  #concurrency: number;
  #active = 0;
  #handler: Handler;

  constructor(concurrency: number, handler: Handler) {
    this.#concurrency = concurrency;
    this.#handler = handler;
  }

  enqueue(job: Job) {
    this.#queue.push(job);
    this.#drain();
  }

  enqueueMany(jobs: Job[]) {
    for (const job of jobs) this.#queue.push(job);
    this.#drain();
  }

  #drain() {
    if (this.#running) return;
    this.#running = true;
    queueMicrotask(() => this.#process());
  }

  async #process(): Promise<void> {
    while (this.#queue.length && this.#active < this.#concurrency) {
      const job = this.#queue.shift();
      if (!job) break;
      this.#active += 1;
      this.#handler(job)
        .catch((err) => logger.error(`Job failed for ${job.symbol}: ${err}`))
        .finally(() => {
          this.#active -= 1;
          this.#running = false;
          this.#drain();
        });
    }

    this.#running = false;
  }
}
