# Hub Lineup + Compare Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hub's work/process/about sections with:
- equal service tiles and an Apple-style plan lineup,
- a per-service compare page at `/{locale}/compare`,
- a process section where each step shows what it produces,
- an about section built around a fact list.

**Architecture:**
- **Data:** service and plan data, including a per-service feature matrix, lives in `lib/packages.ts`. The hub lineup and the compare page both render from it, using a shared `SpecCell` and a shared client `ServiceTiles` tab list.
- **Panels:** the hub renders both lineups on the server and a small client `WorkTabs` toggles them.
- **Compare page:** a client `CompareView` reads `?service=` with `useSyncExternalStore`, the same pattern as `components/demo/demo-pill.tsx`, so it works under static export.
- **Screenshots:** a fan of real screenshots per plan, captured by `scripts/capture-thumbs.mjs`.

**Tech Stack:**
- Next.js 16.4 (App Router, `output: "export"`) on Cloudflare Workers static assets (`pnpm start` = `wrangler dev`)
- React 19, TypeScript strict, Tailwind CSS 4, lucide-react
- Vitest, Playwright (desktop 1440×900 and mobile 375×812), pnpm

**Spec:** `docs/superpowers/specs/2026-10-20-hub-lineup-compare-design.md`

## Global Constraints

### Copy and accessibility

- **Copy tone:** professional and client-focused. No boasting and no claims about other sellers.
- **Thai pronoun:** use only "เรา". Never ผม, ฉัน or ดิฉัน. A unit test enforces this.
- **No off-platform contact:** no email, LINE or phone for SupaOhm anywhere. No `mailto:`, `tel:` or `line.me`.
- **Fonts:**
  - No serif fonts.
  - Use only the fonts already loaded in `app/[locale]/layout.tsx`: Bricolage Grotesque 800 (`font-display`), Anuphan (`font-sans`), Kalam 700 and Itim (`--font-hand`, `--font-itim`).
  - No new fonts.
- **Accessibility and layout:**
  - AA text contrast.
  - No horizontal page overflow at 375px or 1440px (smoke test).
  - Visible keyboard focus.
  - `prefers-reduced-motion` respected.

### Build and dependencies

- **Static export stays:** `output: "export"`. Nothing may need a server: no `headers()`, `cookies()`, route handlers or server-side `searchParams`.
- **No new dependencies.**
- **Do not touch `app/demos/**`.**

### Banned visual treatments

- No 01–06 index numbers, all-caps labels, "·"-joined meta strings or "→" on buttons in the new sections.
- The process steps may show 1–5 because they are a real sequence.

### Service accents and buttons

- **Accents:** `web` = lime `#d7ff5c` (existing `--color-lime`); `app` = sky `#9fd8ff` (new `--color-sky` in `@theme`).
  - Applied through the CSS variable `--acc` via the classes `.acc-lime` and `.acc-sky`.
  - Used as `bg-(--acc)` and `text-(--acc)`.
- **Buttons:**
  - Lineup and compare buttons are pills (`rounded-full`). Primary is filled `bg-(--acc)` with `text-forest`; secondary is an accent outline.
  - Everything else on the site keeps 6px (`rounded-md`) buttons.

### Feature matrix (confirmed by the user, 2026-10-20)

Copy it exactly.

**Websites**

| Row | Basic | Standard | Premium |
|---|---|---|---|
| pages | 1 landing page | 3 pages | 5 pages |
| resp | ✓ | ✓ | ✓ |
| form | – | ✓ | ✓ |
| seo | ✓ | ✓ | ✓ |
| comps | – | – | ✓ |
| inter | – | – | ✓ |
| rev | 1 | 2 | 3 |
| src | ✓ | ✓ | ✓ |
| live | ✓ | ✓ | ✓ |

**Web apps**

| Row | Basic | Standard | Premium |
|---|---|---|---|
| screens | 1 backend module | 3 dashboard screens | 5 screens |
| mods | 1 | 2 | 3 |
| login | – | Basic login | Accounts and sign-in |
| charts | – | ✓ | ✓ |
| api | Up to 4 REST endpoints | Connected to your database | Backend APIs |
| db | ✓ | ✓ | ✓ |
| resp | – | – | ✓ |
| rev | 1 | 2 | 3 |
| src | ✓ | ✓ | ✓ |
| live | – | – | ✓ |

### Commits and the dev server

- **Commit trailer:** every commit message ends with exactly `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- **Git:** do not switch branches and do not push. The branch is `feat/hub-lineup-compare`.
- **Local server:** port 3100.
  - Start: `pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &)`, then wait until `curl -s -o /dev/null http://localhost:3100/en` succeeds.
  - Stop: `lsof -ti tcp:3100 | xargs kill`.
  - `pnpm test:e2e` builds and starts its own server on 3100, so stop yours first.

## File structure

| File | Responsibility |
|---|---|
| `lib/packages.ts` | Packages, services, compare rows, per-plan values, `serviceTiles(locale)`, helpers |
| `scripts/capture-thumbs.mjs` | Captures `public/thumbs/<id>.jpg` (1440×900) and `public/thumbs/pages/<id>-<n>.jpg` (640×400) |
| `components/hub/spec-cell.tsx` | Renders one compare value (count / bool / text). No hooks, so it's usable from server and client |
| `components/hub/plan-stack.tsx` | Fan of a plan's page screenshots |
| `components/hub/service-tiles.tsx` | Client tab list of service tiles: keyboard and `aria-*` |
| `components/hub/work-tabs.tsx` | Client: holds the selected service on the hub and toggles the server-rendered panels |
| `components/hub/lineup.tsx` | One service's lineup (three plan columns, aligned rows, Compare button) |
| `components/hub/work-section.tsx` | `#work`: heading + `WorkTabs` |
| `components/compare/compare-view.tsx` | Client: tiles, `?service=` sync, sticky header, row table |
| `app/[locale]/compare/page.tsx` | Compare route and metadata |
| `components/hub/process-section.tsx` | `#process`: five steps with artefacts |
| `components/hub/about-section.tsx` | `#about`: bio + fact list |

---

### Task 1: Service data model and plan screenshots

**Files:**
- Modify: `lib/packages.ts` (whole file; see Step 3)
- Modify: `scripts/capture-thumbs.mjs` (whole file; see Step 4)
- Create: `public/thumbs/pages/*.jpg` (18 files, generated)
- Regenerate: `public/thumbs/{web-basic,web-standard,web-premium,app-basic,app-standard,app-premium}.jpg`
  - PR #3 changed the resort and shop-admin fonts, so all six are recaptured.
- Modify: `README.md` (thumbnail section)
- Test: `tests/unit/packages.test.ts`

**Interfaces:**
- Produces (exports of `lib/packages.ts`, used by Tasks 2–4):
  - `type RowKind = "count" | "bool" | "text"`
  - `interface CompareRow { key: string; kind: RowKind; group?: Record<Locale, string>; label: Record<Locale, string> }`
  - `type RowValue = { n: number; unit: Record<Locale, string> } | boolean | Record<Locale, string>`. Text rows use `false` for "not included".
  - `Package` gains these fields:
    - `tagline: Record<Locale, string>`
    - `pages: string[]`: public paths like `/thumbs/pages/web-standard-1.jpg`, length = page/screen count
    - `values: Record<string, RowValue>`
    - `scope` stays until Task 2.
  - `interface Service { id: ServiceId; name; blurb; lede; sub (all Record<Locale, string>); accent: "lime" | "sky"; fastworkUrl: string; fan: string[]; rows: CompareRow[]; lineupRows: string[] }`
  - `const services: Service[]`, in the order `web`, `app`
  - `getService(id: ServiceId): Service`, which throws on unknown ids
  - `interface ServiceTile { id: ServiceId; name: string; blurb: string; from: string; count: number; fan: string[]; accent: "lime" | "sky" }`
  - `serviceTiles(locale: Locale): ServiceTile[]`
  - Unchanged: `packages`, `getPackage`, `packagesByService`, `formatTHB`, `FASTWORK_PROFILE_URL`, `ServiceId`, `Tier`, `PackageId`

- [ ] **Step 1: Write the failing tests**

Replace `tests/unit/packages.test.ts` with:

```ts
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatTHB,
  getPackage,
  getService,
  packages,
  packagesByService,
  serviceTiles,
  services,
} from "@/lib/packages";

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
        expect(p.tagline[locale]).not.toBe("");
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

describe("services", () => {
  it("has the two Fastwork services in order, each with three plans", () => {
    expect(services.map((s) => s.id)).toEqual(["web", "app"]);
    for (const s of services) expect(packagesByService(s.id)).toHaveLength(3);
  });

  it("getService finds by id and throws on unknown ids", () => {
    expect(getService("app").accent).toBe("sky");
    expect(getService("web").accent).toBe("lime");
    // @ts-expect-error unknown id
    expect(() => getService("nope")).toThrow();
  });

  it("picks four lineup rows that exist in the service's rows", () => {
    for (const s of services) {
      const keys = s.rows.map((r) => r.key);
      expect(new Set(keys).size).toBe(keys.length);
      expect(s.rows[0].group).toBeDefined();
      expect(s.lineupRows).toHaveLength(4);
      for (const k of s.lineupRows) expect(keys).toContain(k);
    }
  });

  it("gives every package exactly one value per row of its service, of the row's kind", () => {
    for (const p of packages) {
      const s = getService(p.service);
      expect(Object.keys(p.values).sort()).toEqual(s.rows.map((r) => r.key).sort());
      for (const row of s.rows) {
        const v = p.values[row.key];
        if (row.kind === "count") {
          expect(v).toMatchObject({ n: expect.any(Number), unit: { th: expect.any(String), en: expect.any(String) } });
        }
        if (row.kind === "bool") expect(typeof v).toBe("boolean");
        if (row.kind === "text") {
          expect(v === false || (typeof v === "object" && "th" in v && "en" in v)).toBe(true);
        }
      }
    }
  });

  it("shows one screenshot per page or screen the plan includes", () => {
    for (const p of packages) {
      const size = (p.values.pages ?? p.values.screens) as { n: number };
      expect(p.pages).toHaveLength(size.n);
    }
  });

  it("points every lineup and tile image at a file in public/", () => {
    const paths = [...packages.flatMap((p) => p.pages), ...services.flatMap((s) => s.fan)];
    for (const path of paths) expect(existsSync(join("public", path)), path).toBe(true);
  });

  it("matches the confirmed feature matrix", () => {
    const col = (service: "web" | "app", key: string) => packagesByService(service).map((p) => p.values[key]);
    expect(col("web", "form")).toEqual([false, true, true]);
    expect(col("web", "seo")).toEqual([true, true, true]);
    expect(col("web", "comps")).toEqual([false, false, true]);
    expect(col("web", "inter")).toEqual([false, false, true]);
    expect(col("web", "live")).toEqual([true, true, true]);
    expect(col("app", "charts")).toEqual([false, true, true]);
    expect(col("app", "db")).toEqual([true, true, true]);
    expect(col("app", "resp")).toEqual([false, false, true]);
    expect(col("app", "live")).toEqual([false, false, true]);
    expect(getPackage("app-basic").values.login).toBe(false);
    expect(getPackage("app-standard").values.login).toEqual({ th: "ล็อกอินพื้นฐาน", en: "Basic login" });
    expect(packagesByService("web").map((p) => (p.values.rev as { n: number }).n)).toEqual([1, 2, 3]);
  });

  it("builds tiles with the cheapest plan as the from-price", () => {
    expect(serviceTiles("en").map((t) => [t.id, t.name, t.from, t.count, t.accent])).toEqual([
      ["web", "Websites", "฿4,900", 3, "lime"],
      ["app", "Web apps", "฿5,900", 3, "sky"],
    ]);
    expect(serviceTiles("th").map((t) => t.name)).toEqual(["เว็บไซต์", "เว็บแอป"]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/packages.test.ts`
