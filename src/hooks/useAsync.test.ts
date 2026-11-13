import { act, renderHook, waitFor } from '@testing-library/react';
import { useAsync } from './useAsync';

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useAsync', () => {
  it('goes loading -> success', async () => {
    const { result } = renderHook(() => useAsync(async () => 'ok', 'k'));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current).toMatchObject({ status: 'success', data: 'ok' }));
  });

  it('reports errors, wraps non-Error rejections, and retries', async () => {
    let calls = 0;
    const { result } = renderHook(() =>
      useAsync(async () => {
        if (++calls === 1) throw 'plain string';
        return 'recovered';
      }, 'k'),
    );
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('plain string');
    act(() => result.current.retry());
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current).toMatchObject({ status: 'success', data: 'recovered' }));
  });

  it('ignores a slow response for an old key (no stale data after the inputs change)', async () => {
    const slow = deferred<string>();
    const { result, rerender } = renderHook(
      ({ key }) => useAsync(() => (key === 'a' ? slow.promise : Promise.resolve('B')), key),
      { initialProps: { key: 'a' } },
    );
    rerender({ key: 'b' });
    await waitFor(() => expect(result.current).toMatchObject({ status: 'success', data: 'B' }));
    await act(async () => slow.resolve('A-late'));
    expect(result.current.data).toBe('B');
  });
});
