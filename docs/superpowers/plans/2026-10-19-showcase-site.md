# Fastwork Showcase Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js showcase site: a TH/EN hub that mirrors SupaOhm's six Fastwork packages, plus one live, clickable demo per package.

**Architecture:** A single Next.js 16 App Router app with two root layouts: `app/[locale]` for the hub (`<html lang>` per locale) and `app/demos` for the demos (`<html lang="th">`). All data is mocked. App demos persist edits through a localStorage-backed `createDemoStore`. Pure logic lives in `lib/` and is unit-tested with Vitest. Pages are verified with Playwright smoke and flow tests.

**Tech Stack:** Next.js 16.4 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS 4, Recharts 3, lucide-react, Vitest + jsdom, Playwright 1.64 (Chromium only), pnpm.

**Spec:** `docs/superpowers/specs/2026-10-19-showcase-design.md`

## Global Constraints

- No backend, database, API keys or environment variables. Nothing leaves the browser except Unsplash image loads and outbound links to Fastwork.
- No email, phone or LINE ID for SupaOhm anywhere. Every contact CTA links to `https://fastwork.com/user/devohm` or a listing URL from `lib/packages.ts`.
- Prices are exact: web basic ฿4,900, web standard ฿7,900, web premium ฿14,900, app basic ฿5,900, app standard ฿14,900, app premium ฿29,900.
- All demo businesses, people, phone numbers and reviews are fictional. Phone numbers use the `080000xxxx` pattern. Every demo shows `<DemoPill>`, which labels it as demo content.
- Hub copy refers to SupaOhm with neutral pronouns: "เรา" in Thai, "I" in English. Do not use ผม or ฉัน.
- Thai text must never use `leading` below `1.15`, because tight line-height clips Thai vowel and tone marks.
- Every localStorage access is wrapped in try/catch, and the page must render correctly without storage.
- Pages must not scroll horizontally at 375px width.
- Every page, including login screens and admin shells, renders exactly one `<main>`. The smoke test waits for it.
- Each demo has its own fonts and palette, set in its `layout.tsx`. The hub tokens (`paper`, `ink`, `accent`…) are hub-only.
- Images: Unsplash only, loaded through `unsplash(id, width)` from `lib/images.ts`. Every photo id is verified with `curl -sI` before use.
- Commit after every task. Every commit message ends with a blank line and then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Visual markup policy:** this plan gives complete code for every data, logic, shared-component, hub and test file. For demo page JSX, it gives the exact routes, sections, copy source, design tokens and `data-testid`s instead of full markup, because that UI is iterated visually. Implementers of demo tasks must invoke the `frontend-design` skill, build the pages from the listed content files, and pass the visual check step (screenshots at 375px and 1440px).

## File Structure

```
next.config.ts                  # / → /th redirect, Unsplash images
vitest.config.ts
playwright.config.ts
app/
  globals.css                   # Tailwind import + hub theme tokens
  [locale]/layout.tsx           # hub root layout (html lang)
  [locale]/page.tsx             # hub page
  demos/layout.tsx              # demos root layout (html lang="th")
  demos/sale-page/…             # web-basic
  demos/company/…               # web-standard
  demos/resort/…                # web-premium
  demos/orders-api/…            # app-basic
  demos/shop-admin/…            # app-standard
  demos/clinic-booking/…        # app-premium
components/
  hub/*.tsx                     # hub sections
  demo/demo-pill.tsx            # floating pill on every demo
  demo/require-session.tsx      # fake-auth guard for app demos
  demo/reset-demo-button.tsx
lib/
  i18n/{config.ts,index.ts,th.json,en.json}
  packages.ts                   # single source of truth for 6 packages
  demo-store.ts                 # createDemoStore (framework-free)
  use-demo-store.ts             # React bindings (client)
  dates.ts                      # toISODate, addDays, nextDays
  validation.ts                 # isEmail, isThaiPhone
  images.ts                     # unsplash() helper + verified photo ids
  demos/<slug>/*.ts             # content + pure logic per demo
tests/
  unit/*.test.ts                # Vitest
  e2e/routes.ts                 # every route, appended per task
  e2e/*.spec.ts                 # Playwright
scripts/capture-thumbs.mjs      # hub thumbnails from live demos
```

Note: the spec mentions `lib/mock/<demo>.ts`. This plan uses `lib/demos/<slug>/` instead, so that content and logic for a demo live together. Task 1 updates the spec to match.

---

### Task 1: Scaffold, tooling, root layouts and smoke test

**Files:**
- Create: the Next.js scaffold, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `app/globals.css`, `app/global-not-found.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx` (temporary), `app/demos/layout.tsx`, `lib/i18n/config.ts`, `tests/e2e/routes.ts`, `tests/e2e/smoke.spec.ts`
- Delete: the scaffold's `app/layout.tsx`, `app/page.tsx` and `public/*.svg`
- Modify: `package.json` scripts, `docs/superpowers/specs/2026-10-19-showcase-design.md` (the `lib/mock` path → `lib/demos/<slug>/`)

**Interfaces:**
- Produces: `locales`, `Locale`, `defaultLocale`, `isLocale(value: string): value is Locale` and `LOCALE_STORAGE_KEY = "showcase:locale"` from `@/lib/i18n/config`. Also `routes: string[]` from `tests/e2e/routes.ts`, which later tasks append to.

- [ ] **Step 1: Scaffold Next.js into the existing repo**

```bash
cd /Users/supa/projects/active/fastexample
pnpm create next-app@16.4.2 . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm --turbopack --yes
```
Expected: the scaffold completes. `docs/` is on create-next-app's allow-list, so the non-empty directory is fine. If it refuses anyway, move `docs/` to the scratchpad, scaffold, then move it back.

- [ ] **Step 2: Install dependencies and the browser**

```bash
pnpm add recharts lucide-react
pnpm add -D vitest jsdom @playwright/test
pnpm exec playwright install chromium
rm app/layout.tsx app/page.tsx public/*.svg
```

- [ ] **Step 3: Set scripts in `package.json`**

Replace the `"scripts"` block with:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 4: Write config files**

`next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/th", permanent: false }];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    unoptimized: true,
  },
};

export default nextConfig;
```

`vitest.config.ts`:
```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
});
```

`playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } } },
  ],
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}/th`,
    timeout: 240_000,
    reuseExistingServer: false,
  },
});
```

Append to `.gitignore`:
```
/test-results/
/playwright-report/
```

- [ ] **Step 5: Write the i18n config**

`lib/i18n/config.ts`:
```ts
export const locales = ["th", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "th";
export const LOCALE_STORAGE_KEY = "showcase:locale";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
```

- [ ] **Step 6: Write the failing smoke test**

`tests/e2e/routes.ts`:
```ts
// Every page in the site. Each demo task appends its routes here.
export const routes: string[] = ["/th", "/en"];
```

`tests/e2e/smoke.spec.ts`:
```ts
import { expect, test } from "@playwright/test";
import { routes } from "./routes";

test.beforeEach(async ({ page }) => {
  // Log in to both app demos so admin routes render their real content.
  await page.addInitScript(() => {
    localStorage.setItem("demo:shop-admin:session", "true");
    localStorage.setItem("demo:clinic:session", "true");
  });
});

for (const route of routes) {
  test(`smoke ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    const res = await page.goto(route, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.locator("main").first()).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test("root redirects to /th", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/th$/);
});

test("unknown locale returns 404", async ({ page }) => {
  const res = await page.goto("/fr");
  expect(res?.status()).toBe(404);
});
```

- [ ] **Step 7: Run it to verify it fails**

Run: `pnpm test:e2e smoke`
Expected: FAIL. The build errors because there are no layouts or pages.

- [ ] **Step 8: Write globals and the root layouts**

`app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-paper: #f4eee6;
  --color-ink: #161412;
  --color-muted: #6b6259;
  --color-line: #ddd2c4;
  --color-accent: #e0542a;
  --font-sans: var(--font-anuphan), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-bricolage), var(--font-anuphan), ui-sans-serif, sans-serif;
}

html {
  scroll-behavior: smooth;
}
```

`app/[locale]/layout.tsx`:
```tsx
import "../globals.css";
import { Anuphan, Bricolage_Grotesque } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/config";

const anuphan = Anuphan({ subsets: ["thai", "latin"], variable: "--font-anuphan" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} className={`${anuphan.variable} ${bricolage.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
```

`app/[locale]/page.tsx` (temporary; Task 4 replaces it):
```tsx
export default function HubPage() {
  return <main className="p-6">SupaOhm</main>;
}
```

`app/demos/layout.tsx`:
```tsx
import "../globals.css";

export default function DemosRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

`app/global-not-found.tsx` is needed because there is no top-level root layout, so 404s need their own document:
```tsx
import "./globals.css";
import Link from "next/link";

export const metadata = { title: "404 — SupaOhm" };

export default function GlobalNotFound() {
  return (
    <html lang="th">
      <body className="bg-paper font-sans text-ink antialiased">
        <main className="grid min-h-dvh place-items-center p-6 text-center">
          <div>
            <p className="text-6xl font-bold">404</p>
            <Link href="/th" className="mt-4 inline-block underline">
              กลับหน้าแรก · Back home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
```
If the build reports that `global-not-found` needs a flag in this Next version, add `experimental: { globalNotFound: true }` to `next.config.ts`.

- [ ] **Step 9: Run tests to verify they pass**

Run: `pnpm typecheck && pnpm lint && pnpm test:e2e smoke`
Expected: all pass, with 8 smoke tests (4 tests × 2 projects).

- [ ] **Step 10: Update the spec path and commit**

In `docs/superpowers/specs/2026-10-19-showcase-design.md`, replace the line `  mock/<demo>.ts                # seeded data per demo` with `  demos/<slug>/*.ts             # content, seeded data and pure logic per demo`.

```bash
git add -A
git commit -m "chore: scaffold Next.js app with root layouts and smoke tests

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shared libraries: packages, i18n dictionaries, dates, validation

**Files:**
- Create: `lib/packages.ts`, `lib/i18n/th.json`, `lib/i18n/en.json`, `lib/i18n/index.ts`, `lib/dates.ts`, `lib/validation.ts`
- Test: `tests/unit/packages.test.ts`, `tests/unit/i18n.test.ts`, `tests/unit/dates.test.ts`, `tests/unit/validation.test.ts`

**Interfaces:**
- Consumes: `Locale` from `@/lib/i18n/config`.
- Produces:
  - `@/lib/packages`: `ServiceId = "web" | "app"`, `Tier = "basic" | "standard" | "premium"`, `PackageId = \`${ServiceId}-${Tier}\``, `interface Package { id; service; tier; priceTHB: number; title: Record<Locale,string>; scope: Record<Locale,string[]>; demoName: Record<Locale,string>; demoPath: string; fastworkUrl: string }`, `packages: Package[]`, `getPackage(id: PackageId): Package`, `packagesByService(service: ServiceId): Package[]`, `formatTHB(n: number): string`, `FASTWORK_PROFILE_URL`.
  - `@/lib/i18n`: `type Dictionary`, `getDictionary(locale: Locale): Dictionary`, plus a re-export of everything in `config.ts`.
  - `@/lib/dates`: `toISODate(d: Date): string` (local `YYYY-MM-DD`), `addDays(d: Date, n: number): Date`, `nextDays(from: Date, n: number): string[]`, `parseISODate(s: string): Date` (local midnight).
  - `@/lib/validation`: `isEmail(s: string): boolean`, `normalizePhone(s: string): string`, `isThaiPhone(s: string): boolean`.

- [ ] **Step 1: Write the failing tests**

`tests/unit/packages.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { formatTHB, getPackage, packages, packagesByService } from "@/lib/packages";

describe("packages", () => {
  it("has exactly the six Fastwork packages at the listed prices", () => {
    expect(packages.map((p) => [p.id, p.priceTHB])).toEqual([
      ["web-basic", 4900],
      ["web-standard", 7900],
      ["web-premium", 14900],
      ["app-basic", 5900],
      ["app-standard", 14900],
      ["app-premium", 29900],
    ]);
  });

  it("groups three tiers per service in order", () => {
    for (const service of ["web", "app"] as const) {
      expect(packagesByService(service).map((p) => p.tier)).toEqual(["basic", "standard", "premium"]);
    }
  });

  it("links every package to a demo route and its Fastwork listing", () => {
    for (const p of packages) {
      expect(p.demoPath).toMatch(/^\/demos\/[a-z-]+$/);
      expect(p.fastworkUrl).toMatch(/^https:\/\/fastwork\.com\/user\/devohm\/gigs\//);
    }
  });

  it("has non-empty copy in both locales", () => {
    for (const p of packages) {
      for (const locale of ["th", "en"] as const) {
        expect(p.title[locale]).not.toBe("");
        expect(p.demoName[locale]).not.toBe("");
        expect(p.scope[locale].length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("getPackage finds by id and throws on unknown ids", () => {
    expect(getPackage("app-premium").priceTHB).toBe(29900);
    // @ts-expect-error unknown id
    expect(() => getPackage("nope")).toThrow();
  });

  it("formats baht with thousands separators", () => {
    expect(formatTHB(4900)).toBe("฿4,900");
    expect(formatTHB(29900)).toBe("฿29,900");
  });
});
```

`tests/unit/i18n.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/en.json";
import th from "@/lib/i18n/th.json";
import { getDictionary, isLocale } from "@/lib/i18n";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, shape(v)]),
    );
  }
  return typeof value;
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("i18n", () => {
  it("th and en dictionaries have identical shape", () => {
    expect(shape(en)).toEqual(shape(th));
  });

  it("has no empty strings", () => {
    for (const s of [...strings(th), ...strings(en)]) expect(s.trim()).not.toBe("");
  });

  it("never uses gendered Thai first-person pronouns", () => {
    for (const s of strings(th)) expect(s).not.toMatch(/ผม|ฉัน|ดิฉัน/);
  });

  it("returns the dictionary per locale", () => {
    expect(getDictionary("en").services.viewDemo).toBe("View demo");
    expect(getDictionary("th").services.viewDemo).toBe("ดูตัวอย่าง");
  });

  it("validates locales", () => {
    expect(isLocale("th")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });
});
```

`tests/unit/dates.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { addDays, nextDays, parseISODate, toISODate } from "@/lib/dates";

describe("dates", () => {
  it("formats local dates as YYYY-MM-DD", () => {
    expect(toISODate(new Date(2026, 9, 9))).toBe("2026-10-09");
  });

  it("adds days across month boundaries", () => {
    expect(toISODate(addDays(new Date(2026, 9, 30), 3))).toBe("2026-11-02");
  });

  it("lists the next n days starting today", () => {
    expect(nextDays(new Date(2026, 9, 19), 3)).toEqual(["2026-10-19", "2026-10-20", "2026-10-21"]);
  });

  it("parses ISO dates to local midnight", () => {
    const d = parseISODate("2026-10-19");
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 9, 19, 0]);
  });
});
```

`tests/unit/validation.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { isEmail, isThaiPhone, normalizePhone } from "@/lib/validation";

describe("validation", () => {
  it("accepts plausible emails only", () => {
    expect(isEmail("a@b.co")).toBe(true);
    expect(isEmail("a@b")).toBe(false);
    expect(isEmail("a b@c.com")).toBe(false);
  });

  it("normalizes phone separators", () => {
    expect(normalizePhone("080-000 0001")).toBe("0800000001");
  });

  it("accepts Thai 9–10 digit numbers starting with 0", () => {
    expect(isThaiPhone("080-000-0001")).toBe(true);
    expect(isThaiPhone("021234567")).toBe(true);
    expect(isThaiPhone("1800000001")).toBe(false);
    expect(isThaiPhone("08000")).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL. The modules don't exist yet.

- [ ] **Step 3: Implement `lib/dates.ts` and `lib/validation.ts`**

`lib/dates.ts`:
```ts
export function toISODate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

export function nextDays(from: Date, n: number): string[] {
  return Array.from({ length: n }, (_, i) => toISODate(addDays(from, i)));
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
```

`lib/validation.ts`:
```ts
export function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
}

export function normalizePhone(s: string): string {
  return s.replace(/[\s-]/g, "");
}

export function isThaiPhone(s: string): boolean {
  return /^0\d{8,9}$/.test(normalizePhone(s));
}
```

- [ ] **Step 4: Implement `lib/packages.ts`**

Before writing it, open both listings in Chrome and copy the full "Basic" scope of the app service, which is truncated on the listing card:
`https://fastwork.com/user/devohm/gigs/i-will-build-a-custom-web-application-dashboard-or-backend-api-s.pu39xm3f7rrynh`.
If it differs from the `app-basic` scope below, update the bullets to match the listing.

```ts
import type { Locale } from "@/lib/i18n/config";

export type ServiceId = "web" | "app";
export type Tier = "basic" | "standard" | "premium";
export type PackageId = `${ServiceId}-${Tier}`;

export interface Package {
  id: PackageId;
  service: ServiceId;
  tier: Tier;
  priceTHB: number;
  title: Record<Locale, string>;
  scope: Record<Locale, string[]>;
  demoName: Record<Locale, string>;
  demoPath: string;
  fastworkUrl: string;
}

export const FASTWORK_PROFILE_URL = "https://fastwork.com/user/devohm";

const WEB_URL =
  "https://fastwork.com/user/devohm/gigs/i-will-build-a-responsive-website-or-landing-page-with-next-js-s.f879y5wiwf0nr2";
const APP_URL =
  "https://fastwork.com/user/devohm/gigs/i-will-build-a-custom-web-application-dashboard-or-backend-api-s.pu39xm3f7rrynh";

export const packages: Package[] = [
  {
    id: "web-basic",
    service: "web",
    tier: "basic",
    priceTHB: 4900,
    title: { th: "เว็บไซต์ · Basic", en: "Website · Basic" },
    scope: {
      th: ["แลนดิ้งเพจ 1 หน้า", "รองรับมือถือ แท็บเล็ต เดสก์ท็อป", "SEO พื้นฐาน", "แก้ไข 1 ครั้ง"],
      en: ["1 responsive landing page", "Mobile, tablet & desktop", "Basic on-page SEO", "1 revision"],
    },
    demoName: { th: "Mali Botanics — เซลเพจสกินแคร์", en: "Mali Botanics — skincare sale page" },
    demoPath: "/demos/sale-page",
    fastworkUrl: WEB_URL,
  },
  {
    id: "web-standard",
    service: "web",
    tier: "standard",
    priceTHB: 7900,
    title: { th: "เว็บไซต์ · Standard", en: "Website · Standard" },
    scope: {
      th: ["สูงสุด 3 หน้า", "ฟอร์มติดต่อ", "SEO พื้นฐาน", "แก้ไข 2 ครั้ง"],
      en: ["Up to 3 pages", "Contact form", "Basic SEO", "2 revisions"],
    },
    demoName: { th: "สยามพรีซิชั่น — เว็บไซต์บริษัท", en: "Siam Precision — company website" },
    demoPath: "/demos/company",
    fastworkUrl: WEB_URL,
  },
  {
    id: "web-premium",
    service: "web",
    tier: "premium",
    priceTHB: 14900,
    title: { th: "เว็บไซต์ · Premium", en: "Website · Premium" },
    scope: {
      th: ["สูงสุด 5 หน้า", "คอมโพเนนต์ใช้ซ้ำได้", "อินเทอร์แอกชันเพิ่มเติม", "แก้ไข 3 ครั้ง"],
      en: ["Up to 5 pages", "Reusable components", "Additional interactions", "3 revisions"],
    },
    demoName: { th: "แสงจันทร์ รีสอร์ท — เว็บไซต์รีสอร์ท", en: "Saeng Chan Resort — resort website" },
    demoPath: "/demos/resort",
    fastworkUrl: WEB_URL,
  },
  {
    id: "app-basic",
    service: "app",
    tier: "basic",
    priceTHB: 5900,
    title: { th: "เว็บแอป · Basic", en: "Web app · Basic" },
    scope: {
      th: ["ระบบหลังบ้าน 1 โมดูล", "REST API สูงสุด 4 endpoint", "ข้อมูล 1 ประเภท"],
      en: ["One small backend module", "Up to 4 REST endpoints", "One data resource"],
    },
    demoName: { th: "Orders API — เอกสาร API ทดลองยิงได้", en: "Orders API — interactive API docs" },
    demoPath: "/demos/orders-api",
    fastworkUrl: APP_URL,
  },
  {
    id: "app-standard",
    service: "app",
    tier: "standard",
    priceTHB: 14900,
    title: { th: "เว็บแอป · Standard", en: "Web app · Standard" },
    scope: {
      th: ["แดชบอร์ดสูงสุด 3 หน้าจอ", "ระบบล็อกอินพื้นฐาน", "ข้อมูล 2 โมดูล", "ตารางและกราฟ"],
      en: ["Up to 3 dashboard screens", "Basic login", "2 data modules", "Tables & simple charts"],
    },
    demoName: { th: "ร้านดี — ระบบหลังร้าน", en: "Ran Dee — shop back office" },
    demoPath: "/demos/shop-admin",
    fastworkUrl: APP_URL,
  },
  {
    id: "app-premium",
    service: "app",
    tier: "premium",
    priceTHB: 29900,
    title: { th: "เว็บแอป · Premium", en: "Web app · Premium" },
    scope: {
      th: ["MVP สูงสุด 5 หน้าจอ", "ระบบยืนยันตัวตน", "ข้อมูลหลักสูงสุด 3 โมดูล", "รองรับทุกอุปกรณ์"],
      en: ["MVP with up to 5 screens", "Authentication", "Up to 3 core data modules", "Responsive"],
    },
    demoName: { th: "ลูมิ คลินิก — ระบบจองคิว", en: "Lumi Clinic — booking system" },
    demoPath: "/demos/clinic-booking",
    fastworkUrl: APP_URL,
  },
];

export function getPackage(id: PackageId): Package {
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) throw new Error(`Unknown package: ${id}`);
  return pkg;
}

export function packagesByService(service: ServiceId): Package[] {
  return packages.filter((p) => p.service === service);
}

export function formatTHB(n: number): string {
  return `฿${new Intl.NumberFormat("en-US").format(n)}`;
}
```

- [ ] **Step 5: Implement the dictionaries and `lib/i18n/index.ts`**

`lib/i18n/th.json`:
```json
{
  "meta": {
    "title": "SupaOhm — ตัวอย่างงานเว็บไซต์และระบบ",
    "description": "ลองใช้เว็บตัวอย่างของทุกแพ็กเกจ: เซลเพจ เว็บบริษัท เว็บรีสอร์ท API แดชบอร์ด และระบบจองคิว สร้างด้วย Next.js"
  },
  "nav": {
    "services": "บริการ",
    "process": "ขั้นตอน",
    "stack": "เครื่องมือ",
    "about": "เกี่ยวกับ",
    "switchLocale": "EN",
    "switchLocaleLabel": "Switch to English"
  },
  "hero": {
    "eyebrow": "Full-stack web developer · กรุงเทพฯ",
    "title": "เว็บไซต์และระบบที่ธุรกิจของคุณใช้งานได้จริง",
    "subtitle": "ทุกแพ็กเกจบน Fastwork มีเว็บตัวอย่างให้ลองกดใช้งานก่อนจ้าง เห็นชัดว่างบเท่านี้จะได้อะไร",
    "ctaDemos": "ดูตัวอย่างงาน",
    "ctaFastwork": "โปรไฟล์บน Fastwork"
  },
  "services": {
    "heading": "เลือกแพ็กเกจ แล้วลองเล่นตัวอย่างได้ทันที",
    "web": {
      "title": "เว็บไซต์ / แลนดิ้งเพจ",
      "description": "เว็บไซต์รองรับทุกอุปกรณ์ สร้างด้วย Next.js โหลดเร็ว ดีไซน์ตามแบรนด์ ไม่ใช้เทมเพลตสำเร็จรูป"
    },
    "app": {
      "title": "เว็บแอป / แดชบอร์ด / API",
      "description": "ระบบหลังบ้าน แดชบอร์ด และ API สำหรับจัดการข้อมูลและงานประจำวันของธุรกิจ"
    },
    "viewDemo": "ดูตัวอย่าง",
    "order": "สั่งซื้อบน Fastwork",
    "perProject": "/ โปรเจกต์",
    "tiers": { "basic": "Basic", "standard": "Standard", "premium": "Premium" }
  },
  "process": {
    "heading": "ขั้นตอนการทำงาน",
    "steps": [
      { "title": "บรีฟ", "body": "บอกเป้าหมาย ตัวอย่างที่ชอบ และกำหนดส่ง เรายืนยันขอบเขตและราคาก่อนสั่งซื้อ" },
      { "title": "ออกแบบ", "body": "ร่างเลย์เอาต์และหน้าตาให้ดูก่อน อนุมัติแล้วจึงเริ่มเขียนโค้ด" },
      { "title": "พัฒนา", "body": "Next.js + TypeScript + Tailwind ทดสอบบนมือถือ แท็บเล็ต และเดสก์ท็อป" },
      { "title": "แก้ไข", "body": "ปรับแก้ตามจำนวนรอบที่รวมอยู่ในแพ็กเกจ" },
      { "title": "ส่งมอบ", "body": "ส่งซอร์สโค้ด ช่วยขึ้นระบบออนไลน์ และอธิบายการใช้งาน" }
    ]
  },
  "stack": {
    "heading": "เครื่องมือที่ใช้",
    "body": "ทุกเว็บตัวอย่างในหน้านี้สร้างด้วยชุดเครื่องมือเดียวกับที่ใช้ทำงานให้ลูกค้า"
  },
  "about": {
    "heading": "เกี่ยวกับ SupaOhm",
    "body": "Supakorn (โอห์ม) นักศึกษาวิศวกรรมคอมพิวเตอร์ SIIT ธรรมศาสตร์ และนักพัฒนาเว็บแบบ Full-stack ในกรุงเทพฯ มีประสบการณ์สร้างเครื่องมือภายในองค์กร ระบบ AI และหน้าเว็บสมัยใหม่ เคยฝึกงานตำแหน่ง AI Developer ที่ Mizuhada Group และ UX/UI Researcher ที่ BAKA Group",
    "portfolio": "ดูพอร์ตโฟลิโอส่วนตัว"
  },
  "footer": {
    "heading": "มีโปรเจกต์ในใจแล้ว?",
    "body": "ส่งรายละเอียด งานอ้างอิง และกำหนดส่งมาทาง Fastwork แล้วเราจะยืนยันขอบเขตและราคาก่อนเริ่มงาน",
    "button": "คุยกันบน Fastwork",
    "note": "ธุรกิจ บุคคล และรีวิวในเว็บตัวอย่างทั้งหมดเป็นข้อมูลสมมติ"
  }
}
```

`lib/i18n/en.json`:
```json
{
  "meta": {
    "title": "SupaOhm — Website & web app demos",
    "description": "Try a live demo of every package: sale page, company site, resort site, API, dashboard and booking system, built with Next.js."
  },
  "nav": {
    "services": "Services",
    "process": "Process",
    "stack": "Stack",
    "about": "About",
    "switchLocale": "ไทย",
    "switchLocaleLabel": "เปลี่ยนเป็นภาษาไทย"
  },
  "hero": {
    "eyebrow": "Full-stack web developer · Bangkok",
    "title": "Websites and web apps your business can actually use",
    "subtitle": "Every package on Fastwork has a live demo you can click through before you hire, so you see exactly what your budget gets.",
    "ctaDemos": "See the demos",
    "ctaFastwork": "Fastwork profile"
  },
  "services": {
    "heading": "Pick a package, then try its demo",
    "web": {
      "title": "Website / landing page",
      "description": "Responsive websites built with Next.js: fast, on-brand, and never a prebuilt template."
    },
    "app": {
      "title": "Web app / dashboard / API",
      "description": "Back-office systems, dashboards and APIs that manage your data and day-to-day operations."
    },
    "viewDemo": "View demo",
    "order": "Order on Fastwork",
    "perProject": "/ project",
    "tiers": { "basic": "Basic", "standard": "Standard", "premium": "Premium" }
  },
  "process": {
    "heading": "How I work",
    "steps": [
      { "title": "Brief", "body": "Share your goals, references and deadline. I confirm scope and price before you order." },
      { "title": "Design", "body": "I sketch the layout and look first. Code starts once you approve." },
      { "title": "Build", "body": "Next.js + TypeScript + Tailwind, tested on mobile, tablet and desktop." },
      { "title": "Revise", "body": "Revision rounds are included in your package." },
      { "title": "Deliver", "body": "Source code, help going live, and a short handover." }
    ]
  },
  "stack": {
    "heading": "Stack",
    "body": "Every demo on this page is built with the same tools I use for client work."
  },
  "about": {
    "heading": "About SupaOhm",
    "body": "I'm Supakorn (Ohm), a Computer Engineering student at SIIT, Thammasat University, and a full-stack developer in Bangkok. I've built internal business tools, AI systems and modern web interfaces, including as an AI Developer intern at Mizuhada Group and a UX/UI Researcher intern at BAKA Group.",
    "portfolio": "View personal portfolio"
  },
  "footer": {
    "heading": "Have a project in mind?",
    "body": "Send your details, references and deadline on Fastwork, and I'll confirm scope and price before starting.",
    "button": "Talk on Fastwork",
    "note": "All businesses, people and reviews in the demos are fictional."
  }
}
```

`lib/i18n/index.ts`:
```ts
import type { Locale } from "./config";
import en from "./en.json";
import th from "./th.json";

export type Dictionary = typeof th;

const dictionaries: Record<Locale, Dictionary> = { th, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export * from "./config";
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm test && pnpm typecheck`
Expected: PASS for all four test files, and no type errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add packages, i18n dictionaries, date and validation helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Demo store, React bindings and shared demo components

**Files:**
- Create: `lib/demo-store.ts`, `lib/use-demo-store.ts`, `components/demo/demo-pill.tsx`, `components/demo/require-session.tsx`, `components/demo/reset-demo-button.tsx`
- Test: `tests/unit/demo-store.test.ts`

**Interfaces:**
- Consumes: `getPackage`, `formatTHB`, `PackageId` from `@/lib/packages`, and `LOCALE_STORAGE_KEY`, `defaultLocale`, `isLocale`, `Locale` from `@/lib/i18n/config`.
- Produces:
  - `@/lib/demo-store`: `interface DemoStore<T> { get(): T; getSeed(): T; set(next: T | ((prev: T) => T)): T; reset(): T; subscribe(fn: () => void): () => void }` and `createDemoStore<T>(key: string, seed: T): DemoStore<T>`. The storage key is `"demo:" + key`.
  - `@/lib/use-demo-store` (client): `useDemoStore<T>(store): [T, DemoStore<T>["set"]]` and `useHydrated(): boolean`.
  - `<DemoPill packageId: PackageId />`, `<RequireSession store: DemoStore<boolean> loginPath: string>{children}</RequireSession>`, and `<ResetDemoButton stores: DemoStore<unknown>[] label?: string className?: string />`.

- [ ] **Step 1: Write the failing test**

`tests/unit/demo-store.test.ts`:
```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test demo-store`
Expected: FAIL. `@/lib/demo-store` cannot be resolved.

- [ ] **Step 3: Implement `lib/demo-store.ts`**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test demo-store`
Expected: PASS (7 tests).

- [ ] **Step 5: Implement the React bindings and shared components**

`lib/use-demo-store.ts`:
```ts
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
```

`components/demo/require-session.tsx`:
```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { DemoStore } from "@/lib/demo-store";
import { useDemoStore, useHydrated } from "@/lib/use-demo-store";

export function RequireSession({
  store,
  loginPath,
  children,
}: {
  store: DemoStore<boolean>;
  loginPath: string;
  children: React.ReactNode;
}) {
  const [session] = useDemoStore(store);
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !session) router.replace(loginPath);
  }, [hydrated, session, router, loginPath]);

  if (!hydrated || !session) return null;
  return <>{children}</>;
}
```

`components/demo/reset-demo-button.tsx`:
```tsx
"use client";

import { RotateCcw } from "lucide-react";
import type { DemoStore } from "@/lib/demo-store";

export function ResetDemoButton({
  stores,
  label = "รีเซ็ตข้อมูลตัวอย่าง",
  className = "",
}: {
  stores: DemoStore<unknown>[];
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-testid="reset-demo"
      onClick={() => stores.forEach((s) => s.reset())}
      className={`inline-flex items-center gap-2 text-sm ${className}`}
    >
      <RotateCcw className="size-4" aria-hidden />
      {label}
    </button>
  );
}
```

`components/demo/demo-pill.tsx`:
```tsx
"use client";

import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { LOCALE_STORAGE_KEY, defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { formatTHB, getPackage, type PackageId } from "@/lib/packages";

const copy: Record<Locale, Record<"back" | "order" | "note" | "collapse" | "expand", string>> = {
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

const noopSubscribe = () => () => {};

function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isLocale(stored)) return stored;
  } catch {
    // ignore
  }
  return defaultLocale;
}

export function DemoPill({ packageId }: { packageId: PackageId }) {
  const pkg = getPackage(packageId);
  const locale = useSyncExternalStore(noopSubscribe, readLocale, () => defaultLocale);
  const [open, setOpen] = useState(true);
  const c = copy[locale];
  const font = { fontFamily: "ui-sans-serif, system-ui, sans-serif" };

  if (!open) {
    return (
      <button
        type="button"
        data-testid="demo-pill"
        aria-label={c.expand}
        onClick={() => setOpen(true)}
        style={font}
        className="fixed bottom-4 right-4 z-[100] grid size-11 place-items-center rounded-full bg-neutral-950 text-white shadow-lg"
      >
        <ChevronUp className="size-5" aria-hidden />
      </button>
    );
  }

  return (
    <div
      data-testid="demo-pill"
      style={font}
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-xl items-center gap-1 rounded-full bg-neutral-950/95 p-1.5 text-white shadow-2xl backdrop-blur"
    >
      <Link
        href={`/${locale}#services`}
        aria-label={c.back}
        className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm hover:bg-white/10"
      >
        <ArrowLeft className="size-4" aria-hidden />
        <span className="hidden sm:inline">{c.back}</span>
      </Link>
      <div className="min-w-0 flex-1 px-1 leading-[1.2]">
        <p className="truncate text-sm font-semibold">
          {pkg.title[locale]} · {formatTHB(pkg.priceTHB)}
        </p>
        <p className="truncate text-[11px] text-white/60">{c.note}</p>
      </div>
      <a
        href={pkg.fastworkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-neutral-950 hover:bg-white/90"
      >
        {c.order}
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
      <button
        type="button"
        aria-label={c.collapse}
        onClick={() => setOpen(false)}
        className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/10"
      >
        <ChevronDown className="size-4" aria-hidden />
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all pass.

```bash
git add -A
git commit -m "feat: add demo store, session guard, reset button and demo pill

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Hub page

**Files:**
- Create: `components/hub/site-header.tsx`, `components/hub/locale-switch.tsx`, `components/hub/remember-locale.tsx`, `components/hub/hero.tsx`, `components/hub/services-section.tsx`, `components/hub/package-card.tsx`, `components/hub/process-section.tsx`, `components/hub/stack-section.tsx`, `components/hub/about-section.tsx`, `components/hub/site-footer.tsx`
- Modify: `app/[locale]/page.tsx` (full replacement)
- Test: `tests/e2e/hub.spec.ts`

**Interfaces:**
- Consumes: `getDictionary`, `Dictionary`, `Locale`, `isLocale`, `LOCALE_STORAGE_KEY` from `@/lib/i18n`, and `packages`, `packagesByService`, `formatTHB`, `FASTWORK_PROFILE_URL`, `Package`, `PackageId` from `@/lib/packages`.
- Produces: hub sections with ids `services`, `process`, `stack`, `about`, and package cards with `data-testid="package-<id>"`.

- [ ] **Step 1: Write the failing test**

`tests/e2e/hub.spec.ts`:
```ts
import { expect, test } from "@playwright/test";
import { packages } from "../../lib/packages";

test("every package card links to its demo and Fastwork listing", async ({ page }) => {
  await page.goto("/th");
  for (const pkg of packages) {
    const card = page.getByTestId(`package-${pkg.id}`);
    await expect(card).toContainText(`฿${pkg.priceTHB.toLocaleString("en-US")}`);
    await expect(card.getByRole("link", { name: "ดูตัวอย่าง" })).toHaveAttribute("href", pkg.demoPath);
    await expect(card.getByRole("link", { name: /สั่งซื้อบน Fastwork/ })).toHaveAttribute("href", pkg.fastworkUrl);
  }
});

test("locale switch goes to English and back", async ({ page }) => {
  await page.goto("/th");
  await page.getByRole("link", { name: "Switch to English" }).click();
  await expect(page).toHaveURL(/\/en/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Websites and web apps");
  await page.getByRole("link", { name: "เปลี่ยนเป็นภาษาไทย" }).click();
  await expect(page).toHaveURL(/\/th/);
});

test("no off-platform contact details on the hub", async ({ page }) => {
  await page.goto("/th");
  const html = await page.content();
  expect(html).not.toMatch(/mailto:|tel:|line\.me/);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test:e2e hub`
Expected: FAIL. No package cards are found.

- [ ] **Step 3: Implement the hub components**

`components/hub/remember-locale.tsx`:
```tsx
"use client";

import { useEffect } from "react";
import { LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n/config";

// Lets the demo pill speak the same language the visitor chose on the hub.
export function RememberLocale({ locale }: { locale: Locale }) {
  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // ignore
    }
  }, [locale]);
  return null;
}
```

`components/hub/locale-switch.tsx`:
```tsx
"use client";

import type { Locale } from "@/lib/i18n/config";

export function LocaleSwitch({ locale, label, ariaLabel }: { locale: Locale; label: string; ariaLabel: string }) {
  const target = locale === "th" ? "en" : "th";
  return (
    <a
      href={`/${target}`}
      hrefLang={target}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        window.location.assign(`/${target}${window.location.hash}`);
      }}
      className="rounded-full border border-ink/15 px-3.5 py-1.5 text-sm font-semibold transition hover:border-ink"
    >
      {label}
    </a>
  );
}
```

`components/hub/site-header.tsx`:
```tsx
import type { Dictionary, Locale } from "@/lib/i18n";
import { LocaleSwitch } from "./locale-switch";

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    ["#services", t.nav.services],
    ["#process", t.nav.process],
    ["#stack", t.nav.stack],
    ["#about", t.nav.about],
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href={`/${locale}`} className="font-display text-lg font-bold tracking-tight">
          SupaOhm
        </a>
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="transition hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
        <LocaleSwitch locale={locale} label={t.nav.switchLocale} ariaLabel={t.nav.switchLocaleLabel} />
      </div>
    </header>
  );
}
```

`components/hub/hero.tsx`:
```tsx
import type { Dictionary } from "@/lib/i18n";
import { FASTWORK_PROFILE_URL } from "@/lib/packages";

