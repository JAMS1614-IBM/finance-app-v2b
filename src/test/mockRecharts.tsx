import type { ReactNode } from 'react';

/**
 * Recharts needs real layout, which jsdom lacks. Use with
 * vi.mock('recharts', async () => (await import('../test/mockRecharts')).rechartsMock).
 * The mock renders the props our code computes, so tests can assert on them.
 */
const Box = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
const Nothing = () => null;

export const rechartsMock = {
  ResponsiveContainer: Box,
  LineChart: ({ data, children }: { data: unknown[]; children?: ReactNode }) => (
    <div data-testid="line-chart" data-rows={data.length}>
      {children}
    </div>
  ),
  Line: ({ dataKey, name, stroke, strokeWidth }: Record<string, string | number>) => (
    <span data-testid="line" data-key={dataKey} data-name={name} data-stroke={stroke} data-width={strokeWidth} />
  ),
  XAxis: ({ tickFormatter }: { tickFormatter?: (t: number) => string }) => (
    <span data-testid="x-tick">{tickFormatter?.(Date.UTC(2025, 5, 4, 15, 30))}</span>
  ),
  YAxis: ({ tickFormatter }: { tickFormatter?: (v: number) => string }) => (
    <span data-testid="y-tick">{tickFormatter?.(12.4)}</span>
  ),
  CartesianGrid: Nothing,
  Tooltip: ({
    labelFormatter,
    formatter,
  }: {
    labelFormatter?: (t: number) => string;
    formatter?: (v: number) => string;
  }) => (
    <span data-testid="tooltip">
      {labelFormatter?.(Date.UTC(2025, 5, 4, 15, 30))} | {formatter?.(1.234)}
    </span>
  ),
  Legend: Nothing,
};
