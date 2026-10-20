# Hub Redesign ("Moving Wall") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the beige, template-looking hub (`/en`, `/th`) with a dark "moving wall" studio page whose first screen shows the live demos. The hero headline is "See *exactly* what you're paying for." English becomes the default language.

**Architecture:** Only the hub changes. The demos under `app/demos/**` stay untouched.

- The hub is rebuilt section by section in `components/hub/`.
- Its copy lives in `lib/i18n/{en,th}.json`. Prices, scope and links still come from `lib/packages.ts`.
- New hub colour tokens go into `app/globals.css` `@theme`. The legacy beige tokens stay until Task 4, so the page builds and passes tests after every task.
- Motion is pure CSS keyframes. The only client components are the wall's pause toggle and the existing locale switch.

**Tech Stack:** Next.js 16.4.2 (App Router, static prerender, Turbopack), React 19, TypeScript strict, Tailwind CSS 4, `next/font/google`, lucide-react, Vitest, Playwright, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-20-hub-redesign-design.md`

## Global Constraints

**Next.js**
- This repo uses Next.js 16. Before writing code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecations: use `preload`, not `priority`, on `next/image`.
- `app/[locale]/layout.tsx` is a root layout that renders `<html>`/`<body>`. Hub pages are statically prerendered with `dynamicParams = false`.
- Do not add dependencies. Fonts come from `next/font/google`. Icons come from `lucide-react`, which is already installed.

**Colour tokens** (hub only, exact values)

| Token | Value |
|---|---|
| `forest` | `#0e1a14` |
| `forest-2` | `#16261d` |
| `cream` | `#efeadb` |
| `cream-muted` | `#b4b3a6` |
| `lime` | `#d7ff5c` |
| `rule` | `#efeadb1f` |

**Type**
- Bricolage Grotesque 800 handles Latin display. Anuphan handles Thai and body text.
- Kalam 700 (Latin) with Itim 400 (Thai) is used ONLY for the hero accent word. No serif fonts anywhere.
- Thai headings use line-height ≥ 1.2 and no negative letter-spacing. Hub headings carry the `display-heading` class, which handles this.
- Never use `uppercase` or wide tracking on Thai text.

**Buttons**
- 6px radius (`rounded-md`), never pills.
- Primary: `bg-lime text-forest`.
- Secondary: `border border-cream/25`.

**Copy**
- Tone is professional and client-focused. No boasting, and no claims about other sellers.
- Thai copy refers to SupaOhm only with the neutral pronoun "เรา". Never use ผม, ฉัน or ดิฉัน. A unit test enforces this.
- No off-platform contact details anywhere: no `mailto:`, `tel:` or `line.me`. Every hire or contact CTA links to the Fastwork profile or listing.

**Language and anchors**
- English is the default: `/` redirects to `/en`.
- Section anchors are `#work`, `#process` and `#about`.

**Accessibility**
- AA contrast (4.5:1) for text.
- Decorative images use `alt=""` and live inside an `aria-hidden` container.
- Respect `prefers-reduced-motion: reduce`: the wall is static and the underline is fully drawn.
- The wall has a visible pause/play toggle (WCAG 2.2.2).

**Quality bar**, checked by `tests/e2e/smoke.spec.ts` at 1440×900 and 375×812:
- HTTP 200
- a visible `<main>`
- no horizontal overflow
- zero console errors

**Demo links**
- Links to demo routes use `next/link` with `prefetch={false}`.

**Commits**
- Work on branch `feat/hub-redesign`. Do not push.
- Every commit message ends with a blank line followed by `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

**Commands**

| Command | What it does |
|---|---|
| `pnpm typecheck` | type check |
| `pnpm lint` | lint |
| `pnpm test` | Vitest |
| `pnpm test:e2e <spec names>` | builds, serves on port 3100, runs desktop and mobile projects |

---

## File map

| File | Task | Responsibility |
|---|---|---|
| `lib/i18n/config.ts` | 1 | `defaultLocale = "en"` |
| `next.config.ts` | 1 | `/` → `/en` redirect |
| `app/global-not-found.tsx` | 1, 4 | 404 page: link to `/en` (T1), forest styling (T4) |
| `tests/e2e/smoke.spec.ts`, `tests/unit/i18n.test.ts` | 1–4 | test updates |
| `app/globals.css` | 2, 4 | tokens, `display-heading`, scribble and wall CSS (T2); legacy tokens removed (T4) |
| `app/[locale]/layout.tsx` | 2, 4 | loads Kalam + Itim (T2); forest body (T4) |
| `components/hub/scribble.tsx` | 2 | hand-drawn underlined accent word |
| `components/hub/hero-wall.tsx` | 2 | client: streaming screenshot wall + pause toggle |
| `components/hub/hero.tsx` | 2 | hero copy + wall |
| `components/hub/site-header.tsx`, `locale-switch.tsx` | 2 | dark sticky header, Hire button |
| `components/hub/site-footer.tsx` | 2 | lime CTA band + footer note |
| `components/hub/project-row.tsx` | 3 | one project/package row |
| `components/hub/work-section.tsx` | 3 | `#work`: grouped project rows (replaces `services-section.tsx` and `package-card.tsx`) |
| `components/hub/process-section.tsx` | 4 | dark numbered timeline |
| `components/hub/about-section.tsx` | 4 | bio + stack (absorbs `stack-section.tsx`) |
| `components/demo/demo-pill.tsx` | 2 | back link → `/${locale}#work` |
| `lib/i18n/{en,th}.json`, `lib/i18n/index.ts` | 2–4 | hub copy |
| `tests/e2e/hub.spec.ts` | 2, 3 | hub behaviour |

---

### Task 1: English as the default language

**Files:**
- Modify: `lib/i18n/config.ts`
- Modify: `next.config.ts`
- Modify: `app/global-not-found.tsx`
- Test: `tests/unit/i18n.test.ts`, `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `defaultLocale === "en"`. `components/demo/demo-pill.tsx` already falls back to `defaultLocale`, so it needs no change in this task.

- [ ] **Step 0: Create the branch**

```bash
git checkout -b feat/hub-redesign
```

- [ ] **Step 1: Write the failing tests**

In `tests/unit/i18n.test.ts`, change the import line `import { getDictionary, isLocale } from "@/lib/i18n";` to:

```ts
import { defaultLocale, getDictionary, isLocale } from "@/lib/i18n";
```

and add this test inside the `describe("i18n", …)` block:

```ts
  it("defaults to English", () => {
    expect(defaultLocale).toBe("en");
  });
