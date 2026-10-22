# Orders API: Shop Owner First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Web app Basic demo (`/demos/orders-api`) so a shop owner sees what they're buying first, and nothing on the page starts empty. The page also becomes fully bilingual through the shared demo switch.

What a shop owner should see first:
- orders arriving in the shop's LINE on their own;
- a short, plain-language pitch;
- a small "for your developer" log.

Below that come a three-lane "how it works" section, then the existing try-it console and reference, restyled light.

**Architecture:**
- The mock API (`lib/demos/orders-api/api.ts`) returns LINE notifications as structured data instead of English text, so the page can word them in the current language.
- A pure "story" module replays a fixed loop of requests through the same API, on its own in-memory orders. Its output drives the hero and the lanes.
- All interface copy moves to `app/demos/orders-api/_components/copy.ts` as `L` values.

**Tech stack:** Next.js 16.4 App Router (static export), React 19, TypeScript strict, Tailwind 4, Anuphan + JetBrains Mono (already loaded), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-22-demo-rework-bilingual-design.md`: Part 2 "Orders API", Part 3 step 5.

**Approved mockup:** `.superpowers/brainstorm/19193-1792598876/content/api-directions.html`. Direction **A** is the top section, and the **B** lanes go below it as "how it works".

## Global Constraints

- **Static export:** keep `output: "export"`. Add no new dependencies.
- **Next.js:** read `node_modules/next/dist/docs/` before using a Next.js API not already used in this repo (AGENTS.md).
- **Fonts:** Anuphan for UI, JetBrains Mono for code. No serif fonts. No `font-light`.
- **Light palette** (replaces the dark page palette; set on the layout wrapper):

  | Token | Value |
  |---|---|
  | `--bg` | `#f6f7f4` |
  | `--panel` | `#ffffff` |
  | `--panel-2` | `#eef1ec` |
  | `--line` | `#d9ded6` |
  | `--text` | `#15201a` |
  | `--muted` | `#55615a` |
  | `--get` | `#1a7f37` |
  | `--post` | `#0969da` |
  | `--patch` | `#9a6700` |
  | `--err` | `#cf222e` |
  | `--line-green` | `#06c755` (decorative fills only) |
  | `--line-green-ink` | `#067a37` (green text) |

- **Contrast:**
  - Method and status colours may only be used as text on `--panel` (white) or `--bg`, where they measure 4.5:1 or better. They fail on `--panel-2`.
  - Code panels (request body, response, curl, the developer log) may stay dark. They use `--code-bg #0e1116`, `--code-text #e6edf3`, `--code-muted #8b949e` and the dark method colours `#3fb950` / `#58a6ff` / `#d29922` / `#f85149` (all 5.6:1 or better on `#0e1116`).
  - Any other text/background pair must be checked against AA before use.
- **Text sizes:** body text at least 16px. Small print, labels and code at least 14px. Method badges and the LINE phone's tiny chrome (status bar, timestamps) are decorative and may be 12px.
- **Language:**
  - Every visible string, `aria-label` and placeholder comes from `copy.ts` as an `L` value and renders in `useLang()`'s language.
  - API data stays as it is: JSON keys, status codes, and the Thai sample customers and products. It is a Thai shop's data.
  - The seller refers to themselves only as "เรา"; "คุณ" for the customer is fine.
  - Brand: Thai `ร้านดี`, English `Raan Dee`.
- **Nothing starts empty:**
  - The hero phone and developer log show events from first paint after hydration.
  - The console's response panel shows a labelled example response before the first send.
  - The console's LINE phone starts with one earlier message.
- **Motion:**
  - The story autoplays every **1.8 s**. It pauses when the hero is off-screen (IntersectionObserver) or the tab is hidden.
  - Under `prefers-reduced-motion: reduce`, the hero, log and lanes show a static filled state (the first 4 events) with no timer.
