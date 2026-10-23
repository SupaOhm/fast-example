# ร้านดี Shop Admin: Today First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Web app Standard demo (`/demos/shop-admin`) so a visitor lands straight on the shop owner's day. That means no login wall, and today's to-dos and packing queue come first. The demo gets its own kraft-paper look and full Thai/English through the shared demo switch.

**Architecture:**
- **Data:** `lib/demos/shop-admin/data.ts` keeps the pure seed and metrics. Its business content becomes bilingual (`L` values for product names, categories and customers), and it gains the pure "today" helpers the overview needs: `toPack`, `packingQueue`, `markPacked`, `salesOn`, `channelSales`, `parseOrderFilter`, `matchesQuery`.
- **Session:** the session store now defaults to signed in. Logging out writes `false`, which brings back the existing login screen.
- **Copy:** all interface text moves to `app/demos/shop-admin/_components/copy.ts`.
- **Pages:** still exactly three screens (overview, orders, stock), plus the login.

**Tech stack:** Next.js 16.4 App Router (static export), React 19, TypeScript strict, Tailwind 4, recharts (already a dependency), Bai Jamjuree and JetBrains Mono through `next/font/google`, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-22-demo-rework-bilingual-design.md`, Part 2 "ร้านดี: shop admin" and Part 3 step 6.

**Approved mockup:** `.superpowers/brainstorm/19193-1792598876/content/shop-directions.html`, with A's look and B's layout. It sets direction only; the final design is done with `frontend-design`.

## Global Constraints

- **Static export:** keep `output: "export"`. Add no new dependencies.
- **Next.js:** read `node_modules/next/dist/docs/` before using a Next.js API not already used in this repo (AGENTS.md).
- **Fonts:**
  - Bai Jamjuree (weights 400, 500, 600, 700; subsets thai and latin) for everything.
  - JetBrains Mono (400, 600; latin) only for receipt totals, order numbers and SKUs.
  - No serif fonts. No `font-light` or weights below 400.
- **Palette** (set on the layout wrapper; replaces the green palette):

  | Token | Value | Use |
  |---|---|---|
  | `--bg` | `#f1e6d2` | kraft page |
  | `--paper` | `#fbf7ef` | cards, receipts, panels |
  | `--line` | `#d8c6a3` | borders, rules (decorative only) |
  | `--ink` | `#2b2217` | text (12.6:1 on kraft) |
  | `--muted` | `#665540` | secondary text (5.8:1 on kraft, 6.7:1 on paper) |
  | `--wood` | `#2b2217` | dark "till" card and dark surfaces |
  | `--mustard` | `#e2b04a` | fills and highlights only; text on it is `--ink` (7.8:1) |
  | `--mustard-ink` | `#8a5a00` | accent text on kraft/paper (4.8:1 / 5.5:1) |
  | `--warn` | `#a3361f` | low-stock and cancelled text (5.5:1 / 6.3:1) |
  | `--ok` | `#3d6b2f` | packed and shipped text (5.1:1 / 5.9:1) |

- **Contrast:**
  - On `--wood`, text may be `--bg` (12.6:1) or `--mustard` (7.8:1) only.
  - `--muted`, `--warn`, `--ok` and `--mustard-ink` fail on `--mustard` and on `--wood`, so never use them there.
  - Any other text/background pair must be checked against AA (4.5:1) before use.
- **Text sizes:**
  - Body text, list rows, receipt lines and buttons: at least 16px.
  - Labels, captions, table headers, badges and the sidebar's small print: at least 14px.
  - Chart tick labels: at least 12px.
- **Language:**
  - Every visible string, `aria-label`, placeholder and chart label comes from `copy.ts` (or from an `L` value in the data) and renders in `useLang()`'s language.
  - Use `fill()` from `@/lib/demos/format` for placeholders, and `formatDate` (via `_components/format.ts`) for dates.
  - Brand: Thai `ร้านดี`, English `Raan Dee`.
  - Order numbers (`RD-2001`), SKUs and ฿ prices stay the same in both languages.
  - The seller refers to themselves only as "เรา"; "คุณ" for the customer is fine.
- **No login wall:**
  - `/demos/shop-admin` opens on the overview with no login step.
  - A banner (`data-testid="demo-session"`) reads `กำลังดูในฐานะเจ้าของร้าน (เดโม)` / `Viewing as the shop owner (demo)` and holds the page's only log-out button.
  - Logging out goes to `/demos/shop-admin/login`, and the admin routes then redirect there until the visitor logs in again.
- **Screens:** exactly three admin screens (overview, orders, stock) plus the login. Add no route.
- **Drawn art:** product icons are inline SVG drawn for this shop (`_components/product-icon.tsx`). No emoji or photos as product art. Lucide icons are fine for interface controls.
- **Test ids kept:** `login-submit`, `reset-demo`, `sales-chart`, `orders-search`, `orders-empty`, `stock-row-<SKU>`, `stock-input`, `stock-save`.
- **Test ids added:**
  - `demo-session`
  - `todo-pack`, `todo-low`, `todo-sold`
  - `pack-row` (with `data-order-id`)
  - `receipt`
  - `product-icon`
- **Test id removed:** `kpi`.
- **Accessible names kept:**
  - Each order's status `<select>` is labelled `สถานะคำสั่งซื้อ <id>` / `Order status <id>`.
  - The status filter is labelled `สถานะ` / `Status`.
  - Pagination buttons are labelled `หน้าก่อนหน้า`/`หน้าถัดไป` (`Previous page`/`Next page`).
  - The page counter reads `<n> / <pages>`.
- **Accessibility:** no horizontal overflow at 375px or 1440px, visible focus everywhere, and `prefers-reduced-motion` respected (no stamp or card animations under it).
- **Commits:** end every message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, and add no other attribution line.
- **Branch:** `feat/shop-admin-rework` (already created from `main`). Never push or merge without Ohm's OK; merging deploys devbyohm.com.

## File map

| File | Change | Responsibility |
|---|---|---|
| `lib/demos/shop-admin/data.ts` | Modify | Bilingual business data, new statuses and channels, today helpers |
| `lib/demos/shop-admin/store.ts` | Modify | Session defaults to signed in; data key `v2` |
| `tests/unit/shop-admin.test.ts` | Modify | Seed, metrics, today helpers |
| `app/demos/shop-admin/_components/copy.ts` | Create | All interface copy, status and channel labels |
| `tests/unit/shop-admin-copy.test.ts` | Create | Copy completeness |
| `app/demos/shop-admin/_components/format.ts` | Rewrite | Dates via `formatDate`, item count, channel icons |
| `app/demos/shop-admin/layout.tsx` | Modify | Kraft palette, fonts, `LangScope`, static bilingual title |
| `app/demos/shop-admin/(app)/*/page.tsx`, `login/page.tsx` | Modify | Static bilingual titles |
| `app/demos/shop-admin/_components/admin-shell.tsx` | Rewrite | Kraft shell, demo-session banner, language switch |
| `app/demos/shop-admin/_components/login-form.tsx` | Rewrite | Bilingual, kraft look |
| `app/demos/shop-admin/_components/brand-mark.tsx` | Rewrite | Drawn ร้านดี mark |
| `app/demos/shop-admin/_components/product-icon.tsx` | Create | Twelve drawn product icons |
| `app/demos/shop-admin/_components/overview.tsx` | Rewrite | Today first: greeting, to-do tiles, packing queue, compact charts |
| `app/demos/shop-admin/_components/orders-table.tsx` | Rewrite | Receipt cards, filter from the URL |
| `app/demos/shop-admin/_components/stock-table.tsx` | Rewrite | Kraft look, product icons, bilingual |
| `tests/e2e/shop-admin.spec.ts` | Rewrite | No login wall, packing, logout, orders, stock, English |
| `tests/e2e/demo-lang.spec.ts` | Modify | Add the shop admin |
| `public/thumbs/app-standard.jpg`, `public/thumbs/pages/app-standard-{1,2,3}.jpg` | Regenerate | New look on the hub |

---

### Task 1: Bilingual data, today helpers, signed-in session, copy

