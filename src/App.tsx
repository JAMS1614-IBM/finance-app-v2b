import { createHttpMarketDataService } from './services/httpMarketDataService';
import { createMockMarketDataService } from './services/mockMarketDataService';
import { MarketDataProvider } from './services/MarketDataContext';
import type { MarketDataService } from './services/marketDataService';
import { DashboardPage } from './pages/DashboardPage';

// Live data goes through the Express proxy; `npm run dev:mock` uses sample data with no server.
const defaultService =
  import.meta.env.VITE_DATA_SOURCE === 'mock' ? createMockMarketDataService() : createHttpMarketDataService();

export default function App({ service = defaultService }: { service?: MarketDataService }) {
  return (
    <MarketDataProvider service={service}>
      <DashboardPage />
    </MarketDataProvider>
  );
}
