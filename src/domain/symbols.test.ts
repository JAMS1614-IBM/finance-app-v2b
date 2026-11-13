import { parseSymbol } from './symbols';

describe('parseSymbol', () => {
  it('trims and upper-cases valid tickers', () => {
    expect(parseSymbol(' ibm ')).toBe('IBM');
    expect(parseSymbol('7203.t')).toBe('7203.T');
    expect(parseSymbol('^gspc')).toBe('^GSPC');
  });

  it('rejects empty, digit-only, too long, and unsafe input', () => {
    for (const bad of ['', '  ', '123', 'TOOLONGSYMBOL', 'A B', 'A,B', 'A/B']) {
      expect(parseSymbol(bad)).toBeNull();
    }
  });
});