**Files:**
- Modify: `lib/demos/shop-admin/data.ts`, `lib/demos/shop-admin/store.ts`, `tests/unit/shop-admin.test.ts`
- Create: `app/demos/shop-admin/_components/copy.ts`, `tests/unit/shop-admin-copy.test.ts`
- Rewrite: `app/demos/shop-admin/_components/format.ts`
- Modify, with the smallest edits that keep the app compiling: `overview.tsx`, `orders-table.tsx`, `stock-table.tsx`, `admin-shell.tsx`. Tasks 2 and 3 rewrite these files.

**Interfaces:**
- Consumes: `L`, `Lang` from `@/lib/demos/lang`; `formatDate` from `@/lib/demos/format`; `addDays`, `toISODate`, `parseISODate` from `@/lib/dates`.
- Produces, for Tasks 2 and 3:
  - **Types:** `Product` (`name: L`, `category: L`), `ShopOrderStatus = "paid" | "packed" | "shipped" | "cancelled"`, `SHOP_ORDER_STATUSES`, `ShopChannel = "line" | "shopee" | "store"`, `SHOP_CHANNELS`, `ShopOrder` (`customer: L`, `channel: ShopChannel`), `ShopData`, `OrderFilter = ShopOrderStatus | "all"`.
  - **Existing functions:** `buildShopSeed(today)`, `isLowStock(p)`, `dailySales(data, today, days?)`, `kpis(data, today)`, `topProducts(data, n?)` (returns `{ sku, name: L, qty, revenue }[]`), `updateStock(data, sku, stock)`, `setOrderStatus(data, id, status)`.
  - **New functions:**
    - `toPack(data): ShopOrder[]`
    - `packingQueue(data, keep: readonly string[], limit?): ShopOrder[]`
    - `markPacked(data, id): ShopData`
    - `salesOn(data, date: string): { revenue: number; orders: number }`
    - `channelSales(data, today, days?): { channel: ShopChannel; count: number; revenue: number }[]`
    - `parseOrderFilter(search: string): OrderFilter`
    - `matchesQuery(order, query): boolean`
  - **Stores:** `shopSession` (default `true`) and `shopData`.
  - **Copy:** `ui`, `statusLabel: Record<ShopOrderStatus, L>`, `channelLabel: Record<ShopChannel, L>` from `copy.ts`.
  - **Format helpers:** `shortDate(iso, lang)`, `weekdayDate(iso, lang)`, `fullDate(date, lang)`, `dayMonth(iso)`, `itemCount(order)`, `CHANNEL_ICON` from `format.ts`.

- [ ] **Step 1: Write the failing unit tests.**

  Replace `tests/unit/shop-admin.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { toISODate } from "@/lib/dates";
import {
  buildShopSeed,
  channelSales,
  dailySales,
  isLowStock,
  kpis,
  markPacked,
  matchesQuery,
  packingQueue,
  parseOrderFilter,
  PRODUCTS,
  salesOn,
  setOrderStatus,
  SHOP_CHANNELS,
  toPack,
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
      expect(SHOP_CHANNELS).toContain(order.channel);
      expect(order.customer.th).toMatch(/^คุณ/);
      expect(order.customer.en).toMatch(/^Khun /);
    }
  });

  it("includes at least two low-stock products", () => {
    expect(buildShopSeed(today).products.filter(isLowStock).length).toBeGreaterThanOrEqual(2);
  });

  it("only recent orders still wait to be packed or for the courier", () => {
    const data = buildShopSeed(today);
    const old = data.orders.filter((o) => o.date < "2026-10-17");
    expect(old.every((o) => o.status === "shipped" || o.status === "cancelled")).toBe(true);
    expect(toPack(data).length).toBeGreaterThanOrEqual(3);
    expect(data.orders.some((o) => o.status === "packed")).toBe(true);
  });

  it("names every product in Thai and English", () => {
    for (const p of PRODUCTS) {
      expect(p.name.th.trim()).not.toBe("");
      expect(p.name.en.trim()).not.toBe("");
      expect(p.category.en.trim()).not.toBe("");
    }
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

  it("topProducts is sorted by revenue, capped, and named in both languages", () => {
    const top = topProducts(data, 5);
    expect(top.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < top.length; i++) expect(top[i - 1].revenue).toBeGreaterThanOrEqual(top[i].revenue);
    expect(top[0].name.en.length).toBeGreaterThan(0);
  });

  it("salesOn counts one day's valid orders", () => {
    const day = toISODate(today);
    const valid = data.orders.filter((o) => o.date === day && o.status !== "cancelled");
    expect(salesOn(data, day)).toEqual({ revenue: valid.reduce((s, o) => s + o.total, 0), orders: valid.length });
    expect(salesOn(data, day).orders).toBeGreaterThan(0);
    expect(salesOn(data, "2020-01-01")).toEqual({ revenue: 0, orders: 0 });
  });

  it("channelSales splits the last 30 days by channel, biggest first", () => {
    const rows = channelSales(data, today);
    expect(rows.map((r) => r.channel).sort()).toEqual([...SHOP_CHANNELS].sort());
    expect(rows.reduce((s, r) => s + r.revenue, 0)).toBe(kpis(data, today).revenue30d);
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].revenue).toBeGreaterThanOrEqual(rows[i].revenue);
  });
});

describe("packing", () => {
  const data = buildShopSeed(today);

  it("toPack lists paid orders, oldest first", () => {
    const queue = toPack(data);
    expect(queue.every((o) => o.status === "paid")).toBe(true);
    for (let i = 1; i < queue.length; i++) {
      const [a, b] = [queue[i - 1], queue[i]];
      expect(a.date < b.date || (a.date === b.date && a.id < b.id)).toBe(true);
    }
  });

  it("markPacked moves a paid order to packed and leaves others alone", () => {
    const first = toPack(data)[0];
    const next = markPacked(data, first.id);
    expect(next.orders.find((o) => o.id === first.id)?.status).toBe("packed");
    expect(toPack(next)).toHaveLength(toPack(data).length - 1);
    expect(data.orders.find((o) => o.id === first.id)?.status).toBe("paid");
    const shipped = data.orders.find((o) => o.status === "shipped")!;
    expect(markPacked(data, shipped.id)).toBe(data);
  });

  it("packingQueue keeps orders packed this visit in their place", () => {
    const queue = packingQueue(data, [], 4);
    expect(queue).toHaveLength(4);
    const packed = markPacked(data, queue[1].id);
    expect(packingQueue(packed, [queue[1].id], 4).map((o) => o.id)).toEqual(queue.map((o) => o.id));
    expect(packingQueue(packed, [], 4).map((o) => o.id)).not.toContain(queue[1].id);
  });
});

describe("orders page helpers", () => {
  const data = buildShopSeed(today);

  it("parseOrderFilter reads a known status from the query string", () => {
    expect(parseOrderFilter("?status=paid")).toBe("paid");
    expect(parseOrderFilter("status=cancelled")).toBe("cancelled");
    expect(parseOrderFilter("?status=nope")).toBe("all");
    expect(parseOrderFilter("")).toBe("all");
  });

  it("matchesQuery finds an order by number or by either name", () => {
    const o = data.orders[0];
    expect(matchesQuery(o, "")).toBe(true);
    expect(matchesQuery(o, o.id.toLowerCase())).toBe(true);
    expect(matchesQuery(o, `  ${o.customer.th} `)).toBe(true);
    expect(matchesQuery(o, o.customer.en.toUpperCase())).toBe(true);
    expect(matchesQuery(o, "ไม่มีลูกค้าคนนี้")).toBe(false);
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

  Create `tests/unit/shop-admin-copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import * as copy from "@/app/demos/shop-admin/_components/copy";
import { PRODUCTS, SHOP_CHANNELS, SHOP_ORDER_STATUSES } from "@/lib/demos/shop-admin/data";
import { missingTranslations } from "./helpers/missing-translations";

