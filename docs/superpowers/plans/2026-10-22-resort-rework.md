# Saeng Chan Resort: Premium Moments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Website Premium demo (`/demos/resort`) look and feel premium. The current design stays, and four things are added: a moonrise hero that reacts to scrolling, a live 14-night availability strip that hands its dates to the booking form, an editorial middle section, and a room rail. Body text is also raised to at least 16px.

**Architecture:**
- Pricing and availability rules are pure functions in `lib/demos/resort/availability.ts`. The strip and the booking form's estimate share them, so their totals always agree.
- Each new section is its own client component under `app/demos/resort/_components/`. The home page stays a server component and composes them.
- The resort is already bilingual (`components/demo/lang.tsx`). New copy is `L` values in `_components/copy.ts` and `lib/demos/resort/content.ts`.

**Tech stack:** Next.js 16.4 App Router (static export), React 19, TypeScript strict, Tailwind 4, Mitr (display) + Anuphan (body), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-22-demo-rework-bilingual-design.md`, Part 2 "Saeng Chan Resort", and Part 3 step 4.

**Approved mockups:** `.superpowers/brainstorm/19193-1792598876/content/resort-moments.html` (all four moments) and `resort-rooms.html` (rail option **B**, used on every screen size).

## Global Constraints

- **Static export:** keep `output: "export"`.
- **No new dependencies.**
- **Next.js APIs:** read `node_modules/next/dist/docs/` before using a Next.js API not already used in this repo (AGENTS.md).
- **Look:**
  - Keep the resort's current palette (`--sand #f3ece0`, `--sand-2`, `--paper`, `--sea #1f5f5b`, `--sea-deep #123b39`, `--night #0c2928`, `--sun #d9a441`, `--ink`, `--muted #55605c`, `--line`).
  - Keep its fonts: Mitr 500 for display, Anuphan for body.
  - Keep its header and footer and the other pages.
  - No serif fonts.
  - Arch-shaped photos stay only on the rooms page. The new rail cards are rounded rectangles, not arches.
- **Text sizes:**
  - Body text is at least 16px. Small print (labels, captions, notes) is at least 14px.
  - In `app/demos/resort/**`, replace every `text-[15px]` with `text-base`, and every `text-[13px]`, `text-[12px]` and `text-[11px]` with `text-sm`.
  - Text inside decorative `aria-hidden` SVGs is exempt.
- **Language:**
  - Every visible string, alt and aria-label comes from `copy.ts` or `content.ts` as an `L` value, rendered with `T`, `TImage` or `useLang()`.
  - No inline `lang === "th" ? … : …` literals. The existing one in `inquiry-form.tsx` moves to copy.
  - The seller refers to themselves only as "เรา". Addressing the customer as "คุณ" is fine.
- **Pricing:**
  - Friday and Saturday nights cost `Math.round(base * 1.25 / 100) * 100`. Every other night costs `base`.
  - A stay's total is the sum of its nights' prices, from check-in up to (not including) check-out.
  - The strip and the booking form's estimate both use `stayTotal`.
- **Full nights:**
  - Decided by `isFullNight(iso, roomId)`, a deterministic hash of the date and the room. Everyone sees the same strip on the same day.
  - A full night can't be picked.
  - A range that crosses a full night restarts the selection at the clicked night.
- **Motion:**
  - With `prefers-reduced-motion: reduce`, the moonrise hero shows its first state, at plain `100svh` height with no extended scroll.
  - Reduced motion also turns off rail smooth-scrolling and hover zoom.
  - Scroll handlers use `requestAnimationFrame` and write CSS variables. React must not re-render on every frame.
- **Test ids kept:** everything that exists today (`lang-toggle` is now `lang-switch`, plus `room-card`, `filter-*`, `rooms-empty`, `gallery-item`, `lightbox`, `input-*`, `error-*`, `inquiry-*`).
- **Test ids added:**
  - Strip: `availability`, `night` (one per night, with `data-iso` and `disabled` when full), `availability-room`, `availability-summary`, `availability-book`.
  - Rail: `room-rail`, `rail-next`, `rail-prev`, `rail-counter`.
  - Hero: `moonrise-hero`, `moonrise-line`.
- **Accessibility:**
  - No horizontal page overflow at 375px or 1440px. A horizontal scroller inside a section is fine.
  - Visible focus on every control.
  - Strip nights are `<button>`s whose `aria-label` holds the full date and price (or "full"), and `aria-pressed` for the chosen nights.
