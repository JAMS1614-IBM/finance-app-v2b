import { rankByChange, windowChangePercent } from './metrics';

const series = (...closes: number[]) => closes.map((close, time) => ({ time, close }));

describe('metrics', () => {
  it('computes first-to-last change', () => {
    expect(windowChangePercent(series(100, 150, 110))).toBeCloseTo(10);
    expect(windowChangePercent(series(100))).toBeNull();
    expect(windowChangePercent(series(0, 5))).toBeNull();
  });

  it('ranks best first and skips empty series', () => {
    const ranked = rankByChange({ A: series(100, 105), B: series(100, 120), C: [] });
    expect(ranked.map((r) => r.symbol)).toEqual(['B', 'A']);
  });
});
