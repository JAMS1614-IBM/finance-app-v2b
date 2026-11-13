import type { ChartRow, HistoryBySymbol, PricePoint } from './types';

/** Percent change from the first point, so symbols with different prices share one axis. */
export function toPercentChange(points: PricePoint[]): PricePoint[] {
  if (points.length === 0 || points[0].close === 0) return [];
  const base = points[0].close;
  return points.map((p) => ({ time: p.time, close: ((p.close - base) / base) * 100 }));
}

/** Merge per-symbol series into rows keyed by timestamp. Gaps stay undefined. */
export function buildChartRows(history: HistoryBySymbol): ChartRow[] {
  const rows = new Map<number, ChartRow>();
  for (const [symbol, points] of Object.entries(history)) {
    for (const p of toPercentChange(points)) {
      const row = rows.get(p.time) ?? ({ time: p.time } as ChartRow);
      row[symbol] = p.close;
      rows.set(p.time, row);
    }
  }
  return [...rows.values()].sort((a, b) => a.time - b.time);
}