- **Commits:** end every message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, and add no other attribution line.
- **Branch:** `feat/resort-rework`, cut from `main`. Never push or merge without Ohm's OK; merging deploys devbyohm.com.

## File map

| File | Change | Responsibility |
|---|---|---|
| `lib/demos/format.ts`, `tests/unit/demo-format.test.ts` | Modify | Add a `"weekday"` date style |
| `lib/demos/resort/availability.ts` | Create | `nightlyRate`, `isFullNight`, `upcomingNights`, `stayTotal`, `pickNight`, `bookingHref` |
| `tests/unit/resort-availability.test.ts` | Create | Rules above |
| `lib/demos/resort/content.ts` | Modify | `facts` for the editorial middle |
| `app/demos/resort/_components/copy.ts` | Modify | New interface copy |
| `app/demos/resort/_components/availability-strip.tsx` | Create | The 14-night strip |
| `app/demos/resort/_components/inquiry-form.tsx` | Modify | Read `checkIn`/`checkOut` from the URL; estimate with `stayTotal`; copy fix |
| `app/demos/resort/_components/moonrise-hero.tsx` | Create | Scroll-driven hero |
| `app/demos/resort/_components/editorial-facts.tsx` | Create (or inline in page) | Three big facts |
| `app/demos/resort/_components/room-rail.tsx` | Create | Five-room rail |
| `app/demos/resort/(home)/page.tsx` | Modify | Compose the new sections |
| `tests/e2e/resort.spec.ts` | Modify | Strip → booking, rail, hero |
| `public/thumbs/web-premium.jpg`, `public/thumbs/pages/web-premium-{1..5}.jpg` | Regenerate | New home on the hub |

---

### Task 1: Pricing and availability rules, plus new copy

**Files:**
- Modify: `lib/demos/format.ts`, `tests/unit/demo-format.test.ts`
- Create: `lib/demos/resort/availability.ts`, `tests/unit/resort-availability.test.ts`
- Modify: `lib/demos/resort/content.ts`, `app/demos/resort/_components/copy.ts`

**Interfaces:**
- Consumes: `toISODate(d)`, `addDays(d, n)`, `parseISODate(s)` from `@/lib/dates`; `ROOMS`, `type Room` from the resort; `type Lang`, `type L`.
- Produces, from `@/lib/demos/resort/availability`:
  - `nightlyRate(base: number, iso: string): number`
  - `isFullNight(iso: string, roomId: string): boolean`
  - `interface Night { iso: string; price: number; full: boolean }`
  - `upcomingNights(from: Date, roomId: string, base: number, count?: number): Night[]`. The default `count` is 14, and the nights start at `from`'s date.
  - `stayTotal(base: number, checkIn: string, checkOut: string): number`
  - `type Pick = { checkIn: number | null; checkOut: number | null }`, which holds indexes into a `Night[]`
  - `pickNight(current: Pick, index: number, nights: Night[]): Pick`
  - `bookingHref(roomId: string, checkIn: string, checkOut: string): string`
- Produces, from `lib/demos/format.ts`: `DateStyle` gains `"weekday"` (`{ weekday: "short" }`).
- Produces, from content and copy: `facts` and the new `ui` keys listed below.

