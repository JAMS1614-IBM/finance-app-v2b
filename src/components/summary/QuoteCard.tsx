import type { Company } from '../../config/companies';
import type { Quote } from '../../domain/types';

export function QuoteCard({ company, quote }: { company: Company; quote?: Quote }) {
  const up = (quote?.changePercent ?? 0) >= 0;
  return (
    <article className="quote" style={{ borderTopColor: company.color }} aria-label={company.name}>
      <h3>
        {company.name} <small>{company.symbol}</small>
      </h3>
      {quote ? (
        <>
          <p className="price">${quote.price.toFixed(2)}</p>
          <p className={up ? 'up' : 'down'}>
            {up ? '+' : ''}
            {quote.changePercent.toFixed(2)}%
          </p>
        </>
      ) : (
        <p className="state">No quote</p>
      )}
    </article>
  );
}
