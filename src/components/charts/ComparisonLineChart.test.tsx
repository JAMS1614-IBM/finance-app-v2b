import { render, screen } from '@testing-library/react';
import { COMPANIES } from '../../config/companies';
import { ComparisonLineChart } from './ComparisonLineChart';

vi.mock('recharts', async () => (await import('../../test/mockRecharts')).rechartsMock);

const rows = [
  { time: 1, IBM: 0, MSFT: 0 },
  { time: 2, IBM: 1.5, MSFT: -2 },
];

describe('ComparisonLineChart', () => {
  it('draws one line per company with its configured color, and emphasizes the primary', () => {
    render(<ComparisonLineChart rows={rows} companies={COMPANIES} window="week" />);
    const lines = screen.getAllByTestId('line');
    expect(lines.map((l) => l.dataset.key)).toEqual(COMPANIES.map((c) => c.symbol));
    expect(lines[0]).toHaveAttribute('data-stroke', COMPANIES[0].color);
    expect(lines[0]).toHaveAttribute('data-name', 'IBM');
    expect(Number(lines[0].dataset.width)).toBeGreaterThan(Number(lines[1].dataset.width));
    expect(screen.getByTestId('line-chart')).toHaveAttribute('data-rows', '2');
  });

  it('formats the y axis as a percentage', () => {
    render(<ComparisonLineChart rows={rows} companies={COMPANIES} window="week" />);
    expect(screen.getByTestId('y-tick')).toHaveTextContent('12%');
  });

  it('shows a time on the x axis for the current day and a date for longer windows', () => {
    const { rerender } = render(<ComparisonLineChart rows={rows} companies={COMPANIES} window="today" />);
    expect(screen.getByTestId('x-tick').textContent).toMatch(/\d{1,2}:\d{2}/);
    rerender(<ComparisonLineChart rows={rows} companies={COMPANIES} window="quarter" />);
    expect(screen.getByTestId('x-tick').textContent).not.toMatch(/:/);
  });

  it('formats tooltip values to two decimals with a percent sign', () => {
    render(<ComparisonLineChart rows={rows} companies={COMPANIES} window="week" />);
    expect(screen.getByTestId('tooltip')).toHaveTextContent('1.23%');
  });

  it('shows an empty state instead of an empty chart', () => {
    render(<ComparisonLineChart rows={[]} companies={COMPANIES} window="week" />);
    expect(screen.getByText('No data for this window.')).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });
});
