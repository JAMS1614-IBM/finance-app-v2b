export type TimeWindow = 'today' | 'week' | 'quarter';

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface PricePoint {
  /** Epoch milliseconds */
  time: number;
  close: number;
}

export type HistoryBySymbol = Record<string, PricePoint[]>;

/** One row of a merged chart dataset: `time` plus one percent-change value per symbol. */
export type ChartRow = { time: number } & Record<string, number | undefined>;
