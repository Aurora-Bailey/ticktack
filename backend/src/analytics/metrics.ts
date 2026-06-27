import type { Quote } from "../scraper/types.ts";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface ScoreBreakdown {
  symbol: string;
  score: number;
  interest: number;
  components: {
    momentum: number;
    trend: number;
    volume: number;
  };
}

export function computeScore(quote: Quote): ScoreBreakdown {
  const momentum = quote.changePct;
  const trendBaseline = quote.fiftyDayAverage || quote.twoHundredDayAverage || quote.price;
  const trend = trendBaseline ? ((quote.price - trendBaseline) / trendBaseline) * 100 : 0;
  const volumeRatio = quote.averageVolume ? quote.volume / quote.averageVolume : 1;
  const volumeScore = (volumeRatio - 1) * 10;

  const score = momentum * 0.5 + trend * 0.35 + volumeScore * 0.15;

  const changeComponent = clamp(Math.abs(momentum) * 8, 0, 80);
  const volumeComponent = clamp((volumeRatio - 1) * 25, 0, 20);
  const interest = clamp(changeComponent + volumeComponent, 1, 100);

  return {
    symbol: quote.symbol,
    score,
    interest,
    components: {
      momentum,
      trend,
      volume: volumeScore,
    },
  };
}