- **Test ids kept:** `endpoint-<METHOD>-<path>`, `api-send`, `api-body`, `api-path`, `api-status`, `api-response`, `line-preview`, `reset-demo`.
- **Test ids added:** `story-phone` (hero LINE), `story-log` (developer log), `story-lanes` (how it works), `example-response` (the pre-send example).
- **Accessibility:** no horizontal overflow at 375px or 1440px. Visible focus. The autoplaying phone is `role="log"` with `aria-live="off"` (it must not chatter). The console's phone, which reacts to the visitor's own requests, keeps `aria-live="polite"`.
- **Commits:** end every message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, and add no other attribution line.
- **Branch:** `feat/orders-api-rework`, cut from `main`. Never push or merge without Ohm's OK; merging deploys devbyohm.com.

## File map

| File | Change | Responsibility |
|---|---|---|
| `lib/demos/orders-api/api.ts` | Modify | `LineNotification` becomes structured |
| `tests/unit/orders-api.test.ts` | Modify | Assert the structured notifications |
| `lib/demos/orders-api/story.ts` | Create | `STORY`, `storyEvents(now)` |
| `tests/unit/orders-api-story.test.ts` | Create | Story replays cleanly |
| `app/demos/orders-api/_components/copy.ts` | Create | All interface copy |
| `tests/unit/orders-api-copy.test.ts` | Create | Copy completeness |
| `app/demos/orders-api/layout.tsx` | Modify | Light palette, `LangScope`, static bilingual title |
| `app/demos/orders-api/page.tsx` | Rewrite | Owner-first hero, lanes, console, reference |
| `app/demos/orders-api/_components/*` | Modify/create | Story player, hero phone, dev log, lanes; console/playground/line-preview made bilingual and light |
| `tests/e2e/orders-api.spec.ts` | Modify | Story plays, example response, English |
| `tests/e2e/demo-lang.spec.ts` | Modify | Add the Orders API |
| `public/thumbs/app-basic.jpg`, `public/thumbs/pages/app-basic-1.jpg` | Regenerate | New look on the hub |

---

### Task 1: Structured notifications, the story, the copy

**Files:**
- Modify: `lib/demos/orders-api/api.ts`, `tests/unit/orders-api.test.ts`
- Create: `lib/demos/orders-api/story.ts`, `tests/unit/orders-api-story.test.ts`
- Create: `app/demos/orders-api/_components/copy.ts`, `tests/unit/orders-api-copy.test.ts`
- Modify: `app/demos/orders-api/_components/api-console.tsx`. Make only the minimal change that keeps it compiling: format the structured notification in Thai with a temporary local helper. Task 2 replaces this.

**Interfaces:**
- Produces, from `@/lib/demos/orders-api/api`:

```ts
export type LineNotification =
  | { kind: "new"; orderId: string; customer: string; itemCount: number; total: number }
  | { kind: "status"; orderId: string; customer: string; from: OrderStatus; to: OrderStatus };
```

- Produces, from `@/lib/demos/orders-api/story`:
  - `interface StoryEvent { seq: number; request: ApiRequest; response: ApiResponse }`
  - `STORY_LENGTH`
  - `storyEvents(now: Date): StoryEvent[]`
- Produces, from `copy.ts`: `ui` (keys below), `endpointCopy` (per-endpoint summaries), `statusHelp`, `orderFieldNotes`.

- [ ] **Step 1: Write the failing tests.**

  In `tests/unit/orders-api.test.ts`:
  - Replace `expect(response.notification?.lines[0]).toContain("ORD-1009");` with:

```ts
    expect(response.notification).toMatchObject({ kind: "new", orderId: "ORD-1009" });
```

  - Replace `expect(response.notification?.lines[1]).toMatch(/→ shipped$/);` with:

```ts
    expect(response.notification).toMatchObject({ kind: "status", to: "shipped" });
```

  Create `tests/unit/orders-api-story.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { STORY_LENGTH, storyEvents } from "@/lib/demos/orders-api/story";

const now = new Date("2026-10-22T03:00:00.000Z");

describe("storyEvents", () => {
  const events = storyEvents(now);

  it("plays one full round of the story", () => {
    expect(events).toHaveLength(STORY_LENGTH);
    expect(events.map((e) => e.seq)).toEqual(events.map((_, i) => i));
  });

  it("only makes requests the API accepts", () => {
    for (const e of events) expect(e.response.status).toBeLessThan(300);
  });

  it("opens with a new order that pings LINE", () => {
    expect(events[0].request.method).toBe("POST");
    expect(events[0].response.status).toBe(201);
    expect(events[0].response.notification).toMatchObject({ kind: "new", orderId: "ORD-1001" });
  });

  it("ends with every order shipped", () => {
    const last = new Map<string, string>();
    for (const e of events) {
      const n = e.response.notification;
      if (n?.kind === "new") last.set(n.orderId, "pending");
      if (n?.kind === "status") last.set(n.orderId, n.to);
    }
    expect([...last.values()].every((s) => s === "shipped")).toBe(true);
    expect(last.size).toBe(4);
  });

  it("is the same every time", () => {
    expect(storyEvents(now)).toEqual(events);
  });
});
```

  Create `tests/unit/orders-api-copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import * as copy from "@/app/demos/orders-api/_components/copy";
import { missingTranslations } from "./helpers/missing-translations";

describe("orders API copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations(copy)).toEqual([]);
  });

  it("words both kinds of LINE message with their placeholders", () => {
    for (const key of ["lineNewTitle", "lineNewBody", "lineStatusTitle", "lineStatusBody"] as const) {
      expect(copy.ui[key].th.length).toBeGreaterThan(0);
      expect(copy.ui[key].en.length).toBeGreaterThan(0);
    }
    expect(copy.ui.lineNewBody.en).toContain("{items}");
    expect(copy.ui.lineNewBody.en).toContain("{total}");
    expect(copy.ui.lineStatusBody.th).toContain("{to}");
  });
});
```

  Run `pnpm test tests/unit/orders-api.test.ts tests/unit/orders-api-story.test.ts tests/unit/orders-api-copy.test.ts`.
  Expected: FAIL. The notification is still the old `{ title, lines }` shape, and the story and copy modules don't exist yet.

- [ ] **Step 2: Implement.**

  In `lib/demos/orders-api/api.ts`, replace the `LineNotification` interface with the union above and update the two places that build notifications:

```ts
      return {
        orders: [order, ...orders],
        response: respond(201, { data: order }, {
          kind: "new",
          orderId: order.id,
          customer: order.customer,
          itemCount: order.items.reduce((sum, i) => sum + i.qty, 0),
          total: order.total,
        }),
      };
```

```ts
    response: respond(200, { data: updated }, {
      kind: "status",
      orderId: updated.id,
      customer: updated.customer,
      from: order.status,
      to: status,
    }),
```

  Then delete the now-unused `baht` helper.

  Create `lib/demos/orders-api/story.ts`:

```ts
import { handleRequest, type ApiRequest, type ApiResponse, type Order } from "./api";

export interface StoryEvent {
  seq: number;
  request: ApiRequest;
  response: ApiResponse;
}

// Four sample orders from a northern-Thai snack shop. They arrive, get paid and ship, interleaved like a real morning.
const ORDERS = [
  { customer: "คุณนิด", items: [{ sku: "NP-01", name: "น้ำพริกหนุ่ม", qty: 2, price: 120 }] },
  { customer: "คุณต้น", items: [{ sku: "KM-02", name: "แคบหมู", qty: 3, price: 80 }] },
  { customer: "คุณแอน", items: [{ sku: "SU-03", name: "ไส้อั่ว", qty: 1, price: 180 }] },
  { customer: "คุณเมย์", items: [{ sku: "NA-04", name: "น้ำพริกอ่อง", qty: 2, price: 110 }] },
];

type Step = [order: number, action: "new" | "paid" | "shipped"];

const STORY: Step[] = [
  [0, "new"], [1, "new"], [0, "paid"], [2, "new"], [1, "paid"], [0, "shipped"],
  [3, "new"], [2, "paid"], [1, "shipped"], [3, "paid"], [2, "shipped"], [3, "shipped"],
];

export const STORY_LENGTH = STORY.length;

/** One full round of the story, replayed through the real mock API on a fresh, private order list. */
export function storyEvents(now: Date): StoryEvent[] {
  let orders: Order[] = [];
  const ids: string[] = [];
  return STORY.map(([n, action], seq) => {
    const request: ApiRequest =
      action === "new"
        ? { method: "POST", path: "/orders", body: ORDERS[n] }
        : { method: "PATCH", path: `/orders/${ids[n]}/status`, body: { status: action } };
    const result = handleRequest(orders, request, new Date(now.getTime() + seq * 60_000));
    orders = result.orders;
    if (action === "new") ids[n] = (result.response.body as { data: Order }).data.id;
    return { seq, request, response: result.response };
  });
}
```

  Create `app/demos/orders-api/_components/copy.ts`:
  - Fill it with **every** user-facing string currently in `page.tsx`, `_components/playground.tsx`, `_components/api-console.tsx` and `_components/line-preview.tsx`, plus the new strings below.
  - For existing strings, keep the Thai exactly. Write natural, professional English (the reference already has some English: reuse it).
  - Structure:
    - `export const ui = { … } satisfies Record<string, L>;`
    - `export const endpointCopy: Record<string, L>`, keyed `"GET /orders"` etc. These are the four summaries, Thai from `THAI_SUMMARY`, English from `ENDPOINTS[].summary`.
    - `export const statusHelp: Record<number, L>`, from `STATUS_HELP`.
    - `export const orderFieldNotes: Record<string, L>`, from `ORDER_FIELDS`.
  - New strings (use verbatim):

