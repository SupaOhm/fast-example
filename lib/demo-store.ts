export interface DemoStore<T> {
  get(): T;
  getSeed(): T;
  set(next: T | ((prev: T) => T)): T;
  reset(): T;
  subscribe(fn: () => void): () => void;
}

const PREFIX = "demo:";

interface DemoStoreOptions<T> {
  /**
   * Value to use while nothing is stored, worked out on the client when first read.
   * It is never written to storage, and the server snapshot stays `seed`.
   */
  initial?: () => T;
}

// A tiny observable store backed by localStorage. Every storage access is
// guarded, so the demos still work in private windows or with storage blocked.
export function createDemoStore<T>(key: string, seed: T, options: DemoStoreOptions<T> = {}): DemoStore<T> {
  const storageKey = PREFIX + key;
  const listeners = new Set<() => void>();
  let current: T | undefined;

  function fallback(): T {
    if (options.initial) {
      try {
        return options.initial();
      } catch {
        // fall through to seed
      }
    }
    return structuredClone(seed);
  }

  function read(): T {
    try {
      const raw = globalThis.localStorage?.getItem(storageKey);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // fall through to the fallback
    }
    return fallback();
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
    current = fallback();
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
    // Cross-tab sync: another tab writing the same key (or clearing storage)
    // invalidates our cached value so the next get() re-reads localStorage.
    let onStorage: ((e: StorageEvent) => void) | undefined;
    if (typeof window !== "undefined") {
      onStorage = (e: StorageEvent) => {
        if (e.key === storageKey || e.key === null) {
          current = undefined;
          fn();
        }
      };
      window.addEventListener("storage", onStorage);
    }
    return () => {
      listeners.delete(fn);
      if (onStorage) window.removeEventListener("storage", onStorage);
    };
  }

  return { get, getSeed: () => seed, set, reset, subscribe };
}

/**
 * Removes this demo's stored keys that a newer build or an earlier day left behind (old versions, past days), so
 * localStorage doesn't grow with every visit. `prefix` is the demo's key prefix (e.g. "clinic:"); `keep` lists the
 * keys still in use, as passed to `createDemoStore`. Guarded like the stores: it does nothing on the server or with
 * storage blocked.
 */
export function pruneDemoKeys(prefix: string, keep: string[]) {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return;
    const live = new Set(keep.map((k) => PREFIX + k));
    const stale: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k?.startsWith(PREFIX + prefix) && !live.has(k)) stale.push(k);
    }
    stale.forEach((k) => storage.removeItem(k));
  } catch {
    // ignore
  }
}