```

In `tests/e2e/smoke.spec.ts`, replace the redirect test with:

```ts
test("root redirects to /en", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/i18n.test.ts`
Expected: FAIL in "defaults to English" (`expected 'th' to be 'en'`).

- [ ] **Step 3: Implement**

In `lib/i18n/config.ts`:

```ts
export const defaultLocale: Locale = "en";
```

In `next.config.ts`, change the redirect to:

```ts
    return [{ source: "/", destination: "/en", permanent: false }];
```

Replace `app/global-not-found.tsx` with:

```tsx
import "./globals.css";
import Link from "next/link";

export const metadata = { title: "404 — SupaOhm" };

export default function GlobalNotFound() {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-paper font-sans text-ink antialiased">
        <main className="grid min-h-dvh place-items-center p-6 text-center">
          <div>
            <p className="text-6xl font-bold">404</p>
            <Link href="/en" className="mt-4 inline-block underline">
              Back home · กลับหน้าแรก
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test && pnpm typecheck && pnpm test:e2e smoke`
Expected: all unit tests PASS. Smoke PASS, including "root redirects to /en" in both projects.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/config.ts next.config.ts app/global-not-found.tsx tests/unit/i18n.test.ts tests/e2e/smoke.spec.ts
git commit -m "feat(hub): make English the default language

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Theme, header, moving-wall hero and CTA band

**Files:**
- Modify: `app/globals.css`, `app/[locale]/layout.tsx`
- Create: `components/hub/scribble.tsx`, `components/hub/hero-wall.tsx`
- Rewrite: `components/hub/hero.tsx`, `components/hub/site-header.tsx`, `components/hub/locale-switch.tsx` (styling only), `components/hub/site-footer.tsx`
- Modify: `components/hub/services-section.tsx` (anchor id only), `components/demo/demo-pill.tsx` (anchor only)
- Modify: `lib/i18n/en.json`, `lib/i18n/th.json`, `lib/i18n/index.ts`
- Test: `tests/unit/i18n.test.ts`, `tests/e2e/hub.spec.ts`

**Interfaces:**
- Consumes: `packages`, `formatTHB`, `FASTWORK_PROFILE_URL` and `type PackageId` from `@/lib/packages`; `type Dictionary` and `type Locale` from `@/lib/i18n`.
- Produces:
  - `Scribble({ children }: { children: React.ReactNode })`, a server component.
  - `HeroWall({ pauseLabel, playLabel }: { pauseLabel: string; playLabel: string })`, a client component.
  - Utility tokens `bg-forest`, `bg-forest-2`, `text-cream`, `text-cream-muted`, `bg-lime`, `text-lime`, `border-rule` and `font-hand`, plus the CSS class `display-heading`.
  - Dictionary keys `nav.{work,process,about,hire,switchLocale,switchLocaleLabel}`, `hero.{title,body,ctaWork,ctaPrice,pauseMotion,playMotion}`, `cta.{heading,body,button}` and `footer.note`.
  - `Dictionary` is now `typeof en`.

**Context for this task:**
- After this task the page shows: new header, new hero, the OLD services, process, stack and about sections (still beige), then the new CTA band. Tasks 3 and 4 replace the beige sections.
- The body stays beige (`bg-paper`) until Task 4, so every new section sets its own `bg-forest text-cream`.
- The old `ServicesSection` gets `id="work"` now, so the hero buttons, the nav link and the demo pill all point at a real anchor.

- [ ] **Step 1: Write the failing tests**

In `tests/unit/i18n.test.ts`, add inside the `describe` block:

```ts
  it("hero title marks exactly one accent word and one line break", () => {
    for (const dict of [en, th]) {
      const [line1, line2, ...rest] = dict.hero.title.split("\n");
      expect(rest).toEqual([]);
      expect(line2.trim()).not.toBe("");
      expect(line1.split("*")).toHaveLength(3);
      expect(line1.split("*")[1].trim()).not.toBe("");
    }
  });

  it("price CTA has a {price} placeholder", () => {
    expect(en.hero.ctaPrice).toContain("{price}");
    expect(th.hero.ctaPrice).toContain("{price}");
  });
```

In `tests/e2e/hub.spec.ts`, replace the "locale switch goes to English and back" and "no off-platform contact details on the hub" tests with these. Leave the two package tests untouched; Task 3 rewrites them.

```ts
test("locale switch goes to Thai and back", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("See exactly what you're paying for.");
  await page.getByRole("link", { name: "เปลี่ยนเป็นภาษาไทย" }).click();
  await expect(page).toHaveURL(/\/th/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("เห็นชัดๆ");
  await page.getByRole("link", { name: "Switch to English" }).click();
  await expect(page).toHaveURL(/\/en/);
});

test("no off-platform contact details on the hub", async ({ page }) => {
  for (const path of ["/en", "/th"]) {
    await page.goto(path);
    const html = await page.content();
    expect(html).not.toMatch(/mailto:|tel:|line\.me/);
  }
});

test("hero wall motion can be paused and resumed", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Pause motion" }).click();
  await page.getByRole("button", { name: "Play motion" }).click();
  await expect(page.getByRole("button", { name: "Pause motion" })).toBeVisible();
});

test("header hire button goes to the Fastwork profile", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("banner").getByRole("link", { name: "Hire on Fastwork" })).toHaveAttribute(
    "href",
    "https://fastwork.com/user/devohm",
  );
});
```

- [ ] **Step 2: Run the unit tests to verify they fail**

Run: `pnpm test tests/unit/i18n.test.ts`
Expected: FAIL. `dict.hero.title` is undefined and `ctaPrice` doesn't exist yet.

- [ ] **Step 3: Update the dictionaries**

In `lib/i18n/en.json`:

- Replace the `"nav"` object with:

```json
  "nav": {
    "work": "Work",
    "process": "Process",
    "about": "About",
    "hire": "Hire on Fastwork",
    "switchLocale": "ไทย",
    "switchLocaleLabel": "เปลี่ยนเป็นภาษาไทย"
  },