```ts
  brand: { th: "ร้านดี", en: "Raan Dee" },
  heroKicker: { th: "ร้านดี · ระบบรับออเดอร์", en: "Raan Dee · order system" },
  heroTitle: { th: "ออเดอร์เข้าปุ๊บ เด้งใน LINE ปั๊บ", en: "An order comes in, and LINE pings right away" },
  heroSub: {
    th: "รับออเดอร์จากเว็บ แชต หรือหน้าร้านไว้ที่เดียว ร้านรู้ทันทีทุกครั้งที่มีออเดอร์ใหม่หรือสถานะเปลี่ยน",
    en: "Orders from your website, chat or counter land in one place, and the shop hears about every new order and status change straight away.",
  },
  benefitLine: { th: "แจ้งเตือนเข้า LINE ร้านอัตโนมัติ", en: "Automatic alerts in the shop's LINE" },
  benefitStatus: { th: "ติดตามสถานะ รอจ่าย → จ่ายแล้ว → ส่งแล้ว", en: "Track every order: pending → paid → shipped" },
  benefitApi: { th: "ต่อกับเว็บหรือแอปที่มีอยู่ได้ผ่าน API", en: "Connects to your existing website or app through an API" },
  devLogTitle: { th: "สำหรับนักพัฒนา", en: "For your developer" },
  devLogHint: { th: "คำขอ API ที่อยู่เบื้องหลังแต่ละข้อความ", en: "The API call behind each message" },
  tryIt: { th: "ลองยิงคำขอเอง", en: "Try a request yourself" },
  lanesHeading: { th: "ระบบทำงานอย่างไร", en: "How it works" },
  lanesSub: {
    th: "ทุกออเดอร์วิ่งจากหน้าร้านเข้า API แล้วแจ้งเตือนเข้า LINE ของร้าน",
    en: "Every order travels from your shop front through the API and into the shop's LINE.",
  },
  laneShop: { th: "หน้าร้าน / เว็บ", en: "Shop front / website" },
  laneApi: { th: "Orders API", en: "Orders API" },
  laneLine: { th: "LINE ของร้าน", en: "The shop's LINE" },
  lineNewTitle: { th: "🛒 ออเดอร์ใหม่", en: "🛒 New order" },
  lineNewBody: { th: "{items} ชิ้น · {total}", en: "{items} items · {total}" },
  lineStatusTitle: { th: "📦 อัปเดตสถานะออเดอร์", en: "📦 Order status updated" },
  lineStatusBody: { th: "{from} → {to}", en: "{from} → {to}" },
  statusPending: { th: "รอชำระ", en: "pending" },
  statusPaid: { th: "ชำระแล้ว", en: "paid" },
  statusShipped: { th: "ส่งแล้ว", en: "shipped" },
  statusCancelled: { th: "ยกเลิก", en: "cancelled" },
  exampleResponse: { th: "ตัวอย่าง response", en: "Example response" },
  exampleResponseHint: { th: "กด Send เพื่อยิงคำขอจริงในเบราว์เซอร์", en: "Press Send to make a real request in your browser" },
  resetDemo: { th: "รีเซ็ตข้อมูลตัวอย่าง", en: "Reset sample data" },
```

  - In `api-console.tsx`, make only the change needed to compile: where it spreads `notification` into a `LineMessage`, convert with a small local function. It turns `{kind:"new"}` into `{ title: "🛒 ออเดอร์ใหม่", lines: [\`${n.orderId} · ${n.customer}\`, \`${n.itemCount} ชิ้น · ฿${n.total.toLocaleString("en-US")}\`] }`, and `{kind:"status"}` into `{ title: "📦 อัปเดตสถานะออเดอร์", lines: [\`${n.orderId} · ${n.customer}\`, \`${n.from} → ${n.to}\`] }`. Mark it `// temporary: Task 2 renders this per language`.

