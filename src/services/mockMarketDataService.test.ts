import { MarketDataError } from './errors';
import { createMockMarketDataService } from './mockMarketDataService';

const svc = createMockMarketDataService(() => 1_700_000_000_000);

describe('mockMarketDataService', () => {
  it('is deterministic', async () => {
    expect(await svc.getHistory(['IBM'], 'week')).toEqual(await svc.getHistory(['IBM'], 'week'));
  });

  it('returns a quote and a series per symbol', async () => {
    expect((await svc.getQuotes(['IBM', 'MSFT'])).map((q) => q.symbol)).toEqual(['IBM', 'MSFT']);
    const h = await svc.getHistory(['IBM', 'MSFT'], 'quarter');
    expect(Object.keys(h)).toEqual(['IBM', 'MSFT']);
    expect(h.IBM.length).toBeGreaterThan(1);
  });

  it('rejects invalid symbols with a typed error', async () => {
    await expect(svc.getQuotes(['bad symbol'])).rejects.toBeInstanceOf(MarketDataError);
  });
});