```

- Replace the `"hero"` object with:

```json
  "hero": {
    "title": "See *exactly* what\nyou're paying for.",
    "body": "Each package I offer on Fastwork has a working example you can open and use, so the scope and quality are clear before you order.",
    "ctaWork": "Browse the work ↓",
    "ctaPrice": "Packages from {price}",
    "pauseMotion": "Pause motion",
    "playMotion": "Play motion"
  },
```

- Replace the `"footer"` object (the last key) with these two objects:

```json
  "cta": {
    "heading": "Have a project in mind?",
    "body": "Send your brief on Fastwork and I'll confirm scope and price before we start.",
    "button": "Hire me on Fastwork"
  },
  "footer": {
    "note": "All businesses, people and reviews in the demos are fictional."
  }
```

In `lib/i18n/th.json`:

- Replace `"nav"` with:

```json
  "nav": {
    "work": "ผลงาน",
    "process": "ขั้นตอน",
    "about": "เกี่ยวกับ",
    "hire": "จ้างงานบน Fastwork",
    "switchLocale": "EN",
    "switchLocaleLabel": "Switch to English"
  },
```

- Replace `"hero"` with:

```json
  "hero": {
    "title": "เห็น*ชัดๆ*\nว่าจ่ายแล้วได้อะไร",
    "body": "ทุกแพ็กเกจบน Fastwork มีเว็บตัวอย่างที่เปิดใช้งานได้จริง เห็นขอบเขตและคุณภาพงานชัดเจนก่อนสั่งซื้อ",
    "ctaWork": "ดูผลงาน ↓",
    "ctaPrice": "แพ็กเกจเริ่มต้น {price}",
    "pauseMotion": "หยุดภาพเคลื่อนไหว",
    "playMotion": "เล่นภาพเคลื่อนไหว"
  },
```

- Replace `"footer"` with:

```json
  "cta": {
    "heading": "มีโปรเจกต์ในใจแล้ว?",
    "body": "ส่งรายละเอียดงานมาทาง Fastwork แล้วเราจะยืนยันขอบเขตและราคาก่อนเริ่มงาน",
    "button": "จ้างงานบน Fastwork"
  },
  "footer": {
    "note": "ธุรกิจ บุคคล และรีวิวในเว็บตัวอย่างทั้งหมดเป็นข้อมูลสมมติ"
  }
```

In `lib/i18n/index.ts`, change `export type Dictionary = typeof th;` to:

```ts
export type Dictionary = typeof en;
```

- [ ] **Step 4: Add tokens, fonts and the motion CSS**

Replace `app/globals.css` with the block below. The legacy tokens stay until Task 4.

```css
@import "tailwindcss";

@theme {
  --color-forest: #0e1a14;
  --color-forest-2: #16261d;
  --color-cream: #efeadb;
  --color-cream-muted: #b4b3a6;
  --color-lime: #d7ff5c;
  --color-rule: #efeadb1f;
  /* Legacy beige tokens — removed in Task 4 once every section is converted. */
  --color-paper: #f4eee6;
  --color-ink: #161412;
  --color-muted: #6b6259;
  --color-line: #ddd2c4;
  --color-accent: #e0542a;
  --font-sans: var(--font-anuphan), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-bricolage), var(--font-anuphan), ui-sans-serif, sans-serif;
  /* Kalam has no Thai glyphs, so Thai characters fall through to Itim. */
  --font-hand: var(--font-kalam), var(--font-itim), cursive;
}

@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}

/* Thai display headings: roomier leading, no negative tracking (unlayered, so it beats utilities). */
:lang(th) .display-heading {
  letter-spacing: 0;
  line-height: 1.25;
}

/* Hero accent word with a hand-drawn underline (components/hub/scribble.tsx). */
.scribble {
  position: relative;
  display: inline-block;
  isolation: isolate;
  white-space: nowrap;
  font-family: var(--font-hand);
  font-weight: 700;
  font-synthesis: none;
  font-size: 1.05em;
  letter-spacing: -0.01em;
  color: var(--color-lime);
}
.scribble svg {
  position: absolute;
  left: 0;
  top: calc(100% - 0.1em);
  z-index: -1;
  width: 100%;
  height: 0.24em;
  overflow: visible;
  pointer-events: none;
}
.scribble:lang(th) svg {
  top: calc(100% - 0.16em);
}
.scribble path {
  fill: none;
  stroke: var(--color-lime);
  stroke-width: 4.4;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
}

/* Hero screenshot wall (components/hub/hero-wall.tsx). Tracks hold their items twice, so -50% loops seamlessly. */
@media (prefers-reduced-motion: no-preference) {
  .scribble path {
    stroke-dashoffset: 1;
    animation: scribble-draw 0.7s 0.3s cubic-bezier(0.65, 0, 0.35, 1) forwards;
  }
  .hero-wall-up {
    animation: hero-wall-up 40s linear infinite;
  }
  .hero-wall-down {
    animation: hero-wall-down 40s linear infinite;
  }
  .hero-wall[data-paused] :is(.hero-wall-up, .hero-wall-down) {
    animation-play-state: paused;
  }
}

@keyframes scribble-draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes hero-wall-up {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50%);
  }
}
@keyframes hero-wall-down {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0);
  }
}
```

Replace `app/[locale]/layout.tsx` with:

```tsx
import "../globals.css";
import { Anuphan, Bricolage_Grotesque, Itim, Kalam } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n/config";