- [ ] **Step 3: Run the tests and confirm they pass.**

  Run `pnpm test tests/unit/orders-api.test.ts tests/unit/orders-api-story.test.ts tests/unit/orders-api-copy.test.ts`. Expected: PASS.

  Then run `pnpm typecheck && pnpm lint && pnpm test`, then `pnpm test:e2e tests/e2e/orders-api.spec.ts`. Expected: all pass. The page is unchanged apart from the notification wording, and the existing e2e still finds `ORD-1009` in the LINE preview.

- [ ] **Step 4: Commit.**

```bash
git add lib/demos/orders-api tests/unit/orders-api.test.ts tests/unit/orders-api-story.test.ts tests/unit/orders-api-copy.test.ts app/demos/orders-api/_components/copy.ts app/demos/orders-api/_components/api-console.tsx
git commit -F - <<'EOF'
feat(orders-api): structured LINE notifications, a replayable order story, bilingual copy

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Rebuild the page, shop owner first (visual; use `frontend-design`)

**Invoke the `frontend-design` skill first.** Follow the approved mockup (`api-directions.html`): option A on top, B's lanes below. This is the Basic web-app plan, so it sells an API with LINE alerts, not an admin dashboard. Don't add a kanban or board UI.

**Files:**
- Modify: `app/demos/orders-api/layout.tsx`, `app/demos/orders-api/page.tsx`
- Modify: `app/demos/orders-api/_components/api-console.tsx`, `playground.tsx`, `line-preview.tsx`, `http.tsx`
- Create, as you see fit: `_components/story-player.tsx` (the shared autoplay hook or context), `_components/owner-hero.tsx`, `_components/dev-log.tsx`, `_components/story-lanes.tsx`, `_components/line-message.tsx` (renders a `LineNotification` in the current language)
- Modify: `tests/e2e/orders-api.spec.ts`

**Interfaces:**
- Consumes: from Task 1, `storyEvents`, `STORY_LENGTH`, `LineNotification`, `ui`, `endpointCopy`, `statusHelp`, `orderFieldNotes`; plus `useLang`, `LangScope`, `DemoLangSwitch`, `fill`, `formatTHB`, `useHydrated`, `ResetDemoButton` (pass `label={ui.resetDemo[lang]}`).

**Fixed requirements:**

1. **Layout:**
   - Use the light palette tokens from the Global Constraints, plus the `--code-*` tokens for code panels.
   - Wrap in `LangScope`.
   - `metadata.title`: `"Orders API · Raan Dee"`.
   - `description`: `"Raan Dee's Orders API: a small REST API that takes orders and pings the shop on LINE. A fictional business for a demo site."`
   - Keep `DemoPill packageId="app-basic"`.
2. **Header:**
   - The brand mark with `ui.brand`.
   - In-page links for "how it works", "try it" and "reference" (labels from copy; reuse the existing ones where they exist).
   - A `DemoLangSwitch`, styled to fit, with a visible focus ring. There is exactly one on the page.
3. **Owner-first hero** (top of `main`):
   - Left column: `ui.heroKicker`, an `<h1>` with `ui.heroTitle`, `ui.heroSub`, the three benefits with a check mark each, and a link to `#try` labelled `ui.tryIt`.
   - Middle: the shop's LINE phone (`data-testid="story-phone"`, `role="log"`, `aria-live="off"`, labelled), showing the latest 4 story notifications rendered by the shared LINE message component.
   - Right: the dark developer log (`data-testid="story-log"`) titled `ui.devLogTitle` with `ui.devLogHint`. It shows the latest 6 requests as `METHOD path status`, coloured with the dark method colours.
   - Layout: three columns from `lg`. On phones the order is text, then phone, then log.