Expected: FAIL. `getService`, `services` and `serviceTiles` are not exported, and `tagline` is undefined.

- [ ] **Step 3: Rewrite `lib/packages.ts`**

Replace the whole file with the code below.
- The six package objects keep their existing `title`, `scope`, `demoName`, `demoPath` and `fastworkUrl` values verbatim; only `tagline`, `pages` and `values` are added.
- `scope` is removed in Task 2.

```ts
import type { Locale } from "@/lib/i18n/config";

export type ServiceId = "web" | "app";
export type Tier = "basic" | "standard" | "premium";
export type PackageId = `${ServiceId}-${Tier}`;

export type RowKind = "count" | "bool" | "text";

export interface CompareRow {
  key: string;
  kind: RowKind;
  /** Compare-page section heading; set on the first row of each group. */
  group?: Record<Locale, string>;
  label: Record<Locale, string>;
}

/** count → { n, unit }; bool → boolean; text → localized text, or false when the plan doesn't include it. */
export type RowValue = { n: number; unit: Record<Locale, string> } | boolean | Record<Locale, string>;

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
  tagline: Record<Locale, string>;
  /** Screenshots of the demo, one per page or screen the plan includes (scripts/capture-thumbs.mjs). */
  pages: string[];
  /** One value per row key of the package's service. */
  values: Record<string, RowValue>;
}

export interface Service {
  id: ServiceId;
  name: Record<Locale, string>;
  blurb: Record<Locale, string>;
  lede: Record<Locale, string>;
  sub: Record<Locale, string>;
  accent: "lime" | "sky";
  fastworkUrl: string;
  /** Three screenshots fanned out on the service tile. */
  fan: string[];
  rows: CompareRow[];
  /** Four row keys shown under each plan in the hub lineup. */
  lineupRows: string[];
}

export interface ServiceTile {
  id: ServiceId;
  name: string;
  blurb: string;
  from: string;
  count: number;
  fan: string[];
  accent: Service["accent"];
}

export const FASTWORK_PROFILE_URL = "https://fastwork.com/user/devohm";

const WEB_URL =
  "https://fastwork.com/user/devohm/gigs/i-will-build-a-responsive-website-or-landing-page-with-next-js-s.f879y5wiwf0nr2";
const APP_URL =
  "https://fastwork.com/user/devohm/gigs/i-will-build-a-custom-web-application-dashboard-or-backend-api-s.pu39xm3f7rrynh";

const l = (en: string, th: string): Record<Locale, string> => ({ th, en });
const count = (n: number, en: string, th: string): RowValue => ({ n, unit: l(en, th) });
const shots = (id: PackageId, n: number) => Array.from({ length: n }, (_, i) => `/thumbs/pages/${id}-${i + 1}.jpg`);

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
    tagline: l("One landing page that sells one product or campaign.", "แลนดิ้งเพจ 1 หน้า สำหรับขายสินค้าหรือแคมเปญเดียว"),
    pages: shots("web-basic", 1),
    values: {
      pages: count(1, "landing page", "แลนดิ้งเพจ"),
      resp: true,
      form: false,
      seo: true,
      comps: false,
      inter: false,
      rev: count(1, "revision", "ครั้ง"),
      src: true,
      live: true,
    },
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
    tagline: l("A small company site with a working contact form.", "เว็บบริษัทขนาดเล็ก พร้อมฟอร์มติดต่อที่ใช้งานได้จริง"),
    pages: shots("web-standard", 3),
    values: {
      pages: count(3, "pages", "หน้า"),
      resp: true,
      form: true,
      seo: true,
      comps: false,
      inter: false,
      rev: count(2, "revisions", "ครั้ง"),
      src: true,
      live: true,
    },
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
    tagline: l(
      "A full brand site with reusable sections and richer interactions.",
      "เว็บแบรนด์เต็มรูปแบบ มีส่วนประกอบใช้ซ้ำได้และอินเทอร์แอกชันมากขึ้น",
    ),
    pages: shots("web-premium", 5),
    values: {
      pages: count(5, "pages", "หน้า"),
      resp: true,
      form: true,
      seo: true,
      comps: true,
      inter: true,
      rev: count(3, "revisions", "ครั้ง"),
      src: true,
      live: true,
    },
  },
  {
    id: "app-basic",
    service: "app",
    tier: "basic",
    priceTHB: 5900,
    title: { th: "เว็บแอป · Basic", en: "Web app · Basic" },
    scope: {
      th: ["ระบบหลังบ้าน 1 โมดูล", "REST API สูงสุด 4 endpoint", "ตรวจสอบข้อมูลและเชื่อมฐานข้อมูล", "แก้ไข 1 ครั้ง"],
      en: ["One small backend module", "Up to 4 REST endpoints", "Validation & database connection", "1 revision"],
    },
    demoName: { th: "Orders API — เอกสาร API ทดลองยิงได้", en: "Orders API — interactive API docs" },
    demoPath: "/demos/orders-api",
    fastworkUrl: APP_URL,
    tagline: l("One backend module with a small REST API.", "ระบบหลังบ้าน 1 โมดูล พร้อม REST API ขนาดเล็ก"),
    pages: shots("app-basic", 1),
    values: {
      screens: count(1, "backend module", "โมดูลหลังบ้าน"),
      mods: count(1, "data module", "โมดูลข้อมูล"),
      login: false,
      charts: false,
      api: l("Up to 4 REST endpoints", "REST API สูงสุด 4 endpoint"),
      db: true,
      resp: false,
      rev: count(1, "revision", "ครั้ง"),
      src: true,
      live: false,
    },
  },
  {
    id: "app-standard",
    service: "app",
    tier: "standard",
    priceTHB: 14900,
    title: { th: "เว็บแอป · Standard", en: "Web app · Standard" },
    scope: {
      th: ["แดชบอร์ดสูงสุด 3 หน้าจอ", "ระบบล็อกอินพื้นฐาน", "ข้อมูล 2 โมดูล", "ตารางและกราฟ", "แก้ไข 2 ครั้ง"],
      en: ["Up to 3 dashboard screens", "Basic login", "2 data modules", "Tables & simple charts", "2 revisions"],
    },
    demoName: { th: "ร้านดี — ระบบหลังร้าน", en: "Ran Dee — shop back office" },
    demoPath: "/demos/shop-admin",
    fastworkUrl: APP_URL,
    tagline: l("An admin dashboard with login, tables and charts.", "แดชบอร์ดหลังบ้าน พร้อมล็อกอิน ตาราง และกราฟ"),
    pages: shots("app-standard", 3),
    values: {
      screens: count(3, "dashboard screens", "หน้าจอแดชบอร์ด"),
      mods: count(2, "data modules", "โมดูลข้อมูล"),
      login: l("Basic login", "ล็อกอินพื้นฐาน"),
      charts: true,
      api: l("Connected to your database", "เชื่อมต่อฐานข้อมูลของคุณ"),
      db: true,
      resp: false,
      rev: count(2, "revisions", "ครั้ง"),
      src: true,
      live: false,
    },
  },
  {
    id: "app-premium",
    service: "app",
    tier: "premium",
    priceTHB: 29900,
    title: { th: "เว็บแอป · Premium", en: "Web app · Premium" },
    scope: {
      th: ["MVP สูงสุด 5 หน้าจอ", "ระบบยืนยันตัวตน", "ข้อมูลหลักสูงสุด 3 โมดูล", "รองรับทุกอุปกรณ์", "แก้ไข 3 ครั้ง"],
      en: ["MVP with up to 5 screens", "Authentication", "Up to 3 core data modules", "Responsive", "3 revisions"],
    },
    demoName: { th: "ลูมิ คลินิก — ระบบจองคิว", en: "Lumi Clinic — booking system" },
    demoPath: "/demos/clinic-booking",
    fastworkUrl: APP_URL,
    tagline: l(
      "A scoped MVP with a customer side, a staff side and accounts.",
      "MVP ครบทั้งฝั่งลูกค้า ฝั่งพนักงาน และระบบบัญชีผู้ใช้",
    ),
    pages: shots("app-premium", 5),
    values: {
      screens: count(5, "screens", "หน้าจอ"),
      mods: count(3, "data modules", "โมดูลข้อมูล"),
      login: l("Accounts and sign-in", "ระบบบัญชีและการเข้าสู่ระบบ"),
      charts: true,
      api: l("Backend APIs", "Backend API"),
      db: true,
      resp: true,
      rev: count(3, "revisions", "ครั้ง"),
      src: true,
      live: true,
    },
  },
];

const delivery: CompareRow[] = [
  { key: "rev", kind: "count", group: l("Delivery", "การส่งมอบ"), label: l("Revisions", "จำนวนครั้งที่แก้ไข") },
  { key: "src", kind: "bool", label: l("Full source code", "ซอร์สโค้ดทั้งหมด") },
  { key: "live", kind: "bool", label: l("Help going live", "ช่วยนำขึ้นออนไลน์") },
];

export const services: Service[] = [
  {
    id: "web",
    name: l("Websites", "เว็บไซต์"),
    blurb: l("Landing pages and company sites, built in Next.js.", "แลนดิ้งเพจและเว็บบริษัท สร้างด้วย Next.js"),
    lede: l("Websites and landing pages", "เว็บไซต์และแลนดิ้งเพจ"),
    sub: l(
      "The same build at three sizes: more pages, more interaction and more revisions as you go up.",
      "งานแบบเดียวกันในสามขนาด ยิ่งแพ็กเกจสูง ยิ่งได้จำนวนหน้า อินเทอร์แอกชัน และรอบแก้ไขมากขึ้น",
    ),
    accent: "lime",
    fastworkUrl: WEB_URL,
    fan: ["/thumbs/pages/web-premium-1.jpg", "/thumbs/pages/web-premium-3.jpg", "/thumbs/pages/web-standard-1.jpg"],
    rows: [
      { key: "pages", kind: "count", group: l("Size", "ขนาดงาน"), label: l("Pages", "จำนวนหน้า") },
      {
        key: "resp",
        kind: "bool",
        group: l("Features", "ฟีเจอร์"),
        label: l("Mobile, tablet and desktop", "รองรับมือถือ แท็บเล็ต และเดสก์ท็อป"),
      },
      { key: "form", kind: "bool", label: l("Contact form", "ฟอร์มติดต่อ") },
      { key: "seo", kind: "bool", label: l("Basic on-page SEO", "SEO พื้นฐาน") },
      { key: "comps", kind: "bool", label: l("Reusable components", "คอมโพเนนต์ใช้ซ้ำได้") },
      { key: "inter", kind: "bool", label: l("Extra interactions", "อินเทอร์แอกชันเพิ่มเติม") },
      ...delivery,
    ],
    lineupRows: ["pages", "form", "comps", "rev"],
  },
  {
    id: "app",
    name: l("Web apps", "เว็บแอป"),
    blurb: l("Dashboards, back offices and APIs for daily work.", "แดชบอร์ด ระบบหลังบ้าน และ API สำหรับงานประจำวัน"),
    lede: l("Web apps, dashboards and APIs", "เว็บแอป แดชบอร์ด และ API"),
    sub: l(
      "The same build at three sizes: from one backend module up to a full MVP with accounts.",
      "งานแบบเดียวกันในสามขนาด ตั้งแต่ระบบหลังบ้าน 1 โมดูล ไปจนถึง MVP ที่มีระบบบัญชีผู้ใช้",
    ),
    accent: "sky",
    fastworkUrl: APP_URL,
    fan: ["/thumbs/pages/app-premium-2.jpg", "/thumbs/pages/app-standard-1.jpg", "/thumbs/pages/app-basic-1.jpg"],
    rows: [
      { key: "screens", kind: "count", group: l("Size", "ขนาดงาน"), label: l("Screens", "จำนวนหน้าจอ") },
      { key: "mods", kind: "count", label: l("Data modules", "โมดูลข้อมูล") },
      { key: "login", kind: "text", group: l("Features", "ฟีเจอร์"), label: l("Login", "ระบบล็อกอิน") },
      { key: "charts", kind: "bool", label: l("Tables and charts", "ตารางและกราฟ") },
      { key: "api", kind: "text", label: l("API", "API") },
      { key: "db", kind: "bool", label: l("Validation and database", "ตรวจสอบข้อมูลและฐานข้อมูล") },
      { key: "resp", kind: "bool", label: l("Works on phones", "ใช้งานบนมือถือได้") },
      ...delivery,
    ],
    lineupRows: ["screens", "login", "charts", "rev"],
  },
];

export function getPackage(id: PackageId): Package {
  const pkg = packages.find((p) => p.id === id);
  if (!pkg) throw new Error(`Unknown package: ${id}`);
  return pkg;
}

export function getService(id: ServiceId): Service {
  const service = services.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}

export function packagesByService(service: ServiceId): Package[] {
  return packages.filter((p) => p.service === service);
}

export function formatTHB(n: number): string {
  return `฿${new Intl.NumberFormat("en-US").format(n)}`;
}

export function serviceTiles(locale: Locale): ServiceTile[] {
  return services.map((s) => {
    const plans = packagesByService(s.id);
    return {
      id: s.id,
      name: s.name[locale],
      blurb: s.blurb[locale],
      from: formatTHB(Math.min(...plans.map((p) => p.priceTHB))),
      count: plans.length,
      fan: s.fan,
      accent: s.accent,
    };
  });
}
```

