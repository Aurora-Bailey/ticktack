import { config } from "../config/mod.ts";

type Level = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
type ActionType = "NET" | "HTTP" | "WS" | "SCRAPE" | "DB";

const LEVEL_WEIGHT: Record<Level, number> = {
  DEBUG: 10,
  INFO: 20,
  WARNING: 30,
  ERROR: 40,
  CRITICAL: 50,
};

const GLOBAL_LEVEL = config.LOG_LEVEL as Level;
const LOG_FILE_NAME = `logs/${config.APP_NAME}-${new Date().toISOString().slice(0, 10)}.log`;

const LEVEL_COLOR: Record<Level, (text: string) => string> = {
  DEBUG: (text) => dim(text),
  INFO: (text) => cyan(text),
  WARNING: (text) => yellow(text),
  ERROR: (text) => red(text),
  CRITICAL: (text) => magenta(text),
};

const ACTION_COLOR: Record<ActionType, (text: string) => string> = {
  NET: (text) => blue(text),
  HTTP: (text) => green(text),
  WS: (text) => magenta(text),
  SCRAPE: (text) => cyan(text),
  DB: (text) => yellow(text),
};

await Deno.mkdir("logs", { recursive: true });

function color(code: number, text: string) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

function bold(text: string) {
  return color(1, text);
}

function dim(text: string) {
  return color(2, text);
}

function cyan(text: string) {
  return color(36, text);
}

function yellow(text: string) {
  return color(33, text);
}

function red(text: string) {
  return color(31, text);
}

function magenta(text: string) {
  return color(35, text);
}

function blue(text: string) {
  return color(34, text);
}

function green(text: string) {
  return color(32, text);
}

class SimpleLogger {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }

  #shouldLog(level: Level) {
    return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[GLOBAL_LEVEL];
  }

  #writeToFile(payload: Record<string, unknown>) {
    const line = `${JSON.stringify(payload)}\n`;
    void Deno.writeTextFile(LOG_FILE_NAME, line, { append: true });
  }

  #log(level: Level, msg: unknown, ...args: unknown[]) {
    if (!this.#shouldLog(level)) return;
    const timestamp = new Date().toISOString();
    const message = typeof msg === "string" ? msg : JSON.stringify(msg);
    const levelLabel = LEVEL_COLOR[level](`[${level}]`);
    const loggerLabel = bold(`[${this.#name}]`);
    const line = `${levelLabel} ${dim(timestamp)} ${loggerLabel} ${message}`;

    switch (level) {
      case "ERROR":
      case "CRITICAL":
        console.error(line, ...args);
        break;
      case "WARNING":
        console.warn(line, ...args);
        break;
      default:
        console.log(line, ...args);
    }

    this.#writeToFile({
      level,
      timestamp,
      logger: this.#name,
      message,
      args,
    });
  }

  #logAction(type: ActionType, message: string, meta?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const pickColor = ACTION_COLOR[type] ?? ((text: string) => text);
    const symbol = pickColor("➜");
    const badge = bold(pickColor(`[${type}]`));
    const loggerLabel = bold(`[${this.#name}]`);
    const metaArgs = meta ? [dim(JSON.stringify(meta))] : [];
    console.log(`${symbol} ${badge} ${dim(timestamp)} ${loggerLabel} ${message}`, ...metaArgs);

    this.#writeToFile({
      level: "ACTION",
      action: type,
      timestamp,
      logger: this.#name,
      message,
      meta,
    });
  }

  debug(msg: unknown, ...args: unknown[]) {
    this.#log("DEBUG", msg, ...args);
  }

  info(msg: unknown, ...args: unknown[]) {
    this.#log("INFO", msg, ...args);
  }

  warning(msg: unknown, ...args: unknown[]) {
    this.#log("WARNING", msg, ...args);
  }

  error(msg: unknown, ...args: unknown[]) {
    this.#log("ERROR", msg, ...args);
  }

  critical(msg: unknown, ...args: unknown[]) {
    this.#log("CRITICAL", msg, ...args);
  }

  action(type: ActionType, message: string, meta?: Record<string, unknown>) {
    this.#logAction(type, message, meta);
  }
}

export type Logger = SimpleLogger;

export function createLogger(name: string): Logger {
  return new SimpleLogger(name);
}
