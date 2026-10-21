# Shared Demo Language (EN/TH) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every demo one shared Thai/English language choice. Move the resort demo, the only bilingual one today, onto it. The black demo bar follows the same choice.

**Architecture:**
- A new `demoLang` store sits in `lib/demos/lang.ts`. It is built on the existing `createDemoStore`, which gains an `initial` option. While nothing is stored, the client starts from the hub's choice, then the browser language. The server always renders Thai.
- Resort's helpers (`useLang`, `T`, `LangScope`, `TImage`) and its EN/TH button move to `components/demo/lang.tsx`, and resort imports them from there.
- A small date formatter, `lib/demos/format.ts`, is added for later steps.

**Tech stack:** Next.js 16.4 App Router (static export), React 19, TypeScript strict, Tailwind 4, Vitest (jsdom for storage tests), Playwright.

**Spec:** `docs/superpowers/specs/2026-10-22-demo-rework-bilingual-design.md`, Part 1, and step 1 of Part 3.

## Global Constraints

- **Static export:** keep `output: "export"`; nothing may need a server.
- **No new dependencies.**
- **Next.js docs:** read `node_modules/next/dist/docs/` before using any Next.js API you haven't seen in this repo (AGENTS.md). This plan only uses `"use client"` and `next/image`, both already used here.
- **Storage key:** the language choice is stored under `demo:lang`, written via `createDemoStore("lang", …)`.
  - When nothing is stored, the initial value is, in order: `showcase:locale` if it is a valid locale; else `th` if `navigator.language` starts with `th`; else `en`.
  - The server snapshot is `th`.
  - Switching inside a demo writes `demo:lang` only and never changes `showcase:locale`.
- **Old resort key:** `resort:lang` is removed and not migrated.
- **Switch button:**
  - Shows the language you'd switch *to*: `EN` while Thai is showing, `TH` while English is showing.
  - Its `aria-label` is in the current language: `เปลี่ยนเป็นภาษาอังกฤษ` while Thai is showing, `Switch to Thai` while English is showing.
  - Its test id is `lang-switch`.
- **Dates:** Thai uses the Buddhist year via `th-TH`; English uses `en-GB` (e.g. `21 Oct 2026`).
- **Copy tone:** professional; Thai uses only "เรา"; no serif fonts. This plan adds no visible copy beyond the switch labels above.
- **Accessibility:** visible keyboard focus on the switch (the resort styling below keeps its focus outline).
- **Commits:** end every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Branch:** work on `feat/demo-lang`, created from `docs/demo-rework-spec`. Never push or merge to `main`; merging deploys devbyohm.com and needs Ohm's explicit OK.

## File map

| File | Change | Responsibility |
|---|---|---|
| `lib/demo-store.ts` | Modify | Optional `initial()` used while nothing is stored |
| `lib/demos/lang.ts` | Create | `Lang`, `L`, `initialDemoLang`, `demoLang` store, `otherLang` |
| `lib/demos/format.ts` | Create | `formatDate(date, lang, style)`, re-export of `formatTHB` |
| `components/demo/lang.tsx` | Create | `useLang`, `T`, `LangScope`, `TImage`, `DemoLangSwitch` |
| `components/demo/demo-pill.tsx` | Modify | Read `demoLang` instead of `showcase:locale` |
| `lib/demos/resort/logic.ts` | Modify | Import `L`/`Lang` from `lib/demos/lang` instead of defining them |
| `lib/demos/resort/content.ts` | Modify | Import path for `L` |
| `lib/demos/resort/lang-store.ts` | Delete | Replaced by `demoLang` |
| `app/demos/resort/_components/t.tsx` | Delete | Moved to `components/demo/lang.tsx` |
| `app/demos/resort/_components/lang-toggle.tsx` | Delete | Replaced by `DemoLangSwitch` |
| `app/demos/resort/_components/copy.ts` | Modify | Import path for `L`; drop `switchToEn`/`switchToTh` |
| `app/demos/resort/**` (8 more files) | Modify | Import paths only, plus the header uses `DemoLangSwitch` |
| `tests/unit/demo-store.test.ts` | Modify | Tests for `initial` |
| `tests/unit/demo-lang.test.ts` | Create | `initialDemoLang`, `demoLang`, `otherLang` |
| `tests/unit/demo-format.test.ts` | Create | `formatDate` |
| `tests/unit/helpers/missing-translations.ts` | Create | Finds `{ th, en }` entries with a blank side (reused by later steps) |
| `tests/unit/resort-copy.test.ts` | Create | Resort copy completeness |
| `tests/e2e/resort.spec.ts` | Modify | Thai browser locale, new test id |
| `tests/e2e/demo-lang.spec.ts` | Create | Start language, switch, demo bar, hub left alone |

