import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Company } from '../../config/companies';
import type { ChartRow, TimeWindow } from '../../domain/types';

function formatTick(time: number, window: TimeWindow): string {
  const d = new Date(time);
  return window === 'today'
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

interface Props {
  rows: ChartRow[];
  companies: Company[];
  window: TimeWindow;
}

/** Percent-change comparison. Pure props in, chart out. */
export function ComparisonLineChart({ rows, companies, window }: Props) {
  if (rows.length === 0) return <p className="state">No data for this window.</p>;
  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(t: number) => formatTick(t, window)} minTickGap={32} />
          <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
          <Tooltip
            labelFormatter={(t) => formatTick(Number(t), window)}
            formatter={(v) => `${Number(v).toFixed(2)}%`}
          />
          <Legend />
          {companies.map((c) => (
            <Line
              key={c.symbol}
              type="monotone"
              dataKey={c.symbol}
              name={c.name}
              stroke={c.color}
              strokeWidth={c.primary ? 3 : 1.5}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