- [ ] **Step 4: Extend the capture script**

Replace `scripts/capture-thumbs.mjs` with:

```js
// Usage: pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
//        node scripts/capture-thumbs.mjs http://localhost:3100
//        lsof -ti tcp:3100 | xargs kill
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3100";

// Hero wall and Fastwork covers: one 1440×900 shot per package.
const thumbs = {
  "web-basic": "/demos/sale-page",
  "web-standard": "/demos/company",
  "web-premium": "/demos/resort",
  "app-basic": "/demos/orders-api",
  "app-standard": "/demos/shop-admin",
  "app-premium": "/demos/clinic-booking/book",
};

// Hub lineup fans: every page a plan includes, at 640×400. Keep in step with `pages` in lib/packages.ts.
const pages = {
  "web-basic": ["/demos/sale-page"],
  "web-standard": ["/demos/company", "/demos/company/services", "/demos/company/contact"],
  "web-premium": ["/demos/resort", "/demos/resort/rooms", "/demos/resort/gallery", "/demos/resort/about", "/demos/resort/booking"],
  "app-basic": ["/demos/orders-api"],
  "app-standard": ["/demos/shop-admin", "/demos/shop-admin/orders", "/demos/shop-admin/stock"],
  "app-premium": [
    "/demos/clinic-booking/book",
    "/demos/clinic-booking/admin",
    "/demos/clinic-booking/admin/customers",
    "/demos/clinic-booking/admin/services",
    "/demos/clinic-booking/admin/reports",
  ],
};

await mkdir("public/thumbs/pages", { recursive: true });
const browser = await chromium.launch();

async function openPage(viewport, deviceScaleFactor) {
  const context = await browser.newContext({ viewport, deviceScaleFactor });
  await context.addInitScript(() => {
    localStorage.setItem("demo:shop-admin:session", "true");
    localStorage.setItem("demo:clinic:session", "true");
  });
  const page = await context.newPage();
  // Pin the browser clock to today at 10:30 local, so time-of-day UI (the clinic
  // chat's timestamps, open slots) looks like business hours whenever we capture.
  const fixed = new Date();
  fixed.setHours(10, 30, 0, 0);
  await page.clock.setFixedTime(fixed);
  return page;
}

async function shoot(page, path, file) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: '[data-testid="demo-pill"]{display:none!important}' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: file, type: "jpeg", quality: 82 });
  console.log(`captured ${file}`);
}

const large = await openPage({ width: 1440, height: 900 }, 1);
for (const [id, path] of Object.entries(thumbs)) await shoot(large, path, `public/thumbs/${id}.jpg`);

const small = await openPage({ width: 1280, height: 800 }, 0.5);
for (const [id, list] of Object.entries(pages)) {
  for (const [i, path] of list.entries()) await shoot(small, path, `public/thumbs/pages/${id}-${i + 1}.jpg`);
}
await browser.close();
```

- [ ] **Step 5: Capture the screenshots**

Run:
```bash
lsof -ti tcp:3100 | xargs kill 2>/dev/null; pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &)
for i in $(seq 1 40); do curl -s -o /dev/null http://localhost:3100/en && break; sleep 1; done
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
ls public/thumbs/pages | wc -l
```
Expected: 24 "captured …" lines, then `18`.

Open (Read) these four images and confirm each shows real demo content, with no blank page, no login screen and no demo pill:
- `public/thumbs/pages/web-premium-1.jpg`, which uses the resort's new Mitr headings
- `public/thumbs/pages/app-standard-2.jpg`
- `public/thumbs/pages/app-premium-5.jpg`
- `public/thumbs/web-premium.jpg`

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm test && pnpm typecheck && pnpm lint`
Expected: all unit tests PASS (packages.test.ts now has 13 tests); typecheck and lint are clean.

- [ ] **Step 7: Update the README thumbnail note**

In `README.md`, replace the line `Screenshots land in `public/thumbs/` and can be uploaded as Fastwork listing covers.` with:

```markdown
Screenshots land in `public/thumbs/` (hero wall, Fastwork covers) and `public/thumbs/pages/` (one per page of each plan, used by the hub lineup). Re-run after changing a demo's look.
```

- [ ] **Step 8: Commit**

```bash
git add lib/packages.ts scripts/capture-thumbs.mjs public/thumbs tests/unit/packages.test.ts README.md
git commit -m "feat(packages): services, compare rows and per-plan screenshots

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Service tiles and plan lineup on the hub

**Files:**
- Modify: `app/globals.css` (add the `--color-sky` token and accent classes)
- Create: `components/hub/spec-cell.tsx`, `components/hub/plan-stack.tsx`, `components/hub/service-tiles.tsx`, `components/hub/work-tabs.tsx`, `components/hub/lineup.tsx`
- Modify: `components/hub/work-section.tsx` (whole file)
- Delete: `components/hub/project-row.tsx`
- Modify: `lib/packages.ts` (remove `scope`)
- Modify: `lib/i18n/en.json`, `lib/i18n/th.json` (`work` block)
- Test: `tests/unit/i18n.test.ts`, `tests/e2e/hub.spec.ts`