**Not in this plan (later steps of the spec):** making `app/demos/shop-admin/_components/format.ts` and `app/demos/clinic-booking/_components/admin-format.ts` call `formatDate`. That happens in steps 6 and 7, when those demos are translated. Until then their output stays Thai as it is today.

---

### Task 1: `createDemoStore` gets an `initial` option

**Files:**
- Modify: `lib/demo-store.ts`
- Test: `tests/unit/demo-store.test.ts`

**Interfaces:**
- Produces: `createDemoStore<T>(key: string, seed: T, options?: { initial?: () => T }): DemoStore<T>`.
  - `getSeed()` still returns `seed`, which is used as the server snapshot.
  - `get()` returns the stored value. If nothing is stored or storage fails, it returns `initial()`, or `structuredClone(seed)` when there is no `initial` or it throws.
  - `reset()` clears storage and returns the same fallback.
  - `initial()`'s result is never written to storage.

- [ ] **Step 1: Write the failing tests.** Append to `tests/unit/demo-store.test.ts`, at the end of the file, after the last `describe` block:

```ts
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
```

- [ ] **Step 2: Run the tests and confirm they fail.**

Run: `pnpm test tests/unit/demo-store.test.ts`
Expected: FAIL. `uses initial() while nothing is stored` gets `"seed"` instead of `"start"`, and `reset goes back to initial()` fails the same way.

- [ ] **Step 3: Implement.** In `lib/demo-store.ts`:

Replace the function signature line and the `read` function:

```ts
export interface DemoStoreOptions<T> {
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
```

(The existing comment `// A tiny observable store backed by localStorage…` above the function moves below the new interface, as shown. Don't duplicate it.)

In `reset()`, change `current = structuredClone(seed);` to `current = fallback();`.

- [ ] **Step 4: Run the tests and confirm they pass.**

Run: `pnpm test tests/unit/demo-store.test.ts`
Expected: PASS (all old and new tests).

- [ ] **Step 5: Commit.**

```bash
git add lib/demo-store.ts tests/unit/demo-store.test.ts
git commit -F - <<'EOF'
feat(demo-store): optional initial() for values worked out on the client

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: The shared `demoLang` store

**Files:**
- Create: `lib/demos/lang.ts`
- Test: `tests/unit/demo-lang.test.ts`

**Interfaces:**
- Consumes: `createDemoStore(key, seed, { initial })` from Task 1; `LOCALE_STORAGE_KEY` (`"showcase:locale"`) and `isLocale` from `@/lib/i18n/config`.
- Produces, from `@/lib/demos/lang`:
  - `type Lang = "th" | "en"`
  - `type L = Record<Lang, string>`
  - `initialDemoLang(hubLocale: string | null | undefined, navigatorLanguage: string | null | undefined): Lang`
  - `demoLang: DemoStore<Lang>`
  - `otherLang(lang: Lang): Lang`

- [ ] **Step 1: Write the failing tests.** Create `tests/unit/demo-lang.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests and confirm they fail.**

Run: `pnpm test tests/unit/demo-lang.test.ts`
Expected: FAIL. The import fails because `lib/demos/lang.ts` does not exist yet.

- [ ] **Step 3: Implement.** Create `lib/demos/lang.ts`:

```ts
import { createDemoStore } from "@/lib/demo-store";
import { LOCALE_STORAGE_KEY, isLocale } from "@/lib/i18n/config";

export type Lang = "th" | "en";
/** One piece of demo copy in both languages. */
export type L = Record<Lang, string>;

/**
 * The language a visitor's first demo opens in: the hub choice if there is one,
 * otherwise Thai for Thai browsers and English for everyone else.
 */
export function initialDemoLang(
  hubLocale: string | null | undefined,
  navigatorLanguage: string | null | undefined,
): Lang {
  if (hubLocale && isLocale(hubLocale)) return hubLocale;
  return navigatorLanguage?.toLowerCase().startsWith("th") ? "th" : "en";
}

function readHubLocale(): string | null {
  try {
    return globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

// One choice shared by every demo. The server renders Thai; on the client an unset
// choice follows the hub, then the browser. Switching never touches the hub's own choice.
export const demoLang = createDemoStore<Lang>("lang", "th", {
  initial: () => initialDemoLang(readHubLocale(), globalThis.navigator?.language),
});

export const otherLang = (lang: Lang): Lang => (lang === "th" ? "en" : "th");
```

- [ ] **Step 4: Run the tests and confirm they pass.**

Run: `pnpm test tests/unit/demo-lang.test.ts`
Expected: PASS (14 tests).

- [ ] **Step 5: Commit.**

```bash
git add lib/demos/lang.ts tests/unit/demo-lang.test.ts
git commit -F - <<'EOF'
feat(demos): shared demo language store that starts from the hub choice

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: `formatDate` for both languages

**Files:**
- Create: `lib/demos/format.ts`
- Test: `tests/unit/demo-format.test.ts`

**Interfaces:**
- Consumes: `type Lang` from `@/lib/demos/lang` (Task 2); `parseISODate(s: string): Date` from `@/lib/dates`; `formatTHB(n: number): string` from `@/lib/packages`.
- Produces, from `@/lib/demos/format`:
  - `type DateStyle = "dayMonth" | "dayMonthYear" | "weekdayDayMonth" | "full"`
  - `formatDate(date: Date | string, lang: Lang, style: DateStyle): string`. A string must be an ISO date, `YYYY-MM-DD`.
  - A re-export of `formatTHB`.

- [ ] **Step 1: Write the failing tests.** Create `tests/unit/demo-format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatDate, formatTHB } from "@/lib/demos/format";