4. **Story player:**
   - One shared player feeds the hero phone, the log and the lanes.
   - It steps through `storyEvents(new Date())` every 1.8 s, looping. After `STORY_LENGTH` steps it starts a new round and clears the displays.
   - It pauses when the hero is off-screen and the lanes section is also off-screen, or when `document.hidden` is true.
   - Before hydration it renders a stable empty frame (the same height, so nothing shifts). Right after hydration it shows the first 3 events immediately, so the page never looks empty. Then it continues on the timer.
   - Under reduced motion: show the first 4 events, with no timer.
5. **LINE messages** (the shared component, used in the hero, the lanes and the console phone) render from a `LineNotification` in the current language:
   - Title: `ui.lineNewTitle` or `ui.lineStatusTitle`.
   - First line: `orderId · customer`.
   - Second line: `fill(ui.lineNewBody, { items, total: formatTHB(total) })`, or `fill(ui.lineStatusBody, { from, to })`. `from` and `to` are status words from `ui.statusPending` and the like.
   - The bubble footer text is copy too ("ดูออเดอร์").
6. **How it works** (`data-testid="story-lanes"`):
   - `h2` `ui.lanesHeading`, `ui.lanesSub`.
   - Three labelled lanes: `ui.laneShop`, `ui.laneApi`, `ui.laneLine`.
   - The latest 4 events, each shown as:
     - the request (method plus a short path) in lane 1;
     - the response status in lane 2, appearing about 0.45 s later;
     - the LINE message in lane 3, appearing about 0.9 s later.
   - Use CSS animation delays, not extra timers.
   - On phones the lanes stack, each event becoming a vertical mini-sequence. There must be no sideways page scroll.
7. **Console and reference** (`#try`, `#reference`):
   - Restyle for the light theme. Every string comes from copy.
   - The endpoint list shows `endpointCopy[key][lang]`.
   - The reference uses `statusHelp` and `orderFieldNotes`.
   - **Response panel:** before the first send, it shows a labelled example response (`data-testid="example-response"`, label `ui.exampleResponse`, hint `ui.exampleResponseHint`). The example is the selected endpoint's typical success body, computed by running its example request through `handleRequest` on a copy of `SEED_ORDERS`. It has no `api-status` test id. After a send, the real response replaces it, with `api-status` as today. After a reset, the example comes back.
   - **Console phone:** `line-preview` is always present. It starts with one earlier message: `ORD-1008` as a new order, built from the seed. It then appends the visitor's own notifications. Reset returns it to the single earlier message.
8. **Removed:** the old inline Thai and English literals in all of these files.
9. **Text sizes:** follow the Global Constraints.

- [ ] **Step 1: Write the failing e2e tests.**

  Replace `tests/e2e/orders-api.spec.ts` with:

```ts
import { expect, test } from "@playwright/test";

test.use({ locale: "th-TH" });

test("the shop's LINE fills with orders on its own", async ({ page }) => {
  await page.goto("/demos/orders-api");
  const phone = page.getByTestId("story-phone");
  await expect(phone).toContainText("ORD-1001");
  await expect(page.getByTestId("story-log")).toContainText("POST");
  await expect(phone).toContainText("ORD-1002", { timeout: 6000 });
});

test("the console shows an example response before the first send", async ({ page }) => {
  await page.goto("/demos/orders-api");
  await page.getByTestId("endpoint-POST-/orders").click();
  await expect(page.getByTestId("example-response")).toBeVisible();
  await expect(page.getByTestId("api-status")).toHaveCount(0);
  await expect(page.getByTestId("line-preview")).toContainText("ORD-1008");
});

test("POST /orders returns 201 and shows a LINE notification", async ({ page }) => {
  await page.goto("/demos/orders-api");
  await page.getByTestId("endpoint-POST-/orders").click();
  await page.getByTestId("api-send").click();
  await expect(page.getByTestId("api-status")).toHaveText(/201/);
  await expect(page.getByTestId("example-response")).toHaveCount(0);
  await expect(page.getByTestId("line-preview")).toContainText("ORD-1009");
  await expect(page.getByTestId("line-preview")).toContainText("ออเดอร์ใหม่");
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
  await expect(page.getByTestId("line-preview")).not.toContainText("ORD-1009");
  await expect(page.getByTestId("api-status")).toHaveCount(0);
  await expect(page.getByTestId("example-response")).toBeVisible();
  await page.getByTestId("endpoint-GET-/orders").click();
  await page.getByTestId("api-path").fill("/orders");
  await page.getByTestId("api-send").click();
  await expect(page.getByTestId("api-response")).toContainText('"count": 8');
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the LINE messages read in English", async ({ page }) => {
    await page.goto("/demos/orders-api");
    await expect(page.getByTestId("story-phone")).toContainText("New order");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("An order comes in, and LINE pings right away");
  });
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the story shows a still, filled state", async ({ page }) => {
    await page.goto("/demos/orders-api");
    const phone = page.getByTestId("story-phone");
    await expect(phone).toContainText("ORD-1001");
    const before = await phone.textContent();
    await page.waitForTimeout(2500);
    expect(await phone.textContent()).toBe(before);
  });
});
```

  Run `pnpm test:e2e tests/e2e/orders-api.spec.ts`. Expected: FAIL. The new test ids don't exist yet.

