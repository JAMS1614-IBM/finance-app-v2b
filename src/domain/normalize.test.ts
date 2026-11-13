import { buildChartRows, toPercentChange } from './normalize';

describe('toPercentChange', () => {
  it('measures change from the first point', () => {
    const out = toPercentChange([
      { time: 1, close: 100 },
      { time: 2, close: 110 },
    ]);
    expect(out.map((p) => p.close)).toEqual([0, 10]);
  });

  it('returns an empty series for empty or zero-based input', () => {
    expect(toPercentChange([])).toEqual([]);
    expect(toPercentChange([{ time: 1, close: 0 }])).toEqual([]);
  });
});

describe('buildChartRows', () => {
  it('merges series by timestamp and leaves gaps undefined', () => {
    const rows = buildChartRows({
      IBM: [
        { time: 1, close: 100 },
        { time: 2, close: 120 },
      ],
      ORCL: [{ time: 2, close: 50 }],
    });
    expect(rows).toEqual([
      { time: 1, IBM: 0 },
      { time: 2, IBM: 20, ORCL: 0 },
    ]);
  });
});