const d = new Date(2026, 9, 21); // Wednesday 21 October 2026

describe("formatDate", () => {
  it("writes Thai dates with the Buddhist year", () => {
    expect(formatDate(d, "th", "dayMonth")).toBe("21 ต.ค.");
    expect(formatDate(d, "th", "dayMonthYear")).toBe("21 ต.ค. 2569");
    expect(formatDate(d, "th", "weekdayDayMonth")).toBe("พุธ 21 ต.ค.");
    expect(formatDate(d, "th", "full")).toBe("วันพุธที่ 21 ตุลาคม 2569");
  });

  it("writes English dates day first with the Gregorian year", () => {
    expect(formatDate(d, "en", "dayMonth")).toBe("21 Oct");
    expect(formatDate(d, "en", "dayMonthYear")).toBe("21 Oct 2026");
    expect(formatDate(d, "en", "weekdayDayMonth")).toBe("Wed 21 Oct");
    expect(formatDate(d, "en", "full")).toBe("Wednesday, 21 October 2026");
  });

  it("accepts ISO date strings as local dates", () => {
    expect(formatDate("2026-10-21", "en", "dayMonthYear")).toBe("21 Oct 2026");
    expect(formatDate("2026-10-21", "th", "dayMonthYear")).toBe("21 ต.ค. 2569");
  });
});

