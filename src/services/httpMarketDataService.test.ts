import { MarketDataError } from './errors';
import { createHttpMarketDataService } from './httpMarketDataService';

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

describe('httpMarketDataService', () => {
  it('requests the right URL and unwraps data', async () => {
    const fetchFn = vi.fn(() => json(200, { data: [{ symbol: 'IBM', price: 1, change: 0, changePercent: 0 }] }));
    const svc = createHttpMarketDataService(fetchFn as unknown as typeof fetch);
    expect(await svc.getQuotes(['IBM', 'MSFT'])).toHaveLength(1);
    expect(fetchFn).toHaveBeenCalledWith('/api/quotes?symbols=IBM%2CMSFT');
    await svc.getHistory(['IBM'], 'week');
    expect(fetchFn).toHaveBeenLastCalledWith('/api/history?symbols=IBM&window=week');
  });

  it.each([
    [400, 'INVALID_SYMBOL', 'INVALID_SYMBOL'],
    [400, 'INVALID_REQUEST', 'INVALID_SYMBOL'],
    [502, 'UPSTREAM_UNAVAILABLE', 'UPSTREAM_UNAVAILABLE'],
    [500, 'INTERNAL', 'UPSTREAM_UNAVAILABLE'],
  ])('maps HTTP %i / %s to %s', async (status, code, expected) => {
    const svc = createHttpMarketDataService((() => json(status, { error: { code, message: 'nope' } })) as typeof fetch);
    await expect(svc.getQuotes(['IBM'])).rejects.toMatchObject({ code: expected, message: 'nope' });
  });

  it('maps a non-JSON failure and a network failure', async () => {
    const html = createHttpMarketDataService((() => Promise.resolve(new Response('<html>', { status: 502 }))) as typeof fetch);
    await expect(html.getQuotes(['IBM'])).rejects.toMatchObject({
      code: 'UPSTREAM_UNAVAILABLE',
      message: expect.stringContaining('npm run dev'),
    });
    const down = createHttpMarketDataService((() => Promise.reject(new TypeError('fail'))) as typeof fetch);
    await expect(down.getQuotes(['IBM'])).rejects.toBeInstanceOf(MarketDataError);
    await expect(down.getQuotes(['IBM'])).rejects.toMatchObject({ code: 'NETWORK' });
  });
});
