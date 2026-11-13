export interface Company {
  symbol: string;
  name: string;
  color: string;
  primary?: boolean;
}

export const MAX_COMPANIES = 5;

/** Fails fast on a bad config: max 5, no duplicates, exactly one primary. */
export function defineCompanies(list: Company[]): Company[] {
  if (list.length > MAX_COMPANIES) throw new Error(`At most ${MAX_COMPANIES} companies are supported`);
  if (new Set(list.map((c) => c.symbol)).size !== list.length) throw new Error('Duplicate company symbol');
  if (list.filter((c) => c.primary).length !== 1) throw new Error('Exactly one primary company is required');
  return list;
}

/** Single source of truth for tracked companies. */
export const COMPANIES = defineCompanies([
  { symbol: 'IBM', name: 'IBM', color: '#0f62fe', primary: true },
  { symbol: 'MSFT', name: 'Microsoft', color: '#198038' },
  { symbol: 'ORCL', name: 'Oracle', color: '#da1e28' },
  { symbol: 'SAP', name: 'SAP', color: '#8a3ffc' },
  { symbol: 'CRM', name: 'Salesforce', color: '#b28600' },
]);
