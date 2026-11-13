import { act, renderHook } from '@testing-library/react';
import { parseWindow, useTimeWindow } from './useTimeWindow';

describe('useTimeWindow', () => {
  beforeEach(() => globalThis.history.replaceState(null, '', '/'));

  it('falls back to the default for unknown values', () => {
    expect(parseWindow('nope')).toBe('today');
    expect(parseWindow(null)).toBe('today');
  });

  it('reads and writes ?window=', () => {
    globalThis.history.replaceState(null, '', '/?window=quarter');
    const { result } = renderHook(() => useTimeWindow());
    expect(result.current[0]).toBe('quarter');
    act(() => result.current[1]('week'));
    expect(result.current[0]).toBe('week');
    expect(globalThis.location.search).toBe('?window=week');
  });
});