- [ ] **Step 2: Build it.** Invoke `frontend-design`, then build the requirements above.
- [ ] **Step 3: Visual check.**
  - Run `pnpm dev --port 3000` and use a screenshot script in `.superpowers/sdd/`.
  - Set the language with `localStorage.setItem("demo:lang", JSON.stringify("th" | "en"))` in `addInitScript`, and hide `[data-testid=demo-pill]`.
  - Take full-page shots at 1440×900 and 375×812 in both languages, about 6 s after load so the story has moved.
  - Look at every one. Fix anything clipped, overlapping, empty or overflowing.
  - Save the four shots as `.superpowers/sdd/api-{desk,phone}-{th,en}.jpg`.
  - Stop the server.
- [ ] **Step 4: Checks.**
  - Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/orders-api.spec.ts tests/e2e/smoke.spec.ts`.
  - Expected: all pass on both projects. The smoke test confirms there are no console errors or hydration warnings.
  - Then run `pnpm test:e2e tests/e2e/orders-api.spec.ts --repeat-each=3`. Expected: no flakes.
- [ ] **Step 5: Commit.**

```bash
git add -A app/demos/orders-api tests/e2e/orders-api.spec.ts
git commit -F - <<'EOF'
feat(orders-api): shop-owner-first page with a live LINE story, how-it-works lanes and a light console, in Thai and English

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Shared language test, hub thumbnails, full verification

**Files:** `tests/e2e/demo-lang.spec.ts`; regenerate `public/thumbs/app-basic.jpg` and `public/thumbs/pages/app-basic-1.jpg`.

- [ ] **Step 1: Add the Orders API to `DEMOS`.**

  Append this to `DEMOS` in `tests/e2e/demo-lang.spec.ts`. The `h1` lives in `main`, and `next` equals `home` because it's a one-page demo.

```ts
  { name: "orders api", home: "/demos/orders-api", next: "/demos/orders-api", where: "main", en: "An order comes in", th: "ออเดอร์เข้าปุ๊บ" },
```

  Run `pnpm test:e2e tests/e2e/demo-lang.spec.ts`. Expected: PASS on both projects.

- [ ] **Step 2: Regenerate the thumbnails.**
  - The script pins the clock at 10:30. The story starts on hydration, so the shot shows the first events.

```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
git add public/thumbs/app-basic.jpg public/thumbs/pages/app-basic-1.jpg
git checkout -- public/thumbs
```

  - Open `public/thumbs/app-basic.jpg` and check that it shows the light owner-first hero in Thai, with LINE messages visible (not empty).
  - If the phone is empty in the shot (the clock is pinned, so timers may not run), report it rather than editing the capture script.

- [ ] **Step 3: Full verification.**
  - Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`. Expected: everything passes.

- [ ] **Step 4: Commit.**

```bash
git add tests/e2e/demo-lang.spec.ts public/thumbs/app-basic.jpg public/thumbs/pages/app-basic-1.jpg
git commit -F - <<'EOF'
test(orders-api): shared language test; hub thumbnails for the new page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