- [ ] **Step 1: Write the failing tests.**

  Create `tests/unit/resort-availability.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  bookingHref,
  isFullNight,
  nightlyRate,
  pickNight,
  stayTotal,
  upcomingNights,
  type Night,
} from "@/lib/demos/resort/availability";

describe("nightlyRate", () => {
  it("charges the base rate Sunday to Thursday", () => {
    expect(nightlyRate(3600, "2026-10-22")).toBe(3600); // Thursday
    expect(nightlyRate(3600, "2026-10-25")).toBe(3600); // Sunday
  });

  it("adds 25% on Friday and Saturday, rounded to the nearest ฿100", () => {
    expect(nightlyRate(3600, "2026-10-23")).toBe(4500); // Friday
    expect(nightlyRate(2900, "2026-10-24")).toBe(3600); // Saturday: 3625 rounds to 3600
  });
});

describe("isFullNight", () => {
  it("is the same for the same night and room", () => {
    expect(isFullNight("2026-10-22", "pool-villa")).toBe(isFullNight("2026-10-22", "pool-villa"));
  });

  it("leaves most nights open but fills some", () => {
    const nights = upcomingNights(new Date(2026, 9, 1), "sea-deluxe", 3600, 60);
    const full = nights.filter((n) => n.full).length;
    expect(full).toBeGreaterThan(0);
    expect(full).toBeLessThan(30);
  });
});

describe("upcomingNights", () => {
  it("lists 14 consecutive nights starting on the given day", () => {
    const nights = upcomingNights(new Date(2026, 9, 22, 18, 30), "sea-deluxe", 3600);
    expect(nights).toHaveLength(14);
    expect(nights[0].iso).toBe("2026-10-22");
    expect(nights[13].iso).toBe("2026-11-04");
    expect(nights[1].price).toBe(4500); // Friday
  });
});

describe("stayTotal", () => {
  it("sums each night from check-in up to check-out", () => {
    // Thu 3600 + Fri 4500 + Sat 4500
    expect(stayTotal(3600, "2026-10-22", "2026-10-25")).toBe(12600);
  });

  it("is zero when check-out is not after check-in", () => {
    expect(stayTotal(3600, "2026-10-22", "2026-10-22")).toBe(0);
    expect(stayTotal(3600, "2026-10-23", "2026-10-22")).toBe(0);
  });
});

describe("pickNight", () => {
  const n = (full: boolean): Night => ({ iso: "x", price: 1, full });
  const nights = [n(false), n(false), n(true), n(false), n(false)];
  const none = { checkIn: null, checkOut: null };

  it("starts a stay on the first click", () => {
    expect(pickNight(none, 1, nights)).toEqual({ checkIn: 1, checkOut: null });
  });

  it("ends the stay on a later night", () => {
    expect(pickNight({ checkIn: 0, checkOut: null }, 1, nights)).toEqual({ checkIn: 0, checkOut: 1 });
  });

  it("restarts when the clicked night is not after check-in", () => {
    expect(pickNight({ checkIn: 3, checkOut: null }, 1, nights)).toEqual({ checkIn: 1, checkOut: null });
  });

  it("restarts at the clicked night when the range would cross a full night", () => {
    expect(pickNight({ checkIn: 0, checkOut: null }, 4, nights)).toEqual({ checkIn: 4, checkOut: null });
  });

  it("starts over after a finished stay", () => {
    expect(pickNight({ checkIn: 0, checkOut: 1 }, 3, nights)).toEqual({ checkIn: 3, checkOut: null });
  });

  it("ignores full nights", () => {
    expect(pickNight({ checkIn: 0, checkOut: null }, 2, nights)).toEqual({ checkIn: 0, checkOut: null });
  });
});

describe("bookingHref", () => {
  it("links to the booking form with the room and dates", () => {
    expect(bookingHref("pool-villa", "2026-10-22", "2026-10-25")).toBe(
      "/demos/resort/booking?room=pool-villa&checkIn=2026-10-22&checkOut=2026-10-25",
    );
  });
});
```

  Append to `tests/unit/demo-format.test.ts`, inside `describe("formatDate")`:

```ts
  it("writes a short weekday", () => {
    expect(formatDate(d, "th", "weekday")).toBe("พุธ");
    expect(formatDate(d, "en", "weekday")).toBe("Wed");
  });
```

- [ ] **Step 2: Run them and confirm they fail.**

  Run: `pnpm test tests/unit/resort-availability.test.ts tests/unit/demo-format.test.ts`
  Expected: FAIL. The availability module doesn't exist yet, and `"weekday"` is not a style.

- [ ] **Step 3: Implement.**

  - In `lib/demos/format.ts`:
    - Add `"weekday"` to `DateStyle`.
    - Add `weekday: { weekday: "short" },` to `OPTIONS`.

  - Create `lib/demos/resort/availability.ts`:

```ts
import { addDays, parseISODate, toISODate } from "@/lib/dates";

export interface Night {
  iso: string;
  price: number;
  full: boolean;
}

/** Friday and Saturday nights cost 25% more, rounded to the nearest ฿100. */
export function nightlyRate(base: number, iso: string): number {
  const day = parseISODate(iso).getDay();
  return day === 5 || day === 6 ? Math.round((base * 1.25) / 100) * 100 : base;
}

/**
 * Whether a room is fully booked that night. Derived from the date and room alone,
 * so every visitor sees the same strip on the same day. Roughly one night in five is full.
 */
export function isFullNight(iso: string, roomId: string): boolean {
  let h = 2166136261;
  for (const c of `${iso}:${roomId}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) % 5 === 0;
}

export function upcomingNights(from: Date, roomId: string, base: number, count = 14): Night[] {
  return Array.from({ length: count }, (_, i) => {
    const iso = toISODate(addDays(from, i));
    return { iso, price: nightlyRate(base, iso), full: isFullNight(iso, roomId) };
  });
}

