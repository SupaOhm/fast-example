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
});
