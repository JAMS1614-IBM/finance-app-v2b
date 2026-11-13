import { COMPANIES, defineCompanies } from './companies';

const c = (symbol: string, primary = false) => ({ symbol, name: symbol, color: '#000', primary });

describe('companies config', () => {
  it('ships IBM as the single primary with 5 companies', () => {
    expect(COMPANIES).toHaveLength(5);
    expect(COMPANIES.filter((x) => x.primary).map((x) => x.symbol)).toEqual(['IBM']);
  });

  it('rejects more than 5, duplicates, and a missing primary', () => {
    expect(() => defineCompanies(['A', 'B', 'C', 'D', 'E', 'F'].map((s, i) => c(s, i === 0)))).toThrow();
    expect(() => defineCompanies([c('A', true), c('A')])).toThrow(/Duplicate/);
    expect(() => defineCompanies([c('A'), c('B')])).toThrow(/primary/);
  });
});