**Interfaces:**
- Consumes (Task 1): `services`, `Service`, `ServiceTile`, `serviceTiles(locale)`, `packagesByService`, `formatTHB`, `CompareRow`, `RowValue`, plus `Package.tagline`, `Package.pages` and `Package.values`.
- Produces (used by Task 3):
  - `SpecCell({ row, value, locale, yes, no }: { row: CompareRow; value: RowValue; locale: Locale; yes: string; no: string })`. No hooks.
  - `ServiceTiles(props: { idPrefix: string; tiles: ServiceTile[]; selected: ServiceId; onSelect: (id: ServiceId) => void; label: string; plansFrom: string; compact?: boolean })`. It's a client component.
    - Tab ids are `tab-${idPrefix}-${id}`, and each tile controls `panel-${idPrefix}-${id}`.
  - CSS: `.acc-lime` and `.acc-sky` set `--acc`; the Tailwind color `sky` is `#9fd8ff`.
  - Dictionary keys under `work`: `heading`, `servicesLabel`, `plansFrom` ("{count} … {price}"), `tryDemo`, `order`, `demo` ("… {name}"), `compare`, `included`, `notIncluded` and `tiers.{basic,standard,premium}`.

- [ ] **Step 1: Write the failing e2e tests**

Replace `tests/e2e/hub.spec.ts` with the file below. The last five tests are the existing ones, unchanged.

```ts
import { expect, test } from "@playwright/test";
import { packagesByService } from "../../lib/packages";

const price = (n: number) => `฿${n.toLocaleString("en-US")}`;

test("service tiles switch between the website and web app lineups", async ({ page }) => {
  await page.goto("/en");
  const web = page.getByRole("tab", { name: /Websites/ });
  const app = page.getByRole("tab", { name: /Web apps/ });
  await expect(web).toHaveAttribute("aria-selected", "true");
  for (const pkg of packagesByService("web")) await expect(page.getByTestId(`plan-${pkg.id}`)).toBeVisible();
  for (const pkg of packagesByService("app")) await expect(page.getByTestId(`plan-${pkg.id}`)).toBeHidden();
  await app.click();
  await expect(app).toHaveAttribute("aria-selected", "true");
  for (const pkg of packagesByService("app")) await expect(page.getByTestId(`plan-${pkg.id}`)).toBeVisible();
  for (const pkg of packagesByService("web")) await expect(page.getByTestId(`plan-${pkg.id}`)).toBeHidden();
});

test("every plan shows its price, demo link and Fastwork link", async ({ page }) => {
  await page.goto("/en");
  for (const [service, tab] of [["web", /Websites/], ["app", /Web apps/]] as const) {
    await page.getByRole("tab", { name: tab }).click();
    for (const pkg of packagesByService(service)) {
      const plan = page.getByTestId(`plan-${pkg.id}`);
      await expect(plan).toContainText(price(pkg.priceTHB));
      await expect(plan.getByRole("link", { name: "Try the demo" })).toHaveAttribute("href", pkg.demoPath);
      await expect(plan.getByRole("link", { name: /Order on Fastwork/ })).toHaveAttribute("href", pkg.fastworkUrl);
    }
  }
});

test("each plan fans out one real screenshot per page it includes", async ({ page }) => {
  await page.goto("/en");
  for (const pkg of packagesByService("web")) {
    const imgs = page.getByTestId(`plan-${pkg.id}`).locator("img");
    await expect(imgs).toHaveCount(pkg.pages.length);
    for (const img of await imgs.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    }
  }
});

test("arrow keys move between service tiles", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("tab", { name: /Websites/ }).focus();
  await page.keyboard.press("ArrowRight");
  const app = page.getByRole("tab", { name: /Web apps/ });
  await expect(app).toHaveAttribute("aria-selected", "true");
  await expect(app).toBeFocused();
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: /Websites/ })).toBeFocused();
});

test("compare button links to the compare page for the shown service", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("tabpanel").getByRole("link", { name: "Compare plans" })).toHaveAttribute(
    "href",
    "/en/compare?service=web",
  );
  await page.getByRole("tab", { name: /Web apps/ }).click();
  await expect(page.getByRole("tabpanel").getByRole("link", { name: "Compare plans" })).toHaveAttribute(
    "href",
    "/en/compare?service=app",
  );
});

test("Thai lineup uses Thai labels", async ({ page }) => {
  await page.goto("/th");
  await expect(page.getByRole("tab", { name: /เว็บไซต์/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("plan-web-basic").getByRole("link", { name: "ลองเดโม่" })).toHaveAttribute(
    "href",
    "/demos/sale-page",
  );
});

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
  const wall = page.locator(".hero-wall");
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(wall).toHaveAttribute("data-paused", "true");
  const states = () =>
    page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => (a.effect as KeyframeEffect).target?.closest(".hero-wall"))
        .map((a) => a.playState),
    );
  expect(await states()).toEqual(["paused", "paused", "paused"]);
  await page.getByRole("button", { name: "Play motion" }).click();
  await expect(wall).not.toHaveAttribute("data-paused");
  expect(await states()).toEqual(["running", "running", "running"]);
  await expect(page.getByRole("button", { name: "Pause motion" })).toBeVisible();
});

test("header hire button goes to the Fastwork profile", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("banner").getByRole("link", { name: "Hire on Fastwork" })).toHaveAttribute(
    "href",
    "https://fastwork.com/user/devohm",
  );
});

test("hero wall has no empty bands at any point of the loop", async ({ page }) => {
  await page.goto("/en");
  await page.waitForLoadState("networkidle");
  for (const time of [0, 10000, 20000, 30000, 39000]) {
    const misses = await page.evaluate((t) => {
      const wall = document.querySelector(".hero-wall") as HTMLElement;
      const anims = document
        .getAnimations()
        .filter((a) => (a.effect as KeyframeEffect).target?.closest(".hero-wall"));
      for (const a of anims) {
        a.pause();
        a.currentTime = t;
      }
      const r = wall.getBoundingClientRect();
      const top = Math.max(r.top, 0);
      const bottom = Math.min(r.bottom, window.innerHeight);
      const missed: string[] = [];
      for (const fx of [0.08, 0.5, 0.92]) {
        for (let i = 0; i <= 8; i++) {
          const x = r.left + r.width * fx;
          const y = top + 2 + ((bottom - top - 4) * i) / 8;
          // Probe a few px apart so a point inside the margin between two screenshots still counts.
          const hit = [0, 20, -20, 40, -40].some((dy) =>
            document.elementsFromPoint(x, y + dy).some((el) => el.tagName === "IMG" && wall.contains(el)),
          );
          if (!hit) missed.push(`${Math.round(x)},${Math.round(y)}`);
        }
      }
      return missed;
    }, time);
    expect(misses, `uncovered points at t=${time}ms`).toEqual([]);
  }
});
```

- [ ] **Step 2: Update the i18n unit tests**

In `tests/unit/i18n.test.ts`:
1. Remove the `import { packages } from "@/lib/packages";` line.
2. Delete the whole test `it("has 2–3 'try this' prompts for every package", …)`.
3. Replace the test `it("returns the dictionary per locale", …)` with:

```ts
  it("returns the dictionary per locale", () => {
    expect(getDictionary("en").work.tryDemo).toBe("Try the demo");
    expect(getDictionary("th").work.tryDemo).toBe("ลองเดโม่");
  });

  it("lineup copy keeps its placeholders", () => {
    for (const dict of [en, th]) {
      expect(dict.work.plansFrom).toContain("{count}");
      expect(dict.work.plansFrom).toContain("{price}");
      expect(dict.work.demo).toContain("{name}");
    }
  });
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm test tests/unit/i18n.test.ts`
Expected: FAIL. `work.tryDemo`, `plansFrom` and `demo` don't exist yet.

The e2e tests are run in Step 9.

- [ ] **Step 4: Replace the `work` block in both dictionaries**

In `lib/i18n/en.json`, replace the entire `"work": { … }` object (from `"heading": "The work"` through the closing brace of `"try"`) with:

```json
  "work": {
    "heading": "The work",
    "servicesLabel": "Services",
    "plansFrom": "{count} plans, from {price}",
    "tryDemo": "Try the demo",
    "order": "Order on Fastwork",
    "demo": "Demo: {name}",
    "compare": "Compare plans",
    "included": "Included",
    "notIncluded": "Not included",
    "tiers": {
      "basic": "Basic",
      "standard": "Standard",
      "premium": "Premium"
    }
  },
```

In `lib/i18n/th.json`, replace the entire `"work": { … }` object with:

```json
  "work": {
    "heading": "ผลงาน",
    "servicesLabel": "บริการ",
    "plansFrom": "{count} แพ็กเกจ เริ่มต้น {price}",
    "tryDemo": "ลองเดโม่",
    "order": "สั่งซื้อบน Fastwork",
    "demo": "เดโม่: {name}",
    "compare": "เปรียบเทียบแพ็กเกจ",
    "included": "มีให้",
    "notIncluded": "ไม่มี",
    "tiers": {
      "basic": "Basic",
      "standard": "Standard",
      "premium": "Premium"
    }
  },
```

- [ ] **Step 5: Add the accent token and classes to `app/globals.css`**

Inside the existing `@theme { … }` block, after `--color-lime: #d7ff5c;`, add:

```css
  --color-sky: #9fd8ff;
```

At the end of the file, append:

```css
/* Service accent: lime for websites, sky for web apps. Read by bg-(--acc), text-(--acc), border-(--acc). */
.acc-lime {
  --acc: var(--color-lime);
}
.acc-sky {
  --acc: var(--color-sky);
}
```

- [ ] **Step 6: Create the shared pieces**

`components/hub/spec-cell.tsx`:

```tsx
import { Check, Minus } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { CompareRow, RowValue } from "@/lib/packages";

// One feature value, shared by the hub lineup and the compare page. Colour comes from --acc.
export function SpecCell({
  row,
  value,
  locale,
  yes,
  no,
}: {
  row: CompareRow;
  value: RowValue;
  locale: Locale;
  yes: string;
  no: string;
}) {
  if (typeof value === "object" && "n" in value) {
    return (
      <>
        <span className="block font-display text-3xl leading-none font-extrabold text-(--acc)">{value.n}</span>
        <span className="mt-1 block text-sm leading-snug text-cream-muted">{value.unit[locale]}</span>
      </>
    );
  }
  const included = value !== false;
  const text = typeof value === "object" ? value[locale] : row.label[locale];
  return (
    <>
      {included ? (
        <Check aria-hidden strokeWidth={2.4} className="mx-auto size-[22px] text-(--acc)" />
      ) : (
        <Minus aria-hidden strokeWidth={2.2} className="mx-auto size-[22px] text-cream/25" />
      )}
      <span className="sr-only">{included ? yes : no}: </span>
      <span className="mt-1 block text-sm leading-snug text-cream-muted">{text}</span>
    </>
  );
}
```

`components/hub/plan-stack.tsx`:

```tsx
import Image from "next/image";

// A plan's pages fanned out: 1, 3 or 5 screenshots, so the bigger plan visibly holds more.
export function PlanStack({ pages, className = "" }: { pages: string[]; className?: string }) {
  const mid = (pages.length - 1) / 2;
  return (
    <div aria-hidden className={`relative ${className}`}>
      {pages.map((src, i) => {
        const o = i - mid;
        return (
          <div
            key={src}
            className="absolute bottom-0 left-1/2 aspect-[16/10] w-[58%] origin-bottom overflow-hidden rounded-md bg-white shadow-[0_18px_40px_#0009,0_0_0_1px_#ffffff1a]"
            style={{
              transform: `translateX(calc(-50% + ${o * 34}px)) translateY(${Math.abs(o) * 10}px) rotate(${o * 7}deg)`,
              zIndex: 10 - Math.abs(o),
            }}
          >
            <Image
              src={src}
              alt=""
              width={640}
              height={400}
              sizes="(min-width: 768px) 20vw, 50vw"
              className="h-full w-full object-cover object-top"
            />
          </div>
        );
      })}
    </div>
  );
}
```

`components/hub/service-tiles.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useRef, type KeyboardEvent } from "react";
import type { ServiceId, ServiceTile } from "@/lib/packages";

// Equal, full-size tile per Fastwork service, built as an ARIA tab list (arrow keys, Home, End).
export function ServiceTiles({
  idPrefix,
  tiles,
  selected,
  onSelect,
  label,
  plansFrom,
  compact = false,
}: {
  idPrefix: string;
  tiles: ServiceTile[];
  selected: ServiceId;
  onSelect: (id: ServiceId) => void;
  label: string;
  plansFrom: string;
  compact?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent, i: number) {
    const last = tiles.length - 1;
    const next =
      e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    onSelect(tiles[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className="grid grid-cols-2 gap-3 md:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] md:gap-4"
    >
      {tiles.map((tile, i) => {
        const on = tile.id === selected;
        const [before, after] = plansFrom.replace("{count}", String(tile.count)).split("{price}");
        return (
          <button
            key={tile.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${idPrefix}-${tile.id}`}
            aria-selected={on}
            aria-controls={`panel-${idPrefix}-${tile.id}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(tile.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`acc-${tile.accent} group relative isolate flex flex-col overflow-hidden rounded-[18px] p-4 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--acc) sm:p-6 ${
              compact ? "min-h-[120px]" : "min-h-[150px] md:min-h-[210px]"
            } ${on ? "bg-(--acc) text-forest" : "bg-forest-2 text-cream ring-1 ring-rule ring-inset hover:ring-cream/40"}`}
          >
            <span
              className={`relative z-10 font-display leading-none font-extrabold tracking-[-0.04em] ${
                compact ? "text-xl sm:text-2xl" : "max-w-[9ch] text-2xl md:text-[34px]"
              }`}
            >
              {tile.name}
            </span>
            {!compact && (
              <span className="relative z-10 mt-3 hidden max-w-[22ch] text-sm leading-relaxed opacity-80 md:block">
                {tile.blurb}
              </span>
            )}
            <span className="relative z-10 mt-auto pt-5 text-xs font-semibold sm:text-sm">
              {before}
              <span className="font-display text-base font-extrabold tracking-[-0.02em] sm:text-xl">{tile.from}</span>
              {after}
            </span>
            <span
              aria-hidden
              className={`absolute -right-10 -bottom-6 z-0 hidden h-[72%] w-[55%] transition-transform duration-500 group-hover:-translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 sm:block md:w-[min(46%,300px)] ${
                on ? "-translate-y-2 motion-reduce:translate-y-0" : ""
              }`}
            >
              {tile.fan.map((src, j) => (
                <span
                  key={src}
                  className="absolute right-0 bottom-0 block aspect-[16/10] w-[88%] overflow-hidden rounded-md bg-white shadow-[0_10px_30px_#0008]"
                  style={{ transform: `translate(${-j * 26}px, ${-j * 18}px) rotate(${-j * 6}deg)`, zIndex: 3 - j }}
                >
                  <Image src={src} alt="" width={640} height={400} sizes="300px" className="h-full w-full object-cover object-top" />
                </span>
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

`components/hub/work-tabs.tsx`:

```tsx
"use client";

import { useState, type ReactNode } from "react";
import type { ServiceId, ServiceTile } from "@/lib/packages";
import { ServiceTiles } from "./service-tiles";

// Holds the selected service on the hub. The lineups are server-rendered and passed in as panels.
export function WorkTabs({
  tiles,
  panels,
  label,
  plansFrom,
}: {
  tiles: ServiceTile[];
  panels: ReactNode[];
  label: string;
  plansFrom: string;
}) {
  const [selected, setSelected] = useState<ServiceId>(tiles[0].id);
  return (
    <>
      <ServiceTiles
        idPrefix="work"
        tiles={tiles}
        selected={selected}
        onSelect={setSelected}
        label={label}
        plansFrom={plansFrom}
      />
      {tiles.map((tile, i) => (
        <div
          key={tile.id}
          role="tabpanel"
          id={`panel-work-${tile.id}`}
          aria-labelledby={`tab-work-${tile.id}`}
          hidden={tile.id !== selected}
          className="mt-14"
        >
          {panels[i]}
        </div>
      ))}
    </>
  );
}
```

- [ ] **Step 7: Create the lineup and rewrite the work section**

`components/hub/lineup.tsx`:

```tsx
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatTHB, packagesByService, type Package, type Service } from "@/lib/packages";
import { PlanStack } from "./plan-stack";
import { SpecCell } from "./spec-cell";