export function Hero({ t }: { t: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
      <p className="text-sm font-medium tracking-wide text-muted">{t.hero.eyebrow}</p>
      <h1 className="mt-5 max-w-4xl font-display text-[2.6rem] font-bold leading-[1.15] tracking-tight sm:text-7xl">
        {t.hero.title}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t.hero.subtitle}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href="#services"
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent"
        >
          {t.hero.ctaDemos}
        </a>
        <a
          href={FASTWORK_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold transition hover:border-ink"
        >
          {t.hero.ctaFastwork}
        </a>
      </div>
    </section>
  );
}
```

`components/hub/package-card.tsx`:
```tsx
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatTHB, type Package, type PackageId } from "@/lib/packages";

// Stand-in preview until Task 11 replaces it with real screenshots.
const previewTone: Record<PackageId, string> = {
  "web-basic": "linear-gradient(135deg,#f6efe2,#d9e4cf)",
  "web-standard": "linear-gradient(135deg,#1d2a3f,#3c5a80)",
  "web-premium": "linear-gradient(135deg,#e9dcc6,#5e8c88)",
  "app-basic": "linear-gradient(135deg,#0f1115,#283041)",
  "app-standard": "linear-gradient(135deg,#eef2ef,#7fb59a)",
  "app-premium": "linear-gradient(135deg,#fbe9ea,#d98a96)",
};

