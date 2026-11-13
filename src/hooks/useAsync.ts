import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error };

type Settled<T> = { request: string; result: Exclude<AsyncState<T>, { status: 'loading' }> };

/**
 * Runs `fn` when `key` changes (or on retry). Results from stale runs are ignored.
 * Loading is derived: a settled result only counts if it belongs to the current request.
 */
export function useAsync<T>(fn: () => Promise<T>, key: string): AsyncState<T> & { retry: () => void } {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const request = `${key}#${attempt}`;

  useEffect(() => {
    let cancelled = false;
    fn().then(
      (data) => !cancelled && setSettled({ request, result: { status: 'success', data } }),
      (e: unknown) =>
        !cancelled &&
        setSettled({ request, result: { status: 'error', error: e instanceof Error ? e : new Error(String(e)) } }),
    );
    return () => {
      cancelled = true;
    };
    // `request` stands in for the inputs captured by `fn`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const state: AsyncState<T> = settled?.request === request ? settled.result : { status: 'loading' };
  return { ...state, retry };
}
