import type { MarketDataService } from '../src/services/marketDataService';
import { withCache } from './cache';

function counting() {
  const calls = { quotes: 0, history: 0 };
  let fail = false;
  const inner: MarketDataService = {
    getQuotes: async () => {
      calls.quotes++;
      if (fail) throw new Error('x');
      return [];
    },
    getHistory: async () => {
      calls.history++;
      return {};
    },
  };
  return { inner, calls, setFail: (v: boolean) => (fail = v) };
}

describe('withCache', () => {
  it('serves repeat calls from cache, regardless of symbol order, until the TTL expires', async () => {
    let t = 0;
    const { inner, calls } = counting();
    const svc = withCache(inner, { quotesTtlMs: 100, now: () => t });
    await svc.getQuotes(['A', 'B']);
    await svc.getQuotes(['B', 'A']);
    expect(calls.quotes).toBe(1);
    t = 101;
    await svc.getQuotes(['A', 'B']);
    expect(calls.quotes).toBe(2);
  });

  it('keys history by window and never caches errors', async () => {
    const { inner, calls, setFail } = counting();
    const svc = withCache(inner);
    await svc.getHistory(['A'], 'week');
    await svc.getHistory(['A'], 'quarter');
    expect(calls.history).toBe(2);
    setFail(true);
    await expect(svc.getQuotes(['A'])).rejects.toThrow();
    setFail(false);
    await svc.getQuotes(['A']);
    expect(calls.quotes).toBe(2);
  });
});