const anuphan = Anuphan({ subsets: ["thai", "latin"], variable: "--font-anuphan" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
// Hero accent word only. No metric-adjusted fallback for Kalam, so Thai glyphs fall through to Itim.
const kalam = Kalam({ weight: "700", subsets: ["latin"], variable: "--font-kalam", adjustFontFallback: false });
const itim = Itim({ weight: "400", subsets: ["thai"], variable: "--font-itim", preload: false });

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
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${anuphan.variable} ${bricolage.variable} ${kalam.variable} ${itim.variable}`}
    >
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Create `components/hub/scribble.tsx`**

```tsx
// One accent word in a heading: handwritten, lime, with a hand-drawn underline.
// Styling and the draw-in animation live in app/globals.css (.scribble).
export function Scribble({ children }: { children: React.ReactNode }) {
  return (
    <span className="scribble">
      {children}
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path pathLength={1} d="M1 6.5 C 22 3.5, 55 2.8, 99 4.8" />
      </svg>
    </span>
  );
}
```

- [ ] **Step 6: Create `components/hub/hero-wall.tsx`**

```tsx
"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { PackageId } from "@/lib/packages";

const COLUMNS: { ids: PackageId[]; direction: "up" | "down" }[] = [
  { ids: ["web-premium", "app-standard", "web-basic"], direction: "up" },
  { ids: ["app-premium", "web-standard", "app-basic"], direction: "down" },
  { ids: ["web-basic", "app-premium", "web-premium"], direction: "up" },
];

// Decorative, tilted wall of demo screenshots that streams up/down. The pause toggle satisfies WCAG 2.2.2.
export function HeroWall({ pauseLabel, playLabel }: { pauseLabel: string; playLabel: string }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className="relative h-72 sm:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[52%]">
      <div aria-hidden className="hero-wall absolute inset-0 overflow-hidden" data-paused={paused || undefined}>
        <div className="absolute -inset-x-[12%] -inset-y-1/2 flex rotate-[-8deg] gap-3 sm:gap-4">
          {COLUMNS.map((col, i) => (
            <div key={i} className="min-w-0 flex-1">
              <div className={`hero-wall-${col.direction}`}>
                {[...col.ids, ...col.ids].map((id, j) => (
                  <div key={j} className="mb-3 overflow-hidden rounded-lg shadow-2xl shadow-black/50 sm:mb-4">
                    <Image
                      src={`/thumbs/${id}.jpg`}
                      alt=""
                      width={1440}
                      height={900}
                      sizes="(min-width: 1024px) 18vw, 33vw"
                      className="aspect-[16/10] w-full object-cover object-top"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-forest via-transparent to-forest lg:hidden" />
        <div className="absolute inset-0 hidden bg-linear-to-r from-forest via-forest/30 to-transparent lg:block" />
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        className="absolute right-4 bottom-4 z-10 flex items-center gap-1.5 rounded-md border border-rule bg-forest/80 px-3 py-1.5 text-xs font-semibold text-cream backdrop-blur transition hover:border-cream motion-reduce:hidden"
      >
        {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
        {paused ? playLabel : pauseLabel}
      </button>
    </div>
  );
}
```

- [ ] **Step 7: Rewrite `components/hub/hero.tsx`**

```tsx
import type { Dictionary } from "@/lib/i18n";
import { formatTHB, packages } from "@/lib/packages";
import { HeroWall } from "./hero-wall";
import { Scribble } from "./scribble";

const fromPrice = formatTHB(Math.min(...packages.map((p) => p.priceTHB)));

export function Hero({ t }: { t: Dictionary }) {
  // Title format: "before *accent* after\nsecond line" (checked by tests/unit/i18n.test.ts).
  const [line1, line2] = t.hero.title.split("\n");
  const [before, accent, after] = line1.split("*");
  return (
    <section className="relative overflow-hidden bg-forest text-cream">
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 lg:pt-28 lg:pb-36">
        <div className="lg:max-w-[40rem]">
          <h1 className="display-heading font-display text-[2.75rem] leading-[1.1] font-extrabold tracking-[-0.04em] sm:text-6xl lg:text-[4.5rem]">
            {before}
            <Scribble>{accent}</Scribble>
            {after}
            <br className="hidden sm:inline" /> {line2}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-cream-muted sm:text-lg">{t.hero.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#work"
              className="rounded-md bg-lime px-5 py-3 text-sm font-bold text-forest transition hover:bg-cream"
            >
              {t.hero.ctaWork}
            </a>
            <a
              href="#work"
              className="rounded-md border border-cream/25 px-5 py-3 text-sm font-semibold transition hover:border-cream"
            >
              {t.hero.ctaPrice.replace("{price}", fromPrice)}
            </a>
          </div>
        </div>
      </div>
      <HeroWall pauseLabel={t.hero.pauseMotion} playLabel={t.hero.playMotion} />
    </section>
  );
}
```

- [ ] **Step 8: Rewrite the header, locale switch and footer**

`components/hub/site-header.tsx`:

```tsx
import type { Dictionary, Locale } from "@/lib/i18n";
import { FASTWORK_PROFILE_URL } from "@/lib/packages";
import { LocaleSwitch } from "./locale-switch";

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    ["#work", t.nav.work],
    ["#process", t.nav.process],
    ["#about", t.nav.about],
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-forest/85 text-cream backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href={`/${locale}`} className="font-display text-lg font-extrabold tracking-tight">
          SupaOhm
        </a>
        <div className="flex items-center gap-2 sm:gap-6">
          <nav className="hidden items-center gap-6 text-sm text-cream-muted md:flex">
            {links.map(([href, label]) => (
              <a key={href} href={href} className="transition hover:text-cream">
                {label}
              </a>
            ))}
          </nav>
          <LocaleSwitch locale={locale} label={t.nav.switchLocale} ariaLabel={t.nav.switchLocaleLabel} />
          <a
            href={FASTWORK_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-lime px-3 py-2 text-sm font-bold whitespace-nowrap text-forest transition hover:bg-cream"
          >
            {t.nav.hire}
          </a>
        </div>
      </div>
    </header>
  );
}
```

`components/hub/locale-switch.tsx`: change only the `className` of the `<a>` to:

```tsx
      className="rounded-md border border-cream/25 px-3 py-1.5 text-sm font-semibold transition hover:border-cream"
```

`components/hub/site-footer.tsx`:

```tsx
import type { Dictionary } from "@/lib/i18n";
import { FASTWORK_PROFILE_URL } from "@/lib/packages";

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="bg-forest text-cream">
      <div className="bg-lime text-forest">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="display-heading max-w-3xl font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-6xl">
            {t.cta.heading}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg">{t.cta.body}</p>
          <a
            href={FASTWORK_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-md bg-forest px-6 py-3.5 text-sm font-bold text-lime transition hover:bg-forest-2"
          >
            {t.cta.button}
          </a>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-cream-muted sm:px-6">
        {t.footer.note} · © {new Date().getFullYear()} SupaOhm
      </p>
    </footer>
  );
}
```

- [ ] **Step 9: Point the anchors at `#work`**

In `components/hub/services-section.tsx`, change `<section id="services" …>` to `<section id="work" …>`, keeping the existing className.

In `components/demo/demo-pill.tsx`, change ``href={`/${locale}#services`}`` to:

```tsx
        href={`/${locale}#work`}
```

- [ ] **Step 10: Run all checks**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e hub smoke`
Expected:
- Typecheck and lint are clean. If typecheck fails on `t.services`, `t.stack`, `t.process` or `t.about` in an untouched section, check that you only replaced `nav`, `hero` and `footer` and added `cta`. Those other keys stay until Tasks 3 and 4.
- All unit tests PASS.
- All hub and smoke e2e tests PASS in both projects. The two old package tests still use `/th` and "ดูตัวอย่าง"; they pass because `services` is untouched.

- [ ] **Step 11: Visual check**

Write this throwaway script to `/private/tmp/claude-501/-Users-supa-projects-active-fastexample/ead8185e-2c39-435c-85ce-af2491f3439e/scratchpad/hub-shots.mjs` (never inside the repo):

```js
import { chromium } from "@playwright/test";
const out = process.argv[2];
const browser = await chromium.launch();
for (const locale of ["en", "th"]) {
  for (const [name, width, height] of [["desk", 1440, 900], ["mob", 375, 812]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`http://localhost:3100/${locale}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200); // let the underline finish drawing
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, i = 0; y < total && i < 8; y += height, i++) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${out}/hub-${locale}-${name}-${i}.png` });
    }
    await page.close();
  }
}
await browser.close();
```

Run it from the repo root so `@playwright/test` resolves:

```bash
SP=/private/tmp/claude-501/-Users-supa-projects-active-fastexample/ead8185e-2c39-435c-85ce-af2491f3439e/scratchpad
pnpm build && (pnpm start --port 3100 >/dev/null 2>&1 &) && sleep 4
cp $SP/hub-shots.mjs ./.hub-shots.tmp.mjs && node ./.hub-shots.tmp.mjs $SP; rm ./.hub-shots.tmp.mjs
lsof -ti tcp:3100 | xargs kill
```

Open every `hub-*-0.png` (the first screens) with the Read tool and check:
- **Desktop EN headline:** exactly two lines, "See exactly what" / "you're paying for.". If it wraps to three, lower `lg:text-[4.5rem]` to `lg:text-[4.25rem]` or widen `lg:max-w-[40rem]` to `lg:max-w-[42rem]`.
- **"exactly":** lime, handwritten (Kalam), with the underline spanning the whole word just under the baseline. The "y" tail must sit in front of the stroke, not be cut by it. The underline must not touch the second line.
- **Thai headline:** "ชัดๆ" is handwritten (Itim) and lime, and its underline sits under the word without touching it. If it touches, tweak only `.scribble:lang(th) svg { top }` in steps of 0.02em.
- **The wall:** visible on the right on desktop and below the copy on mobile, tilted and faded under the copy. The pause button is visible at its bottom-right.
- **Header at 375px:** wordmark, language toggle and "Hire on Fastwork" all fit on one row.

Fix anything off and re-run. List the final screenshot paths in your report.

- [ ] **Step 12: Commit**

```bash
git add app/globals.css "app/[locale]/layout.tsx" components/hub lib/i18n components/demo/demo-pill.tsx tests/unit/i18n.test.ts tests/e2e/hub.spec.ts
git commit -m "feat(hub): moving-wall hero, dark header and lime CTA band

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: The work section (project rows)

**Files:**
- Create: `components/hub/project-row.tsx`, `components/hub/work-section.tsx`
- Delete: `components/hub/services-section.tsx`, `components/hub/package-card.tsx`
- Modify: `app/[locale]/page.tsx`, `lib/i18n/en.json`, `lib/i18n/th.json`
- Test: `tests/unit/i18n.test.ts`, `tests/e2e/hub.spec.ts`

**Interfaces:**
- Consumes: `packages`, `packagesByService(service)`, `formatTHB`, and `type Package` (`id`, `tier`, `priceTHB`, `scope[locale]`, `demoName[locale]`, `demoPath`, `fastworkUrl`) from `@/lib/packages`; the `display-heading` class and the tokens from Task 2.
- Produces:
  - `WorkSection({ locale, t })`, rendered as `<section id="work">`.
  - `ProjectRow({ pkg, index, locale, t })`, an `<article data-testid="package-<id>">`.
  - Dictionary key `work.{heading,intro,groups.{web,app}.{label,description},tryHeading,tryLive,order,tiers.{basic,standard,premium},try.<PackageId>[]}`.
  - The `services` key is removed.

- [ ] **Step 1: Write the failing tests**

In `tests/unit/i18n.test.ts`:

- Add `import { packages } from "@/lib/packages";` to the imports.
- Replace the "returns the dictionary per locale" test with:

```ts
  it("returns the dictionary per locale", () => {
    expect(getDictionary("en").work.tryLive).toBe("Try it live");
    expect(getDictionary("th").work.tryLive).toBe("ลองใช้งานจริง");
  });

  it("has 2–3 'try this' prompts for every package", () => {
    for (const dict of [en, th]) {
      for (const pkg of packages) {
        const prompts = dict.work.try[pkg.id];
        expect(prompts.length).toBeGreaterThanOrEqual(2);
        expect(prompts.length).toBeLessThanOrEqual(3);
      }
    }
  });
```

In `tests/e2e/hub.spec.ts`, replace the two package tests ("every package card links…" and "package cards show real demo thumbnails") with:

```ts
test("every project row shows price and links to its demo and Fastwork listing", async ({ page }) => {
  await page.goto("/en");
  for (const pkg of packages) {
    const row = page.getByTestId(`package-${pkg.id}`);
    await expect(row).toContainText(`฿${pkg.priceTHB.toLocaleString("en-US")}`);
    await expect(row.getByRole("link", { name: "Try it live" })).toHaveAttribute("href", pkg.demoPath);
    await expect(row.getByRole("link", { name: "Order on Fastwork" })).toHaveAttribute("href", pkg.fastworkUrl);
  }
  await expect(page.getByTestId("package-app-premium")).toContainText("Book a slot in the LINE-style flow");
});

test("project rows show real demo thumbnails", async ({ page }) => {
  await page.goto("/en");
  for (const pkg of packages) {
    const img = page.getByTestId(`package-${pkg.id}`).locator("img");
    await expect(img).toHaveAttribute("src", new RegExp(`/thumbs/${pkg.id}\\.jpg`));
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }
});

test("Thai project rows use Thai labels", async ({ page }) => {
  await page.goto("/th");
  const row = page.getByTestId("package-web-basic");
  await expect(row.getByRole("link", { name: "ลองใช้งานจริง" })).toHaveAttribute("href", "/demos/sale-page");
  await expect(row.getByRole("link", { name: "สั่งซื้อบน Fastwork" })).toBeVisible();
});
```

- [ ] **Step 2: Run the unit tests to verify they fail**

Run: `pnpm test tests/unit/i18n.test.ts`
Expected: FAIL. `work` is undefined.

- [ ] **Step 3: Replace `services` with `work` in both dictionaries**

In `lib/i18n/en.json`, replace the whole `"services"` object with:

```json
  "work": {
    "heading": "The work",
    "intro": "Six live projects. Each one is a package you can order on Fastwork, shown at the scope and quality you would receive.",
    "groups": {
      "web": {
        "label": "Websites",
        "description": "Landing pages and multi-page sites, designed for your brand and built with Next.js."
      },
      "app": {
        "label": "Systems",
        "description": "Back offices, dashboards and APIs that handle the day-to-day work of a business."
      }
    },
    "tryHeading": "Try this",
    "tryLive": "Try it live",
    "order": "Order on Fastwork",
    "tiers": { "basic": "Basic", "standard": "Standard", "premium": "Premium" },
    "try": {
      "web-basic": ["Scroll the full sale page on your phone", "Pick a bundle and press the LINE order button"],
      "web-standard": ["Switch between Home, Services and Contact", "Send the contact form empty to see the validation"],
      "web-premium": ["Switch the site between Thai and English", "Filter rooms by number of guests", "Open the photo gallery"],
      "app-basic": ["Send a POST /orders request and get a 201 back", "Change an order's status and see the LINE notification preview"],
      "app-standard": ["Log in with the prefilled demo account", "Search the orders table", "Edit a stock count and watch the low-stock flag"],
      "app-premium": ["Book a slot in the LINE-style flow", "Open the staff side and find your booking in today's queue"]
    }
  },
```

In `lib/i18n/th.json`, replace the whole `"services"` object with:

```json
  "work": {
    "heading": "ผลงาน",
    "intro": "6 โปรเจกต์ที่ใช้งานได้จริง แต่ละชิ้นคือแพ็กเกจที่สั่งได้บน Fastwork ตามขอบเขตและคุณภาพงานที่คุณจะได้รับ",
    "groups": {
      "web": {
        "label": "เว็บไซต์",
        "description": "แลนดิ้งเพจและเว็บหลายหน้า ออกแบบตามแบรนด์ สร้างด้วย Next.js"
      },
      "app": {
        "label": "ระบบ",
        "description": "ระบบหลังบ้าน แดชบอร์ด และ API สำหรับงานประจำวันของธุรกิจ"
      }
    },
    "tryHeading": "ลองทำดู",
    "tryLive": "ลองใช้งานจริง",
    "order": "สั่งซื้อบน Fastwork",
    "tiers": { "basic": "Basic", "standard": "Standard", "premium": "Premium" },
    "try": {
      "web-basic": ["เลื่อนดูเซลเพจทั้งหน้าบนมือถือ", "เลือกเซ็ตสินค้า แล้วกดปุ่มสั่งซื้อทาง LINE"],
      "web-standard": ["สลับดูหน้าแรก บริการ และติดต่อเรา", "กดส่งฟอร์มติดต่อโดยไม่กรอกข้อมูล เพื่อดูการตรวจสอบข้อมูล"],
      "web-premium": ["สลับภาษาเว็บไทย/อังกฤษ", "กรองห้องพักตามจำนวนผู้เข้าพัก", "เปิดดูแกลเลอรีภาพ"],
      "app-basic": ["ส่งคำขอ POST /orders แล้วดูผลตอบกลับ 201", "เปลี่ยนสถานะออเดอร์ แล้วดูตัวอย่างข้อความแจ้งเตือน LINE"],
      "app-standard": ["ล็อกอินด้วยบัญชีเดโมที่กรอกไว้ให้", "ค้นหาในตารางออเดอร์", "แก้จำนวนสต็อก แล้วดูป้ายเตือนสินค้าใกล้หมด"],
      "app-premium": ["จองคิวผ่านหน้าจอสไตล์ LINE", "เข้าฝั่งพนักงาน แล้วหาคิวของคุณในรายการวันนี้"]
    }
  },
```

- [ ] **Step 4: Create `components/hub/project-row.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatTHB, type Package } from "@/lib/packages";

export function ProjectRow({ pkg, index, locale, t }: { pkg: Package; index: number; locale: Locale; t: Dictionary }) {
  const flip = index % 2 === 1;
  return (
    <article
      data-testid={`package-${pkg.id}`}
      className="grid items-center gap-6 border-t border-rule py-12 md:grid-cols-[11fr_9fr] md:gap-12 lg:py-16"
    >
      <Link
        href={pkg.demoPath}
        prefetch={false}
        tabIndex={-1}
        aria-hidden
        className={`group block overflow-hidden rounded-xl border border-rule ${flip ? "md:order-2" : ""}`}
      >
        <Image
          src={`/thumbs/${pkg.id}.jpg`}
          alt=""
          width={1440}
          height={900}
          sizes="(min-width: 768px) 55vw, 100vw"
          className="aspect-[16/10] w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
        />
      </Link>
      <div className={flip ? "md:order-1" : ""}>
        <p aria-hidden className="font-display text-5xl font-extrabold tracking-[-0.04em] text-lime">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h4 className="display-heading mt-3 font-display text-2xl leading-tight font-extrabold tracking-[-0.02em] sm:text-3xl">
          {pkg.demoName[locale]}
        </h4>
        <p className="mt-6 text-xs font-semibold text-cream-muted">{t.work.tryHeading}</p>
        <ul className="mt-2 space-y-2">
          {t.work.try[pkg.id].map((item) => (
            <li key={item} className="flex gap-3 leading-relaxed">
              <span aria-hidden className="text-lime">
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 flex flex-wrap items-baseline gap-x-3">
          <span className="text-sm text-cream-muted">{t.work.tiers[pkg.tier]}</span>
          <span className="font-display text-3xl font-extrabold">{formatTHB(pkg.priceTHB)}</span>
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {pkg.scope[locale].map((item) => (
            <li key={item} className="rounded-md border border-rule px-2.5 py-1 text-xs text-cream-muted">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href={pkg.demoPath}
            prefetch={false}
            className="rounded-md bg-lime px-5 py-3 text-sm font-bold text-forest transition hover:bg-cream"
          >
            {t.work.tryLive}
          </Link>
          <a
            href={pkg.fastworkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-cream/25 px-5 py-3 text-sm font-semibold transition hover:border-cream"
          >
            {t.work.order}
          </a>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Create `components/hub/work-section.tsx`**

```tsx
import type { Dictionary, Locale } from "@/lib/i18n";
import { packages, packagesByService } from "@/lib/packages";
import { ProjectRow } from "./project-row";

export function WorkSection({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="work" className="scroll-mt-16 bg-forest text-cream">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <h2 className="display-heading font-display text-5xl leading-none font-extrabold tracking-[-0.04em] sm:text-7xl">
          {t.work.heading}
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream-muted">{t.work.intro}</p>
        {(["web", "app"] as const).map((service) => (
          <div key={service} className="mt-16">
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="display-heading font-display text-2xl font-extrabold text-lime">
                {t.work.groups[service].label}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-cream-muted">{t.work.groups[service].description}</p>
            </div>
            {packagesByService(service).map((pkg) => (
              <ProjectRow key={pkg.id} pkg={pkg} index={packages.indexOf(pkg)} locale={locale} t={t} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Wire it in and delete the old files**

In `app/[locale]/page.tsx`:
- Replace the import `import { ServicesSection } from "@/components/hub/services-section";` with `import { WorkSection } from "@/components/hub/work-section";`.
- Replace `<ServicesSection locale={locale} t={t} />` with `<WorkSection locale={locale} t={t} />`.

Then:

```bash
git rm components/hub/services-section.tsx components/hub/package-card.tsx
```

- [ ] **Step 7: Run all checks**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e hub smoke`
Expected: everything is clean and PASSES, in both e2e projects.

- [ ] **Step 8: Visual check**

Re-run the screenshot script from Task 2, Step 11. The full script and commands are repeated here.

Write `/private/tmp/claude-501/-Users-supa-projects-active-fastexample/ead8185e-2c39-435c-85ce-af2491f3439e/scratchpad/hub-shots.mjs` if it doesn't exist:

```js
import { chromium } from "@playwright/test";
const out = process.argv[2];
const browser = await chromium.launch();
for (const locale of ["en", "th"]) {
  for (const [name, width, height] of [["desk", 1440, 900], ["mob", 375, 812]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`http://localhost:3100/${locale}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, i = 0; y < total && i < 8; y += height, i++) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${out}/hub-${locale}-${name}-${i}.png` });
    }
    await page.close();
  }
}
await browser.close();
```

```bash
SP=/private/tmp/claude-501/-Users-supa-projects-active-fastexample/ead8185e-2c39-435c-85ce-af2491f3439e/scratchpad
pnpm build && (pnpm start --port 3100 >/dev/null 2>&1 &) && sleep 4
cp $SP/hub-shots.mjs ./.hub-shots.tmp.mjs && node ./.hub-shots.tmp.mjs $SP; rm ./.hub-shots.tmp.mjs
lsof -ti tcp:3100 | xargs kill
```

Read the screenshots that cover `#work` and check:
- **Desktop:** rows alternate image-left and image-right, numbered 01–06, with group labels "Websites" and "Systems" in lime.
- **Mobile:** the image sits above the text, with no cramped buttons.
- **Thai:** the Thai prompts wrap cleanly with readable line height.

Fix anything off and list the final screenshot paths in your report.

- [ ] **Step 9: Commit**

```bash
git add components/hub "app/[locale]/page.tsx" lib/i18n tests/unit/i18n.test.ts tests/e2e/hub.spec.ts
git commit -m "feat(hub): project rows with try-this prompts replace package cards

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Process timeline, merged About, and dropping the beige theme

**Files:**
- Rewrite: `components/hub/process-section.tsx`, `components/hub/about-section.tsx`
- Delete: `components/hub/stack-section.tsx`
- Modify: `app/[locale]/page.tsx`, `app/[locale]/layout.tsx` (body classes), `app/globals.css` (remove legacy tokens), `app/global-not-found.tsx` (forest styling), `lib/i18n/en.json`, `lib/i18n/th.json`
- Test: `tests/unit/i18n.test.ts`

**Interfaces:**
- Consumes: the tokens and `display-heading` from Task 2; `t.process.{heading,steps[]}` (existing).
- Produces:
  - `about.{heading,body,portfolio,stackHeading,stackBody}`. The `stack` key is removed.
  - After this task, `bg-paper`, `text-ink`, `text-muted`, `border-line`, `bg-accent` and `text-accent` no longer exist.

- [ ] **Step 1: Write the failing test**

In `tests/unit/i18n.test.ts`, add inside the `describe` block:

```ts
  it("about section carries the tech stack copy", () => {
    expect(en.about.stackHeading).toBe("Stack");
    expect(th.about.stackHeading).toBe("เครื่องมือที่ใช้");
    expect("stack" in en).toBe(false);
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test tests/unit/i18n.test.ts`
Expected: FAIL. `stackHeading` is undefined.

- [ ] **Step 3: Update the dictionaries**

In `lib/i18n/en.json`, delete the `"stack"` object and replace the `"about"` object with:

```json
  "about": {
    "heading": "Who's building it",
    "body": "I'm Supakorn (Ohm), a Computer Engineering student at SIIT, Thammasat University, and a full-stack developer in Bangkok. I've built internal business tools, AI systems and modern web interfaces, including as an AI Developer intern at Mizuhada Group and a UX/UI Researcher intern at BAKA Group.",
    "portfolio": "View personal portfolio",
    "stackHeading": "Stack",
    "stackBody": "Every demo on this page is built with the same tools I use for client work."
  },
```

In `lib/i18n/th.json`, delete `"stack"` and replace `"about"` with:

```json
  "about": {
    "heading": "ผู้พัฒนา",
    "body": "Supakorn (โอห์ม) นักศึกษาวิศวกรรมคอมพิวเตอร์ SIIT ธรรมศาสตร์ และนักพัฒนาเว็บแบบ Full-stack ในกรุงเทพฯ มีประสบการณ์สร้างเครื่องมือภายในองค์กร ระบบ AI และหน้าเว็บสมัยใหม่ เคยฝึกงานตำแหน่ง AI Developer ที่ Mizuhada Group และ UX/UI Researcher ที่ BAKA Group",
    "portfolio": "ดูพอร์ตโฟลิโอส่วนตัว",
    "stackHeading": "เครื่องมือที่ใช้",
    "stackBody": "ทุกเว็บตัวอย่างในหน้านี้สร้างด้วยชุดเครื่องมือเดียวกับที่ใช้ทำงานให้ลูกค้า"
  },
```

- [ ] **Step 4: Rewrite the two sections**

`components/hub/process-section.tsx`:

```tsx
import type { Dictionary } from "@/lib/i18n";

export function ProcessSection({ t }: { t: Dictionary }) {
  return (
    <section id="process" className="scroll-mt-16 border-t border-rule bg-forest text-cream">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <h2 className="display-heading font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-5xl">
          {t.process.heading}
        </h2>
        <ol className="mt-12 grid gap-8 lg:grid-cols-5 lg:gap-6">
          {t.process.steps.map((step, i) => (
            <li key={step.title} className="border-l border-rule pl-6 lg:border-t lg:border-l-0 lg:pt-6 lg:pl-0">
              <span className="font-display text-sm font-extrabold text-lime">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

`components/hub/about-section.tsx`:

```tsx
import type { Dictionary } from "@/lib/i18n";

const STACK = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Python", "PostgreSQL", "Supabase", "Vercel"];

export function AboutSection({ t }: { t: Dictionary }) {
  return (
    <section id="about" className="scroll-mt-16 border-t border-rule bg-forest text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[3fr_2fr] lg:py-24">
        <div>
          <h2 className="display-heading font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-5xl">
            {t.about.heading}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-cream-muted">{t.about.body}</p>
          <a
            href="https://supakornohm.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm font-semibold underline decoration-lime decoration-2 underline-offset-4 transition hover:text-lime"
          >
            {t.about.portfolio} ↗
          </a>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-cream-muted">{t.about.stackHeading}</h3>
          <p className="mt-2 text-sm leading-relaxed text-cream-muted">{t.about.stackBody}</p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-display text-2xl font-extrabold tracking-[-0.02em]">
            {STACK.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Wire in, delete Stack, drop the beige theme**

In `app/[locale]/page.tsx`, remove the `StackSection` import and the `<StackSection t={t} />` line. The `<main>` order becomes Hero, WorkSection, ProcessSection, AboutSection.

```bash
git rm components/hub/stack-section.tsx
```

In `app/[locale]/layout.tsx`, change the body to:

```tsx
      <body className="bg-forest font-sans text-cream antialiased">{children}</body>
```

In `app/globals.css`, delete the legacy block: the comment line `/* Legacy beige tokens … */` and the five `--color-paper`, `--color-ink`, `--color-muted`, `--color-line` and `--color-accent` lines.

Replace `app/global-not-found.tsx` with:

```tsx
import "./globals.css";
import Link from "next/link";

export const metadata = { title: "404 — SupaOhm" };

export default function GlobalNotFound() {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-forest font-sans text-cream antialiased">
        <main className="grid min-h-dvh place-items-center p-6 text-center">
          <div>
            <p className="font-display text-7xl font-extrabold tracking-[-0.04em] text-lime">404</p>
            <Link href="/en" className="mt-4 inline-block underline decoration-lime underline-offset-4">
              Back home · กลับหน้าแรก
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
```

Then confirm that nothing still uses the removed tokens:

```bash
grep -rnE "\b(bg|text|border|from|to|via|decoration)-(paper|ink|muted|line|accent)\b" app components
```

Expected: no output. (Demo files use CSS variables such as `--line` via `border-(--line)`, which do not match this pattern and are unaffected.)

- [ ] **Step 6: Run the full suite**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`
Expected: everything is clean and the FULL e2e suite (all specs, both projects) PASSES. That proves the demos are unaffected.

- [ ] **Step 7: Visual check of the whole page**

Run the screenshot script once more. The full script and commands are repeated here.

Write `/private/tmp/claude-501/-Users-supa-projects-active-fastexample/ead8185e-2c39-435c-85ce-af2491f3439e/scratchpad/hub-shots.mjs` if it doesn't exist:

```js
import { chromium } from "@playwright/test";
const out = process.argv[2];
const browser = await chromium.launch();
for (const locale of ["en", "th"]) {
  for (const [name, width, height] of [["desk", 1440, 900], ["mob", 375, 812]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`http://localhost:3100/${locale}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, i = 0; y < total && i < 8; y += height, i++) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${out}/hub-${locale}-${name}-${i}.png` });
    }
    await page.close();
  }
}
await browser.close();
```

```bash
SP=/private/tmp/claude-501/-Users-supa-projects-active-fastexample/ead8185e-2c39-435c-85ce-af2491f3439e/scratchpad
pnpm build && (pnpm start --port 3100 >/dev/null 2>&1 &) && sleep 4
cp $SP/hub-shots.mjs ./.hub-shots.tmp.mjs && node ./.hub-shots.tmp.mjs $SP; rm ./.hub-shots.tmp.mjs
lsof -ti tcp:3100 | xargs kill
```

Read every screenshot, at both locales and both sizes, and check:
- **Background:** the whole page is forest from header to footer, with no beige left.
- **Process:** a horizontal five-step row on desktop and a vertical list on mobile.
- **About:** the bio sits beside the stack word list on desktop.
- **CTA band:** lime, followed by the footer note.
- **404 page:** visit `http://localhost:3100/fr` and check that it renders forest with a lime "404".

Fix anything off and list the final screenshot paths in your report.

- [ ] **Step 8: Commit**

```bash
git add components/hub "app/[locale]/page.tsx" "app/[locale]/layout.tsx" app/globals.css app/global-not-found.tsx lib/i18n tests/unit/i18n.test.ts
git commit -m "feat(hub): dark process timeline, merged about/stack, drop beige theme

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