describe("shop admin copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations(copy)).toEqual([]);
    expect(missingTranslations(PRODUCTS)).toEqual([]);
  });

  it("labels every status and channel", () => {
    for (const s of SHOP_ORDER_STATUSES) expect(copy.statusLabel[s].en.length).toBeGreaterThan(0);
    for (const c of SHOP_CHANNELS) expect(copy.channelLabel[c].th.length).toBeGreaterThan(0);
  });

  it("keeps the banner wording from the spec", () => {
    expect(copy.ui.demoBanner.th).toBe("กำลังดูในฐานะเจ้าของร้าน (เดโม)");
    expect(copy.ui.tileToPack.th).toContain("{n}");
    expect(copy.ui.orderStatusLabel.en).toBe("Order status {id}");
  });
});
```

  Run `pnpm vitest run tests/unit/shop-admin.test.ts tests/unit/shop-admin-copy.test.ts`. Expected: FAIL, because the new exports and `copy.ts` don't exist yet.

- [ ] **Step 2: Rewrite `lib/demos/shop-admin/data.ts`.**

```ts
import { addDays, toISODate } from "@/lib/dates";
import type { L } from "@/lib/demos/lang";

export interface Product {
  sku: string;
  name: L;
  category: L;
  price: number;
  stock: number;
  reorderAt: number;
}

// "paid" orders are waiting to be packed; "packed" ones are waiting for the courier.
export type ShopOrderStatus = "paid" | "packed" | "shipped" | "cancelled";
export const SHOP_ORDER_STATUSES: ShopOrderStatus[] = ["paid", "packed", "shipped", "cancelled"];

export type ShopChannel = "line" | "shopee" | "store";
export const SHOP_CHANNELS: ShopChannel[] = ["line", "shopee", "store"];

export interface ShopOrder {
  id: string;
  customer: L;
  channel: ShopChannel;
  date: string;
  items: { sku: string; qty: number }[];
  total: number;
  status: ShopOrderStatus;
}

export interface ShopData {
  products: Product[];
  orders: ShopOrder[];
}

const CHILLI = { th: "น้ำพริก", en: "Chilli dips" };
const SNACKS = { th: "ของทานเล่น", en: "Snacks" };
const CURED = { th: "อาหารแปรรูป", en: "Sausages and cured pork" };
const DRINKS = { th: "เครื่องดื่ม", en: "Tea and coffee" };
const SWEETS = { th: "ขนม", en: "Sweets" };
const GIFTS = { th: "ชุดของขวัญ", en: "Gift sets" };

export const PRODUCTS: Product[] = [
  { sku: "NP-01", name: { th: "น้ำพริกหนุ่ม", en: "Nam prik num green chilli dip" }, category: CHILLI, price: 120, stock: 48, reorderAt: 15 },
  { sku: "NP-02", name: { th: "น้ำพริกอ่อง", en: "Nam prik ong tomato chilli dip" }, category: CHILLI, price: 120, stock: 9, reorderAt: 15 },
  { sku: "KM-01", name: { th: "แคบหมูไร้มัน", en: "Lean pork crackling" }, category: SNACKS, price: 80, stock: 64, reorderAt: 20 },
  { sku: "KM-02", name: { th: "แคบหมูติดมัน", en: "Classic pork crackling" }, category: SNACKS, price: 80, stock: 37, reorderAt: 20 },
  { sku: "SU-01", name: { th: "ไส้อั่วสูญญากาศ", en: "Sai ua sausage, vacuum-packed" }, category: CURED, price: 180, stock: 22, reorderAt: 10 },
  { sku: "SU-02", name: { th: "แหนมหมู", en: "Naem sour pork" }, category: CURED, price: 90, stock: 6, reorderAt: 12 },
  { sku: "TE-01", name: { th: "ชาอูหลงดอยแม่สลอง", en: "Doi Mae Salong oolong tea" }, category: DRINKS, price: 250, stock: 30, reorderAt: 8 },
  { sku: "CO-01", name: { th: "กาแฟดอยช้าง คั่วกลาง", en: "Doi Chang coffee, medium roast" }, category: DRINKS, price: 290, stock: 25, reorderAt: 8 },
  { sku: "SW-01", name: { th: "ข้าวแต๋นน้ำแตงโม", en: "Khao taen rice crackers" }, category: SWEETS, price: 60, stock: 75, reorderAt: 25 },
  { sku: "SW-02", name: { th: "ทองม้วนสด", en: "Thong muan rolled wafers" }, category: SWEETS, price: 70, stock: 41, reorderAt: 20 },
  { sku: "SW-03", name: { th: "มะขามแช่อิ่ม", en: "Candied tamarind" }, category: SWEETS, price: 85, stock: 18, reorderAt: 10 },
  { sku: "GF-01", name: { th: "กล่องของฝากรวม", en: "Chiang Mai gift box" }, category: GIFTS, price: 590, stock: 12, reorderAt: 5 },
];

const CUSTOMERS: L[] = [
  { th: "คุณเมย์", en: "Khun May" },
  { th: "คุณต้น", en: "Khun Ton" },
  { th: "คุณฝน", en: "Khun Fon" },
  { th: "คุณบอส", en: "Khun Boss" },
  { th: "คุณแอน", en: "Khun Ann" },
  { th: "คุณโจ้", en: "Khun Jo" },
  { th: "คุณปุ้ย", en: "Khun Pui" },
  { th: "คุณกิ๊ฟ", en: "Khun Gift" },
  { th: "คุณนิด", en: "Khun Nid" },
  { th: "คุณเอก", en: "Khun Ake" },
];

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
        r < 0.05 ? "cancelled" : back > 2 ? "shipped" : r < 0.5 ? "paid" : r < 0.8 ? "packed" : "shipped";
      orders.push({
        id: `RD-${n++}`,
        customer: pick(CUSTOMERS),
        channel: pick(SHOP_CHANNELS),
        date,
        items,
        total,
        status,
      });
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

/** One day's takings, cancelled orders left out. */
export function salesOn(data: ShopData, date: string): { revenue: number; orders: number } {
  const day = validOrders(data).filter((o) => o.date === date);
  return { revenue: day.reduce((s, o) => s + o.total, 0), orders: day.length };
}

export function channelSales(data: ShopData, today: Date, days = 30) {
  const from = toISODate(addDays(today, 1 - days));
  return SHOP_CHANNELS.map((channel) => {
    const orders = validOrders(data).filter((o) => o.channel === channel && o.date >= from);
    return { channel, count: orders.length, revenue: orders.reduce((s, o) => s + o.total, 0) };
  }).sort((a, b) => b.revenue - a.revenue);
}

const oldestFirst = (a: ShopOrder, b: ShopOrder) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id);

/** Paid orders still waiting to be packed, oldest first. */
export function toPack(data: ShopData): ShopOrder[] {
  return data.orders.filter((o) => o.status === "paid").sort(oldestFirst);
}

/**
 * The overview's packing queue. Orders packed during this visit (`keep`) hold their
 * place, so a row doesn't jump away the moment the owner taps it.
 */
export function packingQueue(data: ShopData, keep: readonly string[], limit = 6): ShopOrder[] {
  return data.orders
    .filter((o) => o.status === "paid" || (o.status === "packed" && keep.includes(o.id)))
    .sort(oldestFirst)
    .slice(0, limit);
}

/** Marks a paid order as packed. Any other order is left as it is. */
export function markPacked(data: ShopData, id: string): ShopData {
  const order = data.orders.find((o) => o.id === id);
  return order?.status === "paid" ? setOrderStatus(data, id, "packed") : data;
}

export function updateStock(data: ShopData, sku: string, stock: number): ShopData {
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a whole number ≥ 0");
  if (!data.products.some((p) => p.sku === sku)) throw new Error(`Unknown SKU ${sku}`);
  return { ...data, products: data.products.map((p) => (p.sku === sku ? { ...p, stock } : p)) };
}

export function setOrderStatus(data: ShopData, id: string, status: ShopOrderStatus): ShopData {
  return { ...data, orders: data.orders.map((o) => (o.id === id ? { ...o, status } : o)) };
}

export type OrderFilter = ShopOrderStatus | "all";

/** The orders page's status filter from `?status=…`, so the overview can link to a filtered list. */
export function parseOrderFilter(search: string): OrderFilter {
  const status = new URLSearchParams(search).get("status");
  return SHOP_ORDER_STATUSES.find((s) => s === status) ?? "all";
}

