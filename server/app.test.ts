import request from 'supertest';
import { MarketDataError } from '../src/services/errors';
import type { MarketDataService } from '../src/services/marketDataService';
import { createApp } from './app';

const service = (overrides: Partial<MarketDataService> = {}): MarketDataService => ({
  getQuotes: async (symbols) => symbols.map((symbol) => ({ symbol, price: 1, change: 0, changePercent: 0 })),
  getHistory: async (symbols) => Object.fromEntries(symbols.map((s) => [s, []])),
  ...overrides,
});

describe('proxy API', () => {
  it('serves quotes and history, normalizing symbol input', async () => {
    const app = createApp(service());
    const q = await request(app).get('/api/quotes?symbols=ibm, msft,ibm');
    expect(q.status).toBe(200);
    expect(q.body.data.map((x: { symbol: string }) => x.symbol)).toEqual(['IBM', 'MSFT']);
    const h = await request(app).get('/api/history?symbols=IBM&window=quarter');
    expect(h.body.data).toEqual({ IBM: [] });
  });

  it.each([
    '/api/quotes',
    '/api/quotes?symbols=A%20B',
    '/api/quotes?symbols=A,B,C,D,E,F,G,H,I,J,K',
    '/api/history?symbols=IBM',
    '/api/history?symbols=IBM&window=year',
  ])('rejects bad input with 400: %s', async (url) => {
    const res = await request(createApp(service())).get(url);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_REQUEST');
  });

  it('maps MarketDataError codes to HTTP statuses', async () => {
    const cases = [['INVALID_SYMBOL', 400], ['UPSTREAM_UNAVAILABLE', 502], ['NETWORK', 503]] as const;
    for (const [code, status] of cases) {
      const app = createApp(service({ getQuotes: async () => Promise.reject(new MarketDataError(code, 'm')) }));
      const res = await request(app).get('/api/quotes?symbols=IBM');
      expect(res.status).toBe(status);
      expect(res.body.error).toEqual({ code, message: 'm' });
    }
  });

  it('hides unexpected errors, 404s unknown API routes, and has a health check', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = createApp(service({ getQuotes: async () => Promise.reject(new Error('secret')) }));
    const res = await request(app).get('/api/quotes?symbols=IBM');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('secret');
    spy.mockRestore();
    expect((await request(app).get('/api/nope')).status).toBe(404);
    expect((await request(app).get('/api/health')).body).toEqual({ status: 'ok' });
  });
});
