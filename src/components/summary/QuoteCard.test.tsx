import { render, screen } from '@testing-library/react';
import { COMPANIES } from '../../config/companies';
import { QuoteCard } from './QuoteCard';
import { QuoteGrid } from './QuoteGrid';

const ibm = COMPANIES[0];

describe('QuoteCard', () => {
  it('shows price and a signed positive change', () => {
    render(<QuoteCard company={ibm} quote={{ symbol: 'IBM', price: 247.1, change: 2, changePercent: 1.005 }} />);
    expect(screen.getByText('$247.10')).toBeInTheDocument();
    expect(screen.getByText('+1.00%')).toHaveClass('up');
  });

  it('shows a negative change without a plus sign', () => {
    render(<QuoteCard company={ibm} quote={{ symbol: 'IBM', price: 100, change: -1, changePercent: -1.38 }} />);
    expect(screen.getByText('-1.38%')).toHaveClass('down');
  });

  it('shows a placeholder when the quote is missing', () => {
    render(<QuoteCard company={ibm} />);
    expect(screen.getByText('No quote')).toBeInTheDocument();
  });
});

describe('QuoteGrid', () => {
  it('matches quotes to companies by symbol and tolerates a missing one', () => {
    render(
      <QuoteGrid
        companies={COMPANIES.slice(0, 2)}
        quotes={[{ symbol: 'MSFT', price: 5, change: 0, changePercent: 0 }]}
      />,
    );
    expect(screen.getByLabelText('IBM')).toHaveTextContent('No quote');
    expect(screen.getByLabelText('Microsoft')).toHaveTextContent('$5.00');
  });
});
