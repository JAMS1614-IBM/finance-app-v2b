import { SYMBOL_PATTERN } from '../domain/symbols';
import type { HistoryBySymbol, PricePoint, Quote, TimeWindow } from '../domain/types';
import { MarketDataError } from './errors';
import type { MarketDataService } from './marketDataService';

const POINTS: Record<TimeWindow, { count: number; stepMs: number }> = {
  today: { count: 78, stepMs: 5 * 60_000 },
  week: { count: 7 * 13, stepMs: 30 * 60_000 },
  quarter: { count: 63, stepMs: 24 * 3_600_000 },
};

function seed(symbol: string): number {
  return [...symbol].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 9973, 7);
}

function basePrice(symbol: string): number {
  return 50 + (seed(symbol) % 250);
}

/** Deterministic sample data: same inputs always give the same output. */
export function createMockMarketDataService(now: () => number = Date.now): MarketDataService {
  const check = (symbols: string[]) => {
    const bad = symbols.find((s) => !SYMBOL_PATTERN.test(s));
    if (bad !== undefined) throw new MarketDataError('INVALID_SYMBOL', `Invalid symbol: ${bad}`);
  };

  return {
    async getQuotes(symbols): Promise<Quote[]> {
      check(symbols);
      return symbols.map((symbol) => {
        const price = basePrice(symbol);
        const changePercent = ((seed(symbol) % 600) - 300) / 100;
        return { symbol, price, change: (price * changePercent) / 100, changePercent };
      });
    },

    async getHistory(symbols, window): Promise<HistoryBySymbol> {
      check(symbols);
      const { count, stepMs } = POINTS[window];
      const end = now();
      const out: HistoryBySymbol = {};
      for (const symbol of symbols) {
        const s = seed(symbol);
        const base = basePrice(symbol);
        const points: PricePoint[] = [];
        for (let i = 0; i < count; i++) {
          const wave = Math.sin((i + s) / 6) * 0.02 + (i / count) * (((s % 11) - 5) / 100);
          points.push({ time: end - (count - 1 - i) * stepMs, close: base * (1 + wave) });
        }
        out[symbol] = points;
      }
      return out;
    },
  };
}