/** Search by order number or customer name, in either language. */
export function matchesQuery(order: ShopOrder, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [order.id, order.customer.th, order.customer.en].some((s) => s.toLowerCase().includes(q));
}
```

- [ ] **Step 3: Update `lib/demos/shop-admin/store.ts`.**

```ts
import { createDemoStore } from "@/lib/demo-store";
import { toISODate } from "@/lib/dates";
import { buildShopSeed, type ShopData } from "./data";

// The demo opens signed in, so visitors land on the overview. Logging out stores
// false, and the login screen then guards the admin until they log in again.
export const shopSession = createDemoStore<boolean>("shop-admin:session", true);
// The seed is built relative to today. The data key is scoped by day so a
// visitor returning on a later day gets a fresh seed instead of a saved
// dataset whose fixed calendar dates have drifted out of the "today"/30-day
// windows. "v2" drops data saved before names became bilingual.
export const shopData = createDemoStore<ShopData>(
  `shop-admin:data:v2:${toISODate(new Date())}`,
  buildShopSeed(new Date()),
);
```

- [ ] **Step 4: Create `app/demos/shop-admin/_components/copy.ts`.**

```ts
import type { L } from "@/lib/demos/lang";
import type { ShopChannel, ShopOrderStatus } from "@/lib/demos/shop-admin/data";

export const ui = {
  // Shell
  brand: { th: "ร้านดี", en: "Raan Dee" },
  brandTagline: { th: "ของฝากเชียงใหม่", en: "Chiang Mai souvenirs" },
  backOffice: { th: "ระบบหลังร้าน สาขานิมมาน", en: "Back office · Nimman branch" },
  ownerName: { th: "คุณนิ่ม", en: "Khun Nim" },
  ownerRole: { th: "เจ้าของร้าน", en: "Shop owner" },
  demoBanner: { th: "กำลังดูในฐานะเจ้าของร้าน (เดโม)", en: "Viewing as the shop owner (demo)" },
  logout: { th: "ออกจากระบบ", en: "Log out" },
  resetData: { th: "รีเซ็ตข้อมูล", en: "Reset data" },
  mainNav: { th: "เมนูหลัก", en: "Main menu" },
  navOverview: { th: "ภาพรวม", en: "Overview" },
  navOrders: { th: "คำสั่งซื้อ", en: "Orders" },
  navStock: { th: "สต็อกสินค้า", en: "Stock" },
  badgeOrders: { th: "รอแพ็ก {n} ออเดอร์", en: "{n} orders to pack" },
  badgeStock: { th: "ใกล้หมด {n} สินค้า", en: "{n} products running low" },

  // Overview
  greeting: { th: "สวัสดี คุณนิ่ม", en: "Hello, Khun Nim" },
  todayIs: { th: "วันนี้ {date}", en: "Today is {date}" },
  todoHeading: { th: "งานวันนี้", en: "Today's to-dos" },
  tileToPack: { th: "ต้องแพ็ก {n} ออเดอร์", en: "{n} orders to pack" },
  tileToPackAction: { th: "ดูออเดอร์ที่ต้องแพ็ก", en: "See orders to pack" },
  tileLow: { th: "ใกล้หมด {n} สินค้า", en: "{n} products running low" },
  tileLowAction: { th: "อัปเดตสต็อก", en: "Update stock" },
  tileSoldToday: { th: "ขายแล้ววันนี้", en: "Sold today" },
  tileSoldTodayFoot: { th: "{n} ออเดอร์ · ดูยอดขาย", en: "{n} orders · see sales" },
  queueHeading: { th: "คิวแพ็กของ", en: "Packing queue" },
  queueHint: {
    th: "แพ็กเสร็จแล้วกดปุ่มเดียว ระบบอัปเดตสถานะออเดอร์ให้ทันที",
    en: "Finished packing? One tap updates the order.",
  },
  markPacked: { th: "แพ็กแล้ว ✓", en: "Packed ✓" },
  markPackedLabel: { th: "แพ็กออเดอร์ {id} แล้ว", en: "Mark {id} as packed" },
  undo: { th: "เลิกทำ", en: "Undo" },
  undoLabel: { th: "เลิกทำออเดอร์ {id}", en: "Undo {id}" },
  queueEmpty: { th: "แพ็กครบทุกออเดอร์แล้ว", en: "Everything is packed." },
  queueMore: { th: "ดูอีก {n} ออเดอร์ในหน้าคำสั่งซื้อ", en: "See {n} more on the orders page" },
  salesHeading: { th: "ยอดขาย", en: "Sales" },
  dailySales: { th: "ยอดขายรายวัน", en: "Daily sales" },
  last30: { th: "30 วันล่าสุด", en: "Last 30 days" },
  salesDelta: { th: "{delta}% จากสัปดาห์ก่อน", en: "{delta}% on last week" },
  bestDay: { th: "วันที่ขายดีที่สุด {date}", en: "Best day {date}" },
  salesChartLabel: {
    th: "กราฟยอดขายรายวัน 30 วันล่าสุด รวม {total} วันที่ขายดีที่สุดคือ {date} {best}",
    en: "Daily sales for the last 30 days, {total} in total. The best day was {date} at {best}.",
  },
  topHeading: { th: "สินค้าขายดี", en: "Best sellers" },
  topHint: { th: "ตามยอดขาย 30 วัน", en: "By sales, last 30 days" },
  pieces: { th: "{n} ชิ้น", en: "{n} pcs" },
  channelHeading: { th: "ยอดขายตามช่องทาง", en: "Sales by channel" },
  orderCount: { th: "{n} บิล", en: "{n} orders" },

  // Orders
  ordersSummary: {
    th: "{n} บิลใน 30 วันล่าสุด รอแพ็ก {pack} บิล",
    en: "{n} orders in the last 30 days, {pack} to pack",
  },
  searchLabel: { th: "ค้นหาด้วยเลขที่บิลหรือชื่อลูกค้า", en: "Search by order number or customer" },
  searchPlaceholder: { th: "ค้นหาเลขที่บิล หรือชื่อลูกค้า", en: "Order number or customer name" },
  statusFilter: { th: "สถานะ", en: "Status" },
  statusAll: { th: "ทั้งหมด", en: "All" },
  orderStatusLabel: { th: "สถานะคำสั่งซื้อ {id}", en: "Order status {id}" },
  emptyTitle: { th: "ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง", en: "No orders match these filters" },
  emptyHint: {
    th: "ลองค้นด้วยเลขที่บิล เช่น RD-2001 หรือชื่อลูกค้า เช่น คุณเมย์",
    en: "Try an order number such as RD-2001, or a customer such as Khun May.",
  },
  clearFilters: { th: "ล้างตัวกรอง", en: "Clear filters" },
  pageRange: { th: "{from}–{to} จาก {n} บิล", en: "{from}–{to} of {n} orders" },
  prevPage: { th: "หน้าก่อนหน้า", en: "Previous page" },
  nextPage: { th: "หน้าถัดไป", en: "Next page" },
  receiptTotal: { th: "รวม", en: "Total" },

  // Stock
  stockIntro: {
    th: "แก้จำนวนคงเหลือแล้วกดบันทึก ระบบจะแจ้งเตือนเมื่อสินค้าถึงจุดสั่งซื้อ",
    en: "Change the count and press Save. Products at their reorder point are flagged.",
  },
  stockProducts: { th: "สินค้า", en: "Products" },
  stockItems: { th: "{n} รายการ", en: "{n} items" },
  stockValue: { th: "มูลค่าสต็อก", en: "Stock value" },
  stockUnits: { th: "รวม {n} ชิ้น", en: "{n} pieces in total" },
  lowStock: { th: "ใกล้หมด", en: "Running low" },
  colProduct: { th: "สินค้า", en: "Product" },
  colCategory: { th: "หมวด", en: "Category" },
  colPrice: { th: "ราคา", en: "Price" },
  colLevel: { th: "ระดับสต็อก", en: "Stock level" },
  colOnHand: { th: "คงเหลือ (ชิ้น)", en: "On hand (pcs)" },
  onHandLabel: { th: "จำนวนคงเหลือ {name}", en: "On hand: {name}" },
  save: { th: "บันทึก", en: "Save" },
  saved: { th: "บันทึกแล้ว", en: "Saved" },
  reorderAt: { th: "จุดสั่งซื้อ {n} ชิ้น", en: "Reorder at {n}" },
  stockError: { th: "ใส่จำนวนเต็มตั้งแต่ 0 ขึ้นไป", en: "Enter a whole number, 0 or more." },

  // Login
  loginTitle: { th: "ร้านดี — ระบบหลังร้าน", en: "Raan Dee back office" },
  loginSub: {
    th: "ดูยอดขาย จัดการคำสั่งซื้อ และอัปเดตสต็อกได้ในที่เดียว",
    en: "Sales, orders and stock, all in one place.",
  },
  email: { th: "อีเมล", en: "Email" },
  password: { th: "รหัสผ่าน", en: "Password" },
  loginNote: { th: "บัญชีตัวอย่าง กดเข้าสู่ระบบได้เลย", en: "This is a sample account. Just press Log in." },
  loginSubmit: { th: "เข้าสู่ระบบ", en: "Log in" },
  loginFoot: {
    th: "ข้อมูลในระบบตัวอย่างเก็บไว้ในเบราว์เซอร์นี้เท่านั้น",
    en: "The sample data is kept in this browser only.",
  },
} satisfies Record<string, L>;

