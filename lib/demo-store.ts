export interface DemoStore<T> {
  get(): T;
  getSeed(): T;
  set(next: T | ((prev: T) => T)): T;
  reset(): T;
  subscribe(fn: () => void): () => void;
}

const PREFIX = "demo:";

// A tiny observable store backed by localStorage. Every storage access is
// guarded, so the demos still work in private windows or with storage blocked.
export function createDemoStore<T>(key: string, seed: T): DemoStore<T> {
  const storageKey = PREFIX + key;
  const listeners = new Set<() => void>();
  let current: T | undefined;

  function read(): T {
    try {
      const raw = globalThis.localStorage?.getItem(storageKey);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // fall through to seed
    }
    return structuredClone(seed);
  }

  function emit() {
    listeners.forEach((fn) => fn());
  }

  function get(): T {
    if (current === undefined) current = read();
    return current;
  }

  function set(next: T | ((prev: T) => T)): T {
    const value = typeof next === "function" ? (next as (prev: T) => T)(get()) : next;
    current = value;
    try {
      globalThis.localStorage?.setItem(storageKey, JSON.stringify(value));
    } catch {
      // keep in-memory value
    }
    emit();
    return value;
  }

  function reset(): T {
    current = structuredClone(seed);
    try {
      globalThis.localStorage?.removeItem(storageKey);
    } catch {
      // ignore
    }
    emit();
    return current;
  }

  function subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }

  return { get, getSeed: () => seed, set, reset, subscribe };
}