/** Sum of each night's rate from check-in up to (not including) check-out. */
export function stayTotal(base: number, checkIn: string, checkOut: string): number {
  let total = 0;
  for (let d = parseISODate(checkIn); toISODate(d) < checkOut; d = addDays(d, 1)) total += nightlyRate(base, toISODate(d));
  return total;
}

export type Pick = { checkIn: number | null; checkOut: number | null };

/** The strip's two-click range picker: first night, then check-out. Full nights can't be picked or crossed. */
export function pickNight(current: Pick, index: number, nights: Night[]): Pick {
  if (nights[index]?.full) return current;
  const { checkIn, checkOut } = current;
  if (checkIn === null || checkOut !== null || index <= checkIn) return { checkIn: index, checkOut: null };
  const crossesFull = nights.slice(checkIn, index).some((n) => n.full);
  return crossesFull ? { checkIn: index, checkOut: null } : { checkIn, checkOut: index };
}

export function bookingHref(roomId: string, checkIn: string, checkOut: string): string {
  return `/demos/resort/booking?${new URLSearchParams({ room: roomId, checkIn, checkOut })}`;
}
```


  - In `lib/demos/resort/content.ts`, add the editorial facts after `highlights`:

```ts
/** The home page's three big facts. `unit` sits small beside the figure; the moonrise has none. */
export const facts: { figure: string; unit?: L; title: L; body: L; photo: string; alt: L }[] = [
  {
    figure: "3",
    unit: { th: "นาที", en: "min" },
    title: { th: "เดินถึงหาดอ่าวนาง", en: "Walk to Ao Nang beach" },
    body: { th: "ผ่านสวนเขตร้อนของรีสอร์ท ไม่ต้องข้ามถนน", en: "Through the resort's tropical garden, without crossing a road." },
    photo: PHOTOS.resortGallery2,
    alt: { th: "ชายหาดและรีสอร์ทจากมุมสูง", en: "The beach and resort from above" },
  },
  {
    figure: "24",
    unit: { th: "ห้อง", en: "rooms" },
    title: { th: "เท่านั้น ไม่พลุกพล่าน", en: "And no more, so it never feels busy" },
    body: { th: "พนักงานจำชื่อแขกได้ตั้งแต่วันแรก", en: "Our team knows every guest by name from the first day." },
    photo: PHOTOS.resortGallery4,
    alt: { th: "สระว่ายน้ำในสวนเขตร้อน", en: "Pool in the tropical garden" },
  },
  {
    figure: "19:30",
    title: { th: "พระจันทร์ขึ้นเหนืออ่าว", en: "Moonrise over the bay" },
    body: { th: "มื้อค่ำริมทะเลจัดตามเวลาพระจันทร์ขึ้นของแต่ละคืน", en: "Beachside dinner is timed to each night's moonrise." },
    photo: PHOTOS.resortGallery6,
    alt: { th: "พระอาทิตย์ตกเหนืออ่าว", en: "Sunset over the bay" },
  },
];
```

  - In `app/demos/resort/_components/copy.ts`, add these keys to `ui`:

```ts
  // moonrise hero
  heroMoonrise: { th: "คืนนี้พระจันทร์ขึ้นเหนืออ่าว 19:30 น.", en: "Tonight the moon rises over the bay at 7:30 pm" },
  // availability strip
  availabilityHeading: { th: "ห้องว่าง 14 คืนข้างหน้า", en: "The next 14 nights" },
  pickFirstNight: { th: "เลือกคืนแรกที่เข้าพัก", en: "Pick your first night" },
  pickCheckOutDay: { th: "เลือกวันเช็กเอาต์", en: "Now pick your check-out day" },
  crossesFull: { th: "ช่วงนี้มีคืนที่เต็มแล้ว เลือกคืนแรกใหม่อีกครั้ง", en: "Those dates include a full night. Pick a new first night." },
  fullNight: { th: "เต็ม", en: "Full" },
  nightOne: { th: "1 คืน", en: "1 night" },
  nightsMany: { th: "{n} คืน", en: "{n} nights" },
  bookTheseDates: { th: "จองช่วงนี้", en: "Book these dates" },
  weekendNote: { th: "คืนวันศุกร์และเสาร์ราคาสูงกว่าวันธรรมดา", en: "Friday and Saturday nights cost more." },
  nightLabel: { th: "{date} · {price}", en: "{date} · {price}" },
  nightLabelFull: { th: "{date} · เต็ม", en: "{date} · full" },
  // room rail
  railHeading: { th: "ห้องพักทั้ง 5 แบบ", en: "All five room types" },
  railSub: { th: "ทุกห้องรวมอาหารเช้า เดินถึงหาด 3 นาที", en: "Breakfast included with every room, three minutes from the beach." },
  seeRoomAndDates: { th: "ดูห้องและเช็กวันว่าง", en: "See the room and dates" },
  previousRoom: { th: "ห้องก่อนหน้า", en: "Previous room" },
  nextRoom: { th: "ห้องถัดไป", en: "Next room" },
  // booking form
  nightsLabel: { th: "จำนวนคืน", en: "Nights" },
