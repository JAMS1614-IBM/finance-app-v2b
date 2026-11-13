import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { COMPANIES } from './config/companies';
import { MarketDataError } from './services/errors';
import { createMockMarketDataService } from './services/mockMarketDataService';

vi.mock('recharts', async () => (await import('./test/mockRecharts')).rechartsMock);

describe('Dashboard', () => {
  beforeEach(() => globalThis.history.replaceState(null, '', '/'));

  it('renders a quote card per company and the chart for the current day', async () => {
    render(<App service={createMockMarketDataService(() => 1_700_000_000_000)} />);
    for (const c of COMPANIES) expect(await screen.findByLabelText(c.name)).toBeInTheDocument();
    expect(await screen.findByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Current day' })).toHaveAttribute('aria-selected', 'true');
  });

  it('feeds normalized percent-change series for every company into the chart', async () => {
    const H = 3_600_000;
    const history = Object.fromEntries(
      COMPANIES.map((c, i) => [c.symbol, [{ time: 0, close: 100 }, { time: H, close: 100 + i }]]),
    );
    const svc = {
      getQuotes: async () => [{ symbol: 'IBM', price: 250, change: 2.5, changePercent: 1 }],
      getHistory: async () => history,
    };
    render(<App service={svc} />);
    expect(await screen.findByTestId('line-chart')).toHaveAttribute('data-rows', '2');
    expect(screen.getAllByTestId('line').map((l) => l.dataset.key)).toEqual(COMPANIES.map((c) => c.symbol));
    expect(screen.getByLabelText('IBM')).toHaveTextContent('$250.00');
    expect(screen.getByLabelText('IBM')).toHaveTextContent('+1.00%');
    expect(screen.getByLabelText('Microsoft')).toHaveTextContent('No quote');
  });

  it('shows the empty state when every series is empty', async () => {
    const svc = {
      getQuotes: async () => [],
      getHistory: async () => Object.fromEntries(COMPANIES.map((c) => [c.symbol, []])),
    };
    render(<App service={svc} />);
    expect(await screen.findByText('No data for this window.')).toBeInTheDocument();
  });

  it('switches window and updates the URL', async () => {
    render(<App service={createMockMarketDataService()} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Last quarter' }));
    expect(await screen.findByRole('region', { name: /Last quarter/ })).toBeInTheDocument();
    expect(globalThis.location.search).toBe('?window=quarter');
  });

  it('renders the last-7-days view from the URL and the tab switches back', async () => {
    globalThis.history.replaceState(null, '', '/?window=week');
    render(<App service={createMockMarketDataService()} />);
    expect(await screen.findByRole('region', { name: /Last 7 days/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Last 7 days' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('tab', { name: 'Current day' }));
    expect(await screen.findByRole('region', { name: /Current day/ })).toBeInTheDocument();
  });

  it('shows an error with Retry when the service fails', async () => {
    const failing = {
      getQuotes: () => Promise.reject(new MarketDataError('NETWORK', 'offline')),
      getHistory: () => Promise.reject(new MarketDataError('NETWORK', 'offline')),
    };
    render(<App service={failing} />);
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(screen.getAllByRole('button', { name: 'Retry' }).length).toBeGreaterThan(0);
  });
});
