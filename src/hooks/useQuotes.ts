import type { Quote } from '../domain/types';
import { useMarketDataService } from '../services/MarketDataContext';
import { useAsync } from './useAsync';

export function useQuotes(symbols: string[]) {
  const service = useMarketDataService();
  return useAsync<Quote[]>(() => service.getQuotes(symbols), symbols.join(','));
}
