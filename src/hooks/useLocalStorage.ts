"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function emit() {
  for (const l of listeners) l();
}

function getServerSnapshot() {
  return null;
}

/** Reads/writes a localStorage string value without server/client hydration mismatches. */
export function useLocalStorage(key: string) {
  const getSnapshot = () => localStorage.getItem(key);
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback((next: string) => {
    localStorage.setItem(key, next);
    emit();
  }, [key]);

  return [value, setValue] as const;
}
