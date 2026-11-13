import { renderHook } from '@testing-library/react';
import { useMarketDataService } from './MarketDataContext';

describe('useMarketDataService', () => {
  it('fails loudly outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useMarketDataService())).toThrow(/MarketDataProvider/);
    spy.mockRestore();
  });
});