describe("formatTHB", () => {
  it("is the same in both languages", () => {
    expect(formatTHB(14500)).toBe("฿14,500");
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail.**

Run: `pnpm test tests/unit/demo-format.test.ts`
Expected: FAIL. The import fails because `lib/demos/format.ts` does not exist yet.

- [ ] **Step 3: Implement.** Create `lib/demos/format.ts`:

```ts
import { parseISODate } from "@/lib/dates";
import type { Lang } from "./lang";

export { formatTHB } from "@/lib/packages";

export type DateStyle = "dayMonth" | "dayMonthYear" | "weekdayDayMonth" | "full";

const OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  dayMonth: { day: "numeric", month: "short" },
  dayMonthYear: { day: "numeric", month: "short", year: "numeric" },
  weekdayDayMonth: { weekday: "short", day: "numeric", month: "short" },
  full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
};

// th-TH uses the Buddhist calendar, which is what Thai customers read; en-GB puts the day first ("21 Oct 2026").
const LOCALE: Record<Lang, string> = { th: "th-TH", en: "en-GB" };

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Formats a Date, or an ISO `YYYY-MM-DD` string read as a local date. */
export function formatDate(date: Date | string, lang: Lang, style: DateStyle): string {
  const key = `${lang}:${style}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(LOCALE[lang], OPTIONS[style]);
    formatters.set(key, formatter);
  }
  return formatter.format(typeof date === "string" ? parseISODate(date) : date);
}
```

- [ ] **Step 4: Run the tests and confirm they pass.**

Run: `pnpm test tests/unit/demo-format.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit.**

```bash
git add lib/demos/format.ts tests/unit/demo-format.test.ts
git commit -F - <<'EOF'
feat(demos): formatDate for Thai (Buddhist year) and English

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Shared language components; resort moves onto them

**Files:**
- Create: `components/demo/lang.tsx`
- Create: `tests/unit/helpers/missing-translations.ts`
- Create: `tests/unit/resort-copy.test.ts`
- Modify:
  - `lib/demos/resort/logic.ts`
  - `lib/demos/resort/content.ts`
  - `app/demos/resort/layout.tsx`
  - `app/demos/resort/(home)/page.tsx`
  - `app/demos/resort/about/page.tsx`
  - `app/demos/resort/booking/page.tsx`
  - `app/demos/resort/_components/copy.ts`
  - `app/demos/resort/_components/page-intro.tsx`
  - `app/demos/resort/_components/lightbox.tsx`
  - `app/demos/resort/_components/room-filter.tsx`
  - `app/demos/resort/_components/resort-footer.tsx`
  - `app/demos/resort/_components/inquiry-form.tsx`
  - `app/demos/resort/_components/resort-header.tsx`
  - `tests/e2e/resort.spec.ts`
- Delete:
  - `app/demos/resort/_components/t.tsx`
  - `app/demos/resort/_components/lang-toggle.tsx`
  - `lib/demos/resort/lang-store.ts`

**Interfaces:**
- Consumes: `demoLang`, `otherLang`, `type L`, `type Lang` from `@/lib/demos/lang` (Task 2); `useDemoStore` from `@/lib/use-demo-store`.
- Produces, from `@/components/demo/lang` (a client module):
  - `useLang(): Lang`
  - `T({ value }: { value: L })`
  - `LangScope({ className?, style?, children })`
  - `TImage(props: Omit<ImageProps, "alt"> & { alt: L })`
  - `DemoLangSwitch({ className?, labels? }: { className?: string; labels?: Record<Lang, React.ReactNode> })`. `labels[x]` is shown when `x` is the language you'd switch *to*; the default is `{ th: "TH", en: "EN" }`. Renders `data-testid="lang-switch"`.
- Produces, from `tests/unit/helpers/missing-translations.ts`: `missingTranslations(value: unknown, path?: string): string[]`, reused by later steps for each demo's copy.

- [ ] **Step 1: Write the failing copy-completeness test.**

Create `tests/unit/helpers/missing-translations.ts`:

```ts
/**
 * Paths of `{ th, en }` copy entries where either language is missing or blank.
 * Walks plain objects, arrays and module namespaces; ignores everything else.
 */
export function missingTranslations(value: unknown, path = "$"): string[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => missingTranslations(v, `${path}[${i}]`));
  if (value === null || typeof value !== "object") return [];
  const o = value as Record<string, unknown>;
  if ("th" in o || "en" in o) {
    const blank = (["th", "en"] as const).filter((k) => typeof o[k] !== "string" || !(o[k] as string).trim());
    return blank.length ? [`${path} (${blank.join(", ")})`] : [];
  }
  return Object.entries(o).flatMap(([k, v]) => missingTranslations(v, `${path}.${k}`));
}
```

Create `tests/unit/resort-copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import * as copy from "@/app/demos/resort/_components/copy";
import * as content from "@/lib/demos/resort/content";
import { missingTranslations } from "./helpers/missing-translations";

describe("missingTranslations", () => {
  it("reports blank or missing sides with their path", () => {
    expect(missingTranslations({ a: { th: "ก", en: " " }, b: [{ th: "ข" }], c: { th: "ค", en: "c" } })).toEqual([
      "$.a (en)",
      "$.b[0] (en)",
    ]);
  });
});

describe("resort copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations({ copy, content })).toEqual([]);
  });

  it("no longer carries the old switch labels", () => {
    expect(Object.keys(copy.ui)).not.toContain("switchToEn");
    expect(Object.keys(copy.ui)).not.toContain("switchToTh");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails.**

Run: `pnpm test tests/unit/resort-copy.test.ts`
Expected: FAIL only on `no longer carries the old switch labels`. The two completeness tests should already pass. If `has Thai and English for every entry` fails, stop and report the listed paths: that would be a real gap in today's resort copy, and needs Ohm's wording, not invented text.

- [ ] **Step 3: Create the shared components.** Create `components/demo/lang.tsx`:

```tsx
"use client";

import Image, { type ImageProps } from "next/image";
import { demoLang, otherLang, type L, type Lang } from "@/lib/demos/lang";
import { useDemoStore } from "@/lib/use-demo-store";

export function useLang(): Lang {
  return useDemoStore(demoLang)[0];
}

/** Renders one bilingual string in the current demo language. */
export function T({ value }: { value: L }) {
  const lang = useLang();
  return <>{value[lang]}</>;
}

/** Sets the `lang` attribute so screen readers and line breaking follow the switch. */
export function LangScope({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const lang = useLang();
  return (
    <div lang={lang} className={className} style={style}>
      {children}
    </div>
  );
}

/** next/image with bilingual alt text, usable from server pages. */
export function TImage({ alt, ...props }: Omit<ImageProps, "alt"> & { alt: L }) {
  const lang = useLang();
  return <Image alt={alt[lang]} {...props} />;
}

// Said in the language currently showing, so it reads naturally to whoever is looking.
const SWITCH_LABEL: Record<Lang, string> = { th: "เปลี่ยนเป็นภาษาอังกฤษ", en: "Switch to Thai" };

/** The EN/TH button every demo puts in its own header. It shows the language you'd switch to. */
export function DemoLangSwitch({
  className = "",
  labels = { th: "TH", en: "EN" },
}: {
  className?: string;
  labels?: Record<Lang, React.ReactNode>;
}) {
  const lang = useLang();
  const next = otherLang(lang);
  return (
    <button
      type="button"
      data-testid="lang-switch"
      onClick={() => demoLang.set(next)}
      aria-label={SWITCH_LABEL[lang]}
      className={className}
    >
      {labels[next]}
    </button>
  );
}
```

- [ ] **Step 4: Point the resort types at the shared module.**

`lib/demos/resort/logic.ts`: delete these two lines:

```ts
export type Lang = "th" | "en";
export type L = Record<Lang, string>;
```

and add this import below the existing imports:

```ts
import type { L, Lang } from "@/lib/demos/lang";
```

`lib/demos/resort/content.ts`: replace `import type { L, Room } from "./logic";` with:

```ts
import type { L } from "@/lib/demos/lang";
import type { Room } from "./logic";
```

`app/demos/resort/_components/copy.ts`:
- Replace `import type { L } from "@/lib/demos/resort/logic";` with `import type { L } from "@/lib/demos/lang";`.
- Delete these two lines from `ui`:

```ts
  switchToEn: { th: "เปลี่ยนเป็นภาษาอังกฤษ", en: "Switch to English" },
  switchToTh: { th: "เปลี่ยนเป็นภาษาไทย", en: "Switch to Thai" },
```

- [ ] **Step 5: Rewrite the resort imports.** Make exactly these replacements:

| File | Old line | New line |
|---|---|---|
| `app/demos/resort/layout.tsx` | `import { LangScope } from "./_components/t";` | `import { LangScope } from "@/components/demo/lang";` |
| `app/demos/resort/(home)/page.tsx` | `import { T, TImage } from "../_components/t";` | `import { T, TImage } from "@/components/demo/lang";` |
| `app/demos/resort/about/page.tsx` | `import { T, TImage } from "../_components/t";` | `import { T, TImage } from "@/components/demo/lang";` |
| `app/demos/resort/booking/page.tsx` | `import { T } from "../_components/t";` | `import { T } from "@/components/demo/lang";` |
| `app/demos/resort/_components/page-intro.tsx` | `import type { L } from "@/lib/demos/resort/logic";` | `import type { L } from "@/lib/demos/lang";` |
| `app/demos/resort/_components/page-intro.tsx` | `import { T } from "./t";` | `import { T } from "@/components/demo/lang";` |
| `app/demos/resort/_components/lightbox.tsx` | `import type { L } from "@/lib/demos/resort/logic";` | `import type { L } from "@/lib/demos/lang";` |
| `app/demos/resort/_components/lightbox.tsx` | `import { useLang } from "./t";` | `import { useLang } from "@/components/demo/lang";` |
| `app/demos/resort/_components/room-filter.tsx` | `import { useLang } from "./t";` | `import { useLang } from "@/components/demo/lang";` |
| `app/demos/resort/_components/resort-footer.tsx` | `import { useLang } from "./t";` | `import { useLang } from "@/components/demo/lang";` |
| `app/demos/resort/_components/inquiry-form.tsx` | `import { useLang } from "./t";` | `import { useLang } from "@/components/demo/lang";` |

In `app/demos/resort/_components/resort-header.tsx`:
- Delete `import { LangToggle } from "./lang-toggle";`.
- Replace `import { T, useLang } from "./t";` with `import { DemoLangSwitch, T, useLang } from "@/components/demo/lang";`.
- Replace `<LangToggle className="md:order-2" />` with the following. These are the classes resort's old toggle used, so the button looks exactly the same:

```tsx
        <DemoLangSwitch className="grid h-10 min-w-10 place-items-center rounded-full border border-current/35 px-3 text-[13px] font-semibold tracking-wide transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:order-2" />
```

- [ ] **Step 6: Delete the old files.**

```bash
git rm app/demos/resort/_components/t.tsx app/demos/resort/_components/lang-toggle.tsx lib/demos/resort/lang-store.ts
```

Then confirm nothing still points at them:

Run: `grep -rn -e "_components/t\"" -e "lang-toggle" -e "lang-store" -e "resortLang" -e "from \"./t\"" app lib components tests`
Expected: no output.

- [ ] **Step 7: Update the resort e2e test.** In `tests/e2e/resort.spec.ts`:

Below the `iso` helper, add:

```ts
// These tests start from Thai; with no hub choice, a Thai browser opens the demo in Thai.
test.use({ locale: "th-TH" });
```

In `language toggle switches copy and persists`, replace `page.getByTestId("lang-toggle")` with `page.getByTestId("lang-switch")`. Add `await page.waitForLoadState("networkidle");` before the click, because the button only works after hydration.

- [ ] **Step 8: Run the checks.**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all pass. Unit tests include `resort-copy.test.ts` (3 tests), and there are no type errors or lint errors.

Run: `pnpm test:e2e tests/e2e/resort.spec.ts tests/e2e/smoke.spec.ts`
Expected: all pass on both the `desktop` and `mobile` projects. The smoke tests cover every resort route with no console errors, which catches hydration problems.

- [ ] **Step 9: Commit.**

```bash
git add -A components/demo/lang.tsx lib/demos/resort app/demos/resort tests/unit/helpers tests/unit/resort-copy.test.ts tests/e2e/resort.spec.ts
git commit -F - <<'EOF'
refactor(resort): use the shared demo language helpers and switch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: The demo bar follows the demo language; end-to-end language tests

**Files:**
- Modify: `components/demo/demo-pill.tsx`
- Create: `tests/e2e/demo-lang.spec.ts`

**Interfaces:**
- Consumes: `useLang()` from `@/components/demo/lang` (Task 4); `type Lang` from `@/lib/demos/lang`.
- Produces: `tests/e2e/demo-lang.spec.ts` with a `DEMOS` list. Each later step of the rework adds its demo to this list.

- [ ] **Step 1: Write the failing e2e test.** Create `tests/e2e/demo-lang.spec.ts`:

```ts
import { expect, test, type Page } from "@playwright/test";

// Demos with the EN/TH switch. Each later step of the demo rework adds its demo here.
const DEMOS = [{ name: "resort", home: "/demos/resort", next: "/demos/resort/rooms", en: "Rooms", th: "ห้องพัก" }];

// The demo bar's small print, which is always visible.
const BAR = { en: "Demo · fictional business", th: "เว็บตัวอย่าง · ธุรกิจสมมติ" };

const nav = (page: Page) => page.getByRole("navigation").first();
const bar = (page: Page) => page.getByTestId("demo-pill");

for (const d of DEMOS) {
  test.describe(`${d.name} with a Thai browser`, () => {
    test.use({ locale: "th-TH" });

    test("opens in the hub language when the hub has a choice", async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("showcase:locale", "en"));
      await page.goto(d.home);
      await expect(nav(page)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);
    });

    test("opens in Thai when the hub has no choice", async ({ page }) => {
      await page.goto(d.home);
      await page.waitForLoadState("networkidle");
      await expect(nav(page)).toContainText(d.th);
      await expect(bar(page)).toContainText(BAR.th);
    });

    test("the switch changes the copy and the bar, holds across pages, and leaves the hub alone", async ({ page }) => {
      await page.goto(d.home);
      await page.waitForLoadState("networkidle");
      await page.getByTestId("lang-switch").click();
      await expect(nav(page)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);

      await page.goto(d.next);
      await expect(nav(page)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);
      expect(await page.evaluate(() => localStorage.getItem("showcase:locale"))).toBeNull();
    });
  });

  test.describe(`${d.name} with an English browser`, () => {
    test.use({ locale: "en-US" });

    test("opens in English when the hub has no choice", async ({ page }) => {
      await page.goto(d.home);
      await expect(nav(page)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);
    });
  });
}
```

- [ ] **Step 2: Run it and confirm it fails.**

Run: `pnpm test:e2e tests/e2e/demo-lang.spec.ts`
Expected: FAIL in `opens in Thai when the hub has no choice` only, on both projects. The resort nav is Thai, but the bar still shows `Demo · fictional business`, because it reads `showcase:locale` and defaults to `en`. The other three tests pass already, because in each of them the bar happens to expect English.

- [ ] **Step 3: Make the bar read the demo language.** In `components/demo/demo-pill.tsx`, replace the imports and everything above `export function DemoPill`:

```tsx
"use client";

