import type { Quote } from "../scraper/types.ts";

export interface ScoreBreakdown {
  symbol: string;
  score: number;
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

  return {
    symbol: quote.symbol,
    score,
    components: {
      momentum,
      trend,
      volume: volumeScore,
    },
  };
}
