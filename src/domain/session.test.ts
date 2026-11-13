import { latestSession } from './session';

const H = 3_600_000;
const bar = (time: number) => ({ time, close: 1 });

describe('latestSession', () => {
  it('keeps only the bars after the last overnight gap', () => {
    const day1 = [0, 1, 2].map((i) => bar(i * H));
    const day2 = [20, 21, 22].map((i) => bar(i * H));
    expect(latestSession([...day1, ...day2]).map((p) => p.time)).toEqual([20 * H, 21 * H, 22 * H]);
  });

  it('sorts unsorted input and handles empty and single-point series', () => {
    expect(latestSession([])).toEqual([]);
    expect(latestSession([bar(5)])).toEqual([bar(5)]);
    expect(latestSession([bar(2 * H), bar(0)]).map((p) => p.time)).toEqual([0, 2 * H]);
  });
});
