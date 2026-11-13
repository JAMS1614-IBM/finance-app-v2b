import type { HistoryBySymbol, TimeWindow } from '../domain/types';
import { useMarketDataService } from '../services/MarketDataContext';
import { useAsync } from './useAsync';

export function useHistory(symbols: string[], window: TimeWindow) {
  const service = useMarketDataService();
  return useAsync<HistoryBySymbol>(() => service.getHistory(symbols, window), `${symbols.join(',')}|${window}`);
}