// One service's plans side by side. On md+ each column is a subgrid, so the same row lines up across plans.
export function Lineup({ service, locale, t }: { service: Service; locale: Locale; t: Dictionary }) {
  return (
    <div className={`acc-${service.accent}`}>
      <h3 className="display-heading font-display text-3xl leading-tight font-extrabold tracking-[-0.03em]">
        {service.lede[locale]}
      </h3>
      <p className="mt-2 max-w-[60ch] leading-relaxed text-cream-muted">{service.sub[locale]}</p>
      <div className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-x-7 md:gap-y-0 md:overflow-visible md:px-0 md:pb-0">
        {packagesByService(service.id).map((pkg) => (
          <PlanCard key={pkg.id} pkg={pkg} service={service} locale={locale} t={t} />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Link
          href={`/${locale}/compare?service=${service.id}`}
          prefetch={false}
          className="rounded-full border border-cream/40 px-6 py-3 font-semibold transition hover:border-cream"
        >
          {t.work.compare}
        </Link>
      </div>
    </div>
  );
}

function PlanCard({ pkg, service, locale, t }: { pkg: Package; service: Service; locale: Locale; t: Dictionary }) {
  const rows = service.lineupRows.flatMap((key) => service.rows.filter((r) => r.key === key));
  return (
    // 10 children = 10 subgrid rows: stack, name, tagline, price, buttons, demo line, 4 specs.
    <article
      data-testid={`plan-${pkg.id}`}
      className="flex w-[85%] shrink-0 snap-center flex-col text-center md:row-span-10 md:grid md:w-auto md:grid-rows-subgrid"
    >
      <PlanStack pages={pkg.pages} className="mb-10 h-44 sm:h-52" />
      <h4 className="font-display text-[32px] leading-none font-extrabold tracking-[-0.04em]">{t.work.tiers[pkg.tier]}</h4>
      <p className="mx-auto mt-2 max-w-[30ch] text-sm leading-relaxed text-cream-muted">{pkg.tagline[locale]}</p>
      <p className="mt-3 font-display text-2xl font-extrabold tracking-[-0.02em]">{formatTHB(pkg.priceTHB)}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2.5">
        <Link
          href={pkg.demoPath}
          prefetch={false}
          className="rounded-full bg-(--acc) px-[18px] py-2.5 text-sm font-bold text-forest transition hover:bg-cream"
        >
          {t.work.tryDemo}
        </Link>
        <a
          href={pkg.fastworkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-(--acc)/55 px-[18px] py-2.5 text-sm font-bold text-(--acc) transition hover:border-(--acc)"
        >
          {t.work.order} ↗<span className="sr-only"> {t.nav.newTab}</span>
        </a>
      </div>
      <p className="mt-2.5 text-xs text-cream-muted">{t.work.demo.replace("{name}", pkg.demoName[locale])}</p>
      {rows.map((row, i) => (
        <div key={row.key} className={i === 0 ? "mt-7 border-t border-rule px-1.5 pt-5" : "px-1.5 pt-4"}>
          <SpecCell
            row={row}
            value={pkg.values[row.key]}
            locale={locale}
            yes={t.work.included}
            no={t.work.notIncluded}
          />
        </div>
      ))}
    </article>
  );
}
```

Replace `components/hub/work-section.tsx` with:

```tsx
import type { Dictionary, Locale } from "@/lib/i18n";
import { serviceTiles, services } from "@/lib/packages";
import { Lineup } from "./lineup";
import { WorkTabs } from "./work-tabs";

export function WorkSection({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="work" className="scroll-mt-16 bg-forest text-cream">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <h2 className="display-heading font-display text-5xl leading-none font-extrabold tracking-[-0.04em] sm:text-7xl">
          {t.work.heading}
        </h2>
        <div className="mt-8">
          <WorkTabs
            tiles={serviceTiles(locale)}
            label={t.work.servicesLabel}
            plansFrom={t.work.plansFrom}
            panels={services.map((s) => (
              <Lineup key={s.id} service={s} locale={locale} t={t} />
            ))}
          />
        </div>
      </div>
    </section>
  );
}
```

Delete `components/hub/project-row.tsx`:

```bash
git rm components/hub/project-row.tsx
```

- [ ] **Step 8: Remove `scope` from `lib/packages.ts`**

1. Delete the line `scope: Record<Locale, string[]>;` from `interface Package`.
2. In each of the six package objects, delete the whole `scope: { th: [...], en: [...] },` property (4 lines each).

Run: `grep -rn "scope" lib components app tests`
Expected: no matches.

- [ ] **Step 9: Run the tests to verify they pass**

```bash
pnpm typecheck && pnpm lint && pnpm test
lsof -ti tcp:3100 | xargs kill 2>/dev/null; pnpm test:e2e tests/e2e/hub.spec.ts tests/e2e/smoke.spec.ts
```
Expected: typecheck and lint are clean; all unit tests PASS; hub and smoke e2e PASS in both projects.

- [ ] **Step 10: Visual check**

Save this script as `.superpowers/sdd/shot.mjs`. The folder is gitignored; create it if missing.

```js
// node .superpowers/sdd/shot.mjs <path> <out-prefix> <selector> [selector...]
import { chromium } from "@playwright/test";
const [path, out, ...selectors] = process.argv.slice(2);
const browser = await chromium.launch();
for (const [w, h, tag] of [[1440, 900, "d"], [375, 812, "m"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`http://localhost:3100${path}`, { waitUntil: "networkidle" });
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await el.screenshot({ path: `${out}-${tag}-${sel.replace(/\W+/g, "")}.png` });
  }
}
await browser.close();
```

Run:
```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &)
for i in $(seq 1 40); do curl -s -o /dev/null http://localhost:3100/en && break; sleep 1; done
mkdir -p .superpowers/sdd/shots
node .superpowers/sdd/shot.mjs /en .superpowers/sdd/shots/t2-en "#work"
node .superpowers/sdd/shot.mjs /th .superpowers/sdd/shots/t2-th "#work"
lsof -ti tcp:3100 | xargs kill
```

Read the four PNGs and check that:
- The tiles are equal width; Websites is lime-filled and Web apps is dark.
- The plan fans grow 1 → 3 → 5 and don't overlap the plan names.
- On desktop, the spec rows line up across the three plans.
- On mobile, the plans scroll sideways inside the section.
- Thai text is not clipped.

Fix anything that's off before committing.

- [ ] **Step 11: Commit**

```bash
git add -A app/globals.css components/hub lib/packages.ts lib/i18n tests
git commit -m "feat(hub): service tiles and plan lineup replace project rows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Compare page, header link and hero CTA

**Files:**
- Create: `app/[locale]/compare/page.tsx`, `components/compare/compare-view.tsx`
- Modify: `components/hub/site-header.tsx`, `components/hub/locale-switch.tsx`, `components/hub/hero.tsx`, `app/[locale]/page.tsx`
- Modify: `lib/i18n/en.json`, `lib/i18n/th.json` (add `nav.compare` and a top-level `compare` block)
- Modify: `tests/e2e/routes.ts`
- Modify: `README.md` (the "Update prices or scope" line)
- Test: create `tests/e2e/compare.spec.ts`

**Interfaces:**
- Consumes:
  - Task 1: `getService`, `packagesByService`, `formatTHB`, `serviceTiles`, and the types `ServiceId`, `ServiceTile`, `Tier`.
  - Task 2: `ServiceTiles`, `SpecCell`, the `.acc-*` classes, and the `work.*` dictionary keys `servicesLabel`, `plansFrom`, `tryDemo`, `included`, `notIncluded` and `tiers`.
- Produces:
  - The route `/{locale}/compare`.
  - `SiteHeader({ locale, t, path? })`, where `path` is the locale-less suffix the language switch keeps (`"/compare"`).
  - `LocaleSwitch({ locale, label, ariaLabel, path? })`.
  - `Hero({ locale, t })`.

- [ ] **Step 1: Write the failing e2e tests**

Create `tests/e2e/compare.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { getService, packagesByService } from "../../lib/packages";

test("compare page defaults to websites and shows every website row for every plan", async ({ page }) => {
  await page.goto("/en/compare");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare plans");
  await expect(page.getByRole("tab", { name: /Websites/ })).toHaveAttribute("aria-selected", "true");
  for (const row of getService("web").rows) {
    for (const pkg of packagesByService("web")) {
      await expect(page.getByTestId(`cell-${row.key}-${pkg.id}`)).toBeVisible();
    }
  }
  await expect(page.getByTestId("cell-form-web-basic")).toContainText("Not included: Contact form");
  await expect(page.getByTestId("cell-form-web-standard")).toContainText("Included: Contact form");
  await expect(page.getByTestId("cell-pages-web-premium")).toContainText("5");
});

test("?service=app opens the web app plans", async ({ page }) => {
  await page.goto("/en/compare?service=app");
  await expect(page.getByRole("tab", { name: /Web apps/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("cell-login-app-standard")).toContainText("Basic login");
  await expect(page.getByTestId("cell-api-app-basic")).toContainText("Up to 4 REST endpoints");
  await expect(page.getByTestId("cell-form-web-basic")).toHaveCount(0);
});

test("switching service updates the URL", async ({ page }) => {
  await page.goto("/en/compare");
  await page.getByRole("tab", { name: /Web apps/ }).click();
  await expect(page).toHaveURL(/\/en\/compare\?service=app$/);
  await expect(page.getByTestId("cell-screens-app-premium")).toBeVisible();
});

test("plan header stays visible while scrolling the table", async ({ page }) => {
  await page.goto("/en/compare");
  await page.getByTestId("cell-rev-web-basic").evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  const box = await page.getByTestId("compare-head").boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(60);
  expect(box!.y).toBeLessThanOrEqual(70);
});

test("header and hero link to the compare page", async ({ page }) => {
  await page.goto("/en");
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Compare", exact: true, includeHidden: true }),
  ).toHaveAttribute("href", "/en/compare");
  await expect(page.getByRole("link", { name: "Packages from ฿4,900" })).toHaveAttribute("href", "/en/compare");
});

test("language switch stays on the compare page and keeps the service", async ({ page }) => {
  await page.goto("/en/compare?service=app");
  await page.getByRole("link", { name: "เปลี่ยนเป็นภาษาไทย" }).click();
  await expect(page).toHaveURL(/\/th\/compare\?service=app$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("เปรียบเทียบแพ็กเกจ");
  await expect(page.getByTestId("cell-login-app-premium")).toContainText("ระบบบัญชีและการเข้าสู่ระบบ");
});

test("no off-platform contact details on the compare page", async ({ page }) => {
  for (const path of ["/en/compare", "/th/compare"]) {
    await page.goto(path);
    expect(await page.content()).not.toMatch(/mailto:|tel:|line\.me/);
  }
});
```

In `tests/e2e/routes.ts`, after `"/en",`, add:

```ts
  "/en/compare",
  "/th/compare",
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `lsof -ti tcp:3100 | xargs kill 2>/dev/null; pnpm test:e2e tests/e2e/compare.spec.ts`
Expected: FAIL. `/en/compare` returns 404.

- [ ] **Step 3: Add the dictionary keys**

In `lib/i18n/en.json`:
- In `"nav"`, after `"work": "Work",`, add `"compare": "Compare",`.
- After the closing brace of the `"work"` block, add:

```json
  "compare": {
    "heading": "Compare plans",
    "intro": "Pick a service to see its three plans side by side.",
    "metaTitle": "Compare plans — SupaOhm",
    "metaDescription": "Compare the Basic, Standard and Premium plans for websites and web apps, row by row."
  },
```

In `lib/i18n/th.json`:
- In `"nav"`, after `"work": "ผลงาน",`, add `"compare": "เปรียบเทียบ",`.
- After the `"work"` block, add:

```json
  "compare": {
    "heading": "เปรียบเทียบแพ็กเกจ",
    "intro": "เลือกบริการ เพื่อดูทั้ง 3 แพ็กเกจเทียบกันทีละหัวข้อ",
    "metaTitle": "เปรียบเทียบแพ็กเกจ — SupaOhm",
    "metaDescription": "เปรียบเทียบแพ็กเกจ Basic, Standard และ Premium ของงานเว็บไซต์และเว็บแอป ทีละหัวข้อ"
  },
```

- [ ] **Step 4: Create the compare view**

`components/compare/compare-view.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Fragment, useState, useSyncExternalStore } from "react";
import { ServiceTiles } from "@/components/hub/service-tiles";
import { SpecCell } from "@/components/hub/spec-cell";
import type { Locale } from "@/lib/i18n/config";
import {
  formatTHB,
  getService,
  packagesByService,
  services,
  type ServiceId,
  type ServiceTile,
  type Tier,
} from "@/lib/packages";

export interface CompareLabels {
  services: string;
  plansFrom: string;
  tryDemo: string;
  included: string;
  notIncluded: string;
  tiers: Record<Tier, string>;
}

const noopSubscribe = () => () => {};

// The page is static, so ?service= is read in the browser (server snapshot: websites).
function readService(): ServiceId {
  const id = new URLSearchParams(window.location.search).get("service");
  return services.find((s) => s.id === id)?.id ?? "web";
}

export function CompareView({ locale, tiles, labels }: { locale: Locale; tiles: ServiceTile[]; labels: CompareLabels }) {
  const fromUrl = useSyncExternalStore(noopSubscribe, readService, () => "web" as ServiceId);
  const [picked, setPicked] = useState<ServiceId | null>(null);
  const selected = picked ?? fromUrl;
  const service = getService(selected);
  const plans = packagesByService(selected);

  function select(id: ServiceId) {
    setPicked(id);
    const url = new URL(window.location.href);
    url.searchParams.set("service", id);
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <ServiceTiles
        idPrefix="compare"
        compact
        tiles={tiles}
        selected={selected}
        onSelect={select}
        label={labels.services}
        plansFrom={labels.plansFrom}
      />
      <div
        role="tabpanel"
        id={`panel-compare-${selected}`}
        aria-labelledby={`tab-compare-${selected}`}
        className={`acc-${service.accent} mt-10`}
      >
        <div className="grid grid-cols-3 gap-x-2 sm:gap-x-7">
          <div
            data-testid="compare-head"
            className="sticky top-16 z-20 col-span-3 grid grid-cols-subgrid border-b border-rule bg-forest py-4"
          >
            {plans.map((p) => (
              <div key={p.id} className="text-center">
                <p className="font-display text-lg leading-none font-extrabold tracking-[-0.03em] sm:text-2xl">
                  {labels.tiers[p.tier]}
                </p>
                <p className="mt-1 font-display text-sm font-extrabold text-(--acc) sm:text-lg">{formatTHB(p.priceTHB)}</p>
                <Link
                  href={p.demoPath}
                  prefetch={false}
                  className="mt-2.5 inline-block rounded-full bg-(--acc) px-3 py-1.5 text-xs font-bold whitespace-nowrap text-forest transition hover:bg-cream sm:text-[13px]"
                >
                  {labels.tryDemo}
                </Link>
              </div>
            ))}
          </div>
          {service.rows.map((row) => (
            <Fragment key={row.key}>
              {row.group && (
                <h2 className="col-span-3 mt-9 border-b border-rule pb-2.5 font-display text-xl font-extrabold tracking-[-0.03em]">
                  {row.group[locale]}
                </h2>
              )}
              {plans.map((p) => (
                <div key={p.id} data-testid={`cell-${row.key}-${p.id}`} className="px-1 pt-4 text-center">
                  <SpecCell
                    row={row}
                    value={p.values[row.key]}
                    locale={locale}
                    yes={labels.included}
                    no={labels.notIncluded}
                  />
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Create the route**

`app/[locale]/compare/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompareView } from "@/components/compare/compare-view";
import { RememberLocale } from "@/components/hub/remember-locale";
import { SiteFooter } from "@/components/hub/site-footer";
import { SiteHeader } from "@/components/hub/site-header";
import { getDictionary, isLocale } from "@/lib/i18n";
import { serviceTiles } from "@/lib/packages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.compare.metaTitle,
    description: t.compare.metaDescription,
    alternates: { languages: { th: "/th/compare", en: "/en/compare", "x-default": "/en/compare" } },
  };
}

export default async function ComparePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <>
      <RememberLocale locale={locale} />
      <SiteHeader locale={locale} t={t} path="/compare" />
      <main className="bg-forest text-cream">
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-20 sm:px-6 lg:pt-20 lg:pb-28">
          <h1 className="display-heading font-display text-5xl leading-none font-extrabold tracking-[-0.04em] sm:text-6xl">
            {t.compare.heading}
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-cream-muted">{t.compare.intro}</p>
          <div className="mt-8">
            <CompareView
              locale={locale}
              tiles={serviceTiles(locale)}
              labels={{
                services: t.work.servicesLabel,
                plansFrom: t.work.plansFrom,
                tryDemo: t.work.tryDemo,
                included: t.work.included,
                notIncluded: t.work.notIncluded,
                tiers: t.work.tiers,
              }}
            />
          </div>
        </div>
      </main>
      <SiteFooter t={t} />
    </>
  );
}
```

- [ ] **Step 6: Header link, a language switch that keeps the page, and the hero CTA**

In `components/hub/site-header.tsx`:
1. Change the signature to `export function SiteHeader({ locale, t, path = "" }: { locale: Locale; t: Dictionary; path?: string }) {`.
2. Replace the `links` constant with the code below. The hash links carry the locale, so they also work from `/compare`.

```tsx
  const links = [
    [`/${locale}#work`, t.nav.work],
    [`/${locale}/compare`, t.nav.compare],
    [`/${locale}#process`, t.nav.process],
    [`/${locale}#about`, t.nav.about],
  ] as const;
```

3. Change the switch element to `<LocaleSwitch locale={locale} path={path} label={t.nav.switchLocale} ariaLabel={t.nav.switchLocaleLabel} />`.

Replace `components/hub/locale-switch.tsx` with:

```tsx
"use client";

import type { Locale } from "@/lib/i18n/config";

export function LocaleSwitch({
  locale,
  label,
  ariaLabel,
  path = "",
}: {
  locale: Locale;
  label: string;
  ariaLabel: string;
  path?: string;
}) {
  const target = locale === "th" ? "en" : "th";
  return (
    <a
      href={`/${target}${path}`}
      hrefLang={target}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        // Full navigation on purpose: hub and demos use different root layouts.
        // Keep ?service= and #anchors so the visitor stays where they were.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(`/${target}${path}${window.location.search}${window.location.hash}`);
      }}
      className="rounded-md border border-cream/40 px-3 py-1.5 text-sm font-semibold transition hover:border-cream"
    >
      {label}
    </a>
  );
}
```

In `components/hub/hero.tsx`:
1. Change the import to `import type { Dictionary, Locale } from "@/lib/i18n";`.
2. Change the signature to `export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {`.
3. Change the second CTA's `href="#work"` (the one rendering `t.hero.ctaPrice`) to `` href={`/${locale}/compare`} ``.

In `app/[locale]/page.tsx`, change `<Hero t={t} />` to `<Hero locale={locale} t={t} />`.

In `README.md`, replace `Edit `lib/packages.ts`. The hub project rows and demo pills read from it.` with:

```markdown
Edit `lib/packages.ts`. The hub lineup, the compare page (`/en/compare`) and the demo pills all read from it, including each plan's feature values. A new service is a new entry in `services` plus its packages.
```

- [ ] **Step 7: Run the tests to verify they pass**

```bash
pnpm typecheck && pnpm lint && pnpm test
lsof -ti tcp:3100 | xargs kill 2>/dev/null; pnpm test:e2e
```
Expected: everything passes. The full e2e suite runs in both projects and now includes `compare.spec.ts` and the two new smoke routes.

- [ ] **Step 8: Visual check**

If `.superpowers/sdd/shot.mjs` is missing, create it:

```js
// node .superpowers/sdd/shot.mjs <path> <out-prefix> <selector> [selector...]
import { chromium } from "@playwright/test";
const [path, out, ...selectors] = process.argv.slice(2);
const browser = await chromium.launch();
for (const [w, h, tag] of [[1440, 900, "d"], [375, 812, "m"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`http://localhost:3100${path}`, { waitUntil: "networkidle" });
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await el.screenshot({ path: `${out}-${tag}-${sel.replace(/\W+/g, "")}.png` });
  }
}
await browser.close();
```

Run:
```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &)
for i in $(seq 1 40); do curl -s -o /dev/null http://localhost:3100/en && break; sleep 1; done
mkdir -p .superpowers/sdd/shots
node .superpowers/sdd/shot.mjs "/en/compare" .superpowers/sdd/shots/t3-en "main"
node .superpowers/sdd/shot.mjs "/th/compare?service=app" .superpowers/sdd/shots/t3-th "main"
lsof -ti tcp:3100 | xargs kill
```

Read the four PNGs and check that:
- The compact tiles are equal.
- The three plan columns line up.
- The group headings span the full width.
- The ✓ marks are lime for websites and sky for web apps.
- On mobile, the three narrow columns don't overflow and Thai labels wrap cleanly.

Fix anything that's off before committing.

- [ ] **Step 9: Commit**

```bash
git add -A app components lib/i18n tests README.md
git commit -m "feat(compare): per-service compare page, header link and hero CTA

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Process steps with artefacts and the about fact list

**Files:**
- Modify: `components/hub/process-section.tsx` (whole file), `components/hub/about-section.tsx` (whole file)
- Modify: `app/globals.css` (add `.hand-note`)
- Modify: `lib/i18n/en.json`, `lib/i18n/th.json` (`process.artefacts`, `about`)
- Test: `tests/unit/i18n.test.ts`, `tests/e2e/hub.spec.ts`

**Interfaces:**
- Consumes:
  - `Dictionary`.
  - The `--font-hand` and `--font-itim` font variables, already loaded in `app/[locale]/layout.tsx`.
  - The Tailwind color `sky` from Task 2.
  - `public/thumbs/pages/web-standard-1.jpg` from Task 1.
- Produces: the dictionary keys below. Nothing else depends on this task.
  - `process.artefacts.{ask, reply, note, source, live, handover, online}`
  - `about.{heading, name, body (with "{name}"), portfolio, facts: {label, value}[4]}`
  - `about.stackHeading` and `about.stackBody` are removed.

- [ ] **Step 1: Write the failing tests**

In `tests/unit/i18n.test.ts`, replace the test `it("about section carries the tech stack copy", …)` with:

```ts
  it("about bio names the developer and lists four facts", () => {
    for (const dict of [en, th]) {
      expect(dict.about.body).toContain("{name}");
      expect(dict.about.facts).toHaveLength(4);
    }
    expect("stackHeading" in en.about).toBe(false);
  });
```

Append to `tests/e2e/hub.spec.ts`:

```ts
test("process shows five steps with a picture each, and about lists the facts", async ({ page }) => {
  await page.goto("/en");
  const steps = page.locator("#process ol > li");
  await expect(steps).toHaveCount(5);
  await expect(steps.nth(3)).toContainText("bigger logo?");
  await expect(steps.nth(4)).toContainText("Handover notes");
  await expect(page.locator("#about")).toContainText("Supakorn (Ohm)");
  await expect(page.locator("#about dl")).toContainText("Mizuhada Group");
  await expect(page.locator("#about dl")).toContainText("FastAPI");
});

test("Thai process and about read in Thai", async ({ page }) => {
  await page.goto("/th");
  await expect(page.locator("#process ol > li").nth(3)).toContainText("โลโก้ใหญ่ขึ้นอีกนิด?");
  await expect(page.locator("#about dl")).toContainText("ประสบการณ์");
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/i18n.test.ts`
Expected: FAIL. `about.facts` is undefined.

- [ ] **Step 3: Update the dictionaries**

In `lib/i18n/en.json`, inside `"process"`, after `"heading": "How I work",`, add:

```json
    "artefacts": {
      "ask": "Need a 3-page site for our factory by the end of the month",
      "reply": "Sure. Here's the scope and price before you order.",
      "note": "bigger logo?",
      "source": "Source code",
      "live": "Live site",
      "handover": "Handover notes",
      "online": "online"
    },
```

Replace the whole `"about": { … }` block in `en.json` with:

```json
  "about": {
    "heading": "Who's building it",
    "name": "Supakorn (Ohm)",
    "body": "I'm {name}, a Computer Engineering student at SIIT, Thammasat University, and a full-stack developer in Bangkok. I've built internal business tools, AI systems and modern web interfaces.",
    "portfolio": "View personal portfolio",
    "facts": [
      { "label": "Studying", "value": "Computer Engineering, SIIT, Thammasat University" },
      { "label": "Experience", "value": "AI Developer intern, Mizuhada Group\nUX/UI Researcher intern, BAKA Group" },
      { "label": "Websites", "value": "Next.js, React, TypeScript, Tailwind CSS" },
      { "label": "Web apps", "value": "Python, FastAPI, Node.js, PostgreSQL, Supabase" }
    ]
  },
```

In `lib/i18n/th.json`, inside `"process"`, after `"heading": "ขั้นตอนการทำงาน",`, add:

```json
    "artefacts": {
      "ask": "อยากได้เว็บ 3 หน้าสำหรับโรงงาน ส่งภายในสิ้นเดือนได้ไหม",
      "reply": "ได้เลย นี่คือขอบเขตงานและราคา ก่อนกดสั่งซื้อ",
      "note": "โลโก้ใหญ่ขึ้นอีกนิด?",
      "source": "ซอร์สโค้ด",
      "live": "เว็บจริง",
      "handover": "เอกสารส่งมอบ",
      "online": "ออนไลน์"
    },
```

Replace the whole `"about": { … }` block in `th.json` with:

```json
  "about": {
    "heading": "ผู้พัฒนา",
    "name": "Supakorn (โอห์ม)",
    "body": "{name} นักศึกษาวิศวกรรมคอมพิวเตอร์ SIIT ธรรมศาสตร์ และนักพัฒนาเว็บแบบ Full-stack ในกรุงเทพฯ มีประสบการณ์สร้างเครื่องมือภายในองค์กร ระบบ AI และหน้าเว็บสมัยใหม่",
    "portfolio": "ดูพอร์ตโฟลิโอส่วนตัว",
    "facts": [
      { "label": "การศึกษา", "value": "วิศวกรรมคอมพิวเตอร์ SIIT มหาวิทยาลัยธรรมศาสตร์" },
      { "label": "ประสบการณ์", "value": "AI Developer (ฝึกงาน), Mizuhada Group\nUX/UI Researcher (ฝึกงาน), BAKA Group" },
      { "label": "เว็บไซต์", "value": "Next.js, React, TypeScript, Tailwind CSS" },
      { "label": "เว็บแอป", "value": "Python, FastAPI, Node.js, PostgreSQL, Supabase" }
    ]
  },
```

- [ ] **Step 4: Add the handwritten-note style**

Append to `app/globals.css`:

```css
/* Handwritten revision note in the process section. Kalam has no Thai glyphs, so Thai uses Itim. */
.hand-note {
  font-family: var(--font-hand);
  font-weight: 700;
}
.hand-note:lang(th) {
  font-family: var(--font-itim, ui-sans-serif), cursive;
  font-weight: 400;
}
```

- [ ] **Step 5: Rewrite the process section**

Replace `components/hub/process-section.tsx` with:

```tsx
import Image from "next/image";
import type { Dictionary } from "@/lib/i18n";

// Syntax-coloured lines for the Build step: [text, colour class].
const CODE: [string, string?][][] = [
  [["export", "text-lime"], [" "], ["function", "text-sky"], [" Contact() {"]],
  [["  "], ["return", "text-lime"], [" <Form"]],
  [["    onSubmit={send}"]],
  [["  />"]],
  [["}"]],
];

// A small picture of what the buyer sees at each step. Decorative; the step text carries the meaning.
function Artefact({ step, t }: { step: number; t: Dictionary }) {
  const a = t.process.artefacts;
  if (step === 0)
    return (
      <div className="flex h-full flex-col justify-center gap-2 p-2.5 text-[11px] leading-snug">
        <p className="max-w-[85%] self-start rounded-[10px] rounded-bl-[3px] bg-cream px-2.5 py-1.5 text-forest">{a.ask}</p>
        <p className="max-w-[85%] self-end rounded-[10px] rounded-br-[3px] bg-lime px-2.5 py-1.5 text-forest">{a.reply}</p>
      </div>
    );
  if (step === 1)
    return (
      <div className="absolute inset-x-[18px] inset-y-3.5 rounded-md border-[1.5px] border-dashed border-cream/35 p-2">
        <div className="h-2.5 w-2/5 rounded-sm bg-cream/15" />
        <div className="mt-2 h-5 w-3/5 rounded-sm bg-cream/15" />
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <div className="h-6 rounded-sm bg-cream/15" />
          <div className="h-6 rounded-sm bg-cream/15" />
          <div className="h-6 rounded-sm bg-cream/15" />
        </div>
      </div>
    );
  if (step === 2)
    return (
      <div className="p-3 font-mono text-[11px] leading-[1.55] whitespace-pre text-cream-muted">
        {CODE.map((line, i) => (
          <div key={i}>
            {line.map(([text, cls], j) => (
              <span key={j} className={cls}>
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  if (step === 3)
    return (
      <>
        <Image
          src="/thumbs/pages/web-standard-1.jpg"
          alt=""
          width={640}
          height={400}
          sizes="240px"
          className="absolute inset-x-3.5 inset-y-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.75rem)] rounded-md object-cover object-top"
        />
        <span className="absolute top-8 left-8 h-10 w-24 -rotate-6 rounded-[50%] border-2 border-lime" />
        <span className="hand-note absolute right-4 bottom-3 -rotate-3 rounded bg-forest px-1.5 py-0.5 text-sm text-lime">
          {a.note}
        </span>
      </>
    );
  return (
    <div className="grid h-full content-center gap-1.5 p-3.5 text-[11.5px]">
      {[
        [a.source, ".zip"],
        [a.live, a.online],
        [a.handover, ".pdf"],
      ].map(([name, tag]) => (
        <div key={name} className="flex justify-between rounded-md bg-forest px-2.5 py-1.5">
          <span>{name}</span>
          <span className="text-lime">{tag}</span>
        </div>
      ))}
    </div>
  );
}

export function ProcessSection({ t }: { t: Dictionary }) {
  return (
    <section id="process" className="scroll-mt-16 border-t border-rule bg-forest text-cream">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <h2 className="display-heading font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-5xl">
          {t.process.heading}
        </h2>
        <ol className="mt-10 grid gap-6 lg:grid-cols-5 lg:gap-3.5">
          {t.process.steps.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[minmax(0,9rem)_1fr] items-start gap-4 sm:grid-cols-[minmax(0,13rem)_1fr] lg:block"
            >
              <div aria-hidden className="relative h-[120px] overflow-hidden rounded-[10px] bg-forest-2 ring-1 ring-rule ring-inset">
                <Artefact step={i} t={t} />
              </div>
              <div>
                <h3 className="font-display text-[19px] leading-tight font-extrabold tracking-[-0.03em] lg:mt-3.5">
                  <span className="mr-2 text-lime">{i + 1}</span>
                  {step.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-cream-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Rewrite the about section**

Replace `components/hub/about-section.tsx` with:

```tsx
import type { Dictionary } from "@/lib/i18n";

export function AboutSection({ t }: { t: Dictionary }) {
  const [before, after] = t.about.body.split("{name}");
  return (
    <section id="about" className="scroll-mt-16 border-t border-rule bg-forest text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1.3fr_1fr] lg:py-24">
        <div>
          <h2 className="display-heading font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-5xl">
            {t.about.heading}
          </h2>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-cream-muted">
            {before}
            <strong className="font-semibold text-cream">{t.about.name}</strong>
            {after}
          </p>
          <a
            href="https://supakornohm.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm font-semibold underline decoration-lime decoration-2 underline-offset-4 transition hover:text-lime"
          >
            {t.about.portfolio} ↗<span className="sr-only"> {t.nav.newTab}</span>
          </a>
        </div>
        <dl className="grid content-start gap-3 md:pt-3">
          {t.about.facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-[7rem_1fr] gap-3 border-b border-rule pb-3 text-sm">
              <dt className="text-cream-muted">{fact.label}</dt>
              <dd>
                {fact.value.split("\n").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Run the tests to verify they pass**

```bash
pnpm typecheck && pnpm lint && pnpm test
lsof -ti tcp:3100 | xargs kill 2>/dev/null; pnpm test:e2e
```
Expected: everything passes, in both projects.

- [ ] **Step 8: Visual check**

If `.superpowers/sdd/shot.mjs` is missing, create it with the same code as in Task 3, Step 8.

```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &)
for i in $(seq 1 40); do curl -s -o /dev/null http://localhost:3100/en && break; sleep 1; done
mkdir -p .superpowers/sdd/shots
node .superpowers/sdd/shot.mjs /en .superpowers/sdd/shots/t4-en "#process" "#about"
node .superpowers/sdd/shot.mjs /th .superpowers/sdd/shots/t4-th "#process" "#about"
lsof -ti tcp:3100 | xargs kill
```

Read the eight PNGs and check that:
- The five pictures sit in a row on desktop.
- On mobile, each picture sits left of its text.
- The chat bubbles fit inside the 120px picture.
- The handwritten note is Kalam in EN and Itim in TH.
- The fact rows are evenly ruled, and the bio name is highlighted in cream.

Fix anything that's off before committing.

- [ ] **Step 9: Commit**

```bash
git add -A app/globals.css components/hub lib/i18n tests
git commit -m "feat(hub): process steps show their artefacts, about becomes a fact list

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
