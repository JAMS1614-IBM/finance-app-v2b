import type { HistoryBySymbol, PricePoint } from './types';

export interface RankedChange {
  symbol: string;
  changePercent: number;
}

/** Percent change from the first to the last point; null when there is nothing to compare. */
export function windowChangePercent(points: PricePoint[]): number | null {
  if (points.length < 2 || points[0].close === 0) return null;
  return ((points[points.length - 1].close - points[0].close) / points[0].close) * 100;
}

/** Best performer first. Symbols with no usable data are left out. */
export function rankByChange(history: HistoryBySymbol): RankedChange[] {
  return Object.entries(history)
    .flatMap(([symbol, points]) => {
      const changePercent = windowChangePercent(points);
      return changePercent === null ? [] : [{ symbol, changePercent }];
    })
    .sort((a, b) => b.changePercent - a.changePercent);
}