export function PackageCard({ pkg, locale, t }: { pkg: Package; locale: Locale; t: Dictionary }) {
  return (
    <article
      data-testid={`package-${pkg.id}`}
      className="flex flex-col rounded-3xl border border-line bg-white/55 p-5 transition hover:border-ink/30"
    >
      <Link href={pkg.demoPath} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-2xl">
        <div className="flex aspect-[16/10] items-end p-4" style={{ background: previewTone[pkg.id] }}>
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-ink">
            {pkg.demoName[locale]}
          </span>
        </div>
      </Link>
      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold">{t.services.tiers[pkg.tier]}</h3>
        <p className="text-right">
          <span className="font-display text-2xl font-bold">{formatTHB(pkg.priceTHB)}</span>{" "}
          <span className="text-xs text-muted">{t.services.perProject}</span>
        </p>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-muted">
        {pkg.scope[locale].map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-accent">
              —
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <Link
          href={pkg.demoPath}
          className="flex-1 rounded-full bg-ink px-4 py-2.5 text-center text-sm font-semibold text-paper transition hover:bg-accent"
        >
          {t.services.viewDemo}
        </Link>
        <a
          href={pkg.fastworkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full border border-ink/20 px-4 py-2.5 text-center text-sm font-semibold transition hover:border-ink"
        >
          {t.services.order}
        </a>
      </div>
    </article>
  );
}
```

`components/hub/services-section.tsx`:
```tsx
import type { Dictionary, Locale } from "@/lib/i18n";
import { packagesByService } from "@/lib/packages";
import { PackageCard } from "./package-card";

export function ServicesSection({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="services" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="max-w-2xl font-display text-3xl font-bold leading-[1.2] sm:text-4xl">{t.services.heading}</h2>
        {(["web", "app"] as const).map((service) => (
          <div key={service} className="mt-14">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h3 className="font-display text-2xl font-bold">{t.services[service].title}</h3>
              <p className="max-w-md text-sm leading-relaxed text-muted">{t.services[service].description}</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {packagesByService(service).map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} locale={locale} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

`components/hub/process-section.tsx`:
```tsx
import type { Dictionary } from "@/lib/i18n";

export function ProcessSection({ t }: { t: Dictionary }) {
  return (
    <section id="process" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{t.process.heading}</h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {t.process.steps.map((step, i) => (
            <li key={step.title} className="bg-paper p-6">
              <span className="font-display text-sm font-bold text-accent">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

`components/hub/stack-section.tsx`:
```tsx
import type { Dictionary } from "@/lib/i18n";

const STACK = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Python", "PostgreSQL", "Supabase", "Vercel"];

export function StackSection({ t }: { t: Dictionary }) {
  return (
    <section id="stack" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t.stack.heading}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">{t.stack.body}</p>
        </div>
        <ul className="flex flex-wrap content-start gap-2">
          {STACK.map((tool) => (
            <li key={tool} className="rounded-full border border-line bg-white/55 px-4 py-2 text-sm font-medium">
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

`components/hub/about-section.tsx`:
```tsx
import type { Dictionary } from "@/lib/i18n";

export function AboutSection({ t }: { t: Dictionary }) {
  return (
    <section id="about" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-[1fr_2fr]">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{t.about.heading}</h2>
        <div>
          <p className="text-lg leading-relaxed">{t.about.body}</p>
          <a
            href="https://supakornohm.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm font-semibold underline decoration-accent decoration-2 underline-offset-4"
          >
            {t.about.portfolio} ↗
          </a>
        </div>
      </div>
    </section>
  );
}
```

`components/hub/site-footer.tsx`:
```tsx
import type { Dictionary } from "@/lib/i18n";
import { FASTWORK_PROFILE_URL } from "@/lib/packages";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="px-4 pb-8 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-ink px-6 py-14 text-paper sm:px-12">
        <h2 className="font-display text-3xl font-bold leading-[1.2] sm:text-5xl">{t.footer.heading}</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-paper/70">{t.footer.body}</p>
        <a
          href={FASTWORK_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-paper hover:text-ink"
        >
          {t.footer.button}
        </a>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-xs text-muted">
        {t.footer.note} · © {new Date().getFullYear()} SupaOhm
      </p>
    </footer>
  );
}
```

- [ ] **Step 4: Replace `app/[locale]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutSection } from "@/components/hub/about-section";
import { Hero } from "@/components/hub/hero";
import { ProcessSection } from "@/components/hub/process-section";
import { RememberLocale } from "@/components/hub/remember-locale";
import { ServicesSection } from "@/components/hub/services-section";
import { SiteFooter } from "@/components/hub/site-footer";
import { SiteHeader } from "@/components/hub/site-header";
import { StackSection } from "@/components/hub/stack-section";
import { getDictionary, isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: { th: "/th", en: "/en" } },
  };
}

export default async function HubPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <>
      <RememberLocale locale={locale} />
      <SiteHeader locale={locale} t={t} />
      <main>
        <Hero t={t} />
        <ServicesSection locale={locale} t={t} />
        <ProcessSection t={t} />
        <StackSection t={t} />
        <AboutSection t={t} />
      </main>
      <SiteFooter t={t} />
    </>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm typecheck && pnpm lint && pnpm test:e2e hub smoke`
Expected: all pass.

- [ ] **Step 6: Visual check**

Run `pnpm dev`, then open `http://localhost:3000/th` and `/en` in Chrome at 375px and 1440px widths. Check that:
- Thai headings show their tone marks with nothing clipped.
- The cards line up in three columns on desktop and stack on mobile.
- Nothing overflows.

Fix any issues before committing. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: build bilingual hub with package cards linking to demos and Fastwork

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Image helper and verified photo ids

**Files:**
- Create: `lib/images.ts`
- Test: `tests/unit/images.test.ts`

**Interfaces:**
- Produces: `unsplash(id: string, width: number): string` and `PHOTOS` (an `as const` object of verified Unsplash photo ids with these keys): `saleHero`, `saleIngredient1`, `saleIngredient2`, `saleIngredient3`, `companyHero`, `companyService1`, `companyService2`, `companyService3`, `companyService4`, `resortHero`, `resortRoom1`…`resortRoom5`, `resortGallery1`…`resortGallery9`, `resortAbout`, `clinicHero`, `clinicInterior`.

- [ ] **Step 1: Write the failing test**

`tests/unit/images.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { PHOTOS, unsplash } from "@/lib/images";

describe("images", () => {
  it("builds sized Unsplash URLs", () => {
    expect(unsplash("1500000000000-abc123", 800)).toBe(
      "https://images.unsplash.com/photo-1500000000000-abc123?w=800&q=75&auto=format&fit=crop",
    );
  });

  it("has a well-formed id for every photo slot", () => {
    expect(Object.keys(PHOTOS).length).toBe(27);
    for (const id of Object.values(PHOTOS)) expect(id).toMatch(/^\d{13}-[0-9a-f]{12}$/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test images`
Expected: FAIL. `@/lib/images` cannot be resolved.

- [ ] **Step 3: Find and verify the photos**

For each slot, search `https://unsplash.com/s/photos/<query>` in Chrome and open a photo. Click "Download" ▸ copy the image link, or read the `images.unsplash.com/photo-<id>` URL from the page. Use only photos under the free Unsplash License (not Unsplash+). Search queries:

| Slot | Query |
|---|---|
| saleHero, saleIngredient1–3 | `serum bottle minimal`, `jasmine flower`, `rice grains`, `aloe vera` |
| companyHero, companyService1–4 | `cnc machining`, `factory engineer`, `industrial automation`, `steel fabrication`, `engineering blueprint` |
| resortHero, resortRoom1–5, resortGallery1–9, resortAbout | `krabi beach resort`, `pool villa`, `hotel suite tropical`, `resort bedroom`, `thai resort`, `andaman sea`, `resort breakfast`, `infinity pool`, `longtail boat` |
| clinicHero, clinicInterior | `skincare clinic`, `beauty clinic interior` |

Verify every id returns 200 before you use it:
```bash
for id in <id1> <id2> ...; do
  printf "%s " "$id"; curl -s -o /dev/null -w "%{http_code}\n" "https://images.unsplash.com/photo-$id?w=400"
done
```
Expected: every line ends in `200`.

- [ ] **Step 4: Implement `lib/images.ts`**

```ts
export function unsplash(id: string, width: number): string {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=75&auto=format&fit=crop`;
}

// Every id below was verified with `curl -sI` to return 200 (Unsplash License).
export const PHOTOS = {
  saleHero: "<verified id>",
  // …one entry per slot listed in Interfaces, 27 in total
} as const;
```
Replace each `<verified id>` with the ids verified in Step 3. The test fails until all 27 are real ids (sale 4, company 5, resort 16, clinic 2).

- [ ] **Step 5: Run the test to verify it passes, then commit**

Run: `pnpm test images`
Expected: PASS.

```bash
git add -A
git commit -m "feat: add Unsplash helper with verified demo photos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Demo `web-basic`: Mali Botanics sale page

**Files:**
- Create: `lib/demos/sale-page/content.ts`, `app/demos/sale-page/layout.tsx`, `app/demos/sale-page/page.tsx`, plus components under `app/demos/sale-page/_components/` as needed
- Modify: `tests/e2e/routes.ts`
- Test: `tests/e2e/sale-page.spec.ts`

**Interfaces:**
- Consumes: `DemoPill`, `PHOTOS`, `unsplash`.

- [ ] **Step 1: Write the failing test and register the route**

Append `"/demos/sale-page"` to the `routes` array in `tests/e2e/routes.ts`.

`tests/e2e/sale-page.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("hero CTA scrolls to the order bundles", async ({ page }) => {
  await page.goto("/demos/sale-page");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByTestId("hero-cta").click();
  await expect(page.locator("#order")).toBeInViewport();
  await expect(page.getByTestId("bundle")).toHaveCount(3);
});

test("FAQ items expand", async ({ page }) => {
  await page.goto("/demos/sale-page");
  const first = page.getByTestId("faq-item").first();
  await first.locator("summary").click();
  await expect(first).toHaveAttribute("open", "");
});

test("demo pill links back to the hub", async ({ page }) => {
  await page.goto("/demos/sale-page");
  await expect(page.getByTestId("demo-pill")).toContainText("฿4,900");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test:e2e sale-page`
Expected: FAIL with 404.

- [ ] **Step 3: Write the content file**

`lib/demos/sale-page/content.ts`:
```ts
import { PHOTOS } from "@/lib/images";

export const brand = { name: "Mali Botanics", tagline: "สกินแคร์จากมะลิและข้าวไทย" };

export const product = {
  name: "เซรั่มน้ำนมข้าวมะลิ",
  size: "30 ml",
  headline: "ผิวกระจ่างใส ชุ่มชื้น ใน 14 วัน",
  sub: "เซรั่มเนื้อบางเบาจากสารสกัดน้ำนมข้าวหอมมะลิและดอกมะลิ ซึมไว ไม่เหนียวเหนอะหนะ เหมาะกับอากาศร้อนชื้น",
  fullPrice: 590,
  promoPrice: 390,
  image: PHOTOS.saleHero,
};

export const benefits = [
  { title: "กระจ่างใสขึ้น", body: "น้ำนมข้าวช่วยให้ผิวดูสว่างและสม่ำเสมอ" },
  { title: "ชุ่มชื้นทั้งวัน", body: "ล็อกความชุ่มชื้นได้นาน แม้อยู่ในห้องแอร์" },
  { title: "อ่อนโยน", body: "ไม่มีน้ำหอมสังเคราะห์และแอลกอฮอล์" },
  { title: "เนื้อบางเบา", body: "ซึมไว แต่งหน้าทับได้ทันที" },
];

export const ingredients = [
  { name: "น้ำนมข้าวหอมมะลิ", body: "อุดมด้วยวิตามินอีและกรดอะมิโน", image: PHOTOS.saleIngredient2 },
  { name: "สารสกัดดอกมะลิ", body: "ช่วยปลอบประโลมผิวและให้กลิ่นหอมอ่อน ๆ ตามธรรมชาติ", image: PHOTOS.saleIngredient1 },
  { name: "ว่านหางจระเข้", body: "เติมความชุ่มชื้นและลดการระคายเคือง", image: PHOTOS.saleIngredient3 },
];

export const reviews = [
  { name: "คุณแพร (ตัวอย่าง)", text: "ใช้ไปสองอาทิตย์ หน้าดูสว่างขึ้นจริง เนื้อไม่เหนียวเลย", stars: 5 },
  { name: "คุณบีม (ตัวอย่าง)", text: "ผิวแพ้ง่ายแต่ใช้ได้ ไม่แสบ ไม่มีสิวขึ้น", stars: 5 },
  { name: "คุณออม (ตัวอย่าง)", text: "กลิ่นมะลิหอมอ่อน ๆ ชอบมาก ซื้อซ้ำแล้ว", stars: 4 },
];

export const bundles = [
  { id: "one", label: "1 ขวด", price: 390, note: "ทดลองใช้", highlight: false },
  { id: "two", label: "2 ขวด", price: 690, note: "ประหยัด ฿90", highlight: true },
  { id: "three", label: "3 ขวด", price: 990, note: "ส่งฟรี + ประหยัด ฿180", highlight: false },
];

export const faqs = [
  { q: "เหมาะกับผิวแบบไหน", a: "ทุกสภาพผิว รวมถึงผิวแพ้ง่าย แนะนำให้ทดสอบที่ท้องแขนก่อนใช้ครั้งแรก" },
  { q: "ใช้กี่ครั้งต่อวัน", a: "เช้าและก่อนนอน ครั้งละ 2–3 หยด หลังล้างหน้า" },
  { q: "ขวดหนึ่งใช้ได้นานเท่าไร", a: "ประมาณ 4–6 สัปดาห์" },
  { q: "จัดส่งกี่วัน", a: "1–3 วันทำการทั่วประเทศ" },
  { q: "มีเลขจดแจ้ง อย. หรือไม่", a: "นี่คือเว็บตัวอย่าง สินค้าจริงจะแสดงเลขจดแจ้งตรงนี้" },
];
```

- [ ] **Step 4: Build the layout and page**

Invoke the `frontend-design` skill first. Requirements:
- `layout.tsx`: font `Prompt` (weights 300/400/600, subsets thai+latin) via `next/font/google` on a wrapper `div`. Palette as CSS variables on the wrapper: `--cream:#f7f1e6`, `--leaf:#3f5b3a`, `--leaf-soft:#dfe7d4`, `--ink:#2a2620`, `--gold:#b8893b`. Export `metadata` with `{ title: "Mali Botanics — เซรั่มน้ำนมข้าวมะลิ", description: product.sub }`. Render `<DemoPill packageId="web-basic" />` after `children`, and give the page `pb-24` so the pill never covers content.
- `page.tsx`, a single `<main>`. Sections in this order:
  1. Header bar: brand name, plus a "สั่งซื้อ" button linking to `#order`.
  2. Hero: `h1` = `product.headline`, sub copy, a strikethrough `fullPrice` next to `promoPrice`, a CTA `data-testid="hero-cta"` with the label "สั่งซื้อทาง LINE" that links to `#order`, and the product photo.
  3. Benefits: a 4-item grid.
  4. Ingredients: 3 cards with photos.
  5. Reviews: 3 cards with stars, plus the caption "รีวิวตัวอย่างสำหรับเว็บสาธิต".
  6. `#order`: 3 bundle cards, each `data-testid="bundle"`. The highlighted bundle gets a "ขายดี" badge. Each card's button is labelled "สั่งซื้อทาง LINE (ตัวอย่าง)" and links to `#order`, not to a real LINE account.
  7. FAQ: `<details data-testid="faq-item">` with `<summary>`.
  8. Footer: brand name, plus "© Mali Botanics (ธุรกิจสมมติ)".
- Use `next/image` with `unsplash(id, width)` and `sizes`. The hero image gets `priority`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm typecheck && pnpm lint && pnpm test:e2e sale-page smoke`
Expected: all pass.

- [ ] **Step 6: Visual check**

Use `pnpm dev` and screenshot `/demos/sale-page` in Chrome at 375px and 1440px. Check that:
- It looks like a real Thai online-shop sale page.
- Thai text isn't clipped.
- The pill doesn't hide the footer.

Iterate until it holds up as a Fastwork cover image.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Mali Botanics sale page demo (web basic)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Demo `web-standard`: Siam Precision company website

**Files:**
- Create: `lib/demos/company/content.ts`, `lib/demos/company/validate-contact.ts`, `app/demos/company/layout.tsx`, `app/demos/company/page.tsx`, `app/demos/company/services/page.tsx`, `app/demos/company/contact/page.tsx`, `app/demos/company/contact/contact-form.tsx` (client), `app/demos/company/_components/*`
- Modify: `tests/e2e/routes.ts`
- Test: `tests/unit/validate-contact.test.ts`, `tests/e2e/company.spec.ts`

**Interfaces:**
- Consumes: `isEmail`, `isThaiPhone` from `@/lib/validation`, plus `DemoPill`, `PHOTOS`, `unsplash`.
- Produces: `ContactInput`, `ContactErrors` and `validateContact(input: ContactInput): ContactErrors` from `@/lib/demos/company/validate-contact`, and `SERVICES` from `@/lib/demos/company/content`.

- [ ] **Step 1: Write the failing unit test**

`tests/unit/validate-contact.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { validateContact, type ContactInput } from "@/lib/demos/company/validate-contact";

const valid: ContactInput = {
  name: "สมชาย ใจดี",
  company: "บริษัท ตัวอย่าง จำกัด",
  email: "somchai@example.com",
  phone: "",
  service: "cnc",
  message: "ต้องการใบเสนอราคางานกลึง 200 ชิ้น",
};

describe("validateContact", () => {
  it("accepts a valid enquiry with optional fields empty", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("requires name, valid email, service and a 10+ char message", () => {
    expect(validateContact({ ...valid, name: " ", email: "x", service: "", message: "สั้น" })).toEqual({
      name: "กรุณากรอกชื่อ",
      email: "อีเมลไม่ถูกต้อง",
      service: "กรุณาเลือกบริการ",
      message: "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร",
    });
  });

  it("validates phone only when provided", () => {
    expect(validateContact({ ...valid, phone: "080-000-0001" })).toEqual({});
    expect(validateContact({ ...valid, phone: "12345" })).toEqual({ phone: "เบอร์โทรไม่ถูกต้อง" });
  });

  it("rejects unknown services", () => {
    expect(validateContact({ ...valid, service: "nope" })).toEqual({ service: "กรุณาเลือกบริการ" });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test validate-contact`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement the content and validation**

`lib/demos/company/content.ts`:
```ts
import { PHOTOS } from "@/lib/images";

export const company = {
  name: "สยามพรีซิชั่น เอ็นจิเนียริ่ง",
  nameEn: "Siam Precision Engineering",
  legal: "บริษัท สยามพรีซิชั่น เอ็นจิเนียริ่ง จำกัด (ธุรกิจสมมติ)",
  tagline: "งานกลึง CNC และชิ้นส่วนอุตสาหกรรม แม่นยำระดับไมครอน",
  intro: "รับผลิตชิ้นส่วนโลหะความแม่นยำสูงสำหรับโรงงานยานยนต์ อาหาร และอิเล็กทรอนิกส์ ตั้งแต่ชิ้นต้นแบบจนถึงการผลิตจำนวนมาก",
  address: "88/8 นิคมอุตสาหกรรมตัวอย่าง ต.ตัวอย่าง อ.เมือง จ.ชลบุรี 20000",
  phone: "038-000-000 (ตัวอย่าง)",
  email: "sales@example.com",
  hours: "จันทร์–เสาร์ 08:00–17:00",
  heroImage: PHOTOS.companyHero,
};

export const stats = [
  { value: "2008", label: "ก่อตั้ง" },
  { value: "350+", label: "โปรเจกต์ที่ส่งมอบ" },
  { value: "±0.01 mm", label: "ความคลาดเคลื่อน" },
  { value: "48 ชม.", label: "ใบเสนอราคา" },
];

export const SERVICES = [
  {
    id: "cnc",
    name: "งานกลึงและกัด CNC",
    short: "ชิ้นส่วนเหล็ก สแตนเลส อลูมิเนียม ตามแบบ",
    detail: "เครื่อง CNC 5 แกน รองรับงานซับซ้อนและงานจำนวนมาก ตรวจสอบทุกชิ้นด้วยเครื่องวัด CMM",
    image: PHOTOS.companyService1,
  },
  {
    id: "fabrication",
    name: "งานโครงสร้างและเชื่อม",
    short: "โครงเครื่องจักร แท่นวาง และงานเหล็กแผ่น",
    detail: "ช่างเชื่อมมีใบรับรอง ออกแบบโครงสร้างให้แข็งแรงและติดตั้งหน้างานได้",
    image: PHOTOS.companyService2,
  },
  {
    id: "automation",
    name: "ระบบอัตโนมัติ",
    short: "จิ๊ก ฟิกเจอร์ และสายพานลำเลียง",
    detail: "ออกแบบอุปกรณ์ช่วยผลิตเพื่อลดเวลาและของเสียในไลน์การผลิต",
    image: PHOTOS.companyService3,
  },
  {
    id: "design",
    name: "ออกแบบและเขียนแบบ",
    short: "แบบ 2D/3D และงานถอดแบบชิ้นส่วนเดิม",
    detail: "วิศวกรช่วยปรับแบบให้ผลิตได้ง่ายขึ้นและต้นทุนต่ำลง ก่อนเริ่มผลิตจริง",
    image: PHOTOS.companyService4,
  },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export const processSteps = ["ส่งแบบหรือตัวอย่างชิ้นงาน", "รับใบเสนอราคาใน 48 ชม.", "ผลิตและตรวจสอบคุณภาพ", "จัดส่งพร้อมรายงานการวัด"];

export const clients = ["ไทยออโต้พาร์ท", "สยามฟู้ดแพ็ค", "อีสเทิร์นอิเล็กทรอนิกส์", "บางนาโลจิสติกส์", "ชลบุรีสตีล"];
```

`lib/demos/company/validate-contact.ts`:
```ts
import { SERVICES } from "@/lib/demos/company/content";
import { isEmail, isThaiPhone } from "@/lib/validation";

export interface ContactInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  if (!input.name.trim()) errors.name = "กรุณากรอกชื่อ";
  if (!isEmail(input.email)) errors.email = "อีเมลไม่ถูกต้อง";
  if (input.phone.trim() && !isThaiPhone(input.phone)) errors.phone = "เบอร์โทรไม่ถูกต้อง";
  if (!SERVICES.some((s) => s.id === input.service)) errors.service = "กรุณาเลือกบริการ";
  if (input.message.trim().length < 10) errors.message = "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร";
  return errors;
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm test validate-contact`
Expected: PASS.

- [ ] **Step 5: Write the failing e2e test and register routes**

Append `"/demos/company", "/demos/company/services", "/demos/company/contact"` to `routes`.

`tests/e2e/company.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("navigation reaches all three pages with their own titles", async ({ page }) => {
  await page.goto("/demos/company");
  await expect(page).toHaveTitle(/สยามพรีซิชั่น/);
  await page.getByRole("navigation").getByRole("link", { name: "บริการ" }).click();
  await expect(page).toHaveURL(/\/demos\/company\/services$/);
  await expect(page).toHaveTitle(/บริการ/);
  await page.getByRole("navigation").getByRole("link", { name: "ติดต่อเรา" }).click();
  await expect(page).toHaveTitle(/ติดต่อ/);
});

test("contact form shows errors, then succeeds", async ({ page }) => {
  await page.goto("/demos/company/contact");
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("error-name")).toBeVisible();
  await expect(page.getByTestId("error-email")).toBeVisible();

  await page.getByLabel("ชื่อผู้ติดต่อ").fill("สมชาย ใจดี");
  await page.getByLabel("อีเมล").fill("somchai@example.com");
  await page.getByLabel("บริการที่สนใจ").selectOption("cnc");
  await page.getByLabel("รายละเอียดงาน").fill("ต้องการใบเสนอราคางานกลึง 200 ชิ้น");
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("contact-success")).toBeVisible();
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm test:e2e company`
Expected: FAIL with 404.

- [ ] **Step 7: Build the pages**

Invoke `frontend-design`. Requirements:
- `layout.tsx`: font `IBM_Plex_Sans_Thai` (400/500/700, thai+latin). Palette: `--navy:#14213d`, `--steel:#e7ebf0`, `--orange:#f28c28`, `--ink:#1b1f27`. The layout contains:
  - A shared header with the company name and a `<nav>` with links "หน้าแรก" (`/demos/company`), "บริการ" (`/services`) and "ติดต่อเรา" (`/contact`). Mark the active link using `usePathname` in a small client component. On mobile, use a menu button that toggles the nav.
  - A footer with `company.legal`, `address` and `hours`.
  - `<DemoPill packageId="web-standard" />`.
  - `metadata.title.template = "%s | สยามพรีซิชั่น"` and `default: "สยามพรีซิชั่น เอ็นจิเนียริ่ง"`.
- `page.tsx` (home): hero (`h1` = `company.tagline`, intro, CTA "ขอใบเสนอราคา" → `/demos/company/contact`, `heroImage`), stats strip, a 4-card services preview linking to `/services`, a clients row (text logos in grey boxes), and a CTA band. `metadata = { title: "หน้าแรก", description: company.intro }`.
- `services/page.tsx`: `metadata = { title: "บริการ" }`. Alternating image/text rows for each of the `SERVICES`, then a numbered `processSteps` list.
- `contact/page.tsx`: `metadata = { title: "ติดต่อเรา" }`. A two-column layout. Left column: `<ContactForm />`. Right column: an info card (address, phone, email, hours, all marked as examples) and a stylised map placeholder block with the address text. Do not embed a Google Maps iframe.
- `contact/contact-form.tsx` (client). Fields with visible `<label>`s that match the test exactly: "ชื่อผู้ติดต่อ", "บริษัท", "อีเมล", "เบอร์โทร", "บริการที่สนใจ" (`<select>` with an empty option plus `SERVICES`), "รายละเอียดงาน" (textarea). On submit:
  1. Run `validateContact` and render each error under its field with `data-testid="error-<field>"`.
  2. If valid, set `submitting` for 600 ms and show a disabled button with the label "กำลังส่ง…".
  3. Replace the form with a `data-testid="contact-success"` panel: "ได้รับข้อมูลแล้ว ทีมขายจะติดต่อกลับภายใน 1 วันทำการ (เว็บตัวอย่าง: ไม่มีการส่งข้อมูลจริง)" plus a "ส่งอีกครั้ง" button that resets the form.

  The submit button is `data-testid="contact-submit"` with the label "ส่งข้อมูล".

- [ ] **Step 8: Run tests, do the visual check, commit**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e company smoke`
Expected: all pass. Then screenshot all three pages at 375px and 1440px in Chrome and iterate until polished.

```bash
git add -A
git commit -m "feat: add Siam Precision company website demo (web standard)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Demo `web-premium`: Saeng Chan Resort

**Files:**
- Create: `lib/demos/resort/content.ts`, `lib/demos/resort/logic.ts`, `lib/demos/resort/lang-store.ts`, `app/demos/resort/layout.tsx`, `app/demos/resort/page.tsx`, `rooms/page.tsx`, `gallery/page.tsx`, `about/page.tsx`, `booking/page.tsx`, plus client components in `app/demos/resort/_components/` (`resort-header.tsx`, `lang-toggle.tsx`, `t.tsx`, `room-filter.tsx`, `lightbox.tsx`, `reveal.tsx`, `inquiry-form.tsx`)
- Modify: `tests/e2e/routes.ts`
- Test: `tests/unit/resort.test.ts`, `tests/e2e/resort.spec.ts`

**Interfaces:**
- Consumes: `isEmail`, `parseISODate`, `createDemoStore`, `useDemoStore`, `DemoPill`, `PHOTOS`, `unsplash`.
- Produces: from `@/lib/demos/resort/logic`: `RoomType`, `Room`, `L = { th: string; en: string }`, `filterRooms(rooms, { type: RoomType | "all"; guests: number }): Room[]`, `nightsBetween(checkIn: string, checkOut: string): number`, `InquiryInput`, `InquiryErrors`, `validateInquiry(input, today: string, lang: "th" | "en"): InquiryErrors`. From `lang-store`: `resortLang: DemoStore<"th" | "en">`.

- [ ] **Step 1: Write the failing unit test**

`tests/unit/resort.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { ROOMS } from "@/lib/demos/resort/content";
import { filterRooms, nightsBetween, validateInquiry, type InquiryInput } from "@/lib/demos/resort/logic";

describe("filterRooms", () => {
  it("returns all rooms for type all and 1 guest", () => {
    expect(filterRooms(ROOMS, { type: "all", guests: 1 })).toHaveLength(ROOMS.length);
  });

  it("filters by type and minimum capacity", () => {
    const result = filterRooms(ROOMS, { type: "villa", guests: 4 });
    expect(result.length).toBeGreaterThan(0);
    for (const room of result) {
      expect(room.type).toBe("villa");
      expect(room.guests).toBeGreaterThanOrEqual(4);
    }
  });

  it("returns empty when nothing fits", () => {
    expect(filterRooms(ROOMS, { type: "deluxe", guests: 10 })).toEqual([]);
  });
});

describe("nightsBetween", () => {
  it("counts nights across months", () => {
    expect(nightsBetween("2026-10-30", "2026-11-02")).toBe(3);
  });
});

describe("validateInquiry", () => {
  const ok: InquiryInput = {
    checkIn: "2026-11-01",
    checkOut: "2026-11-03",
    guests: 2,
    roomId: "",
    name: "Alex",
    email: "alex@example.com",
  };

  it("accepts a valid inquiry", () => {
    expect(validateInquiry(ok, "2026-10-19", "en")).toEqual({});
  });

  it("rejects past check-in and check-out before check-in", () => {
    const errors = validateInquiry({ ...ok, checkIn: "2026-10-01", checkOut: "2026-09-30" }, "2026-10-19", "en");
    expect(errors.checkIn).toBe("Check-in can't be in the past");
    expect(errors.checkOut).toBe("Check-out must be after check-in");
  });

  it("localizes messages and checks name, email, guests", () => {
    const errors = validateInquiry({ ...ok, name: "", email: "x", guests: 0 }, "2026-10-19", "th");
    expect(errors).toEqual({ name: "กรุณากรอกชื่อ", email: "อีเมลไม่ถูกต้อง", guests: "จำนวนผู้เข้าพัก 1–8 คน" });
  });

  it("requires dates", () => {
    const errors = validateInquiry({ ...ok, checkIn: "", checkOut: "" }, "2026-10-19", "en");
    expect(errors.checkIn).toBe("Choose a check-in date");
    expect(errors.checkOut).toBe("Choose a check-out date");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test resort`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement the logic, content and lang store**

`lib/demos/resort/logic.ts`:
```ts
import { parseISODate } from "@/lib/dates";
import { isEmail } from "@/lib/validation";

export type Lang = "th" | "en";
export type L = Record<Lang, string>;
export type RoomType = "deluxe" | "suite" | "villa";

export interface Room {
  id: string;
  type: RoomType;
  name: L;
  guests: number;
  sizeSqm: number;
  pricePerNight: number;
  features: L[];
  image: string;
}

export function filterRooms(rooms: Room[], { type, guests }: { type: RoomType | "all"; guests: number }): Room[] {
  return rooms.filter((r) => (type === "all" || r.type === type) && r.guests >= guests);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = parseISODate(checkOut).getTime() - parseISODate(checkIn).getTime();
  return Math.round(ms / 86_400_000);
}

export interface InquiryInput {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId: string;
  name: string;
  email: string;
}

export type InquiryErrors = Partial<Record<keyof InquiryInput, string>>;

const messages = {
  checkInRequired: { th: "กรุณาเลือกวันเช็กอิน", en: "Choose a check-in date" },
  checkInPast: { th: "วันเช็กอินต้องไม่เป็นวันที่ผ่านมาแล้ว", en: "Check-in can't be in the past" },
  checkOutRequired: { th: "กรุณาเลือกวันเช็กเอาต์", en: "Choose a check-out date" },
  checkOutOrder: { th: "วันเช็กเอาต์ต้องหลังวันเช็กอิน", en: "Check-out must be after check-in" },
  guests: { th: "จำนวนผู้เข้าพัก 1–8 คน", en: "Guests must be 1–8" },
  name: { th: "กรุณากรอกชื่อ", en: "Enter your name" },
  email: { th: "อีเมลไม่ถูกต้อง", en: "Enter a valid email" },
} satisfies Record<string, L>;

// ISO date strings compare correctly as plain strings.
export function validateInquiry(input: InquiryInput, today: string, lang: Lang): InquiryErrors {
  const errors: InquiryErrors = {};
  if (!input.checkIn) errors.checkIn = messages.checkInRequired[lang];
  else if (input.checkIn < today) errors.checkIn = messages.checkInPast[lang];
  if (!input.checkOut) errors.checkOut = messages.checkOutRequired[lang];
  else if (input.checkIn && input.checkOut <= input.checkIn) errors.checkOut = messages.checkOutOrder[lang];
  if (!Number.isInteger(input.guests) || input.guests < 1 || input.guests > 8) errors.guests = messages.guests[lang];
  if (!input.name.trim()) errors.name = messages.name[lang];
  if (!isEmail(input.email)) errors.email = messages.email[lang];
  return errors;
}
```

`lib/demos/resort/content.ts`:
```ts
import { PHOTOS } from "@/lib/images";
import type { L, Room } from "./logic";

export const resort = {
  name: { th: "แสงจันทร์ รีสอร์ท", en: "Saeng Chan Resort" } satisfies L,
  location: { th: "อ่าวนาง กระบี่", en: "Ao Nang, Krabi" } satisfies L,
  tagline: { th: "พักผ่อนริมทะเลอันดามัน ใต้แสงจันทร์", en: "Moonlit calm on the Andaman Sea" } satisfies L,
  intro: {
    th: "บูทีครีสอร์ท 24 ห้อง ท่ามกลางสวนเขตร้อน เดินถึงชายหาดใน 3 นาที",
    en: "A 24-key boutique resort in a tropical garden, three minutes' walk from the beach.",
  } satisfies L,
  heroImage: PHOTOS.resortHero,
  aboutImage: PHOTOS.resortAbout,
};

export const nav: { href: string; label: L }[] = [
  { href: "/demos/resort", label: { th: "หน้าแรก", en: "Home" } },
  { href: "/demos/resort/rooms", label: { th: "ห้องพัก", en: "Rooms" } },
  { href: "/demos/resort/gallery", label: { th: "แกลเลอรี", en: "Gallery" } },
  { href: "/demos/resort/about", label: { th: "เกี่ยวกับเรา", en: "About" } },
  { href: "/demos/resort/booking", label: { th: "จองห้องพัก", en: "Book" } },
];

export const ROOMS: Room[] = [
  {
    id: "garden-deluxe",
    type: "deluxe",
    name: { th: "ดีลักซ์ วิวสวน", en: "Garden Deluxe" },
    guests: 2,
    sizeSqm: 32,
    pricePerNight: 2900,
    features: [{ th: "ระเบียงส่วนตัว", en: "Private balcony" }, { th: "อาหารเช้า", en: "Breakfast included" }],
    image: PHOTOS.resortRoom1,
  },
  {
    id: "sea-deluxe",
    type: "deluxe",
    name: { th: "ดีลักซ์ วิวทะเล", en: "Sea View Deluxe" },
    guests: 2,
    sizeSqm: 34,
    pricePerNight: 3600,
    features: [{ th: "วิวทะเล", en: "Sea view" }, { th: "อ่างอาบน้ำ", en: "Bathtub" }],
    image: PHOTOS.resortRoom2,
  },
  {
    id: "family-suite",
    type: "suite",
    name: { th: "แฟมิลี่ สวีท", en: "Family Suite" },
    guests: 4,
    sizeSqm: 58,
    pricePerNight: 5400,
    features: [{ th: "2 ห้องนอน", en: "Two bedrooms" }, { th: "มุมนั่งเล่น", en: "Living area" }],
    image: PHOTOS.resortRoom3,
  },
  {
    id: "pool-villa",
    type: "villa",
    name: { th: "พูลวิลล่า", en: "Pool Villa" },
    guests: 2,
    sizeSqm: 80,
    pricePerNight: 8900,
    features: [{ th: "สระว่ายน้ำส่วนตัว", en: "Private pool" }, { th: "บริการบัตเลอร์", en: "Butler service" }],
    image: PHOTOS.resortRoom4,
  },
  {
    id: "family-villa",
    type: "villa",
    name: { th: "แฟมิลี่ พูลวิลล่า", en: "Family Pool Villa" },
    guests: 6,
    sizeSqm: 140,
    pricePerNight: 14500,
    features: [{ th: "3 ห้องนอน", en: "Three bedrooms" }, { th: "สระว่ายน้ำส่วนตัว", en: "Private pool" }],
    image: PHOTOS.resortRoom5,
  },
];

export const GALLERY: { id: string; alt: L }[] = [
  { id: PHOTOS.resortGallery1, alt: { th: "ชายหาดหน้ารีสอร์ท", en: "Beach in front of the resort" } },
  { id: PHOTOS.resortGallery2, alt: { th: "สระว่ายน้ำ", en: "Swimming pool" } },
  { id: PHOTOS.resortGallery3, alt: { th: "ห้องพัก", en: "Guest room" } },
  { id: PHOTOS.resortGallery4, alt: { th: "อาหารเช้า", en: "Breakfast" } },
  { id: PHOTOS.resortGallery5, alt: { th: "เรือหางยาว", en: "Longtail boat" } },
  { id: PHOTOS.resortGallery6, alt: { th: "พระอาทิตย์ตก", en: "Sunset" } },
  { id: PHOTOS.resortGallery7, alt: { th: "สวนเขตร้อน", en: "Tropical garden" } },
  { id: PHOTOS.resortGallery8, alt: { th: "สปา", en: "Spa" } },
  { id: PHOTOS.resortGallery9, alt: { th: "ทะเลอันดามัน", en: "Andaman Sea" } },
];

export const highlights: { title: L; body: L }[] = [
  { title: { th: "ใกล้ชายหาด", en: "Steps from the beach" }, body: { th: "เดิน 3 นาทีถึงหาดอ่าวนาง", en: "Three minutes to Ao Nang beach" } },
  { title: { th: "อาหารใต้ต้นตำรับ", en: "Southern Thai kitchen" }, body: { th: "วัตถุดิบจากชาวประมงท้องถิ่น", en: "Sourced from local fishers" } },
  { title: { th: "ทริปเกาะ", en: "Island trips" }, body: { th: "จัดทริปเรือหางยาวส่วนตัว", en: "Private longtail boat tours" } },
];

export const about: { heading: L; body: L } = {
  heading: { th: "ครอบครัวเล็ก ๆ ริมทะเลกระบี่", en: "A small family place on the Krabi coast" },
  body: {
    th: "แสงจันทร์เริ่มจากบ้านพักของครอบครัวเมื่อปี 2012 วันนี้เรายังดูแลแขกทุกคนเหมือนญาติที่มาเยี่ยม (ธุรกิจสมมติสำหรับเว็บสาธิต)",
    en: "Saeng Chan began as our family's beach house in 2012, and we still host every guest like visiting relatives. (Fictional business for a demo site.)",
  },
};
```

`lib/demos/resort/lang-store.ts`:
```ts
import { createDemoStore } from "@/lib/demo-store";
import type { Lang } from "./logic";

export const resortLang = createDemoStore<Lang>("resort:lang", "th");
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm test resort`
Expected: PASS.

- [ ] **Step 5: Write the failing e2e test and register routes**

Append `"/demos/resort", "/demos/resort/rooms", "/demos/resort/gallery", "/demos/resort/about", "/demos/resort/booking"` to `routes`.

`tests/e2e/resort.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

test("language toggle switches copy and persists", async ({ page }) => {
  await page.goto("/demos/resort");
  await page.getByTestId("lang-toggle").click();
  await expect(page.getByRole("navigation").first()).toContainText("Rooms");
  await page.reload();
  await expect(page.getByRole("navigation").first()).toContainText("Rooms");
});

test("room filter narrows results", async ({ page }) => {
  await page.goto("/demos/resort/rooms");
  const all = await page.getByTestId("room-card").count();
  await page.getByTestId("filter-type-villa").click();
  const villas = await page.getByTestId("room-card").count();
  expect(villas).toBeLessThan(all);
  await page.getByTestId("filter-guests").selectOption("10");
  await expect(page.getByTestId("rooms-empty")).toBeVisible();
});

test("gallery lightbox opens, navigates and closes", async ({ page }) => {
  await page.goto("/demos/resort/gallery");
  await page.getByTestId("gallery-item").first().click();
  const box = page.getByTestId("lightbox");
  await expect(box).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(box).toContainText("2 / 9");
  await page.keyboard.press("Escape");
  await expect(box).toBeHidden();
});

test("booking inquiry validates dates and succeeds", async ({ page }) => {
  await page.goto("/demos/resort/booking");
  await page.getByTestId("input-checkIn").fill(iso(10));
  await page.getByTestId("input-checkOut").fill(iso(8));
  await page.getByTestId("inquiry-submit").click();
  await expect(page.getByTestId("error-checkOut")).toBeVisible();

  await page.getByTestId("input-checkOut").fill(iso(12));
  await page.getByTestId("input-name").fill("Alex");
  await page.getByTestId("input-email").fill("alex@example.com");
  await page.getByTestId("inquiry-submit").click();
  await expect(page.getByTestId("inquiry-success")).toContainText("2");
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm test:e2e resort`
Expected: FAIL with 404.

- [ ] **Step 7: Build the pages**

Invoke `frontend-design`. Requirements:
- `layout.tsx`:
  - Fonts: `Noto_Serif_Thai` (display, 400/600) and `Anuphan` (body), both thai+latin.
  - Palette: `--sand:#f3ece0`, `--sea:#1f5f5b`, `--sea-deep:#123b39`, `--sun:#d9a441`, `--ink:#1d2321`.
  - Renders `<ResortHeader />` (client), `children`, a footer and `<DemoPill packageId="web-premium" />`.
  - `metadata.title.template = "%s | Saeng Chan Resort"`.
- `_components/t.tsx` (client): `useLang()` returns the current lang via `useDemoStore(resortLang)`. `<T value={L} />` renders `value[lang]`. Server pages pass `L` objects into `<T>` so all copy switches on the client.
- `_components/lang-toggle.tsx`: a button with `data-testid="lang-toggle"` showing "EN" when the lang is th and "TH" when it is en. Clicking it calls `resortLang.set(...)`.
- `_components/resort-header.tsx`: logo text `resort.name`, a `<nav>` built from `nav` with the active link highlighted (`usePathname`), and the lang toggle. On mobile it uses a menu button. It is transparent over the hero on home and solid elsewhere.
- `_components/reveal.tsx`: wraps children and adds a fade/slide-up when they enter the viewport (IntersectionObserver). It respects `prefers-reduced-motion`.
- Home: a full-bleed hero with `heroImage` (h1 = `resort.tagline`, location, a CTA to `/booking`), `intro`, 3 `highlights`, a 3-room teaser linking to `/rooms`, a 4-photo gallery teaser and a booking CTA band. Sections are wrapped in `<Reveal>`.
- Rooms: `<RoomFilter />` (client) with:
  - Type pills, each `data-testid="filter-type-<all|deluxe|suite|villa>"`.
  - A guests `<select data-testid="filter-guests">` with options 1, 2, 4, 6, 10. The default is 1.
  - Cards built from `filterRooms(ROOMS, …)`, each `data-testid="room-card"` (image, name, guests, m², price per night, features, a "Book this room" link to `/demos/resort/booking?room=<id>`).
  - An empty state, `data-testid="rooms-empty"`.
- Gallery: a 9-image masonry/grid, each `data-testid="gallery-item"` button. `<Lightbox>` (client) has `data-testid="lightbox"`, `role="dialog"`, `aria-modal`, prev/next buttons, a counter `"{i+1} / 9"`, a close button, Esc/ArrowLeft/ArrowRight keys, and locks body scroll while open.
- About: `about` heading and body with `aboutImage`, plus `highlights`.
- Booking: `<InquiryForm />` (client). It reads `?room=` via `useSearchParams`, so wrap it in `<Suspense>` in the page. Inputs, each `data-testid="input-<field>"`: checkIn and checkOut (`type="date"`, with `min` = today), guests (number 1–8, default 2), a room select (optional, "Any room" + ROOMS), name and email. Errors come from `validateInquiry(input, toISODate(new Date()), lang)` and render with `data-testid="error-<field>"`. When the dates are valid, show the nights and the estimated total for the selected room (`pricePerNight × nights`, formatted with `formatTHB`). The submit button is `data-testid="inquiry-submit"`. On success, after a 600 ms delay, show `data-testid="inquiry-success"` with the text "Inquiry received for {nights} nights. (Demo — nothing was sent.)" in en, or "ได้รับคำขอจองแล้ว {nights} คืน (เว็บตัวอย่าง: ไม่มีการส่งข้อมูลจริง)" in th.

- [ ] **Step 8: Run tests, do the visual check, commit**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e resort smoke`
Expected: all pass. Screenshot all 5 pages in both languages at 375px and 1440px and iterate until polished.

```bash
git add -A
git commit -m "feat: add Saeng Chan resort demo with filters, lightbox and inquiry (web premium)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Demo `app-basic`: Orders API docs with a Try-it panel

**Files:**
- Create: `lib/demos/orders-api/api.ts`, `lib/demos/orders-api/seed.ts`, `lib/demos/orders-api/store.ts`, `app/demos/orders-api/layout.tsx`, `app/demos/orders-api/page.tsx`, `app/demos/orders-api/_components/api-console.tsx` (client), `app/demos/orders-api/_components/line-preview.tsx`
- Modify: `tests/e2e/routes.ts`
- Test: `tests/unit/orders-api.test.ts`, `tests/e2e/orders-api.spec.ts`

**Interfaces:**
- Consumes: `createDemoStore`, `useDemoStore`, `ResetDemoButton`, `DemoPill`.
- Produces: from `@/lib/demos/orders-api/api`: `OrderStatus`, `ORDER_STATUSES`, `OrderItem`, `Order`, `HttpMethod`, `ApiRequest`, `LineNotification`, `ApiResponse`, `ApiResult`, `handleRequest(orders: Order[], req: ApiRequest, now?: Date): ApiResult`, `ENDPOINTS`. From `seed.ts`: `SEED_ORDERS: Order[]`. From `store.ts`: `ordersStore: DemoStore<Order[]>`.

- [ ] **Step 1: Write the failing unit test**

`tests/unit/orders-api.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { handleRequest, type Order } from "@/lib/demos/orders-api/api";
import { SEED_ORDERS } from "@/lib/demos/orders-api/seed";

const now = new Date("2026-10-19T10:00:00.000Z");
const seed = (): Order[] => structuredClone(SEED_ORDERS);

describe("GET /orders", () => {
  it("lists all orders", () => {
    const { response } = handleRequest(seed(), { method: "GET", path: "/orders" });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ count: 8 });
  });

  it("filters by status", () => {
    const { response } = handleRequest(seed(), { method: "GET", path: "/orders?status=paid" });
    const body = response.body as { data: Order[]; count: number };
    expect(body.count).toBe(body.data.length);
    expect(body.data.every((o) => o.status === "paid")).toBe(true);
  });

  it("rejects an invalid status filter", () => {
    const { response } = handleRequest(seed(), { method: "GET", path: "/orders?status=lost" });
    expect(response.status).toBe(422);
  });
});

describe("GET /orders/:id", () => {
  it("returns one order", () => {
    const { response } = handleRequest(seed(), { method: "GET", path: "/orders/ORD-1001" });
    expect(response.status).toBe(200);
    expect((response.body as { data: Order }).data.id).toBe("ORD-1001");
  });

  it("404s on unknown id", () => {
    const { response } = handleRequest(seed(), { method: "GET", path: "/orders/ORD-9999" });
    expect(response).toEqual({ status: 404, body: { error: "Order ORD-9999 not found" } });
  });
});

describe("POST /orders", () => {
  const body = {
    customer: "คุณนิด (ตัวอย่าง)",
    items: [
      { sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 2, price: 120 },
      { sku: "KM-02", name: "แคบหมู", qty: 1, price: 80 },
    ],
  };

  it("creates an order with the next id, computed total and a LINE notification", () => {
    const orders = seed();
    const { orders: next, response } = handleRequest(orders, { method: "POST", path: "/orders", body }, now);
    expect(response.status).toBe(201);
    const created = (response.body as { data: Order }).data;
    expect(created).toMatchObject({ id: "ORD-1009", total: 320, status: "pending", createdAt: now.toISOString() });
    expect(next).toHaveLength(9);
    expect(next[0].id).toBe("ORD-1009");
    expect(orders).toHaveLength(8);
    expect(response.notification?.lines[0]).toContain("ORD-1009");
  });

  it("returns 422 with details for invalid bodies", () => {
    const { orders, response } = handleRequest(
      seed(),
      { method: "POST", path: "/orders", body: { customer: "", items: [{ sku: "", name: "x", qty: 0, price: -1 }] } },
      now,
    );
    expect(response.status).toBe(422);
    expect((response.body as { details: string[] }).details).toEqual([
      "customer is required",
      "items[0].sku is required",
      "items[0].qty must be an integer ≥ 1",
      "items[0].price must be a number ≥ 0",
    ]);
    expect(orders).toHaveLength(8);
  });

  it("rejects a non-object body", () => {
    const { response } = handleRequest(seed(), { method: "POST", path: "/orders", body: "hi" }, now);
    expect(response.status).toBe(422);
  });
});

describe("PATCH /orders/:id/status", () => {
  it("updates status with a notification", () => {
    const { orders, response } = handleRequest(seed(), {
      method: "PATCH",
      path: "/orders/ORD-1001/status",
      body: { status: "shipped" },
    });
    expect(response.status).toBe(200);
    expect(orders.find((o) => o.id === "ORD-1001")?.status).toBe("shipped");
    expect(response.notification?.lines[1]).toMatch(/→ shipped$/);
  });

  it("rejects invalid status, unknown id and cancelled orders", () => {
    expect(
      handleRequest(seed(), { method: "PATCH", path: "/orders/ORD-1001/status", body: { status: "lost" } }).response.status,
    ).toBe(422);
    expect(
      handleRequest(seed(), { method: "PATCH", path: "/orders/ORD-9999/status", body: { status: "paid" } }).response.status,
    ).toBe(404);
    expect(
      handleRequest(seed(), { method: "PATCH", path: "/orders/ORD-1004/status", body: { status: "paid" } }).response.status,
    ).toBe(409);
  });
});

describe("routing", () => {
  it("404s unknown routes and 405s wrong methods", () => {
    expect(handleRequest(seed(), { method: "GET", path: "/users" }).response.status).toBe(404);
    expect(handleRequest(seed(), { method: "PATCH", path: "/orders" }).response.status).toBe(405);
    expect(handleRequest(seed(), { method: "POST", path: "/orders/ORD-1001" }).response.status).toBe(405);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test orders-api`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement the seed, API and store**

`lib/demos/orders-api/seed.ts`:
```ts
import type { Order } from "./api";

export const SEED_ORDERS: Order[] = [
  { id: "ORD-1008", customer: "คุณเมย์ (ตัวอย่าง)", items: [{ sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 3, price: 120 }], total: 360, status: "pending", createdAt: "2026-10-19T03:12:00.000Z" },
  { id: "ORD-1007", customer: "คุณต้น (ตัวอย่าง)", items: [{ sku: "SU-03", name: "ไส้อั่ว", qty: 2, price: 180 }], total: 360, status: "paid", createdAt: "2026-10-18T09:40:00.000Z" },
  { id: "ORD-1006", customer: "คุณฝน (ตัวอย่าง)", items: [{ sku: "KM-02", name: "แคบหมู", qty: 4, price: 80 }], total: 320, status: "paid", createdAt: "2026-10-18T05:05:00.000Z" },
  { id: "ORD-1005", customer: "คุณบอส (ตัวอย่าง)", items: [{ sku: "TE-04", name: "ชาอูหลง", qty: 1, price: 250 }, { sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 1, price: 120 }], total: 370, status: "shipped", createdAt: "2026-10-17T11:22:00.000Z" },
  { id: "ORD-1004", customer: "คุณแอน (ตัวอย่าง)", items: [{ sku: "CO-05", name: "กาแฟดอยช้าง", qty: 2, price: 290 }], total: 580, status: "cancelled", createdAt: "2026-10-16T14:00:00.000Z" },
  { id: "ORD-1003", customer: "คุณโจ้ (ตัวอย่าง)", items: [{ sku: "SU-03", name: "ไส้อั่ว", qty: 1, price: 180 }], total: 180, status: "shipped", createdAt: "2026-10-16T02:30:00.000Z" },
  { id: "ORD-1002", customer: "คุณปุ้ย (ตัวอย่าง)", items: [{ sku: "KM-02", name: "แคบหมู", qty: 2, price: 80 }, { sku: "TE-04", name: "ชาอูหลง", qty: 1, price: 250 }], total: 410, status: "shipped", createdAt: "2026-10-15T08:15:00.000Z" },
  { id: "ORD-1001", customer: "คุณกิ๊ฟ (ตัวอย่าง)", items: [{ sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 2, price: 120 }], total: 240, status: "paid", createdAt: "2026-10-15T01:00:00.000Z" },
];
```

`lib/demos/orders-api/api.ts`:
```ts
export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";
export const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export type HttpMethod = "GET" | "POST" | "PATCH";

export interface ApiRequest {
  method: HttpMethod;
  path: string;
  body?: unknown;
}

export interface LineNotification {
  title: string;
  lines: string[];
}

export interface ApiResponse {
  status: number;
  body: unknown;
  notification?: LineNotification;
}

export interface ApiResult {
  orders: Order[];
  response: ApiResponse;
}

export const ENDPOINTS: { method: HttpMethod; path: string; summary: string; example: { path: string; body?: unknown } }[] = [
  { method: "GET", path: "/orders", summary: "List orders, optionally filtered by ?status=", example: { path: "/orders?status=paid" } },
  { method: "GET", path: "/orders/:id", summary: "Get one order", example: { path: "/orders/ORD-1001" } },
  {
    method: "POST",
    path: "/orders",
    summary: "Create an order and notify the shop on LINE",
    example: {
      path: "/orders",
      body: { customer: "คุณนิด (ตัวอย่าง)", items: [{ sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 2, price: 120 }] },
    },
  },
  {
    method: "PATCH",
    path: "/orders/:id/status",
    summary: "Update order status and notify on LINE",
    example: { path: "/orders/ORD-1001/status", body: { status: "shipped" } },
  },
];

const respond = (status: number, body: unknown, notification?: LineNotification): ApiResponse =>
  notification ? { status, body, notification } : { status, body };

const baht = (n: number) => `฿${n.toLocaleString("en-US")}`;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isStatus(v: unknown): v is OrderStatus {
  return typeof v === "string" && (ORDER_STATUSES as string[]).includes(v);
}

function validateNewOrder(body: unknown): { customer: string; items: OrderItem[] } | string[] {
  if (!isRecord(body)) return ["body must be a JSON object"];
  const details: string[] = [];
  const customer = typeof body.customer === "string" ? body.customer.trim() : "";
  if (!customer) details.push("customer is required");
  if (!Array.isArray(body.items) || body.items.length === 0) {
    details.push("items must be a non-empty array");
    return details;
  }
  const items: OrderItem[] = [];
  body.items.forEach((raw, i) => {
    const item = isRecord(raw) ? raw : {};
    const sku = typeof item.sku === "string" ? item.sku.trim() : "";
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!sku) details.push(`items[${i}].sku is required`);
    if (!name) details.push(`items[${i}].name is required`);
    if (!Number.isInteger(item.qty) || (item.qty as number) < 1) details.push(`items[${i}].qty must be an integer ≥ 1`);
    if (typeof item.price !== "number" || item.price < 0) details.push(`items[${i}].price must be a number ≥ 0`);
    items.push({ sku, name, qty: item.qty as number, price: item.price as number });
  });
  return details.length ? details : { customer, items };
}

function nextId(orders: Order[]): string {
  const max = orders.reduce((m, o) => Math.max(m, Number(o.id.replace("ORD-", "")) || 0), 1000);
  return `ORD-${String(max + 1).padStart(4, "0")}`;
}

export function handleRequest(orders: Order[], req: ApiRequest, now: Date = new Date()): ApiResult {
  const url = new URL(req.path, "https://api.example.test");
  const segments = url.pathname.split("/").filter(Boolean);
  const same = (response: ApiResponse): ApiResult => ({ orders, response });

  if (segments[0] !== "orders" || segments.length > 3) return same(respond(404, { error: "Route not found" }));

  if (segments.length === 1) {
    if (req.method === "GET") {
      const status = url.searchParams.get("status");
      if (status !== null && !isStatus(status)) {
        return same(respond(422, { error: "Invalid status filter", allowed: ORDER_STATUSES }));
      }
      const data = status ? orders.filter((o) => o.status === status) : orders;
      return same(respond(200, { data, count: data.length }));
    }
    if (req.method === "POST") {
      const parsed = validateNewOrder(req.body);
      if (Array.isArray(parsed)) return same(respond(422, { error: "Validation failed", details: parsed }));
      const order: Order = {
        id: nextId(orders),
        customer: parsed.customer,
        items: parsed.items,
        total: parsed.items.reduce((sum, i) => sum + i.qty * i.price, 0),
        status: "pending",
        createdAt: now.toISOString(),
      };
      const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);
      return {
        orders: [order, ...orders],
        response: respond(201, { data: order }, {
          title: "🛒 New order",
          lines: [`${order.id} · ${order.customer}`, `${itemCount} items · ${baht(order.total)}`],
        }),
      };
    }
    return same(respond(405, { error: "Method not allowed" }));
  }

  const id = decodeURIComponent(segments[1]);
  const order = orders.find((o) => o.id === id);

  if (segments.length === 2) {
    if (req.method !== "GET") return same(respond(405, { error: "Method not allowed" }));
    return same(order ? respond(200, { data: order }) : respond(404, { error: `Order ${id} not found` }));
  }

  if (segments[2] !== "status") return same(respond(404, { error: "Route not found" }));
  if (req.method !== "PATCH") return same(respond(405, { error: "Method not allowed" }));
  if (!order) return same(respond(404, { error: `Order ${id} not found` }));
  const status = isRecord(req.body) ? req.body.status : undefined;
  if (!isStatus(status)) return same(respond(422, { error: "Invalid status", allowed: ORDER_STATUSES }));
  if (order.status === "cancelled" && status !== "cancelled") {
    return same(respond(409, { error: "Cancelled orders cannot change status" }));
  }
  const updated: Order = { ...order, status };
  return {
    orders: orders.map((o) => (o.id === id ? updated : o)),
    response: respond(200, { data: updated }, {
      title: "📦 Order status updated",
      lines: [`${updated.id} · ${updated.customer}`, `${order.status} → ${status}`],
    }),
  };
}
```

`lib/demos/orders-api/store.ts`:
```ts
import { createDemoStore } from "@/lib/demo-store";
import type { Order } from "./api";
import { SEED_ORDERS } from "./seed";

export const ordersStore = createDemoStore<Order[]>("orders-api:orders", SEED_ORDERS);
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm test orders-api`
Expected: PASS.

- [ ] **Step 5: Write the failing e2e test and register the route**

Append `"/demos/orders-api"` to `routes`.

`tests/e2e/orders-api.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("POST /orders returns 201 and shows a LINE notification", async ({ page }) => {
  await page.goto("/demos/orders-api");
  await page.getByTestId("endpoint-POST-/orders").click();
  await page.getByTestId("api-send").click();
  await expect(page.getByTestId("api-status")).toHaveText(/201/);
  await expect(page.getByTestId("line-preview")).toContainText("ORD-1009");
});

test("invalid JSON shows a client-side error, not a crash", async ({ page }) => {
  await page.goto("/demos/orders-api");
  await page.getByTestId("endpoint-POST-/orders").click();
  await page.getByTestId("api-body").fill("{ nope");
  await page.getByTestId("api-send").click();
  await expect(page.getByTestId("api-status")).toHaveText(/400/);
});

test("reset restores seed data", async ({ page }) => {
  await page.goto("/demos/orders-api");
  await page.getByTestId("endpoint-POST-/orders").click();
  await page.getByTestId("api-send").click();
  await page.getByTestId("reset-demo").click();
  await page.getByTestId("endpoint-GET-/orders").click();
  await page.getByTestId("api-path").fill("/orders");
  await page.getByTestId("api-send").click();
  await expect(page.getByTestId("api-response")).toContainText('"count": 8');
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm test:e2e orders-api`
Expected: FAIL with 404.

- [ ] **Step 7: Build the page**

Invoke `frontend-design`. Requirements:
- `layout.tsx`: fonts `JetBrains_Mono` (code) and `Anuphan` (UI). A dark docs palette: `--bg:#0e1116`, `--panel:#161b22`, `--line:#2a313c`, `--text:#e6edf3`, `--muted:#8b949e`, method colours GET `#3fb950`, POST `#58a6ff`, PATCH `#d29922`, LINE green `#06c755`. Includes `<DemoPill packageId="app-basic" />` and `metadata.title = "Orders API — เอกสาร API"`.
- `page.tsx`, a single `<main>`:
  1. Intro: "Orders API v1", a description (Thai and English one-liners), base URL `https://api.example.test`, and auth "Bearer token (ไม่ต้องใช้ในเดโม)".
  2. Two columns on desktop, stacked on mobile.
  3. Left column: the endpoint list from `ENDPOINTS`. Each item is a button with `data-testid="endpoint-<METHOD>-<path>"`, a method badge and a summary. Selecting one loads `example.path` into the path input and `JSON.stringify(example.body, null, 2)` into the body textarea.
  4. Right column: `<ApiConsole />`.
- `<ApiConsole />` (client):
  - Controls: the method label, a path `<input data-testid="api-path">`, a body `<textarea data-testid="api-body">` (hidden for GET), and a "Send" button `data-testid="api-send"`. The selected endpoint is shared through props or a small `useState` in a parent client component that wraps both columns.
  - On send: parse the body as JSON. On a parse error, show status `400 Bad Request` with `{ "error": "Invalid JSON body" }`. Otherwise run `handleRequest(ordersStore.get(), …)`, then `ordersStore.set(result.orders)`, and show:
    - `data-testid="api-status"`: the status code with its reason phrase, using the map 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 405 Method Not Allowed, 409 Conflict, 422 Unprocessable Entity.
    - Simulated latency of 120–300 ms with a spinner.
    - `data-testid="api-response"`: pretty JSON (`JSON.stringify(body, null, 2)`).
    - When `response.notification` exists, `<LinePreview>` (`data-testid="line-preview"`): a phone-style LINE chat bubble from "ร้านดี Bot" showing the title, the lines and a timestamp.
  - Below the console, a "curl" snippet for the current request, and `<ResetDemoButton stores={[ordersStore]} />`.

- [ ] **Step 8: Run tests, do the visual check, commit**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e orders-api smoke`
Expected: all pass. Screenshot at 375px and 1440px and iterate.

```bash
git add -A
git commit -m "feat: add Orders API docs demo with try-it console and LINE preview (app basic)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Demo `app-standard`: Ran Dee shop back office

**Files:**
- Create: `lib/demos/shop-admin/data.ts`, `lib/demos/shop-admin/store.ts`, `app/demos/shop-admin/layout.tsx`, `app/demos/shop-admin/login/page.tsx`, `app/demos/shop-admin/(app)/layout.tsx`, `app/demos/shop-admin/(app)/page.tsx`, `app/demos/shop-admin/(app)/orders/page.tsx`, `app/demos/shop-admin/(app)/stock/page.tsx`, `app/demos/shop-admin/_components/*` (client: `admin-shell.tsx`, `login-form.tsx`, `overview.tsx`, `orders-table.tsx`, `stock-table.tsx`)
- Modify: `tests/e2e/routes.ts`
- Test: `tests/unit/shop-admin.test.ts`, `tests/e2e/shop-admin.spec.ts`

**Interfaces:**
- Consumes: `toISODate`, `addDays`, `createDemoStore`, `useDemoStore`, `RequireSession`, `ResetDemoButton`, `DemoPill`, `formatTHB`.
- Produces: from `@/lib/demos/shop-admin/data`: `Product`, `ShopOrderStatus`, `SHOP_ORDER_STATUSES`, `ShopOrder`, `ShopData`, `PRODUCTS`, `mulberry32(seed: number): () => number`, `buildShopSeed(today: Date): ShopData`, `isLowStock(p: Product): boolean`, `kpis(data: ShopData, today: Date): { revenue30d: number; orders30d: number; avgOrderValue: number; lowStockCount: number }`, `dailySales(data: ShopData, today: Date, days?: number): { date: string; revenue: number }[]`, `topProducts(data: ShopData, n?: number): { sku: string; name: string; qty: number; revenue: number }[]`, `updateStock(data: ShopData, sku: string, stock: number): ShopData`, `setOrderStatus(data: ShopData, id: string, status: ShopOrderStatus): ShopData`. From `store.ts`: `shopSession: DemoStore<boolean>` (key `shop-admin:session`) and `shopData: DemoStore<ShopData>` (key `shop-admin:data`).

- [ ] **Step 1: Write the failing unit test**

`tests/unit/shop-admin.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { toISODate } from "@/lib/dates";
import {
  buildShopSeed,
  dailySales,
  isLowStock,
  kpis,
  PRODUCTS,
  setOrderStatus,
  topProducts,
  updateStock,
} from "@/lib/demos/shop-admin/data";

const today = new Date(2026, 9, 19);

describe("buildShopSeed", () => {
  it("is deterministic for the same day", () => {
    expect(buildShopSeed(today)).toEqual(buildShopSeed(today));
  });

  it("covers the last 30 days with valid orders", () => {
    const data = buildShopSeed(today);
    const dates = new Set(data.orders.map((o) => o.date));
    expect(dates.size).toBe(30);
    expect([...dates].sort().at(-1)).toBe("2026-10-19");
    expect([...dates].sort()[0]).toBe("2026-09-20");
    for (const order of data.orders) {
      const expected = order.items.reduce((sum, item) => {
        const product = PRODUCTS.find((p) => p.sku === item.sku)!;
        return sum + product.price * item.qty;
      }, 0);
      expect(order.total).toBe(expected);
    }
  });

  it("includes at least two low-stock products", () => {
    expect(buildShopSeed(today).products.filter(isLowStock).length).toBeGreaterThanOrEqual(2);
  });
});

describe("metrics", () => {
  const data = buildShopSeed(today);

  it("kpis exclude cancelled orders", () => {
    const valid = data.orders.filter((o) => o.status !== "cancelled");
    const k = kpis(data, today);
    expect(k.orders30d).toBe(valid.length);
    expect(k.revenue30d).toBe(valid.reduce((s, o) => s + o.total, 0));
    expect(k.avgOrderValue).toBe(Math.round(k.revenue30d / k.orders30d));
    expect(k.lowStockCount).toBe(data.products.filter(isLowStock).length);
  });

  it("dailySales returns one ascending entry per day that sums to revenue", () => {
    const series = dailySales(data, today);
    expect(series).toHaveLength(30);
    expect(series[0].date).toBe("2026-09-20");
    expect(series.at(-1)!.date).toBe(toISODate(today));
    expect(series.reduce((s, d) => s + d.revenue, 0)).toBe(kpis(data, today).revenue30d);
  });

  it("topProducts is sorted by revenue and capped", () => {
    const top = topProducts(data, 5);
    expect(top.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < top.length; i++) expect(top[i - 1].revenue).toBeGreaterThanOrEqual(top[i].revenue);
  });
});

describe("mutations", () => {
  const data = buildShopSeed(today);

  it("updateStock is immutable and validates", () => {
    const sku = data.products[0].sku;
    const next = updateStock(data, sku, 99);
    expect(next.products[0].stock).toBe(99);
    expect(data.products[0].stock).not.toBe(99);
    expect(() => updateStock(data, sku, -1)).toThrow();
    expect(() => updateStock(data, sku, 1.5)).toThrow();
    expect(() => updateStock(data, "NOPE", 1)).toThrow();
  });

  it("setOrderStatus updates one order", () => {
    const id = data.orders[0].id;
    const next = setOrderStatus(data, id, "cancelled");
    expect(next.orders.find((o) => o.id === id)?.status).toBe("cancelled");
    expect(data.orders.find((o) => o.id === id)?.status).not.toBe("cancelled");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test shop-admin`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement the data module and stores**

`lib/demos/shop-admin/data.ts`:
```ts
import { addDays, toISODate } from "@/lib/dates";

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  reorderAt: number;
}

export type ShopOrderStatus = "paid" | "packing" | "shipped" | "cancelled";
export const SHOP_ORDER_STATUSES: ShopOrderStatus[] = ["paid", "packing", "shipped", "cancelled"];

export interface ShopOrder {
  id: string;
  customer: string;
  channel: "LINE" | "Shopee" | "หน้าร้าน";
  date: string;
  items: { sku: string; qty: number }[];
  total: number;
  status: ShopOrderStatus;
}

export interface ShopData {
  products: Product[];
  orders: ShopOrder[];
}

export const PRODUCTS: Product[] = [
  { sku: "NP-01", name: "น้ำพริกหนุ่ม", category: "น้ำพริก", price: 120, stock: 48, reorderAt: 15 },
  { sku: "NP-02", name: "น้ำพริกอ่อง", category: "น้ำพริก", price: 120, stock: 9, reorderAt: 15 },
  { sku: "KM-01", name: "แคบหมูไร้มัน", category: "ของทานเล่น", price: 80, stock: 64, reorderAt: 20 },
  { sku: "KM-02", name: "แคบหมูติดมัน", category: "ของทานเล่น", price: 80, stock: 37, reorderAt: 20 },
  { sku: "SU-01", name: "ไส้อั่วสูญญากาศ", category: "อาหารแปรรูป", price: 180, stock: 22, reorderAt: 10 },
  { sku: "SU-02", name: "แหนมหมู", category: "อาหารแปรรูป", price: 90, stock: 6, reorderAt: 12 },
  { sku: "TE-01", name: "ชาอูหลงดอยแม่สลอง", category: "เครื่องดื่ม", price: 250, stock: 30, reorderAt: 8 },
  { sku: "CO-01", name: "กาแฟดอยช้าง คั่วกลาง", category: "เครื่องดื่ม", price: 290, stock: 25, reorderAt: 8 },
  { sku: "SW-01", name: "ข้าวแต๋นน้ำแตงโม", category: "ขนม", price: 60, stock: 75, reorderAt: 25 },
  { sku: "SW-02", name: "ทองม้วนสด", category: "ขนม", price: 70, stock: 41, reorderAt: 20 },
  { sku: "SW-03", name: "มะขามแช่อิ่ม", category: "ขนม", price: 85, stock: 18, reorderAt: 10 },
  { sku: "GF-01", name: "กล่องของฝากรวม", category: "ชุดของขวัญ", price: 590, stock: 12, reorderAt: 5 },
];

const CUSTOMERS = ["คุณเมย์", "คุณต้น", "คุณฝน", "คุณบอส", "คุณแอน", "คุณโจ้", "คุณปุ้ย", "คุณกิ๊ฟ", "คุณนิด", "คุณเอก"];
const CHANNELS: ShopOrder["channel"][] = ["LINE", "Shopee", "หน้าร้าน"];

// Small deterministic PRNG so the seed is stable for tests and screenshots.
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildShopSeed(today: Date): ShopData {
  const rand = mulberry32(42);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const orders: ShopOrder[] = [];
  let n = 2001;
  for (let back = 29; back >= 0; back--) {
    const date = toISODate(addDays(today, -back));
    const count = 3 + Math.floor(rand() * 7);
    for (let k = 0; k < count; k++) {
      const lines = 1 + Math.floor(rand() * 3);
      const items: ShopOrder["items"] = [];
      for (let l = 0; l < lines; l++) {
        const sku = pick(PRODUCTS).sku;
        if (!items.some((i) => i.sku === sku)) items.push({ sku, qty: 1 + Math.floor(rand() * 4) });
      }
      const total = items.reduce((s, i) => s + PRODUCTS.find((p) => p.sku === i.sku)!.price * i.qty, 0);
      const r = rand();
      const status: ShopOrderStatus =
        r < 0.05 ? "cancelled" : back > 2 ? "shipped" : r < 0.5 ? "paid" : r < 0.8 ? "packing" : "shipped";
      orders.push({ id: `RD-${n++}`, customer: pick(CUSTOMERS), channel: pick(CHANNELS), date, items, total, status });
    }
  }
  return { products: structuredClone(PRODUCTS), orders: orders.reverse() };
}

export function isLowStock(p: Product): boolean {
  return p.stock <= p.reorderAt;
}

function validOrders(data: ShopData) {
  return data.orders.filter((o) => o.status !== "cancelled");
}

export function dailySales(data: ShopData, today: Date, days = 30): { date: string; revenue: number }[] {
  const series = Array.from({ length: days }, (_, i) => ({ date: toISODate(addDays(today, i - days + 1)), revenue: 0 }));
  const index = new Map(series.map((d, i) => [d.date, i]));
  for (const o of validOrders(data)) {
    const i = index.get(o.date);
    if (i !== undefined) series[i].revenue += o.total;
  }
  return series;
}

export function kpis(data: ShopData, today: Date) {
  const from = toISODate(addDays(today, -29));
  const recent = validOrders(data).filter((o) => o.date >= from);
  const revenue30d = recent.reduce((s, o) => s + o.total, 0);
  return {
    revenue30d,
    orders30d: recent.length,
    avgOrderValue: recent.length ? Math.round(revenue30d / recent.length) : 0,
    lowStockCount: data.products.filter(isLowStock).length,
  };
}

export function topProducts(data: ShopData, n = 5) {
  const totals = new Map<string, { qty: number; revenue: number }>();
  for (const o of validOrders(data)) {
    for (const item of o.items) {
      const product = data.products.find((p) => p.sku === item.sku);
      if (!product) continue;
      const t = totals.get(item.sku) ?? { qty: 0, revenue: 0 };
      t.qty += item.qty;
      t.revenue += item.qty * product.price;
      totals.set(item.sku, t);
    }
  }
  return [...totals.entries()]
    .map(([sku, t]) => ({ sku, name: data.products.find((p) => p.sku === sku)!.name, ...t }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n);
}

export function updateStock(data: ShopData, sku: string, stock: number): ShopData {
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a whole number ≥ 0");
  if (!data.products.some((p) => p.sku === sku)) throw new Error(`Unknown SKU ${sku}`);
  return { ...data, products: data.products.map((p) => (p.sku === sku ? { ...p, stock } : p)) };
}

export function setOrderStatus(data: ShopData, id: string, status: ShopOrderStatus): ShopData {
  return { ...data, orders: data.orders.map((o) => (o.id === id ? { ...o, status } : o)) };
}
```

`lib/demos/shop-admin/store.ts`:
```ts
import { createDemoStore } from "@/lib/demo-store";
import { buildShopSeed, type ShopData } from "./data";

export const shopSession = createDemoStore<boolean>("shop-admin:session", false);
export const shopData = createDemoStore<ShopData>("shop-admin:data", buildShopSeed(new Date()));
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm test shop-admin`
Expected: PASS.

- [ ] **Step 5: Write the failing e2e test and register routes**

Append `"/demos/shop-admin/login", "/demos/shop-admin", "/demos/shop-admin/orders", "/demos/shop-admin/stock"` to `routes`.

`tests/e2e/shop-admin.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("unauthenticated visit redirects to login, login reaches overview", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  await expect(page).toHaveURL(/\/demos\/shop-admin\/login$/);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/demos\/shop-admin$/);
  await expect(page.getByTestId("kpi")).toHaveCount(4);
  await expect(page.getByTestId("sales-chart")).toBeVisible();
});

test("stock edit persists across reload and reset restores it", async ({ page }) => {
  await page.goto("/demos/shop-admin/login");
  await page.getByTestId("login-submit").click();
  await page.getByRole("link", { name: "สต็อกสินค้า" }).click();
  const row = page.getByTestId("stock-row-NP-02");
  await row.getByTestId("stock-input").fill("50");
  await row.getByTestId("stock-save").click();
  await expect(row).not.toContainText("ใกล้หมด");
  await page.reload();
  await expect(page.getByTestId("stock-row-NP-02").getByTestId("stock-input")).toHaveValue("50");
  await page.getByTestId("reset-demo").click();
  await expect(page.getByTestId("stock-row-NP-02")).toContainText("ใกล้หมด");
});

test("orders table filters by status and search", async ({ page }) => {
  await page.goto("/demos/shop-admin/login");
  await page.getByTestId("login-submit").click();
  await page.getByRole("link", { name: "คำสั่งซื้อ" }).click();
  await page.getByTestId("orders-search").fill("ไม่มีลูกค้าคนนี้");
  await expect(page.getByTestId("orders-empty")).toBeVisible();
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm test:e2e shop-admin`
Expected: FAIL with 404.

- [ ] **Step 7: Build the pages**

Invoke `frontend-design`. Requirements:
- `app/demos/shop-admin/layout.tsx`: font `Bai_Jamjuree` (400/500/600, thai+latin). Palette: `--bg:#f4f6f4`, `--panel:#ffffff`, `--line:#e3e8e4`, `--brand:#1f7a5a`, `--brand-soft:#e3f2eb`, `--warn:#c2410c`, `--ink:#17201b`. Renders `children` and `<DemoPill packageId="app-standard" />`. `metadata.title.template = "%s | ร้านดี Back Office"`.
- `login/page.tsx` + `<LoginForm>` (client):
  - A centred card titled "ร้านดี — ระบบหลังร้าน".
  - Email and password inputs prefilled with `demo@randee.example` / `demo1234`, plus the note "บัญชีตัวอย่าง กดเข้าสู่ระบบได้เลย".
  - Submit button `data-testid="login-submit"` labelled "เข้าสู่ระบบ".
  - Submitting sets `shopSession.set(true)` and runs `router.push("/demos/shop-admin")`. Any input is accepted.
  - If the session is already true, it redirects to the overview.
- `(app)/layout.tsx`: wraps children in `<RequireSession store={shopSession} loginPath="/demos/shop-admin/login"><AdminShell>…</AdminShell></RequireSession>`.
- `<AdminShell>` (client):
  - A sidebar on desktop and a top bar with a menu on mobile.
  - Nav links "ภาพรวม" (`/demos/shop-admin`), "คำสั่งซื้อ" (`/orders`) and "สต็อกสินค้า" (`/stock`), with the active link highlighted.
  - At the bottom: `<ResetDemoButton stores={[shopData]} />` and a "ออกจากระบบ" button that sets the session to false and pushes to login.
- Overview (`(app)/page.tsx` → `<Overview>`, client):
  - 4 KPI tiles, each `data-testid="kpi"`: ยอดขาย 30 วัน, คำสั่งซื้อ 30 วัน, ยอดเฉลี่ยต่อบิล, สินค้าใกล้หมด.
  - A Recharts `AreaChart` of `dailySales` inside `<div data-testid="sales-chart">`, wrapped in `ResponsiveContainer` with height 280. The X axis shows day/month.
  - A top-5 products list with revenue bars.
  - A "สินค้าใกล้หมด" list linking to stock.
- Orders (`<OrdersTable>`, client):
  - Search input `data-testid="orders-search"` (matches id or customer).
  - A status filter select ("ทั้งหมด" + statuses), using the Thai labels paid→ชำระแล้ว, packing→กำลังแพ็ก, shipped→จัดส่งแล้ว, cancelled→ยกเลิก.
  - Columns: id, date, customer, channel, items count, total, and status (a select that calls `setOrderStatus`).
  - Paginate at 15 rows per page.
  - Empty state: `data-testid="orders-empty"`.
  - Below 640px, render rows as cards instead of a table.
- Stock (`<StockTable>`, client):
  - Rows `data-testid="stock-row-<sku>"` with name, category, price, a stock `<input type="number" data-testid="stock-input">` and a save button `data-testid="stock-save"`.
  - A "ใกล้หมด" badge when `isLowStock`.
  - Saving calls `updateStock`. Show the thrown error message inline under the input.

- [ ] **Step 8: Run tests, do the visual check, commit**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e shop-admin smoke`
Expected: all pass. Screenshot all 4 screens at 375px and 1440px and iterate.

```bash
git add -A
git commit -m "feat: add Ran Dee shop back-office demo (app standard)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Demo `app-premium`, part 1: clinic data layer and customer booking flow

**Files:**
- Create: `lib/demos/clinic-booking/data.ts`, `lib/demos/clinic-booking/store.ts`, `app/demos/clinic-booking/layout.tsx`, `app/demos/clinic-booking/page.tsx`, `app/demos/clinic-booking/book/page.tsx`, `app/demos/clinic-booking/_components/booking-flow.tsx` (client)
- Modify: `tests/e2e/routes.ts`
- Test: `tests/unit/clinic.test.ts`, `tests/e2e/clinic-booking.spec.ts`

**Interfaces:**
- Consumes: `toISODate`, `addDays`, `nextDays`, `isThaiPhone`, `normalizePhone`, `createDemoStore`, `useDemoStore`, `DemoPill`, `PHOTOS`, `unsplash`, `formatTHB`.
- Produces: from `@/lib/demos/clinic-booking/data`:
  - Types: `Service`, `Staff`, `Customer`, `BookingStatus`, `BOOKING_STATUSES`, `Booking`, `ClinicData`.
  - Constants: `STAFF`, `OPEN = "10:00"`, `CLOSE = "19:00"`, `SLOT_STEP_MIN = 30`.
  - Functions:
    - `toMinutes(t: string): number`
    - `fromMinutes(n: number): string`
    - `buildClinicSeed(today: Date): ClinicData`
    - `availableSlots(data, { date, staffId, serviceId, now? }): string[]`
    - `bookAppointment(data, input: { name; phone; serviceId; staffId; date; time }, now?: Date): { data: ClinicData; booking: Booking }` (throws `Error` with a Thai message)
    - `setBookingStatus(data, id, status): ClinicData`
    - `upsertCustomer(data, c: Customer): ClinicData` and `deleteCustomer(data, id): ClinicData` (throws if bookings reference it)
    - `upsertService(data, s: Service): ClinicData` and `deleteService(data, id): ClinicData` (throws if bookings reference it)
    - `revenueByDay(data, end: Date, days?: number): { date: string; revenue: number }[]`
    - `bookingsByService(data): { serviceId: string; name: string; count: number }[]`
    - `newId(prefix: string): string`

  From `store.ts`: `clinicSession: DemoStore<boolean>` (key `clinic:session`) and `clinicData: DemoStore<ClinicData>` (key `clinic:data`).

- [ ] **Step 1: Write the failing unit test**

`tests/unit/clinic.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  availableSlots,
  bookAppointment,
  bookingsByService,
  buildClinicSeed,
  CLOSE,
  deleteCustomer,
  deleteService,
  fromMinutes,
  OPEN,
  revenueByDay,
  setBookingStatus,
  STAFF,
  toMinutes,
  upsertCustomer,
} from "@/lib/demos/clinic-booking/data";

const today = new Date(2026, 9, 19, 9, 0);
const tomorrow = "2026-10-20";

describe("time helpers", () => {
  it("round-trips HH:mm", () => {
    expect(toMinutes("13:30")).toBe(810);
    expect(fromMinutes(810)).toBe("13:30");
  });
});

describe("buildClinicSeed", () => {
  const data = buildClinicSeed(today);

  it("has no overlapping bookings per staff and day, all within hours and skills", () => {
    for (const b of data.bookings) {
      const staff = STAFF.find((s) => s.id === b.staffId)!;
      const service = data.services.find((s) => s.id === b.serviceId)!;
      expect(staff.serviceIds).toContain(b.serviceId);
      expect(toMinutes(b.time)).toBeGreaterThanOrEqual(toMinutes(OPEN));
      expect(toMinutes(b.time) + service.durationMin).toBeLessThanOrEqual(toMinutes(CLOSE));
      const others = data.bookings.filter((o) => o !== b && o.staffId === b.staffId && o.date === b.date);
      for (const o of others) {
        const os = data.services.find((s) => s.id === o.serviceId)!;
        const overlap = toMinutes(b.time) < toMinutes(o.time) + os.durationMin && toMinutes(o.time) < toMinutes(b.time) + service.durationMin;
        expect(overlap).toBe(false);
      }
    }
  });

  it("marks past bookings done or no-show and future ones booked", () => {
    for (const b of data.bookings) {
      if (b.date < "2026-10-19") expect(["done", "no-show"]).toContain(b.status);
      if (b.date > "2026-10-19") expect(b.status).toBe("booked");
    }
  });
});

describe("availableSlots", () => {
  const data = buildClinicSeed(today);

  it("returns no slots when the staff doesn't offer the service", () => {
    const staff = STAFF.find((s) => !s.serviceIds.includes("s-laser"))!;
    expect(availableSlots(data, { date: tomorrow, staffId: staff.id, serviceId: "s-laser" })).toEqual([]);
  });

  it("excludes slots that overlap existing bookings and those ending after close", () => {
    const b = data.bookings.find((x) => x.date === tomorrow)!;
    const slots = availableSlots(data, { date: tomorrow, staffId: b.staffId, serviceId: b.serviceId });
    expect(slots).not.toContain(b.time);
    const duration = data.services.find((s) => s.id === b.serviceId)!.durationMin;
    for (const t of slots) expect(toMinutes(t) + duration).toBeLessThanOrEqual(toMinutes(CLOSE));
    expect(slots.length).toBeGreaterThan(0);
  });

  it("excludes past times today", () => {
    const now = new Date(2026, 9, 19, 14, 10);
    const slots = availableSlots(data, { date: "2026-10-19", staffId: "st-2", serviceId: "s-mask", now });
    for (const t of slots) expect(toMinutes(t)).toBeGreaterThan(14 * 60 + 10);
  });
});

describe("bookAppointment", () => {
  const data = buildClinicSeed(today);
  const staffId = "st-2";
  const serviceId = "s-facial";

  it("books a free slot and creates the customer", () => {
    const time = availableSlots(data, { date: tomorrow, staffId, serviceId })[0];
    const { data: next, booking } = bookAppointment(
      data,
      { name: "ทดสอบ ระบบ", phone: "080-000-0099", serviceId, staffId, date: tomorrow, time },
      today,
    );
    expect(booking).toMatchObject({ date: tomorrow, time, status: "booked" });
    expect(next.customers.find((c) => c.id === booking.customerId)).toMatchObject({ name: "ทดสอบ ระบบ", phone: "0800000099" });
    expect(availableSlots(next, { date: tomorrow, staffId, serviceId })).not.toContain(time);
  });

  it("reuses an existing customer by phone", () => {
    const existing = data.customers[0];
    const time = availableSlots(data, { date: tomorrow, staffId, serviceId })[0];
    const { data: next, booking } = bookAppointment(
      data,
      { name: existing.name, phone: existing.phone, serviceId, staffId, date: tomorrow, time },
      today,
    );
    expect(booking.customerId).toBe(existing.id);
    expect(next.customers).toHaveLength(data.customers.length);
  });

  it("rejects taken slots and bad phones", () => {
    const b = data.bookings.find((x) => x.date === tomorrow)!;
    expect(() =>
      bookAppointment(data, { name: "ก", phone: "0800000098", serviceId: b.serviceId, staffId: b.staffId, date: tomorrow, time: b.time }, today),
    ).toThrow("เวลานี้ไม่ว่างแล้ว");
    expect(() =>
      bookAppointment(data, { name: "ก", phone: "123", serviceId, staffId, date: tomorrow, time: "10:00" }, today),
    ).toThrow("เบอร์โทรไม่ถูกต้อง");
  });
});

describe("admin mutations and reports", () => {
  const data = buildClinicSeed(today);

  it("sets booking status", () => {
    const id = data.bookings[0].id;
    expect(setBookingStatus(data, id, "checked-in").bookings.find((b) => b.id === id)?.status).toBe("checked-in");
  });

  it("blocks deleting referenced customers and services", () => {
    const b = data.bookings[0];
    expect(() => deleteCustomer(data, b.customerId)).toThrow();
    expect(() => deleteService(data, b.serviceId)).toThrow();
  });

  it("upserts and deletes an unreferenced customer", () => {
    const added = upsertCustomer(data, { id: "c-new", name: "ลูกค้าใหม่", phone: "0800000077" });
    expect(added.customers.some((c) => c.id === "c-new")).toBe(true);
    expect(deleteCustomer(added, "c-new").customers.some((c) => c.id === "c-new")).toBe(false);
  });

  it("revenueByDay sums done bookings over the window", () => {
    const series = revenueByDay(data, today, 7);
    expect(series).toHaveLength(7);
    expect(series.at(-1)!.date).toBe("2026-10-19");
    const expected = data.bookings
      .filter((b) => b.status === "done" && b.date >= series[0].date && b.date <= "2026-10-19")
      .reduce((s, b) => s + data.services.find((x) => x.id === b.serviceId)!.price, 0);
    expect(series.reduce((s, d) => s + d.revenue, 0)).toBe(expected);
  });

  it("bookingsByService counts every booking once", () => {
    expect(bookingsByService(data).reduce((s, x) => s + x.count, 0)).toBe(data.bookings.length);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test clinic`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement the data module and stores**

`lib/demos/clinic-booking/data.ts`:
```ts
import { addDays, toISODate } from "@/lib/dates";
import { isThaiPhone, normalizePhone } from "@/lib/validation";

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  serviceIds: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  note?: string;
}

export type BookingStatus = "booked" | "checked-in" | "done" | "no-show";
export const BOOKING_STATUSES: BookingStatus[] = ["booked", "checked-in", "done", "no-show"];

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  status: BookingStatus;
}

export interface ClinicData {
  services: Service[];
  customers: Customer[];
  bookings: Booking[];
}

export const OPEN = "10:00";
export const CLOSE = "19:00";
export const SLOT_STEP_MIN = 30;

const SERVICES: Service[] = [
  { id: "s-consult", name: "ปรึกษาแพทย์", durationMin: 30, price: 0 },
  { id: "s-facial", name: "ทรีตเมนต์หน้าใส", durationMin: 60, price: 1500 },
  { id: "s-hydra", name: "ไฮดราเฟเชียล", durationMin: 60, price: 2500 },
  { id: "s-acne", name: "รักษาสิว", durationMin: 45, price: 1200 },
  { id: "s-laser", name: "เลเซอร์ปรับสีผิว", durationMin: 30, price: 1800 },
  { id: "s-mask", name: "มาสก์ฟื้นฟูผิว", durationMin: 30, price: 600 },
];

export const STAFF: Staff[] = [
  { id: "st-1", name: "พญ. ลลิตา", role: "แพทย์ผิวหนัง", serviceIds: ["s-consult", "s-laser", "s-acne"] },
  { id: "st-2", name: "คุณมิว", role: "นักบำบัดผิว", serviceIds: ["s-facial", "s-hydra", "s-mask", "s-acne"] },
  { id: "st-3", name: "คุณบีม", role: "นักบำบัดผิว", serviceIds: ["s-facial", "s-hydra", "s-mask"] },
];

const CUSTOMER_NAMES = ["คุณแพร", "คุณบีบี", "คุณออม", "คุณจูน", "คุณน้ำ", "คุณพลอย", "คุณเฟิร์น", "คุณมุก", "คุณกาย", "คุณโอ๊ต"];

// Fixed start times per staff, spaced so no two can overlap (longest service is 60 min).
const PATTERN: Record<string, string[]> = {
  "st-1": ["10:00", "11:30", "14:00", "16:30"],
  "st-2": ["10:30", "13:00", "15:00"],
  "st-3": ["11:00", "14:30", "17:00"],
};

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(n: number): string {
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildClinicSeed(today: Date): ClinicData {
  const customers: Customer[] = CUSTOMER_NAMES.map((name, i) => ({
    id: `c-${i + 1}`,
    name,
    phone: `08000000${String(i + 1).padStart(2, "0")}`,
  }));
  const bookings: Booking[] = [];
  let n = 1;
  for (let offset = -7; offset <= 6; offset++) {
    const date = toISODate(addDays(today, offset));
    STAFF.forEach((staff, si) => {
      const times = (offset + si) % 2 === 0 ? PATTERN[staff.id] : PATTERN[staff.id].slice(0, 2);
      times.forEach((time, k) => {
        const serviceId = staff.serviceIds[(k + offset + 7) % staff.serviceIds.length];
        const customerId = customers[(k * 3 + si + offset + 20) % customers.length].id;
        const status: BookingStatus = offset < 0 ? (n % 5 === 0 ? "no-show" : "done") : "booked";
        bookings.push({ id: `b-${n++}`, customerId, serviceId, staffId: staff.id, date, time, status });
      });
    });
  }
  return { services: structuredClone(SERVICES), customers, bookings };
}

export function availableSlots(
  data: ClinicData,
  { date, staffId, serviceId, now }: { date: string; staffId: string; serviceId: string; now?: Date },
): string[] {
  const staff = STAFF.find((s) => s.id === staffId);
  const service = data.services.find((s) => s.id === serviceId);
  if (!staff || !service || !staff.serviceIds.includes(serviceId)) return [];

  const busy = data.bookings
    .filter((b) => b.staffId === staffId && b.date === date && b.status !== "no-show")
    .map((b) => {
      const start = toMinutes(b.time);
      const duration = data.services.find((s) => s.id === b.serviceId)?.durationMin ?? SLOT_STEP_MIN;
      return [start, start + duration] as const;
    });

  const earliest = now && toISODate(now) === date ? now.getHours() * 60 + now.getMinutes() : -1;
  const slots: string[] = [];
  for (let start = toMinutes(OPEN); start + service.durationMin <= toMinutes(CLOSE); start += SLOT_STEP_MIN) {
    if (start <= earliest) continue;
    const end = start + service.durationMin;
    if (busy.some(([s, e]) => start < e && s < end)) continue;
    slots.push(fromMinutes(start));
  }
  return slots;
}

export function bookAppointment(
  data: ClinicData,
  input: { name: string; phone: string; serviceId: string; staffId: string; date: string; time: string },
  now: Date = new Date(),
): { data: ClinicData; booking: Booking } {
  if (!input.name.trim()) throw new Error("กรุณากรอกชื่อ");
  if (!isThaiPhone(input.phone)) throw new Error("เบอร์โทรไม่ถูกต้อง");
  const free = availableSlots(data, { date: input.date, staffId: input.staffId, serviceId: input.serviceId, now });
  if (!free.includes(input.time)) throw new Error("เวลานี้ไม่ว่างแล้ว กรุณาเลือกเวลาใหม่");

  const phone = normalizePhone(input.phone);
  let customers = data.customers;
  let customer = customers.find((c) => c.phone === phone);
  if (!customer) {
    customer = { id: newId("c"), name: input.name.trim(), phone };
    customers = [...customers, customer];
  }
  const booking: Booking = {
    id: newId("b"),
    customerId: customer.id,
    serviceId: input.serviceId,
    staffId: input.staffId,
    date: input.date,
    time: input.time,
    status: "booked",
  };
  return { data: { ...data, customers, bookings: [...data.bookings, booking] }, booking };
}

export function setBookingStatus(data: ClinicData, id: string, status: BookingStatus): ClinicData {
  return { ...data, bookings: data.bookings.map((b) => (b.id === id ? { ...b, status } : b)) };
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
}

export function upsertCustomer(data: ClinicData, c: Customer): ClinicData {
  return { ...data, customers: upsert(data.customers, c) };
}

export function deleteCustomer(data: ClinicData, id: string): ClinicData {
  if (data.bookings.some((b) => b.customerId === id)) throw new Error("ลบไม่ได้ ลูกค้ารายนี้มีประวัติการจอง");
  return { ...data, customers: data.customers.filter((c) => c.id !== id) };
}

export function upsertService(data: ClinicData, s: Service): ClinicData {
  return { ...data, services: upsert(data.services, s) };
}

export function deleteService(data: ClinicData, id: string): ClinicData {
  if (data.bookings.some((b) => b.serviceId === id)) throw new Error("ลบไม่ได้ บริการนี้มีการจองอยู่");
  return { ...data, services: data.services.filter((s) => s.id !== id) };
}

export function revenueByDay(data: ClinicData, end: Date, days = 7): { date: string; revenue: number }[] {
  const series = Array.from({ length: days }, (_, i) => ({ date: toISODate(addDays(end, i - days + 1)), revenue: 0 }));
  const index = new Map(series.map((d, i) => [d.date, i]));
  for (const b of data.bookings) {
    if (b.status !== "done") continue;
    const i = index.get(b.date);
    const price = data.services.find((s) => s.id === b.serviceId)?.price ?? 0;
    if (i !== undefined) series[i].revenue += price;
  }
  return series;
}

export function bookingsByService(data: ClinicData): { serviceId: string; name: string; count: number }[] {
  return data.services.map((s) => ({
    serviceId: s.id,
    name: s.name,
    count: data.bookings.filter((b) => b.serviceId === s.id).length,
  }));
}
```

`lib/demos/clinic-booking/store.ts`:
```ts
import { createDemoStore } from "@/lib/demo-store";
import { buildClinicSeed, type ClinicData } from "./data";

export const clinicSession = createDemoStore<boolean>("clinic:session", false);
export const clinicData = createDemoStore<ClinicData>("clinic:data", buildClinicSeed(new Date()));
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `pnpm test clinic`
Expected: PASS. If the "past bookings no-show" test passes but `bookingsByService` miscounts, check that every seed booking uses a service from `SERVICES`.

- [ ] **Step 5: Write the failing e2e test and register routes**

Append `"/demos/clinic-booking", "/demos/clinic-booking/book"` to `routes`.

`tests/e2e/clinic-booking.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("customer books a slot tomorrow and sees a LINE-style confirmation", async ({ page }) => {
  await page.goto("/demos/clinic-booking");
  await page.getByTestId("book-cta").click();
  await expect(page).toHaveURL(/\/book$/);
  await page.getByTestId("service-s-facial").click();
  await page.getByTestId("staff-st-2").click();
  await page.getByTestId("date-1").click();
  await page.getByTestId("slot").first().click();
  await page.getByTestId("book-name").fill("ทดสอบ ระบบ");
  await page.getByTestId("book-phone").fill("0800000099");
  await page.getByTestId("book-confirm").click();
  await expect(page.getByTestId("booking-confirmed")).toContainText("ทดสอบ ระบบ");
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm test:e2e clinic-booking`
Expected: FAIL with 404.

- [ ] **Step 7: Build the customer side**

Invoke `frontend-design`. Requirements:
- `layout.tsx`: font `Kanit` (300/400/500, thai+latin). Palette: `--blush:#fbeff0`, `--rose:#c86b7a`, `--rose-deep:#8e3e4d`, `--ink:#2b2226`, `--line-green:#06c755`. Renders `children` and `<DemoPill packageId="app-premium" />`. `metadata.title.template = "%s | Lumi Clinic"`.
- `page.tsx` (clinic landing):
  - Hero with `PHOTOS.clinicHero`: "ลูมิ คลินิก", the tagline "ผิวสวยแบบเข้าใจคุณ จองคิวง่ายผ่าน LINE", and a CTA `data-testid="book-cta"` labelled "จองคิวผ่าน LINE" that links to `/demos/clinic-booking/book`.
  - Services with prices from `buildClinicSeed(new Date()).services`, showing "ฟรี" for 0.
  - The team (`STAFF`) and a section using `PHOTOS.clinicInterior`.
  - A secondary link "เข้าสู่ระบบฝั่งคลินิก" → `/demos/clinic-booking/admin/login`.
- `book/page.tsx` → `<BookingFlow />` (client), rendered inside a phone frame: max-w-[420px], centred, LINE-style header bar "Lumi Clinic" with a green accent, chat-bubble prompts. The steps, with a back button on each:
  1. Service: buttons `data-testid="service-<id>"` showing name, duration and price.
  2. Staff, filtered to those offering the service: `data-testid="staff-<id>"`.
  3. Date: 7 chips from `nextDays(new Date(), 7)`, `data-testid="date-<index>"`, labelled with the Thai weekday and day/month (`toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" })`).
  4. Slot grid from `availableSlots(clinicData.get(), { date, staffId, serviceId, now: new Date() })`, each `data-testid="slot"`. Show "ไม่มีเวลาว่างในวันนี้" when empty.
  5. Name `data-testid="book-name"` and phone `data-testid="book-phone"`, then confirm `data-testid="book-confirm"`, which calls `bookAppointment` and then `clinicData.set(result.data)`. Show caught error messages inline.
  6. A confirmation bubble `data-testid="booking-confirmed"` containing the customer name, service, staff, date and time, plus "เราจะส่งข้อความเตือนก่อนถึงคิว 1 วัน (ตัวอย่าง)". Below it, buttons "จองคิวเพิ่ม" (restart) and "ดูฝั่งคลินิก" → `/demos/clinic-booking/admin`.

- [ ] **Step 8: Run tests, do the visual check, commit**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e clinic-booking smoke`
Expected: all pass. Screenshot both pages at 375px and 1440px and iterate.

```bash
git add -A
git commit -m "feat: add Lumi Clinic data layer and LINE-style booking flow (app premium)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Demo `app-premium`, part 2: clinic staff back office

**Files:**
- Create: `app/demos/clinic-booking/admin/login/page.tsx`, `app/demos/clinic-booking/admin/(app)/layout.tsx`, `(app)/page.tsx` (queue), `(app)/customers/page.tsx`, `(app)/services/page.tsx`, `(app)/reports/page.tsx`, plus client components in `app/demos/clinic-booking/_components/` (`clinic-login-form.tsx`, `clinic-shell.tsx`, `queue.tsx`, `customers-crud.tsx`, `services-crud.tsx`, `reports.tsx`)
- Modify: `tests/e2e/routes.ts`, `tests/e2e/clinic-booking.spec.ts`

**Interfaces:**
- Consumes: everything Task 11 produces, plus `RequireSession`, `ResetDemoButton`, `useDemoStore`, `nextDays`, `formatTHB` and Recharts.

- [ ] **Step 1: Write the failing e2e tests and register routes**

Append `"/demos/clinic-booking/admin/login", "/demos/clinic-booking/admin", "/demos/clinic-booking/admin/customers", "/demos/clinic-booking/admin/services", "/demos/clinic-booking/admin/reports"` to `routes`.

Append to `tests/e2e/clinic-booking.spec.ts`:
```ts
test("a customer booking shows up in the staff queue", async ({ page }) => {
  await page.goto("/demos/clinic-booking/book");
  await page.getByTestId("service-s-facial").click();
  await page.getByTestId("staff-st-2").click();
  await page.getByTestId("date-1").click();
  await page.getByTestId("slot").first().click();
  await page.getByTestId("book-name").fill("คิวจากหน้าเว็บ");
  await page.getByTestId("book-phone").fill("0800000088");
  await page.getByTestId("book-confirm").click();
  await expect(page.getByTestId("booking-confirmed")).toBeVisible();

  await page.goto("/demos/clinic-booking/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByTestId("login-submit").click();
  await page.getByTestId("queue-date-1").click();
  const row = page.getByTestId("queue-row").filter({ hasText: "คิวจากหน้าเว็บ" });
  await expect(row).toBeVisible();
  await row.getByTestId("queue-status").selectOption("checked-in");
  await expect(row).toHaveAttribute("data-status", "checked-in");
});

test("customers CRUD blocks deleting customers with bookings", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin/login");
  await page.getByTestId("login-submit").click();
  await page.getByRole("link", { name: "ลูกค้า" }).click();
  await page.getByTestId("customer-add").click();
  await page.getByTestId("customer-name").fill("ลูกค้าใหม่ ทดสอบ");
  await page.getByTestId("customer-phone").fill("0800000077");
  await page.getByTestId("customer-save").click();
  const newRow = page.getByTestId("customer-row").filter({ hasText: "ลูกค้าใหม่ ทดสอบ" });
  await expect(newRow).toBeVisible();
  await newRow.getByTestId("customer-delete").click();
  await expect(newRow).toHaveCount(0);

  await page
    .locator('[data-testid="customer-row"]:not([data-bookings="0"])')
    .first()
    .getByTestId("customer-delete")
    .click();
  await expect(page.getByTestId("crud-error")).toContainText("ลบไม่ได้");
});

test("reports render charts", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin/login");
  await page.getByTestId("login-submit").click();
  await page.getByRole("link", { name: "รายงาน" }).click();
  await expect(page.getByTestId("revenue-chart")).toBeVisible();
  await expect(page.getByTestId("service-chart")).toBeVisible();
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm test:e2e clinic-booking`
Expected: the new tests FAIL with 404 on `/admin`.

- [ ] **Step 3: Build the admin screens**

Invoke `frontend-design`. All screens use the clinic layout palette from Task 11. Requirements:
- `admin/login/page.tsx` → `<ClinicLoginForm>`:
  - Card "Lumi Clinic — สำหรับเจ้าหน้าที่", prefilled `staff@lumi.example` / `demo1234`, and the note "บัญชีตัวอย่าง".
  - `data-testid="login-submit"` sets `clinicSession.set(true)` and pushes to `/demos/clinic-booking/admin`.
  - It redirects if already logged in.
- `admin/(app)/layout.tsx`: `<RequireSession store={clinicSession} loginPath="/demos/clinic-booking/admin/login"><ClinicShell>…</ClinicShell></RequireSession>`.
- `<ClinicShell>`:
  - Nav links "คิววันนี้" (`/admin`), "ลูกค้า" (`/admin/customers`), "บริการ" (`/admin/services`) and "รายงาน" (`/admin/reports`).
  - A link "หน้าจองของลูกค้า ↗" → `/demos/clinic-booking/book`.
  - `<ResetDemoButton stores={[clinicData]} />` and logout.
  - A sidebar on desktop and a bottom tab bar on mobile. Position the tabs above the demo pill (`bottom-20`), or move the tabs to the top on mobile so they never collide with the pill.
- Queue (`<Queue>`):
  - 7 date chips from `nextDays(new Date(), 7)`, each `data-testid="queue-date-<i>"` (default index 0).
  - Summary counts per status.
  - A list of that date's bookings sorted by time. Each is `data-testid="queue-row"` with `data-status={status}` and shows the time, customer name and phone, service, staff and a status `<select data-testid="queue-status">`. Status labels: booked→จองแล้ว, checked-in→มาถึงแล้ว, done→เสร็จสิ้น, no-show→ไม่มา. Changing it calls `setBookingStatus`.
  - Empty state.
- Customers (`<CustomersCrud>`):
  - A search box and an add button `data-testid="customer-add"` that opens an inline form panel with `data-testid="customer-name"`, `customer-phone` (validated with `isThaiPhone`) and an optional note, plus save `data-testid="customer-save"` (`upsertCustomer`, using `newId("c")` for new rows and storing the normalized phone).
  - Rows `data-testid="customer-row"` with `data-bookings={bookingCount}`, showing name, phone, booking count, edit and delete `data-testid="customer-delete"`.
  - Delete calls `deleteCustomer`. Its thrown message renders in `data-testid="crud-error"`.
  - Sort rows by name so seed customers come first and the new test customer is findable.
- Services (`<ServicesCrud>`): the same pattern for name, duration (15–180, step 15) and price (≥0), using `upsertService` / `deleteService` and the same `crud-error` element.
- Reports (`<Reports>`):
  - KPI tiles: revenue for the last 7 days, bookings in the next 7 days, and the no-show rate for the last 7 days.
  - `data-testid="revenue-chart"`: a Recharts `BarChart` of `revenueByDay(data, new Date(), 7)`.
  - `data-testid="service-chart"`: a horizontal `BarChart` of `bookingsByService`.
  - Each chart sits in a `ResponsiveContainer` with height 260.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e clinic-booking smoke`
Expected: all pass.

- [ ] **Step 5: Visual check and commit**

Screenshot all 5 admin screens at 375px and 1440px. Confirm that the mobile tab bar and the demo pill don't overlap. Iterate.

```bash
git add -A
git commit -m "feat: add Lumi Clinic staff back office: queue, CRUD and reports (app premium)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Real thumbnails, README and final verification

**Files:**
- Create: `scripts/capture-thumbs.mjs`, `public/thumbs/<package-id>.jpg` (6 files, generated), `README.md` (replaces the scaffold README)
- Modify: `components/hub/package-card.tsx` (swap the gradient preview for the screenshot)
- Test: the existing `tests/e2e/hub.spec.ts` plus an added thumbnail assertion

**Interfaces:**
- Consumes: `packages` (`demoPath`) and the session storage keys `demo:shop-admin:session` and `demo:clinic:session`.

- [ ] **Step 1: Add the failing assertion**

Append to `tests/e2e/hub.spec.ts`:
```ts
test("package cards show real demo thumbnails", async ({ page }) => {
  await page.goto("/th");
  for (const pkg of packages) {
    const img = page.getByTestId(`package-${pkg.id}`).locator("img");
    await expect(img).toHaveAttribute("src", new RegExp(`/thumbs/${pkg.id}\\.jpg`));
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }
});
```

Run: `pnpm test:e2e hub`
Expected: FAIL. No `img` inside the cards.

- [ ] **Step 2: Write the capture script**

`scripts/capture-thumbs.mjs`:
```js
// Usage: pnpm build && pnpm start --port 3100 (in another terminal), then
//        node scripts/capture-thumbs.mjs http://localhost:3100
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3100";
const targets = {
  "web-basic": "/demos/sale-page",
  "web-standard": "/demos/company",
  "web-premium": "/demos/resort",
  "app-basic": "/demos/orders-api",
  "app-standard": "/demos/shop-admin",
  "app-premium": "/demos/clinic-booking/book",
};

await mkdir("public/thumbs", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await context.addInitScript(() => {
  localStorage.setItem("demo:shop-admin:session", "true");
  localStorage.setItem("demo:clinic:session", "true");
});
const page = await context.newPage();
for (const [id, path] of Object.entries(targets)) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: '[data-testid="demo-pill"]{display:none!important}' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `public/thumbs/${id}.jpg`, type: "jpeg", quality: 82 });
  console.log(`captured ${id}`);
}
await browser.close();
```

- [ ] **Step 3: Capture**

```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 5
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
ls -la public/thumbs
```
Expected: six `.jpg` files, each 100–400 KB. Open each one with the Read tool and confirm it shows the intended demo screen.

- [ ] **Step 4: Use the thumbnails in `package-card.tsx`**

Replace the preview `<Link>` block and delete the `previewTone` map. Add `import Image from "next/image";`.
```tsx
      <Link href={pkg.demoPath} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-2xl border border-line">
        <Image
          src={`/thumbs/${pkg.id}.jpg`}
          alt=""
          width={1440}
          height={900}
          sizes="(min-width: 768px) 33vw, 100vw"
          className="aspect-[16/10] w-full object-cover object-top transition duration-500 hover:scale-[1.03]"
        />
      </Link>
```

- [ ] **Step 5: Write `README.md`**

````markdown
# SupaOhm — Fastwork showcase

Live demos for each package on https://fastwork.com/user/devohm.

| Package | Demo |
|---|---|
| Website · Basic ฿4,900 | `/demos/sale-page` |
| Website · Standard ฿7,900 | `/demos/company` |
| Website · Premium ฿14,900 | `/demos/resort` |
| Web app · Basic ฿5,900 | `/demos/orders-api` |
| Web app · Standard ฿14,900 | `/demos/shop-admin` |
| Web app · Premium ฿29,900 | `/demos/clinic-booking` |

All data is mocked in the browser. App demos save edits to localStorage, and each has a "reset" button.

## Develop

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm test           # unit tests (Vitest)
pnpm test:e2e       # builds, then runs Playwright at 375px and 1440px
```

## Update prices or scope

Edit `lib/packages.ts`. The hub cards and demo pills read from it.

## Refresh hub thumbnails / Fastwork cover images

```bash
pnpm build && pnpm start --port 3100 &
node scripts/capture-thumbs.mjs http://localhost:3100
```
Screenshots land in `public/thumbs/` and can be uploaded as Fastwork listing covers.
````

- [ ] **Step 6: Full verification**

Run, in order:
```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
```
Expected: every command exits 0. Record the pass counts from the final summary lines for the report.

- [ ] **Step 7: Final visual pass in Chrome**

With `pnpm start --port 3100` running, open `/th`, `/en` and every demo route in Chrome at 375px and 1440px. Check:
- Thai text renders with nothing clipped.
- The pill never hides primary actions.
- No placeholder text remains: `grep -rn "<verified id>\|TODO\|lorem" app components lib` returns nothing.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: real demo thumbnails on hub, README, capture script

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 9: Deployment (ask first)**

Deploying publishes the site. Do not deploy without the user's explicit go-ahead. Report that the build is ready, and offer two options: `pnpm dlx vercel` (the user logs in), or pushing to a GitHub repo connected to Vercel.
