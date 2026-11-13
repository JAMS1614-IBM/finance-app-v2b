import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { WindowTabs } from '../components/layout/WindowTabs';
import { QuoteGrid } from '../components/summary/QuoteGrid';
import { COMPANIES } from '../config/companies';
import { useQuotes } from '../hooks/useQuotes';
import { useTimeWindow } from '../hooks/useTimeWindow';
import { QuarterView } from '../views/QuarterView';
import { TodayView } from '../views/TodayView';
import { WeekView } from '../views/WeekView';

const symbols = COMPANIES.map((c) => c.symbol);

export function DashboardPage() {
  const [window, setWindow] = useTimeWindow();
  const quotes = useQuotes(symbols);

  return (
    <main className="page">
      <h1>Market Dashboard</h1>
      {quotes.status === 'loading' && <LoadingState label="Loading quotes…" />}
      {quotes.status === 'error' && <ErrorState message={quotes.error.message} onRetry={quotes.retry} />}
      {quotes.status === 'success' && <QuoteGrid companies={COMPANIES} quotes={quotes.data} />}
      <WindowTabs value={window} onChange={setWindow} />
      {window === 'today' && <TodayView />}
      {window === 'week' && <WeekView />}
      {window === 'quarter' && <QuarterView />}
    </main>
  );
}
