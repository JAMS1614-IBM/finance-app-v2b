import type { HistoryBySymbol, PricePoint, Quote, TimeWindow } from '../../src/domain/types';
import { latestSession } from '../../src/domain/session';
import { MarketDataError } from '../../src/services/errors';
import type { MarketDataService } from '../../src/services/marketDataService';

const DAY_MS = 24 * 60 * 60 * 1000;

export type YahooInterval = '5m' | '30m' | '1d';

/** The single table that defines what each UI window means upstream. */
export const YAHOO_WINDOWS: Record<TimeWindow, { lookbackMs: number; interval: YahooInterval }> = {
  // Five days of 5m bars so a weekend or holiday still contains a full session; trimmed in getHistory.
  today: { lookbackMs: 5 * DAY_MS, interval: '5m' },
  week: { lookbackMs: 7 * DAY_MS, interval: '30m' },
  quarter: { lookbackMs: 92 * DAY_MS, interval: '1d' },
};

/** The slice of yahoo-finance2 this provider uses. Narrow so tests can fake it. */
export interface YahooClient {
  quote(symbols: string[]): Promise<
    {
      symbol: string;
      regularMarketPrice?: number;
      regularMarketChange?: number;
      regularMarketChangePercent?: number;
    }[]
  >;
  chart(
    symbol: string,
    options: { period1: Date; interval: YahooInterval },
  ): Promise<{ quotes: { date: Date; close: number | null }[] }>;
}

const NOT_FOUND = /no data found|not found|delisted/i;
const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Adapts Yahoo's shapes to the app's normalized `Quote` and `PricePoint` types. */
export function createYahooMarketDataService(client: YahooClient, now: () => number = Date.now): MarketDataService {
  return {
    async getQuotes(symbols): Promise<Quote[]> {
      let raw;
      try {
        raw = await client.quote(symbols);
      } catch (error) {
        throw new MarketDataError('UPSTREAM_UNAVAILABLE', `Yahoo Finance request failed: ${messageOf(error)}`);
      }

      // Symbols Yahoo does not return, or returns without a price, are simply absent.
      const quotes: Quote[] = raw.flatMap((q) =>
        typeof q.regularMarketPrice === 'number'
          ? [
              {
                symbol: q.symbol,
                price: q.regularMarketPrice,
                change: q.regularMarketChange ?? 0,
                changePercent: q.regularMarketChangePercent ?? 0,
              },
            ]
          : [],
      );
      if (quotes.length === 0) throw new MarketDataError('INVALID_SYMBOL', `No quote found for: ${symbols.join(', ')}`);
      return quotes;
    },

    /**
     * Partial success: a symbol that fails comes back as an empty series so the rest of the
     * dashboard still renders. Throws only if every symbol failed.
     */
    async getHistory(symbols, window): Promise<HistoryBySymbol> {
      const { lookbackMs, interval } = YAHOO_WINDOWS[window];
      const period1 = new Date(now() - lookbackMs);

      const results = await Promise.allSettled(
        symbols.map(async (symbol): Promise<PricePoint[]> => {
          const chart = await client.chart(symbol, { period1, interval });
          const points = chart.quotes.flatMap((bar) =>
            typeof bar.close === 'number' && Number.isFinite(bar.close)
              ? [{ time: bar.date.getTime(), close: bar.close }]
              : [],
          );
          return window === 'today' ? latestSession(points) : points;
        }),
      );

      const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
      if (failures.length === symbols.length) {
        throw failures.every((f) => NOT_FOUND.test(messageOf(f.reason)))
          ? new MarketDataError('INVALID_SYMBOL', `No data found for: ${symbols.join(', ')}`)
          : new MarketDataError('UPSTREAM_UNAVAILABLE', `Yahoo Finance request failed: ${messageOf(failures[0].reason)}`);
      }

      return Object.fromEntries(symbols.map((s, i) => [s, results[i].status === 'fulfilled' ? results[i].value : []]));
    },
  };
}
