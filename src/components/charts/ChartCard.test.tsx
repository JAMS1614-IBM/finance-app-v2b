import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartCard } from './ChartCard';

describe('ChartCard', () => {
  it('shows loading, hiding children', () => {
    render(<ChartCard title="T" status="loading"><p>body</p></ChartCard>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('body')).not.toBeInTheDocument();
  });

  it('shows the error with a working Retry', async () => {
    const onRetry = vi.fn();
    render(<ChartCard title="T" status="error" error={new Error('boom')} onRetry={onRetry}><p>body</p></ChartCard>);
    expect(screen.getByRole('alert')).toHaveTextContent('boom');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders children on success', () => {
    render(<ChartCard title="T" status="success"><p>body</p></ChartCard>);
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});
