"use client";

import { useSyncExternalStore } from "react";
import type { DemoStore } from "./demo-store";

export function useDemoStore<T>(store: DemoStore<T>): [T, DemoStore<T>["set"]] {
  const value = useSyncExternalStore(store.subscribe, store.get, store.getSeed);
  return [value, store.set];
}

const noopSubscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