export const statusLabel: Record<ShopOrderStatus, L> = {
  paid: { th: "รอแพ็ก", en: "To pack" },
  packed: { th: "แพ็กแล้ว", en: "Packed" },
  shipped: { th: "ส่งแล้ว", en: "Shipped" },
  cancelled: { th: "ยกเลิก", en: "Cancelled" },
};

export const channelLabel: Record<ShopChannel, L> = {
  line: { th: "LINE", en: "LINE" },
  shopee: { th: "Shopee", en: "Shopee" },
  store: { th: "หน้าร้าน", en: "In store" },
};
```

  Tasks 2 and 3 may add keys. Every new key must be an `L` with both languages.

- [ ] **Step 5: Rewrite `app/demos/shop-admin/_components/format.ts`.**

  `STATUS_STYLE` goes away. Task 2 styles statuses in the new palette.

```ts
import { MessageCircle, ShoppingBag, Store } from "lucide-react";
import { parseISODate } from "@/lib/dates";
import { formatDate } from "@/lib/demos/format";
import type { Lang } from "@/lib/demos/lang";
import type { ShopChannel, ShopOrder } from "@/lib/demos/shop-admin/data";

export const shortDate = (iso: string, lang: Lang) => formatDate(iso, lang, "dayMonth");
export const weekdayDate = (iso: string, lang: Lang) => formatDate(iso, lang, "weekdayDayMonth");
export const fullDate = (date: Date, lang: Lang) => formatDate(date, lang, "full");

