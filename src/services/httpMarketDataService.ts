import type { HistoryBySymbol, Quote, TimeWindow } from '../domain/types';
import { MarketDataError, type MarketDataErrorCode } from './errors';
import type { MarketDataService } from './marketDataService';

const CODES: readonly MarketDataErrorCode[] = ['INVALID_SYMBOL', 'UPSTREAM_UNAVAILABLE', 'NETWORK'];

/** Browser-side client for the Express proxy. The browser never calls Yahoo directly. */
export function createHttpMarketDataService(
  fetchFn: typeof fetch = (...args) => globalThis.fetch(...args),
  baseUrl = '/api',
): MarketDataService {
  async function get<T>(path: string, params: Record<string, string>): Promise<T> {
    let response: Response;
    try {
      response = await fetchFn(`${baseUrl}${path}?${new URLSearchParams(params)}`);
    } catch {
      throw new MarketDataError('NETWORK', 'Could not reach the market data service');
    }

    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const err = (body as { error?: { code?: string; message?: string } } | null)?.error;
      const known = CODES.find((c) => c === err?.code);
      // The proxy's request validation (INVALID_REQUEST) is also a caller error.
      const code = known ?? (err?.code === 'INVALID_REQUEST' ? 'INVALID_SYMBOL' : 'UPSTREAM_UNAVAILABLE');
      // No JSON error body means the proxy never answered (e.g. Vite's dev proxy returns a bare 502).
      const fallback = err
        ? `Market data request failed (${response.status})`
        : `Market data service unavailable (${response.status}). Is the API proxy running? Start both with "npm run dev".`;
      throw new MarketDataError(code, err?.message ?? fallback);
    }
    return (body as { data: T }).data;
  }

  return {
    getQuotes: (symbols) => get<Quote[]>('/quotes', { symbols: symbols.join(',') }),
    getHistory: (symbols, window: TimeWindow) =>
      get<HistoryBySymbol>('/history', { symbols: symbols.join(','), window }),
  };
}
