// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDemoStore } from "@/lib/demo-store";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("createDemoStore", () => {
  it("returns a copy of the seed when storage is empty", () => {
    const seed = { items: [1, 2] };
    const store = createDemoStore("t1", seed);
    const value = store.get();
    expect(value).toEqual(seed);
    value.items.push(3);
    expect(seed.items).toEqual([1, 2]);
  });

  it("persists set values across store instances", () => {
    createDemoStore("t2", { n: 0 }).set({ n: 5 });
    expect(localStorage.getItem("demo:t2")).toBe('{"n":5}');
    expect(createDemoStore("t2", { n: 0 }).get()).toEqual({ n: 5 });
  });

  it("supports updater functions", () => {
    const store = createDemoStore("t3", 1);
    store.set((prev) => prev + 1);
    expect(store.get()).toBe(2);
  });

  it("reset restores the seed and clears storage", () => {
    const store = createDemoStore("t4", { n: 0 });
    store.set({ n: 9 });
    expect(store.reset()).toEqual({ n: 0 });
    expect(localStorage.getItem("demo:t4")).toBeNull();
  });

  it("falls back to the seed on corrupt JSON", () => {
    localStorage.setItem("demo:t5", "{not json");
    expect(createDemoStore("t5", { ok: true }).get()).toEqual({ ok: true });
  });

  it("falls back to the seed when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const store = createDemoStore("t6", 1);
    expect(store.get()).toBe(1);
    expect(store.set(2)).toBe(2);
    expect(store.get()).toBe(2);
  });

  it("notifies subscribers on set and reset, and unsubscribes", () => {
    const store = createDemoStore("t7", 0);
    const fn = vi.fn();
    const off = store.subscribe(fn);
    store.set(1);
    store.reset();
    off();
    store.set(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("re-reads and notifies on a storage event for its key (cross-tab sync)", () => {
    const store = createDemoStore("t8", { n: 0 });
    expect(store.get()).toEqual({ n: 0 });
    const fn = vi.fn();
    const off = store.subscribe(fn);
    // Simulate another tab writing the key.
    localStorage.setItem("demo:t8", '{"n":42}');
    window.dispatchEvent(new StorageEvent("storage", { key: "demo:t8" }));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(store.get()).toEqual({ n: 42 });
    // A cleared storage (key === null) also invalidates.
    localStorage.clear();
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(store.get()).toEqual({ n: 0 });
    off();
    window.dispatchEvent(new StorageEvent("storage", { key: "demo:t8" }));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("ignores storage events for other keys", () => {
    const store = createDemoStore("t9", { n: 1 });
    store.get();
    const fn = vi.fn();
    const off = store.subscribe(fn);
    localStorage.setItem("demo:t9", '{"n":7}');
    window.dispatchEvent(new StorageEvent("storage", { key: "demo:other" }));
    expect(fn).not.toHaveBeenCalled();
    expect(store.get()).toEqual({ n: 1 });
    off();
  });
});

describe("createDemoStore initial option", () => {
  it("uses initial() while nothing is stored, without storing it", () => {
    const store = createDemoStore("i1", "seed", { initial: () => "start" });
    expect(store.get()).toBe("start");
    expect(store.getSeed()).toBe("seed");
    expect(localStorage.getItem("demo:i1")).toBeNull();
  });

  it("prefers a stored value over initial()", () => {
    localStorage.setItem("demo:i2", '"saved"');
    expect(createDemoStore("i2", "seed", { initial: () => "start" }).get()).toBe("saved");
  });

  it("reset goes back to initial()", () => {
    const store = createDemoStore("i3", "seed", { initial: () => "start" });
    store.set("saved");
    expect(store.reset()).toBe("start");
    expect(localStorage.getItem("demo:i3")).toBeNull();
  });

  it("falls back to the seed when initial() throws", () => {
    const store = createDemoStore("i4", "seed", {
      initial: () => {
        throw new Error("no browser");
      },
    });
    expect(store.get()).toBe("seed");
  });
});