```

- [ ] **Step 4: Run the tests and confirm they pass.**

  Run: `pnpm test tests/unit/resort-availability.test.ts tests/unit/demo-format.test.ts tests/unit/resort-copy.test.ts`
  Expected: PASS. The existing resort copy-completeness test covers the new keys and `facts`.

  Then run: `pnpm typecheck && pnpm lint && pnpm test`
  Expected: all pass.

- [ ] **Step 5: Commit.**

```bash
git add lib/demos/format.ts tests/unit/demo-format.test.ts lib/demos/resort tests/unit/resort-availability.test.ts app/demos/resort/_components/copy.ts
git commit -F - <<'EOF'
feat(resort): pricing and availability rules, copy for the premium moments

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: The availability strip, handing its dates to the booking form

This is a visual component, so **invoke the `frontend-design` skill first**. The approved look is the mockup's option 3 in `resort-moments.html`:
- a deep-sea (`--sea-deep`) band directly under the hero;
- 14 night cells, each showing the weekday, a big day number and the price;
- full nights faded and crossed out;
- chosen nights in sun gold (`--sun`), with the nights between them softly tinted;
- a room-type selector;
- a summary with a "book these dates" button.

It must look as refined as the rest of the resort.

**Files:**
- Create: `app/demos/resort/_components/availability-strip.tsx`
- Modify: `app/demos/resort/(home)/page.tsx` (insert directly after the hero section), `app/demos/resort/_components/inquiry-form.tsx`

**Interfaces:**
- Consumes:
  - from Task 1: `upcomingNights`, `pickNight`, `stayTotal`, `bookingHref`, `type Night`, `type Pick`, `ui.*`;
  - `formatDate(iso, lang, "weekday" | "dayMonth" | "full")` from `@/lib/demos/format`;
  - `fill` from `@/lib/demos/format`;
  - `ROOMS`;
  - `useLang`, `useHydrated`;
  - `formatTHB`.
- Produces: `<AvailabilityStrip />` with the test ids from the Global Constraints. The booking form reads `?checkIn=` and `?checkOut=`.

**Fixed requirements:**

1. **Before hydration**, the strip renders a stable placeholder of 14 empty cells. Today's date is only known on the client, so this avoids a hydration mismatch.
2. **After hydration:**
   - It shows `upcomingNights(new Date(), roomId, room.pricePerNight)`.
   - The default room is `sea-deluxe`.
   - The room selector (`data-testid="availability-room"`, a labelled `<select>` using `ui.roomType`) lists all `ROOMS` with `room.name[lang]`. Changing it clears the selection.
3. **Each night is a `<button data-testid="night" data-iso={iso}>`:**
   - It is `disabled` when full.
   - Its `aria-pressed` is true when it is the check-in or check-out night.
   - Its `aria-label` is `fill(ui.nightLabel or ui.nightLabelFull, { date: formatDate(iso, lang, "full"), price: formatTHB(price) })`.
   - Visible content: the weekday (`formatDate(iso, lang, "weekday")`), the day of the month and the price. A full night shows `ui.fullNight` instead of the price.
   - Clicking runs `pickNight`.
4. **Layout:** on desktop, 14 equal columns in one row. On phones, a horizontal scroller with scroll-snap and cells at least 56px wide. The page itself must not overflow.
5. **Summary** (`data-testid="availability-summary"`, `aria-live="polite"`):
   - No pick: `ui.pickFirstNight`.
   - Check-in only: `ui.pickCheckOutDay`.
   - After a restart because the range crossed a full night: `ui.crossesFull`, until the next click.
   - Full range: the night count, using `ui.nightOne` or `fill(ui.nightsMany, { n })`, then `·`, then `formatTHB(stayTotal(...))`, then `·` and the room name. Next to it, a `Link` (`data-testid="availability-book"`) to `bookingHref(roomId, checkInIso, checkOutIso)` labelled `ui.bookTheseDates`.
   - `ui.weekendNote` appears as small print.
   - The check-out ISO is the check-out night cell's `iso`. The guest leaves that morning.
