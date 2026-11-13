import type { PricePoint } from './types';

/** A gap longer than this between bars means a new trading session (overnight, weekend, holiday). */
const SESSION_GAP_MS = 4 * 60 * 60 * 1000;

/**
 * Keep only the most recent trading session. Splitting on gaps instead of calendar days
 * works for any exchange timezone. On weekends and holidays this returns the last session.
 */
export function latestSession(points: PricePoint[]): PricePoint[] {
  const sorted = [...points].sort((a, b) => a.time - b.time);
  let start = sorted.length - 1;
  while (start > 0 && sorted[start].time - sorted[start - 1].time <= SESSION_GAP_MS) start--;
  return start < 0 ? [] : sorted.slice(start);
}
