import type { Company } from '../../config/companies';
import type { Quote } from '../../domain/types';
import { QuoteCard } from './QuoteCard';

export function QuoteGrid({ companies, quotes }: { companies: Company[]; quotes: Quote[] }) {
  return (
    <div className="quote-grid">
      {companies.map((c) => (
        <QuoteCard key={c.symbol} company={c} quote={quotes.find((q) => q.symbol === c.symbol)} />
      ))}
    </div>
  );
}