6. **Booking form (`inquiry-form.tsx`):**
   - Initialise `checkIn` and `checkOut` from the `checkIn`/`checkOut` search params, but only when each is a valid ISO date (`/^\d{4}-\d{2}-\d{2}$/`) and `checkIn >= today`. Otherwise leave them empty.
   - The existing `room` param handling stays.
   - The estimate becomes `formatTHB(stayTotal(room.pricePerNight, values.checkIn, values.checkOut))` instead of `pricePerNight * nights`.
   - Replace the inline `lang === "th" ? "จำนวนคืน" : "Nights"` with `ui.nightsLabel[lang]`.
7. **Text sizes:** apply the Global Constraints rule to `inquiry-form.tsx`.

- [ ] **Step 1: Write the failing e2e test.** Append to `tests/e2e/resort.spec.ts`:

```ts
test("availability strip hands a stay to the booking form", async ({ page }) => {
  await page.goto("/demos/resort");
  const strip = page.getByTestId("availability");
  await strip.scrollIntoViewIfNeeded();
  await expect(strip.getByTestId("night").first()).toHaveAttribute("data-iso", /\d{4}-\d{2}-\d{2}/);

  // Find two neighbouring open nights.
  const nights = strip.getByTestId("night");
  const count = await nights.count();
  let first = -1;
  for (let i = 0; i < count - 1; i++) {
    if ((await nights.nth(i).isEnabled()) && (await nights.nth(i + 1).isEnabled())) {
      first = i;
      break;
    }
  }
  expect(first).toBeGreaterThanOrEqual(0);
  const checkIn = await nights.nth(first).getAttribute("data-iso");
  const checkOut = await nights.nth(first + 1).getAttribute("data-iso");

  await nights.nth(first).click();
  await nights.nth(first + 1).click();
  await expect(strip.getByTestId("availability-summary")).toContainText("1");
  await strip.getByTestId("availability-book").click();

  await expect(page).toHaveURL(/\/demos\/resort\/booking\?/);
  await expect(page.getByTestId("input-checkIn")).toHaveValue(checkIn!);
  await expect(page.getByTestId("input-checkOut")).toHaveValue(checkOut!);
  await expect(page.getByTestId("input-roomId")).toHaveValue("sea-deluxe");
  await expect(page.getByTestId("inquiry-nights")).toContainText("1");
});
```

  - If `input-roomId` isn't the room select's test id, read `inquiry-form.tsx` (`data-testid: input-${field}` over `FIELD_ORDER`) and use the right one. It should be `input-roomId`.
  - Run: `pnpm test:e2e tests/e2e/resort.spec.ts`
  - Expected: FAIL, because there's no `availability` element yet.

- [ ] **Step 2: Build it.** Invoke `frontend-design`, then build the strip and the form changes to the requirements above. Insert `<AvailabilityStrip />` in the home page right after the hero `<section>`.
- [ ] **Step 3: Check it visually.**
  - Run `pnpm dev --port 3000` and use a screenshot script in `.superpowers/sdd/`. Set the language with `localStorage.setItem("demo:lang", JSON.stringify("th" | "en"))` in `addInitScript`, and hide `[data-testid=demo-pill]`.
  - Shoot the strip at 1440 and 375, in both languages: once with nothing picked, and once with a 3-night range picked.
  - Look at every shot and fix what's off.
  - Save the four picked-range shots as `.superpowers/sdd/resort-strip-{desk,phone}-{th,en}.jpg`.
- [ ] **Step 4: Run the checks.**
  - Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/resort.spec.ts tests/e2e/smoke.spec.ts`
  - Expected: all pass on both projects. The smoke test confirms there are no console errors (no hydration warnings) on `/demos/resort`.
- [ ] **Step 5: Commit.**

```bash
git add -A app/demos/resort tests/e2e/resort.spec.ts
git commit -F - <<'EOF'
feat(resort): live 14-night availability strip that books straight into the form

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Moonrise hero, editorial facts, room rail (visual)

**Invoke the `frontend-design` skill first.** Follow the approved mockups:
- `resort-moments.html` options 1 (moonrise) and 4 (editorial);
- `resort-rooms.html` option B (rail).

These are the Premium plan's signature moments. They must feel smooth and expensive, not gimmicky.