import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/components/demo/lang";
import type { Lang } from "@/lib/demos/lang";
import { formatTHB, getPackage, type PackageId } from "@/lib/packages";

const copy: Record<Lang, Record<"back" | "order" | "note" | "collapse" | "expand", string>> = {
  th: {
    back: "กลับหน้าผลงาน",
    order: "สั่งแพ็กเกจนี้",
    note: "เว็บตัวอย่าง · ธุรกิจสมมติ",
    collapse: "ย่อแถบ",
    expand: "แสดงแถบตัวอย่าง",
  },
  en: {
    back: "Back to showcase",
    order: "Order this package",
    note: "Demo · fictional business",
    collapse: "Collapse bar",
    expand: "Show demo bar",
  },
};
```

Inside `DemoPill`, replace

```tsx
  const locale = useSyncExternalStore(noopSubscribe, readLocale, () => defaultLocale);
```

with

```tsx
  // The bar speaks the demo's language, so one screen never mixes two. Hub and demo locales share the same codes.
  const locale = useLang();
```

The rest of the component (`pkg.title[locale]`, `href={`/${locale}#work`}`, `copy[locale]`) stays as it is. `noopSubscribe` and `readLocale` are now unused; make sure they were removed with the top block.

- [ ] **Step 4: Run it and confirm it passes.**

Run: `pnpm test:e2e tests/e2e/demo-lang.spec.ts tests/e2e/sale-page.spec.ts`
Expected: PASS on `desktop` and `mobile`. The sale-page spec checks that the bar still shows the package price.

- [ ] **Step 5: Run the full verification.**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`
Expected: everything passes. If an e2e test outside this plan fails because it relied on the bar being English while the browser was Thai, report it rather than rewriting it.

Then check by hand on the dev server at 1440px and 375px:
1. Open `/en`, then `/demos/resort`. It opens in English, and the bar is in English.
2. Press TH. The resort and the bar are now in Thai.
3. Open `/demos/sale-page`. The bar is in Thai, because `demo:lang` is shared, while the sale page itself is still Thai-only.
4. Go back to `/en`. The hub is still English.

- [ ] **Step 6: Commit.**

```bash
git add components/demo/demo-pill.tsx tests/e2e/demo-lang.spec.ts
git commit -F - <<'EOF'
feat(demos): demo bar follows the demo language; e2e for the shared switch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
