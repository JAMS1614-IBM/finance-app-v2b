import { useCallback, useState } from 'react';
import { DEFAULT_WINDOW, TIME_WINDOWS } from '../domain/timeWindows';
import type { TimeWindow } from '../domain/types';

export function parseWindow(value: string | null): TimeWindow {
  return TIME_WINDOWS.find((w) => w.id === value)?.id ?? DEFAULT_WINDOW;
}

/** Active window, stored in the URL (?window=) so views are shareable. */
export function useTimeWindow(): [TimeWindow, (w: TimeWindow) => void] {
  const [window, setWindowState] = useState<TimeWindow>(() =>
    parseWindow(new URLSearchParams(globalThis.location.search).get('window')),
  );

  const setWindow = useCallback((next: TimeWindow) => {
    const url = new URL(globalThis.location.href);
    url.searchParams.set('window', next);
    globalThis.history.replaceState(null, '', url);
    setWindowState(next);
  }, []);

  return [window, setWindow];
}