**Files:**
- Create: `app/demos/resort/_components/moonrise-hero.tsx`, `app/demos/resort/_components/room-rail.tsx`. Create `editorial-facts.tsx` if the facts aren't kept inline.
- Modify: `app/demos/resort/(home)/page.tsx`
  - The hero becomes `<MoonriseHero />`.
  - The "intro + highlights" block becomes the intro sentence plus the editorial facts. `highlights` may then be removed from `content.ts` if nothing else uses it; grep first.
  - The 3-room arch teaser becomes `<RoomRail />`.
  - The strip from Task 2 stays directly under the hero.
  - Gallery teaser, bottom CTA and the rest stay.
- Modify: text sizes across `app/demos/resort/**`, per the Global Constraints rule.
- Modify: `tests/e2e/resort.spec.ts`

**Fixed requirements:**

1. **`MoonriseHero`** (`data-testid="moonrise-hero"`):
   - **Structure:** a tall section (about `180svh`) holding a sticky `100svh` stage. Inside the stage:
     - the existing hero photo (`resort.heroImage`, `TImage`, `preload`);
     - a dusk overlay;
     - a moon (a CSS or SVG disc with a soft glow, warm sun-gold and cream);
     - the location line;
     - an `h1` with `resort.tagline`;
     - a second line `<p data-testid="moonrise-line">` with `ui.heroMoonrise`;
     - the two existing CTA buttons.
   - **Scroll progress:** let `p` run from 0 to 1 as the stage scrolls through. As `p` goes 0→1:
     - the overlay darkens toward night;
     - the moon rises from behind the cliffs or horizon to the upper part of the sky;
     - the `h1` fades out by `p≈0.55`;
     - `moonrise-line` fades in from `p≈0.45` and reaches opacity 1 by `p≈0.75`.
   - **Accessibility:**
     - Both texts stay in the DOM.
     - The `h1` keeps its heading role all the time.
     - `moonrise-line` is not `aria-hidden`, and its visual opacity doesn't matter to screen readers.
     - The buttons stay usable at every `p`.
   - **Implementation:**
     - One passive scroll listener with `requestAnimationFrame` that writes `--p` on the section.
     - All visuals derive from `--p` in CSS (`calc()`). No React state per frame.
   - **Reduced motion:** the section is `100svh` (no extra scroll), `--p` stays 0, and `moonrise-line` is hidden (`hidden`). The tagline is enough.
   - **Before hydration:** `--p` is 0, so the first paint looks exactly like the first state.
   - **Header:** the resort header's transparent-over-hero behaviour must still work. It keys off `scrollY > 48`, so check it.

2. **Editorial facts** (replaces the three thin icons):
   - Keep the `resort.intro` sentence as the lead.
   - Show the three `facts`, each with:
     - a huge Mitr figure in `--sea` (about 88px on desktop), with `unit` small beside it;
     - a photo (`TImage`, `alt={fact.alt}`, rounded 6px);
     - the title in Mitr;
     - the body.
   - Layout: three columns on desktop, stacked on phones.
   - Keep the existing `Reveal` fade-ins.

3. **`RoomRail`** (`data-testid="room-rail"`) shows all five `ROOMS`:
   - **Heading and controls:**
     - `h2` with `ui.railHeading`, plus `ui.railSub`.
     - A counter (`data-testid="rail-counter"`, text `01 / 05`, `tabular-nums`).
     - Two round arrow buttons, `rail-prev` and `rail-next`, with `aria-label` from `ui.previousRoom` / `ui.nextRoom`.
   - **Rail:**
     - A horizontal scroller with `scroll-snap-type: x mandatory`.
     - Tall full-photo cards, about 420px tall on desktop and 380px on phones, rounded 4px, not arches.
     - The first card is wider (the featured room).
   - **Each card is a link** to `/demos/resort/booking?room=<id>`. It shows:
     - a gold tag `{ui.fromPerNight} {formatTHB(price)} {ui.perNight}`;
     - over a dark bottom gradient, the room name in Mitr, plus guests (`ui.guestsUnit`), size (`ui.sqm`) and the first feature;
     - on hover or focus, `ui.seeRoomAndDates →` appears and the photo zooms slightly (none under reduced motion).
   - **Interaction:**
     - Drag to scroll with the mouse (pointer events). A drag must not trigger the card link; only a click without movement does.
     - Touch swipe works natively.
     - The arrows scroll by one card (smooth unless reduced motion).
     - The counter and a thin progress line follow the scroll position.
     - Keyboard: cards are focusable links in order. Focusing a card scrolls it into view.
   - **Overflow:** the rail bleeds to the right edge of the viewport on desktop and phones, but the page must not scroll sideways. Clip at the section.

