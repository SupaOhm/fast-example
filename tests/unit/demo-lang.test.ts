// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { initialDemoLang, otherLang } from "@/lib/demos/lang";

describe("initialDemoLang", () => {
  it.each([
    ["en", "th-TH", "en"],
    ["th", "en-US", "th"],
    [null, "th-TH", "th"],
    [null, "th", "th"],
    [null, "TH-th", "th"],
    [null, "en-US", "en"],
    [null, "ja-JP", "en"],
    [null, undefined, "en"],
    ["fr", "th-TH", "th"],
  ] as const)("hub %s, browser %s → %s", (hub, browser, want) => {
    expect(initialDemoLang(hub, browser)).toBe(want);
  });
});

describe("otherLang", () => {
  it("flips the language", () => {
    expect(otherLang("th")).toBe("en");
    expect(otherLang("en")).toBe("th");
  });
});

describe("demoLang", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  // A fresh module per test, so the store's cached value doesn't leak between tests.
  async function freshStore() {
    vi.resetModules();
    return (await import("@/lib/demos/lang")).demoLang;
  }

  it("renders Thai on the server", async () => {
    expect((await freshStore()).getSeed()).toBe("th");
  });

  it("follows the hub choice when nothing is stored", async () => {
    localStorage.setItem("showcase:locale", "en");
    vi.stubGlobal("navigator", { language: "th-TH" });
    expect((await freshStore()).get()).toBe("en");
  });

  it("follows a Thai browser when there is no hub choice", async () => {
    vi.stubGlobal("navigator", { language: "th-TH" });
    expect((await freshStore()).get()).toBe("th");
  });

  it("stores a switch under demo:lang and leaves the hub choice alone", async () => {
    localStorage.setItem("showcase:locale", "en");
    const store = await freshStore();
    store.set("th");
    expect(localStorage.getItem("demo:lang")).toBe('"th"');
    expect(localStorage.getItem("showcase:locale")).toBe("en");
    expect((await freshStore()).get()).toBe("th");
  });
});
