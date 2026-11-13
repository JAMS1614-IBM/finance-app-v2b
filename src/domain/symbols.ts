/** Letters, digits, `.`, `-`, `^`; 1-10 chars, at least one letter. Allows tickers like `7203.T`. Shared by browser and proxy. */
export const SYMBOL_PATTERN = /^(?=.*[A-Za-z])[A-Za-z0-9.^-]{1,10}$/;

/** Trim and upper-case; returns null if the input is not a valid ticker. */
export function parseSymbol(input: string): string | null {
  const symbol = input.trim().toUpperCase();
  return SYMBOL_PATTERN.test(symbol) ? symbol : null;
}
