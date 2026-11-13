import { MarketDataError } from '../../src/services/errors';
import { createYahooMarketDataService, YAHOO_WINDOWS, type YahooClient } from './yahooProvider';

const NOW = Date.UTC(2025, 5, 4, 20, 0, 0);
const H = 3_600_000;
const bar = (time: number, close: number | null) => ({ date: new Date(time), close });

function fakeClient(overrides: Partial<YahooClient> = {}): YahooClient {
  return {
    quote: async () => [],
    chart: async () => ({ quotes: [] }),
    ...overrides,
  };
}

describe('yahooProvider.getQuotes', () => {
  it('normalizes quotes and fills missing change fields', async () => {
    const svc = createYahooMarketDataService(
      fakeClient({
        quote: async () => [
          { symbol: 'IBM', regularMarketPrice: 250, regularMarketChange: 2, regularMarketChangePercent: 0.8 },
          { symbol: 'MSFT', regularMarketPrice: 400 },
          { symbol: 'NOPRICE' },
        ],
      }),
    );
    expect(await svc.getQuotes(['IBM', 'MSFT', 'NOPRICE'])).toEqual([
      { symbol: 'IBM', price: 250, change: 2, changePercent: 0.8 },
      { symbol: 'MSFT', price: 400, change: 0, changePercent: 0 },
    ]);
  });

  it('throws INVALID_SYMBOL when nothing is usable, UPSTREAM_UNAVAILABLE when the client throws', async () => {
    await expect(createYahooMarketDataService(fakeClient()).getQuotes(['ZZZ'])).rejects.toMatchObject({
      code: 'INVALID_SYMBOL',
    });
    const down = createYahooMarketDataService(fakeClient({ quote: async () => Promise.reject(new Error('503')) }));
    await expect(down.getQuotes(['IBM'])).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' });
  });
});

describe('yahooProvider.getHistory', () => {
  it('requests the configured interval and lookback for each window', async () => {
    const chart = vi.fn(async () => ({ quotes: [bar(NOW, 1)] }));
    const svc = createYahooMarketDataService(fakeClient({ chart }), () => NOW);
    for (const [window, cfg] of Object.entries(YAHOO_WINDOWS)) {
      await svc.getHistory(['IBM'], window as keyof typeof YAHOO_WINDOWS);
      expect(chart).toHaveBeenLastCalledWith('IBM', { period1: new Date(NOW - cfg.lookbackMs), interval: cfg.interval });
    }
  });

  it('drops null/NaN closes and maps to { time, close }', async () => {
    const svc = createYahooMarketDataService(
      fakeClient({ chart: async () => ({ quotes: [bar(1, 10), bar(2, null), bar(3, NaN), bar(4, 12)] }) }),
    );
    expect((await svc.getHistory(['IBM'], 'week')).IBM).toEqual([
      { time: 1, close: 10 },
      { time: 4, close: 12 },
    ]);
  });

  it('keeps only the latest session for the current-day window', async () => {
    const yesterday = [bar(NOW - 26 * H, 1), bar(NOW - 25 * H, 2)];
    const today = [bar(NOW - 2 * H, 3), bar(NOW - H, 4)];
    const svc = createYahooMarketDataService(fakeClient({ chart: async () => ({ quotes: [...yesterday, ...today] }) }));
    expect((await svc.getHistory(['IBM'], 'today')).IBM.map((p) => p.close)).toEqual([3, 4]);
    expect((await svc.getHistory(['IBM'], 'week')).IBM).toHaveLength(4);
  });

  it('returns an empty series for a failed symbol while the others succeed', async () => {
    const svc = createYahooMarketDataService(
      fakeClient({
        chart: async (symbol) => {
          if (symbol === 'BAD') throw new Error('Not Found');
          return { quotes: [bar(1, 5)] };
        },
      }),
    );
    expect(await svc.getHistory(['IBM', 'BAD'], 'week')).toEqual({ IBM: [{ time: 1, close: 5 }], BAD: [] });
  });

  it('throws only when every symbol fails, picking the error code by cause', async () => {
    const notFound = createYahooMarketDataService(fakeClient({ chart: async () => Promise.reject(new Error('No data found')) }));
    await expect(notFound.getHistory(['A', 'B'], 'week')).rejects.toMatchObject({ code: 'INVALID_SYMBOL' });
    const down = createYahooMarketDataService(fakeClient({ chart: async () => Promise.reject(new Error('socket hang up')) }));
    await expect(down.getHistory(['A'], 'week')).rejects.toBeInstanceOf(MarketDataError);
    await expect(down.getHistory(['A'], 'week')).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE' });
  });
});
