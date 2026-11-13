import type { HistoryBySymbol, Quote, TimeWindow } from '../domain/types';

/** The only thing the UI knows about market data. Swap implementations without touching components. */
export interface MarketDataService {
  getQuotes(symbols: string[]): Promise<Quote[]>;
  getHistory(symbols: string[], window: TimeWindow): Promise<HistoryBySymbol>;
}
