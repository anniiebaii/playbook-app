import { useCallback, useEffect, useState } from 'react';

import { toError } from '../utils/errors';

export interface AsyncData<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  /** Applies a local update to loaded data, e.g. after a successful mutation. */
  mutate: (update: (current: T) => T) => void;
  /** Refetches in the background, keeping the current data until the new result arrives. */
  reload: () => void;
}

interface Settled<T> {
  source: () => Promise<T>;
  data?: T;
  error?: Error;
}

/**
 * Runs `load` whenever its identity changes and tracks the result. Wrap `load` in
 * `useCallback` so it only changes when its inputs do, or pass `null` to skip loading.
 *
 * Each result is tagged with the `load` that produced it, so responses from a stale
 * request are discarded and `isLoading` is derived rather than stored.
 */
export function useAsyncData<T>(load: (() => Promise<T>) | null): AsyncData<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!load) return;
    let isStale = false;
    load().then(
      (data) => {
        if (!isStale) setSettled({ source: load, data });
      },
      (error: unknown) => {
        if (!isStale) setSettled({ source: load, error: toError(error) });
      },
    );
    return () => {
      isStale = true;
    };
  }, [load, reloadCount]);

  const mutate = useCallback((update: (current: T) => T) => {
    setSettled((previous) =>
      previous?.data === undefined ? previous : { ...previous, data: update(previous.data) },
    );
  }, []);

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  const current = settled?.source === load ? settled : undefined;
  return {
    data: current?.data,
    error: current?.error,
    isLoading: load !== null && current === undefined,
    mutate,
    reload,
  };
}
