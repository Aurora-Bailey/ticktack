export interface Quote {
  symbol: string;
  price: number;
  changePct: number;
  volume: number;
  fiftyDayAverage: number;
  twoHundredDayAverage: number;
  averageVolume: number;
  timestamp: Date;
  raw: Record<string, unknown>;
}

export interface Job {
  symbol: string;
  tier: "weekly" | "daily" | "hourly" | "minute";
}