/** Chart ticks: "19/10" reads the same in both languages. */
export const dayMonth = (iso: string) => {
  const d = parseISODate(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export const itemCount = (o: ShopOrder) => o.items.reduce((s, i) => s + i.qty, 0);

export const CHANNEL_ICON: Record<ShopChannel, typeof Store> = {
  line: MessageCircle,
  shopee: ShoppingBag,
  store: Store,
};
```

- [ ] **Step 6: Keep the current screens compiling.**

  Make the smallest edits to `overview.tsx`, `orders-table.tsx`, `stock-table.tsx` and `admin-shell.tsx` so `pnpm typecheck` and `pnpm lint` pass:
  - Read `.th` from `name`, `category` and `customer`.
  - Use `statusLabel[s].th` and `channelLabel[c].th` in place of the old maps.
  - Call `shortDate(iso, "th")`, `weekdayDate(iso, "th")` and `fullDate(d, "th")` in place of the old helpers.
  - Use `channelSales(data, today)` for the overview's channel list.
  - Replace the old status styles with one neutral class.

  Tasks 2 and 3 rewrite these files, so don't restyle anything here.

- [ ] **Step 7: Run the checks.**

  Run `pnpm vitest run tests/unit/shop-admin.test.ts tests/unit/shop-admin-copy.test.ts && pnpm typecheck && pnpm lint && pnpm test`. Expected: all pass.

  `tests/e2e/shop-admin.spec.ts` now fails on its login-wall tests. Task 2 rewrites that spec, so don't run it or change it here.

- [ ] **Step 8: Commit.**

```bash
git add lib/demos/shop-admin tests/unit/shop-admin.test.ts tests/unit/shop-admin-copy.test.ts app/demos/shop-admin/_components
git commit -F - <<'EOF'
feat(shop-admin): bilingual shop data, today helpers for packing, a signed-in demo session and the copy file

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Kraft shell, demo session banner, login, product icons, today-first overview (visual; use `frontend-design`)

**Invoke the `frontend-design` skill first.** Follow the approved mockup (`shop-directions.html`): option A's look (kraft paper, dark wood, mustard) with option B's today-first layout.

This is a small Chiang Mai souvenir shop's back office, used on the owner's phone as much as on a laptop. It should feel like their shop: warm kraft paper, wooden counter, stamped labels. It should not look like a generic SaaS dashboard. Each demo on the site has its own look, so don't borrow the Orders API's LINE phone or the resort's arches.

**Files:**
- Modify: `app/demos/shop-admin/layout.tsx`, `app/demos/shop-admin/(app)/page.tsx`, `app/demos/shop-admin/(app)/orders/page.tsx`, `app/demos/shop-admin/(app)/stock/page.tsx`, `app/demos/shop-admin/login/page.tsx`
- Rewrite: `_components/admin-shell.tsx`, `_components/login-form.tsx`, `_components/brand-mark.tsx`, `_components/overview.tsx`
- Create: `_components/product-icon.tsx`, plus any small shared pieces you need (for example `_components/stamp.tsx` for status stamps that Task 3 reuses)
- Rewrite: `tests/e2e/shop-admin.spec.ts`

**Interfaces:**
- Consumes:
  - From Task 1: everything listed in its Produces block.
  - Shared: `LangScope`, `useLang`, `DemoLangSwitch` from `@/components/demo/lang`; `fill`, `formatTHB` from `@/lib/demos/format`; `RequireSession`, `ResetDemoButton` (pass `label={ui.resetData[lang]}`), `DemoPill packageId="app-standard"`; `useDemoStore` from `@/lib/use-demo-store`.
- Produces, for Task 3:
  - `ProductIcon({ sku, className })`: an inline SVG with `data-testid="product-icon"` and `aria-hidden`.
  - A status stamp component and status colour classes for the four statuses.
  - The palette tokens.

**Fixed requirements:**

1. **Layout** (`layout.tsx`):
   - Load Bai Jamjuree and JetBrains Mono with `next/font/google`. Expose the mono as a CSS variable (for example `--font-mono`) for totals.
   - Set the palette from the Global Constraints on a `LangScope` wrapper.
   - Keep `DemoPill packageId="app-standard"`.
   - `metadata.title`: `{ template: "%s | Raan Dee Back Office", default: "Raan Dee Back Office · ร้านดี ระบบหลังร้าน" }`.
   - `metadata.description`: `"Raan Dee's back office, a fictional Chiang Mai souvenir shop: today's packing, orders, stock and sales."`
   - Page titles: overview `"Overview · ภาพรวม"`, orders `"Orders · คำสั่งซื้อ"`, stock `"Stock · สต็อกสินค้า"`, login `"Log in · เข้าสู่ระบบ"`.
2. **Shell** (`admin-shell.tsx`):
   - Keep `AdminFrame` wrapping `RequireSession store={shopSession} loginPath="/demos/shop-admin/login"`.
   - **Demo-session banner** (`data-testid="demo-session"`) across the top of every admin page:
     - It shows `ui.demoBanner` and a log-out button labelled `ui.logout`.
     - It is the only log-out control on the page.
     - Logging out runs `shopSession.set(false)` and then `router.push("/demos/shop-admin/login")`.
   - **Navigation:** `<nav aria-label={ui.mainNav}>` holding the three links (`ui.navOverview`, `ui.navOrders`, `ui.navStock`), with `aria-current="page"` on the active one.
     - The orders link shows a badge with the `toPack(data).length` count. Its screen-reader text is `fill(ui.badgeOrders, { n })`.
     - The stock link shows a badge with the low-stock count and `ui.badgeStock`.
     - Each link's accessible name must start with its label (for example `คำสั่งซื้อ`).
   - **Also in the shell:** the brand mark plus `ui.brand` and `ui.backOffice`; the owner (`ui.ownerName`, `ui.ownerRole`); the `ResetDemoButton`; and exactly one `DemoLangSwitch` with a visible focus ring.
   - **Layout:** a sidebar from `lg` and a compact top bar on phones, with the nav reachable on phones without sideways page scroll.
3. **Login** (`login-form.tsx`):
   - Same behaviour as today: any input is accepted, `setSession(true)` then `router.push("/demos/shop-admin")`, and an already signed-in visit is redirected to the overview.
   - All copy comes from `ui` (`loginTitle`, `loginSub`, `email`, `password`, `loginNote`, `loginSubmit`, `loginFoot`). Keep `data-testid="login-submit"` and the pre-filled sample values.
   - It has its own `DemoLangSwitch`, since the shell isn't on this page, and uses the kraft look.
4. **Brand mark** (`brand-mark.tsx`): a drawn inline-SVG mark for ร้านดี (for example a stamped or shop-sign shape with "ดี"), `aria-hidden`. Not a plain coloured square with a letter.
5. **Product icons** (`product-icon.tsx`):
   - `ProductIcon({ sku, className })`: one drawn inline SVG for each of the 12 SKUs, in the palette.
   - Draw: chilli-dip jars (green for NP-01, red for NP-02), two crackling bags, a coiled sai ua sausage, naem in a banana-leaf wrap, a tea tin, a coffee bag, round rice crackers, rolled wafers, a tamarind pack and a gift box.
   - Recognisable at 32px and at 56px.
   - Unknown SKUs get a plain parcel.
   - Every icon has `data-testid="product-icon"` and `aria-hidden`.
6. **Overview** (`overview.tsx`), in this order:
   1. **Greeting:** `<h1>` with `ui.greeting`, then `fill(ui.todayIs, { date: fullDate(today, lang) })`.
   2. **Three to-do tiles** under `ui.todoHeading`. Each tile is one link.
      - `data-testid="todo-pack"`: shows `fill(ui.tileToPack, { n })` with `n = toPack(data).length`, plus `ui.tileToPackAction`. It links to `/demos/shop-admin/orders?status=paid`.
      - `data-testid="todo-low"`: shows `fill(ui.tileLow, { n })` with the low-stock count, plus `ui.tileLowAction`. It links to `/demos/shop-admin/stock`.
      - `data-testid="todo-sold"`: the dark "till" card on `--wood`. It shows `ui.tileSoldToday`, today's `formatTHB(salesOn(data, toISODate(today)).revenue)` large, and `fill(ui.tileSoldTodayFoot, { n })`. It links to `#sales`.
   3. **Packing queue** (`ui.queueHeading`, `ui.queueHint`):
      - The rows come from `packingQueue(data, packedHere)`, where `packedHere` is component state holding the ids packed during this visit.
      - Each row is `data-testid="pack-row"` with `data-order-id={o.id}`. It shows:
        - the order number (mono), the customer in the current language, the channel label and `shortDate`;
        - each item as `ProductIcon` + name + `×qty`;
        - the total (mono).
      - While an order is `paid`, its row has a button showing `ui.markPacked`, with `aria-label={fill(ui.markPackedLabel, { id })}`. Tapping it calls `setData((d) => markPacked(d, id))` and adds the id to `packedHere`.
      - Once packed, the row stays in place, shows a stamped `statusLabel.packed`, and offers an undo button (`ui.undo`, `aria-label={fill(ui.undoLabel, { id })}`). Undo calls `setOrderStatus(d, id, "paid")` and removes the id from `packedHere`.
      - If more paid orders exist than are shown, end with a link `fill(ui.queueMore, { n })` to `/demos/shop-admin/orders?status=paid`. When there is nothing to pack, show `ui.queueEmpty`.
   4. **Sales**, a section with `id="sales"` and the heading `ui.salesHeading`. It is smaller than today's version:
      - **Compact daily chart** (keep `data-testid="sales-chart"`, `role="img"`, `aria-label` from `ui.salesChartLabel`): about 160–200px tall, an area or bar chart in mustard and wood. It shows the 30-day total with `ui.last30`, the change on last week with `ui.salesDelta`, and `ui.bestDay`. The tooltip date uses `weekdayDate`.
      - **Best sellers** (`ui.topHeading`, `ui.topHint`): the top 5, each with `ProductIcon`, name, `fill(ui.pieces, { n: qty })` and revenue.
      - **Sales by channel** (`ui.channelHeading`): `channelSales(data, today)`, each with `channelLabel`, `fill(ui.orderCount, { n })`, revenue and share.
   - The 4-tile KPI strip and the "low stock" panel are removed. The low-stock tile replaces the panel.
   - Read the clock once with `useState(() => new Date())`. It is safe because `RequireSession` renders only after hydration.
7. **Motion:**
   - A short "stamp" animation when an order is packed is welcome.
   - Under `prefers-reduced-motion: reduce` there is no animation, and the stamp simply appears.
8. **Removed:** every inline Thai or English literal in these files. Use copy only. The `kpi` test id goes away.

- [ ] **Step 1: Write the failing e2e tests.**

  Replace `tests/e2e/shop-admin.spec.ts` with this spec. Task 3 adds more tests to it.

```ts
import { expect, test, type Page } from "@playwright/test";

test.use({ locale: "th-TH" });

const nav = (page: Page) => page.getByRole("navigation", { name: "เมนูหลัก" });
const countIn = async (page: Page, testId: string) =>
  Number((await page.getByTestId(testId).innerText()).match(/\d+/)![0]);

test("opens on the overview without logging in", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  await expect(page).toHaveURL(/\/demos\/shop-admin$/);
  await expect(page.getByTestId("demo-session")).toContainText("กำลังดูในฐานะเจ้าของร้าน (เดโม)");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("สวัสดี คุณนิ่ม");
  await expect(page.getByTestId("todo-pack")).toContainText(/ต้องแพ็ก \d+ ออเดอร์/);
  await expect(page.getByTestId("todo-low")).toContainText(/ใกล้หมด \d+ สินค้า/);
  await expect(page.getByTestId("todo-sold")).toContainText("฿");
  await expect(page.getByTestId("pack-row").first()).toBeVisible();
  await expect(page.getByTestId("sales-chart")).toBeVisible();
});

test("one tap packs an order: the row stamps, the tile counts down, the order is packed", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  const before = await countIn(page, "todo-pack");
  const row = page.getByTestId("pack-row").first();
  const id = (await row.getAttribute("data-order-id"))!;
  await row.getByRole("button", { name: `แพ็กออเดอร์ ${id} แล้ว` }).click();
  await expect(page.locator(`[data-testid="pack-row"][data-order-id="${id}"]`)).toContainText("แพ็กแล้ว");
  await expect(page.getByTestId("todo-pack")).toContainText(`ต้องแพ็ก ${before - 1} ออเดอร์`);

  await nav(page).getByRole("link", { name: /^คำสั่งซื้อ/ }).click();
  await page.getByTestId("orders-search").fill(id);
  await expect(page.getByRole("combobox", { name: `สถานะคำสั่งซื้อ ${id}` })).toHaveValue("packed");
});

test("undo puts a packed order back in the queue", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  const before = await countIn(page, "todo-pack");
  const row = page.getByTestId("pack-row").first();
  const id = (await row.getAttribute("data-order-id"))!;
  await row.getByRole("button", { name: `แพ็กออเดอร์ ${id} แล้ว` }).click();
  await page.getByRole("button", { name: `เลิกทำออเดอร์ ${id}` }).click();
  await expect(page.getByRole("button", { name: `แพ็กออเดอร์ ${id} แล้ว` })).toBeVisible();
  await expect(page.getByTestId("todo-pack")).toContainText(`ต้องแพ็ก ${before} ออเดอร์`);
});

test("the sold-today till scrolls to the sales charts", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  await page.getByTestId("todo-sold").click();
  await expect(page.getByTestId("sales-chart")).toBeInViewport();
});

test("logging out shows the login, and logging in returns to the overview", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  await page.getByTestId("demo-session").getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/demos\/shop-admin\/login$/);
  await page.goto("/demos/shop-admin/orders");
  await expect(page).toHaveURL(/\/demos\/shop-admin\/login$/);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/demos\/shop-admin$/);
  await expect(page.getByTestId("demo-session")).toBeVisible();
});

test("a signed-in visit to the login page goes to the overview", async ({ page }) => {
  await page.goto("/demos/shop-admin/login");
  await expect(page).toHaveURL(/\/demos\/shop-admin$/);
});

test("stock edit persists across reload and reset restores it", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  await nav(page).getByRole("link", { name: /^สต็อกสินค้า/ }).click();
  const row = page.getByTestId("stock-row-NP-02");
  await row.getByTestId("stock-input").fill("50");
  await row.getByTestId("stock-save").click();
  await expect(row).not.toContainText("ใกล้หมด");
  await page.reload();
  await expect(page.getByTestId("stock-row-NP-02").getByTestId("stock-input")).toHaveValue("50");
  await page.getByTestId("reset-demo").click();
  await expect(page.getByTestId("stock-row-NP-02")).toContainText("ใกล้หมด");
});

test("empty stock input shows inline error and keeps stored stock", async ({ page }) => {
  await page.goto("/demos/shop-admin/stock");
  const row = page.getByTestId("stock-row-NP-02");
  const input = row.getByTestId("stock-input");
  const before = await input.inputValue();
  await input.fill("");
  await row.getByTestId("stock-save").click();
  await expect(row.getByRole("alert")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("stock-row-NP-02").getByTestId("stock-input")).toHaveValue(before);
  await expect(page.getByTestId("stock-row-NP-02").getByRole("alert")).toHaveCount(0);
});

const rowStatusSelects = (page: Page) => page.getByRole("combobox", { name: /^สถานะคำสั่งซื้อ / });
const orderIds = (page: Page) =>
  rowStatusSelects(page).evaluateAll((els) => els.map((e) => (e.getAttribute("aria-label") ?? "").replace("สถานะคำสั่งซื้อ ", "")));

test("orders search with no match shows the empty state", async ({ page }) => {
  await page.goto("/demos/shop-admin/orders");
  await page.getByTestId("orders-search").fill("ไม่มีลูกค้าคนนี้");
  await expect(page.getByTestId("orders-empty")).toBeVisible();
});

test("orders status filter shows only cancelled orders", async ({ page }) => {
  await page.goto("/demos/shop-admin/orders");
  await expect(rowStatusSelects(page)).toHaveCount(15);
  await page.getByRole("combobox", { name: "สถานะ", exact: true }).selectOption("cancelled");
  const selects = rowStatusSelects(page);
  await expect(selects.first()).toBeVisible();
  const count = await selects.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(15);
  for (let i = 0; i < count; i++) {
    await expect(selects.nth(i)).toHaveValue("cancelled");
    await expect(selects.nth(i).locator("option:checked")).toHaveText("ยกเลิก");
  }
});

test("changing an order status persists across reload", async ({ page }) => {
  await page.goto("/demos/shop-admin/orders");
  const first = rowStatusSelects(page).first();
  await expect(first).toBeVisible();
  const label = await first.getAttribute("aria-label");
  const current = await first.inputValue();
  const next = current === "cancelled" ? "paid" : "cancelled";
  await first.selectOption(next);
  await expect(first).toHaveValue(next);
  await page.reload();
  await expect(page.getByRole("combobox", { name: label ?? "" })).toHaveValue(next);
});

test("orders paginate 15 per page", async ({ page }) => {
  await page.goto("/demos/shop-admin/orders");
  await expect(rowStatusSelects(page)).toHaveCount(15);
  const firstPage = await orderIds(page);
  expect(new Set(firstPage).size).toBe(15);
  await page.getByRole("button", { name: "หน้าถัดไป" }).click();
  await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();
  const count = await rowStatusSelects(page).count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(15);
  const secondPage = await orderIds(page);
  expect(secondPage.filter((id) => firstPage.includes(id))).toEqual([]);
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the overview, banner and packing read in English", async ({ page }) => {
    await page.goto("/demos/shop-admin");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hello, Khun Nim");
    await expect(page.getByTestId("demo-session")).toContainText("Viewing as the shop owner (demo)");
    await expect(page.getByTestId("todo-pack")).toContainText(/\d+ orders to pack/);
    const row = page.getByTestId("pack-row").first();
    await expect(row).toContainText("Khun ");
    const id = (await row.getAttribute("data-order-id"))!;
    await row.getByRole("button", { name: `Mark ${id} as packed` }).click();
    await expect(page.locator(`[data-testid="pack-row"][data-order-id="${id}"]`)).toContainText("Packed");
  });

  test("the login reads in English", async ({ page }) => {
    await page.goto("/demos/shop-admin");
    await page.getByTestId("demo-session").getByRole("button", { name: "Log out" }).click();
    await expect(page.getByTestId("login-submit")).toHaveText("Log in");
  });
});
```

  Run `pnpm test:e2e tests/e2e/shop-admin.spec.ts`. Expected: FAIL, because `demo-session`, the tiles and `pack-row` don't exist yet.

- [ ] **Step 2: Build it.** Invoke `frontend-design`, then build the requirements above.

- [ ] **Step 3: Visual check.**
  - Run `pnpm dev --port 3000` and use a screenshot script in `.superpowers/sdd/`, so `@playwright/test` resolves.
  - Set the language with `localStorage.setItem("demo:lang", JSON.stringify("th"))` (or `"en"`) in `addInitScript`, and hide `[data-testid=demo-pill]`.
  - Take full-page shots at 1440×900 and 375×812 in both languages of the overview and the login.
  - Look at every one. Fix anything clipped, overlapping, empty or overflowing. Make sure the overview's first screen at 375 shows the greeting and at least the first two tiles.
  - Save them as `.superpowers/sdd/shop-overview-{desk,phone}-{th,en}.jpg` and `.superpowers/sdd/shop-login-{desk,phone}-th.jpg`, then stop the server.

- [ ] **Step 4: Checks.**
  - Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/shop-admin.spec.ts tests/e2e/smoke.spec.ts`. Expected: all pass on both projects. The smoke test confirms there are no console errors or hydration warnings.
  - The orders and stock tests run against Task 1's minimally edited screens and must pass too.
  - Then run `pnpm test:e2e tests/e2e/shop-admin.spec.ts --repeat-each=3`. Expected: no flakes.

- [ ] **Step 5: Commit.**

```bash
git add -A app/demos/shop-admin tests/e2e/shop-admin.spec.ts
git commit -F - <<'EOF'
feat(shop-admin): kraft back office that opens on today, with a packing queue, a demo session instead of a login wall, and drawn product icons, in Thai and English

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Receipt-style orders and the stock page (visual; use `frontend-design`)

**Invoke the `frontend-design` skill first**, and follow the look Task 2 set up (read `layout.tsx`, `admin-shell.tsx`, `overview.tsx` and the stamp and product-icon components before you start).

**Files:**
- Rewrite: `app/demos/shop-admin/_components/orders-table.tsx`, `app/demos/shop-admin/_components/stock-table.tsx`
- Modify: `app/demos/shop-admin/_components/copy.ts` (new keys only, if needed)
- Modify: `tests/e2e/shop-admin.spec.ts` (append the tests below)

**Interfaces:**
- Consumes:
  - From Task 1: `parseOrderFilter`, `matchesQuery`, `setOrderStatus`, `SHOP_ORDER_STATUSES`, `OrderFilter`, `isLowStock`, `updateStock`, `toPack`, `ui`, `statusLabel`, `channelLabel`, `shortDate`, `itemCount`, `CHANNEL_ICON`.
  - From Task 2: `ProductIcon`, the status stamp, and the palette tokens.

**Fixed requirements:**

1. **Orders page** (`orders-table.tsx`):
   - **Header:** an `<h1>` with `ui.navOrders`, then `fill(ui.ordersSummary, { n, pack })`, where `pack = toPack(data).length`.
   - **Search:** labelled `ui.searchLabel`, with placeholder `ui.searchPlaceholder`. Keep `data-testid="orders-search"`. It filters with `matchesQuery`.
   - **Status filter:** a `<select>` labelled exactly `ui.statusFilter`. The options are `ui.statusAll (n)` and then each status's `statusLabel (count)`.
     - Its initial value is `parseOrderFilter(window.location.search)`, read in a `useState` initializer. That is safe because `RequireSession` renders only after hydration.
     - Changing it does not need to rewrite the URL.
   - **Receipt cards** (`data-testid="receipt"`), 15 per page, in a grid (1 column on phones, 2–3 on wide screens). Each card:
     - looks like a till receipt: paper, zigzag (torn) top and bottom edges made with CSS masks or SVG, and no images;
     - shows the order number (mono), date (`shortDate`), customer, and channel (icon + `channelLabel`);
     - lists each item as `ProductIcon` + name + `×qty` + line amount (mono);
     - has a dashed rule, then `ui.receiptTotal` with the total in mono (struck through when cancelled);
     - shows a stamped status (the Task 2 stamp, slightly rotated, coloured by status);
     - includes the status `<select>` labelled `fill(ui.orderStatusLabel, { id })` with the four statuses' labels. It may be styled as, or sit beside, the stamp.
   - **Empty state:** `data-testid="orders-empty"` with `ui.emptyTitle`, `ui.emptyHint` and a `ui.clearFilters` button.
   - **Pagination:**
     - `fill(ui.pageRange, …)`;
     - buttons labelled `ui.prevPage` and `ui.nextPage`;
     - a counter whose whole text is `<current> / <pages>`.
2. **Stock page** (`stock-table.tsx`): the same behaviour as today (`StockRow` editing, validation, "saved" hint, sync on reset), restyled in kraft. Specifically:
   - An `<h1>` with `ui.navStock`, plus `ui.stockIntro`.
   - The three summary figures: `ui.stockProducts` with `fill(ui.stockItems)`; `ui.stockValue`, with `fill(ui.stockUnits)` for screen readers; and `ui.lowStock`.
   - Each row shows a `ProductIcon` (about 40px), the name and category in the current language, the SKU (mono), the price, and the stock bar with its reorder tick (from `lg`).
   - Low rows show a `ui.lowStock` badge.
   - The input is labelled `fill(ui.onHandLabel, { name })`, with `ui.save`, `ui.saved` and `fill(ui.reorderAt, { n })`.
   - The validation error shows `ui.stockError[lang]` for the known `updateStock` message, and the raw message otherwise.
   - Keep `stock-row-<SKU>`, `stock-input` and `stock-save`.
   - Column headers come from the `ui.col*` keys.
3. **Removed:** every inline Thai or English literal in these two files.
4. **Text sizes:** follow the Global Constraints.

- [ ] **Step 1: Write the failing e2e tests.**

  Append to `tests/e2e/shop-admin.spec.ts`, after the Thai tests and before `test.describe("in English"`:

```ts
test("the to-pack tile opens the orders filtered to packing", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  const n = await countIn(page, "todo-pack");
  await page.getByTestId("todo-pack").click();
  await expect(page).toHaveURL(/\/demos\/shop-admin\/orders\?status=paid$/);
  await expect(page.getByRole("combobox", { name: "สถานะ", exact: true })).toHaveValue("paid");
  await expect(page.getByTestId("receipt")).toHaveCount(Math.min(n, 15));
});

test("orders are receipts with items, a total and a stamped status", async ({ page }) => {
  await page.goto("/demos/shop-admin/orders");
  const receipts = page.getByTestId("receipt");
  await expect(receipts).toHaveCount(15);
  const first = receipts.first();
  await expect(first).toContainText(/RD-\d{4}/);
  await expect(first).toContainText("รวม");
  await expect(first).toContainText("฿");
  await expect(first.getByTestId("product-icon").first()).toBeVisible();
  await expect(first.getByRole("combobox", { name: /^สถานะคำสั่งซื้อ RD-\d{4}$/ })).toBeVisible();
});

test("stock rows show a drawn product icon", async ({ page }) => {
  await page.goto("/demos/shop-admin/stock");
  await expect(page.getByTestId("stock-row-NP-02").getByTestId("product-icon")).toBeVisible();
  await expect(page.getByTestId("stock-row-GF-01")).toContainText("กล่องของฝากรวม");
});
```

  Inside `test.describe("in English", …)` add:

```ts
  test("orders and stock read in English and search finds English names", async ({ page }) => {
    await page.goto("/demos/shop-admin/orders");
    await expect(page.getByRole("combobox", { name: /^Order status RD-\d{4}$/ }).first()).toBeVisible();
    await page.getByTestId("orders-search").fill("Khun May");
    await expect(page.getByTestId("receipt").first()).toContainText("Khun May");
    await page.goto("/demos/shop-admin/stock");
    await expect(page.getByTestId("stock-row-GF-01")).toContainText("Chiang Mai gift box");
    await expect(page.getByTestId("stock-row-NP-02")).toContainText("Running low");
  });
```

  Run `pnpm test:e2e tests/e2e/shop-admin.spec.ts`. Expected: the new tests FAIL, because `receipt` doesn't exist and the filter doesn't read the URL yet.

- [ ] **Step 2: Build it.** Invoke `frontend-design`, then build the requirements above.

- [ ] **Step 3: Visual check.**
  - Use the same method as Task 2, with full-page shots of `/demos/shop-admin/orders` and `/demos/shop-admin/stock` at 1440×900 and 375×812 in both languages.
  - Fix anything clipped, overlapping or overflowing. Check that the zigzag edges render in Chromium at both widths.
  - Save the shots as `.superpowers/sdd/shop-{orders,stock}-{desk,phone}-{th,en}.jpg`.

- [ ] **Step 4: Checks.**
  - Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/shop-admin.spec.ts tests/e2e/smoke.spec.ts`. Expected: all pass on both projects.
  - Then run `pnpm test:e2e tests/e2e/shop-admin.spec.ts --repeat-each=3`. Expected: no flakes.

- [ ] **Step 5: Commit.**

```bash
git add -A app/demos/shop-admin tests/e2e/shop-admin.spec.ts
git commit -F - <<'EOF'
feat(shop-admin): receipt-style orders with stamped statuses and a kraft stock page with product icons, in Thai and English

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Shared language test, hub thumbnails, full verification

**Files:** `tests/e2e/demo-lang.spec.ts`. Regenerate `public/thumbs/app-standard.jpg` and `public/thumbs/pages/app-standard-{1,2,3}.jpg`.

- [ ] **Step 1: Add the shop admin to `DEMOS`.**

  Append this to `DEMOS` in `tests/e2e/demo-lang.spec.ts`. The nav labels prove the language, and the orders page is the second page.

```ts
  { name: "shop admin", home: "/demos/shop-admin", next: "/demos/shop-admin/orders", where: "navigation", en: "Orders", th: "คำสั่งซื้อ" },
```

  Run `pnpm test:e2e tests/e2e/demo-lang.spec.ts`. Expected: PASS on both projects.

  `probe()` takes the first `navigation` landmark on the page. If the demo pill's landmark comes first and the test fails for that reason, report it rather than changing the shared test.

- [ ] **Step 2: Regenerate the thumbnails.**

  The capture script already seeds `demo:shop-admin:session` as `true` and the language as Thai.

```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
git add public/thumbs/app-standard.jpg public/thumbs/pages/app-standard-1.jpg public/thumbs/pages/app-standard-2.jpg public/thumbs/pages/app-standard-3.jpg
git checkout -- public/thumbs
```

  Open the four images. They should show the kraft overview (greeting, tiles, queue), the receipts and the stock page, all in Thai.

- [ ] **Step 3: Full verification.** Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`. Expected: everything passes.

- [ ] **Step 4: Commit.**

```bash
git add tests/e2e/demo-lang.spec.ts public/thumbs/app-standard.jpg public/thumbs/pages/app-standard-1.jpg public/thumbs/pages/app-standard-2.jpg public/thumbs/pages/app-standard-3.jpg
git commit -F - <<'EOF'
test(shop-admin): shared language test; hub thumbnails for the new back office

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