4. **Remove** the old 3-room arch teaser markup from the home page. The rooms page is unchanged.

- [ ] **Step 1: Write the failing e2e tests.** Append to `tests/e2e/resort.spec.ts`:

```ts
test("room rail steps through all five rooms", async ({ page }) => {
  await page.goto("/demos/resort");
  const rail = page.getByTestId("room-rail");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail.getByRole("link")).toHaveCount(5);
  await expect(rail.getByTestId("rail-counter")).toHaveText("01 / 05");
  await rail.getByTestId("rail-next").click();
  await expect(rail.getByTestId("rail-counter")).toHaveText("02 / 05");
  await expect(rail.getByRole("link").first()).toHaveAttribute("href", /\/demos\/resort\/booking\?room=/);
});

test("the moon rises as you scroll the hero", async ({ page }) => {
  await page.goto("/demos/resort");
  await page.waitForLoadState("networkidle");
  const line = page.getByTestId("moonrise-line");
  const opacity = () => line.evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(await opacity()).toBeLessThan(0.2);
  const hero = page.getByTestId("moonrise-hero");
  const height = await hero.evaluate((el) => el.getBoundingClientRect().height);
  await page.mouse.wheel(0, height * 0.7);
  await expect.poll(opacity).toBeGreaterThan(0.9);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the hero is one screen tall and doesn't animate", async ({ page }) => {
    await page.goto("/demos/resort");
    const hero = page.getByTestId("moonrise-hero");
    const [height, viewport] = await hero.evaluate((el) => [el.getBoundingClientRect().height, window.innerHeight]);
    expect(height).toBeLessThanOrEqual(viewport + 1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
```

  - Run: `pnpm test:e2e tests/e2e/resort.spec.ts`
  - Expected: the three new tests FAIL.

- [ ] **Step 2: Build it.** Invoke `frontend-design`, then build the three sections and apply the text-size rule.
- [ ] **Step 3: Check it visually.**
  - **Static shots:** take full-page screenshots of `/demos/resort` at 1440×900 and 375×812 in both languages, with the hero captured at `p=0`. Look at every one.
  - **Hero motion:** also record the hero at `p≈0.5` and `p≈0.9` at 1440 by scrolling, then screenshotting the viewport. Check that the moon, overlay and text crossfade look deliberate.
  - **Rail:** check the rail mid-scroll on phones.
  - **Fix** anything clipped, overlapping, janky or overflowing.
  - **Save** `.superpowers/sdd/resort-{desk,phone}-{th,en}.jpg` (full page) and `.superpowers/sdd/resort-hero-{0,50,90}.jpg`.
- [ ] **Step 4: Run the checks.**
  - Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/resort.spec.ts tests/e2e/demo-lang.spec.ts tests/e2e/smoke.spec.ts`
  - Expected: all pass on both projects.
- [ ] **Step 5: Commit.**

```bash
git add -A app/demos/resort lib/demos/resort tests/e2e/resort.spec.ts
git commit -F - <<'EOF'
feat(resort): moonrise hero, editorial facts and a five-room rail

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Hub thumbnails and full verification

**Files:**
- Regenerate: `public/thumbs/web-premium.jpg`, `public/thumbs/pages/web-premium-1.jpg` … `web-premium-5.jpg`

- [ ] **Step 1: Regenerate.**

```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
git add public/thumbs/web-premium.jpg public/thumbs/pages/web-premium-1.jpg public/thumbs/pages/web-premium-2.jpg public/thumbs/pages/web-premium-3.jpg public/thumbs/pages/web-premium-4.jpg public/thumbs/pages/web-premium-5.jpg
git checkout -- public/thumbs
```

  - Open `public/thumbs/web-premium.jpg` and `public/thumbs/pages/web-premium-1.jpg`. Check that they show the moonrise hero's first state in Thai.
  - The screenshot is taken at the top, so `p=0`.

- [ ] **Step 2: Full verification.**
  - Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`
  - Expected: everything passes.

- [ ] **Step 3: Commit.**

```bash
git add public/thumbs/web-premium.jpg public/thumbs/pages/web-premium-1.jpg public/thumbs/pages/web-premium-2.jpg public/thumbs/pages/web-premium-3.jpg public/thumbs/pages/web-premium-4.jpg public/thumbs/pages/web-premium-5.jpg
git commit -F - <<'EOF'
chore(resort): hub thumbnails for the new resort home

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
