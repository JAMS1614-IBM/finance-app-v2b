import { ChartCard } from '../components/charts/ChartCard';
import { ComparisonLineChart } from '../components/charts/ComparisonLineChart';
import { COMPANIES } from '../config/companies';
import { buildChartRows } from '../domain/normalize';
import type { TimeWindow } from '../domain/types';
import { useHistory } from '../hooks/useHistory';

const symbols = COMPANIES.map((c) => c.symbol);

/** Chart for one time window. TodayView/WeekView/QuarterView are thin configurations of this. */
export function WindowView({ window, title }: { window: TimeWindow; title: string }) {
  const history = useHistory(symbols, window);
  return (
    <ChartCard title={title} status={history.status} error={history.error} onRetry={history.retry}>
      {history.status === 'success' && (
        <ComparisonLineChart rows={buildChartRows(history.data)} companies={COMPANIES} window={window} />
      )}
    </ChartCard>
  );
}
