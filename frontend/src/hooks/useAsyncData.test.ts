import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAsyncData } from './useAsyncData';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('useAsyncData', () => {
  it('reports loading, then the loaded data', async () => {
    // Loaders must be stable between renders (e.g. module functions or `useCallback`).
    const load = () => Promise.resolve(42);
    const { result } = renderHook(() => useAsyncData(load));
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.data).toBe(42);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('captures errors', async () => {
    const load = () => Promise.reject(new Error('boom'));
    const { result } = renderHook(() => useAsyncData(load));
    await waitFor(() => {
      expect(result.current.error?.message).toBe('boom');
    });
  });

  it('ignores responses from a stale loader', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const loadFirst = () => first.promise;
    const loadSecond = () => second.promise;

    const { result, rerender } = renderHook(({ load }) => useAsyncData(load), {
      initialProps: { load: loadFirst },
    });
    rerender({ load: loadSecond });

    await act(async () => {
      second.resolve('second');
      first.resolve('first');
      await Promise.all([first.promise, second.promise]);
    });
    expect(result.current.data).toBe('second');
  });

  it('does nothing when the loader is null', () => {
    const { result } = renderHook(() => useAsyncData<number>(null));
    expect(result.current).toMatchObject({ data: undefined, isLoading: false });
  });

  it('applies local mutations to loaded data', async () => {
    const load = () => Promise.resolve([1, 2]);
    const { result } = renderHook(() => useAsyncData(load));
    await waitFor(() => {
      expect(result.current.data).toEqual([1, 2]);
    });

    act(() => {
      result.current.mutate((numbers) => [...numbers, 3]);
    });
    expect(result.current.data).toEqual([1, 2, 3]);
  });

  it('reloads in the background without dropping current data', async () => {
    let calls = 0;
    const next = deferred<number>();
    const load = () => (++calls === 1 ? Promise.resolve(1) : next.promise);
    const { result } = renderHook(() => useAsyncData(load));
    await waitFor(() => {
      expect(result.current.data).toBe(1);
    });

    act(() => {
      result.current.reload();
    });
    expect(result.current).toMatchObject({ data: 1, isLoading: false });

    await act(async () => {
      next.resolve(2);
      await next.promise;
    });
    expect(result.current.data).toBe(2);
    expect(calls).toBe(2);
  });
});
