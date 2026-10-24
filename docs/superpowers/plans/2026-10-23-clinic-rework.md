# Lumi Clinic: Both Sides of a Booking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Web app Premium demo (`/demos/clinic-booking`) around one clear story. A visitor books a treatment in the customer's LINE chat in three taps, and sees it land in the clinic's schedule straight away. The admin has no login wall. The demo gets a stronger rose and wine look and full Thai/English through the shared demo switch.

**Architecture:**
- **Data (`lib/demos/clinic-booking/data.ts`):**
  - The pure data layer gains bilingual service and staff names (`L` values) and error codes (`ClinicError`) instead of Thai error strings.
  - New pure helpers: `progressStatus` (the day in progress), `bookingDay`, `freeTimes`, `nextOpening`, `bookAsGuest` (the 3-tap booking) and `isLineBooking`.
- **Stores:**
  - The session store defaults to signed in.
  - A small `clinicLastBooking` store lets the admin highlight the booking the visitor just made.
- **Copy:** all interface text moves to `app/demos/clinic-booking/_components/copy.ts`.
- **Booking page:** shows the customer's LINE chat and the clinic's day schedule side by side, or as two tabs on phones.

**Tech stack:** Next.js 16.4 App Router (static export), React 19, TypeScript strict, Tailwind 4, recharts (already a dependency), Kanit through `next/font/google`, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-22-demo-rework-bilingual-design.md`, Part 2 "Lumi Clinic" and Part 3 step 7.

**Approved mockups:** `.superpowers/brainstorm/19193-1792598876/content/clinic-flow.html` and `clinic-flow-fixes.html`. They cover all five flow problems, with fix A inside a modern device frame. They set direction only; the final design is done with `frontend-design`.

## Global Constraints

- **Static export:** keep `output: "export"`. Add no new dependencies.
- **Next.js:** read `node_modules/next/dist/docs/` before using a Next.js API not already used in this repo (AGENTS.md).
- **Fonts:**
  - Kanit (weights 400, 500, 600; subsets thai and latin) for everything.
  - No serif fonts. No `font-light`, and nothing below weight 400 (the current page uses 300; remove it).
- **Palette** (set on the layout wrapper; replaces the current palette):

  | Token | Value | Use |
  |---|---|---|
  | `--rose` | `#fbeef0` | page background |
  | `--rose-2` | `#f5dde2` | soft fills, chips |
  | `--paper` | `#fffafb` | cards, panels |
  | `--line` | `#ecd3d9` | borders (decorative only) |
  | `--ink` | `#2a1d22` | text (14.3:1 on rose) |
  | `--muted` | `#6b5560` | secondary text (6.0:1 on rose, 5.3:1 on rose-2) |
  | `--wine` | `#6b1f3a` | headings, primary buttons (white on wine 11.2:1) |
  | `--accent` | `#c2185b` | accents, the "now" line, highlights (5.2:1 as text on rose; white on it 5.9:1) |
  | `--line-green` | `#06c755` | LINE fills only; text on it is `--ink` |
  | `--line-green-ink` | `#04723a` | LINE text (5.4:1 on rose) |
  | `--error` | `#b3261e` | errors (5.8:1 on rose) |

- **Contrast:** check any text/background pair not in this table against AA (4.5:1) before use. The existing status tones in `admin-format.ts` (`STATUS_TONE`) are all 6:1 or better and may stay.
- **Text sizes:**
  - Body text, list rows, chat bubbles, buttons and chips: at least 16px.
  - Labels, captions, badges and table headers: at least 14px.
  - The phone's status bar, the chat timestamps and the schedule's hour ticks are decorative and may be 12px.
- **Language:**
  - Every visible string, `aria-label`, placeholder and chart label comes from `copy.ts` or from an `L` value in the data, and renders in `useLang()`'s language.
  - Use `fill()` from `@/lib/demos/format` for placeholders, and `formatDate` from the same module for dates.
  - Brand: Thai `ลูมิ คลินิก`, English `Lumi Clinic`.
  - **Customer names stay as they are.** The seeded Thai names, and whatever a visitor types, are shown as is in both languages. The business stays Thai (spec, Global rules).
  - ฿ prices and the Thai address stay as they are.
  - The clinic refers to itself as "เรา". The LINE bot may use the polite particle "ค่ะ" (it is the clinic speaking).
- **Images:**
  - Unsplash only, added to `lib/images.ts`, and checked with `curl -sI` to return 200.
  - Staff portraits are tall (portrait aspect) photos of people. Never AI-generated.
- **No login wall:**
  - `/demos/clinic-booking/admin` opens on the queue with no login step.
  - A banner (`data-testid="demo-session"`) reads `กำลังดูในฐานะเจ้าหน้าที่คลินิก (เดโม)` / `Viewing as clinic staff (demo)` and holds the admin's only log-out button.
  - Logging out goes to `/demos/clinic-booking/admin/login`. The admin routes then redirect there until the visitor logs in again.
- **Phone frame:** an original, modern device frame drawn with CSS. No manufacturer's device shape, notch or Dynamic Island copy, and no trademarks.
- **Hydration:** anything that depends on the current time renders only after hydration (`useHydrated()` or behind `RequireSession`), and the server markup reserves its space. That covers the schedule, the free times, the "now" line and the next-opening chip. The data seed is built at module load with the browser's clock.
- **Accessibility:** no horizontal overflow at 375px or 1440px, visible focus everywhere, and `prefers-reduced-motion` respected (no slide or pop animations under it).
- **No off-platform contact** for the site's owner (email, LINE id, phone). The fictional clinic's own sample details are fine.
- **Commits:** end every message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, and add no other attribution line.
- **Branch:** `feat/clinic-rework` (already created from `main`). Never push or merge without Ohm's OK; merging deploys devbyohm.com.

## File map

| File | Change | Responsibility |
|---|---|---|
| `lib/demos/clinic-booking/data.ts` | Modify | Bilingual services and staff, error codes, day in progress, booking helpers |
| `lib/demos/clinic-booking/store.ts` | Modify | Session defaults to signed in (`v2`), data key `v2`, last-booking store |
| `tests/unit/clinic.test.ts` | Rewrite | Seed, slots, guest booking, day in progress, helpers |
| `app/demos/clinic-booking/_components/copy.ts` | Create | All interface copy |
| `tests/unit/clinic-copy.test.ts` | Create | Copy completeness |
| `app/demos/clinic-booking/_components/admin-format.ts` | Modify | Dates via `formatDate`, drop the Thai-only helpers |
| `app/demos/clinic-booking/layout.tsx` | Modify | Palette, Kanit 400+, `LangScope`, static bilingual title |
| `app/demos/clinic-booking/(home)/page.tsx` | Rewrite | Bilingual public site, staff portraits, next-opening chip |
| `lib/images.ts` | Modify | Three staff portraits |
| `app/demos/clinic-booking/book/page.tsx`, `_components/booking-flow.tsx` | Rewrite | Both sides: 3-tap LINE chat, day schedule, toast, phone tabs |
| `app/demos/clinic-booking/_components/*` (new) | Create | `line-phone.tsx`, `day-schedule.tsx`, `staff-portrait.tsx` and the like |
| `app/demos/clinic-booking/_components/clinic-shell.tsx`, `clinic-login-form.tsx`, `queue.tsx`, `admin/login/page.tsx` | Rewrite | No login wall, bilingual admin, highlight the visitor's booking |
| `app/demos/clinic-booking/_components/customers-crud.tsx`, `services-crud.tsx`, `reports.tsx`, `crud-parts.tsx` | Modify | Bilingual and restyled |
| `tests/e2e/clinic-booking.spec.ts` | Rewrite | Booking, schedule, tabs, admin, English |
| `tests/e2e/smoke.spec.ts`, `scripts/capture-thumbs.mjs` | Modify | Drop the old session seed |
| `tests/e2e/demo-lang.spec.ts` | Modify | Add the clinic |
| `public/thumbs/app-premium.jpg`, `public/thumbs/pages/app-premium-{1..5}.jpg` | Regenerate | New look on the hub |

---

### Task 1: Bilingual data, day in progress, guest booking, stores, shared copy

**Files:**
- Modify: `lib/demos/clinic-booking/data.ts`, `lib/demos/clinic-booking/store.ts`
- Rewrite: `tests/unit/clinic.test.ts`
- Create: `app/demos/clinic-booking/_components/copy.ts`, `tests/unit/clinic-copy.test.ts`
- Modify, with the smallest edits that keep the app compiling: `booking-flow.tsx`, `queue.tsx`, `customers-crud.tsx`, `services-crud.tsx`, `reports.tsx`, `clinic-shell.tsx`, `(home)/page.tsx`, `admin-format.ts`. Later tasks rewrite these.
- Modify: `tests/e2e/smoke.spec.ts` (drop the clinic session seed line and fix its comment), `scripts/capture-thumbs.mjs` (drop the `demo:clinic:session` line).

**Interfaces:**
- Consumes: `L` from `@/lib/demos/lang`; `addDays`, `toISODate` from `@/lib/dates`; `isThaiPhone`, `normalizePhone` from `@/lib/validation`; `createDemoStore`.
- Produces, for later tasks:
  - **Types:** `Service` (`name: L`), `Staff` (`name: L`, `role: L`), `Customer` (`name: string`), `Booking`, `BookingStatus`, `BOOKING_STATUSES`, `ClinicData`, `ClinicErrorCode`, `ClinicError`.
  - **Constants:** `OPEN`, `CLOSE`, `SLOT_STEP_MIN`, `SERVICES`, `STAFF`, `GUEST_ID`.
  - **Time helpers:** `toMinutes`, `fromMinutes`, `newId`.
  - **Seed and slots:** `buildClinicSeed(today: Date)`, `availableSlots(...)`, `progressStatus(startMin, endMin, nowMin): BookingStatus`.
  - **Booking-day helpers:**
    - `bookingDay(now: Date): { date: string; isToday: boolean }`
    - `freeTimes(data, { serviceId, date, now, limit? }): { time: string; staffId: string }[]`
    - `nextOpening(data, now): { date: string; isToday: boolean; time: string; staffId: string } | null`
  - **Booking:** `bookAsGuest(data, { name, serviceId, staffId, date, time }, now?): { data: ClinicData; booking: Booking }`, `isLineBooking(b): boolean`.
  - **Kept:** `bookAppointment` (now throws `ClinicError`). Task 3 removes it.
  - **Admin helpers:** `setBookingStatus`, `upsertCustomer`, `deleteCustomer`, `upsertService`, `deleteService`, `revenueByDay`, `bookingsByService` (returns `name: L`).
  - **Stores:** `clinicSession` (key `clinic:session:v2`, default `true`), `clinicData` (key `clinic:data:v2:<day>`), `clinicLastBooking` (`string | null`).
  - **Copy:** `ui`, `statusLabel`, `errorText` from `copy.ts`.

- [ ] **Step 1: Write the failing unit tests.**

  Replace `tests/unit/clinic.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  availableSlots,
  bookAppointment,
  bookAsGuest,
  bookingDay,
  bookingsByService,
  buildClinicSeed,
  ClinicError,
  CLOSE,
  deleteCustomer,
  deleteService,
  freeTimes,
  fromMinutes,
  GUEST_ID,
  isLineBooking,
  nextOpening,
  OPEN,
  progressStatus,
  revenueByDay,
  SERVICES,
  setBookingStatus,
  STAFF,
  toMinutes,
  upsertCustomer,
} from "@/lib/demos/clinic-booking/data";

const today = new Date(2026, 9, 19, 9, 0);
const tomorrow = "2026-10-20";
const codeOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (err) {
    return err instanceof ClinicError ? err.code : "not a ClinicError";
  }
  return "did not throw";
};

describe("time helpers", () => {
  it("round-trips HH:mm", () => {
    expect(toMinutes("13:30")).toBe(810);
    expect(fromMinutes(810)).toBe("13:30");
  });
});

describe("bilingual business data", () => {
  it("names every service and staff member in Thai and English", () => {
    for (const s of SERVICES) expect(s.name.th && s.name.en).toBeTruthy();
    for (const s of STAFF) expect(s.name.th && s.name.en && s.role.th && s.role.en).toBeTruthy();
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

  it("marks past days done or no-show, future days booked, and today all booked before opening", () => {
    for (const b of data.bookings) {
      if (b.date < "2026-10-19") expect(["done", "no-show"]).toContain(b.status);
      if (b.date >= "2026-10-19") expect(b.status).toBe("booked");
    }
  });

  it("shows today in progress: finished bookings done, the current one arrived, later ones booked", () => {
    const at = new Date(2026, 9, 19, 14, 10);
    const now = 14 * 60 + 10;
    const todays = buildClinicSeed(at).bookings.filter((b) => b.date === "2026-10-19");
    for (const b of todays) {
      const start = toMinutes(b.time);
      const end = start + SERVICES.find((s) => s.id === b.serviceId)!.durationMin;
      expect(b.status).toBe(progressStatus(start, end, now));
    }
    const statuses = new Set(todays.map((b) => b.status));
    expect(statuses).toContain("done");
    expect(statuses).toContain("checked-in");
    expect(statuses).toContain("booked");
  });

  it("seeds no LINE bookings", () => {
    expect(data.bookings.some(isLineBooking)).toBe(false);
  });
});

describe("progressStatus", () => {
  it("is booked before the start, arrived during, done from the end", () => {
    expect(progressStatus(600, 660, 599)).toBe("booked");
    expect(progressStatus(600, 660, 600)).toBe("checked-in");
    expect(progressStatus(600, 660, 659)).toBe("checked-in");
    expect(progressStatus(600, 660, 660)).toBe("done");
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

describe("booking day and free times", () => {
  const data = buildClinicSeed(today);

  it("books today while there is an hour left, otherwise tomorrow", () => {
    expect(bookingDay(new Date(2026, 9, 19, 10, 30))).toEqual({ date: "2026-10-19", isToday: true });
    expect(bookingDay(new Date(2026, 9, 19, 17, 59))).toEqual({ date: "2026-10-19", isToday: true });
    expect(bookingDay(new Date(2026, 9, 19, 18, 0))).toEqual({ date: "2026-10-20", isToday: false });
    expect(bookingDay(new Date(2026, 9, 19, 23, 0))).toEqual({ date: "2026-10-20", isToday: false });
  });

  it("lists distinct free times in order, each with a staff member who does the service and is free", () => {
    const now = new Date(2026, 9, 19, 10, 30);
    const options = freeTimes(data, { serviceId: "s-facial", date: "2026-10-19", now });
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThanOrEqual(6);
    const times = options.map((o) => o.time);
    expect([...times].sort()).toEqual(times);
    expect(new Set(times).size).toBe(times.length);
    for (const o of options) {
      expect(toMinutes(o.time)).toBeGreaterThan(10 * 60 + 30);
      expect(STAFF.find((s) => s.id === o.staffId)!.serviceIds).toContain("s-facial");
      expect(availableSlots(data, { date: "2026-10-19", staffId: o.staffId, serviceId: "s-facial", now })).toContain(o.time);
    }
  });

  it("nextOpening finds the earliest free time on the booking day", () => {
    const now = new Date(2026, 9, 19, 10, 30);
    const next = nextOpening(data, now)!;
    expect(next).toMatchObject({ date: "2026-10-19", isToday: true });
    for (const s of SERVICES) {
      const first = freeTimes(data, { serviceId: s.id, date: next.date, now })[0];
      if (first) expect(next.time <= first.time).toBe(true);
    }
    expect(nextOpening(data, new Date(2026, 9, 19, 18, 30))).toMatchObject({ date: "2026-10-20", isToday: false });
  });
});

describe("bookAsGuest", () => {
  const data = buildClinicSeed(today);
  const now = new Date(2026, 9, 19, 10, 30);

  it("books a free time for the guest customer and marks it as a LINE booking", () => {
    const [option] = freeTimes(data, { serviceId: "s-facial", date: "2026-10-19", now });
    const { data: next, booking } = bookAsGuest(
      data,
      { name: "คุณลูกค้าเดโม", serviceId: "s-facial", staffId: option.staffId, date: "2026-10-19", time: option.time },
      now,
    );
    expect(booking).toMatchObject({ customerId: GUEST_ID, date: "2026-10-19", time: option.time, status: "booked" });
    expect(isLineBooking(booking)).toBe(true);
    expect(next.customers.find((c) => c.id === GUEST_ID)).toMatchObject({ name: "คุณลูกค้าเดโม", phone: "" });
    expect(freeTimes(next, { serviceId: "s-facial", date: "2026-10-19", now }).some((o) => o.time === option.time && o.staffId === option.staffId)).toBe(false);
  });

  it("keeps one guest customer and uses the latest name", () => {
    const options = freeTimes(data, { serviceId: "s-mask", date: "2026-10-19", now });
    const first = bookAsGuest(data, { name: "A", serviceId: "s-mask", staffId: options[0].staffId, date: "2026-10-19", time: options[0].time }, now);
    const second = bookAsGuest(first.data, { name: "B", serviceId: "s-mask", staffId: options[1].staffId, date: "2026-10-19", time: options[1].time }, now);
    expect(second.data.customers.filter((c) => c.id === GUEST_ID)).toEqual([{ id: GUEST_ID, name: "B", phone: "" }]);
  });

  it("rejects a blank name and a taken time with error codes", () => {
    const b = data.bookings.find((x) => x.date === tomorrow)!;
    const input = { name: "A", serviceId: b.serviceId, staffId: b.staffId, date: tomorrow, time: b.time };
    expect(codeOf(() => bookAsGuest(data, input, today))).toBe("slot-taken");
    expect(codeOf(() => bookAsGuest(data, { ...input, name: "  " }, today))).toBe("name-required");
  });
});

describe("bookAppointment (kept until the new booking page replaces it)", () => {
  const data = buildClinicSeed(today);

  it("throws error codes", () => {
    const b = data.bookings.find((x) => x.date === tomorrow)!;
    expect(codeOf(() => bookAppointment(data, { name: "ก", phone: "0800000098", serviceId: b.serviceId, staffId: b.staffId, date: tomorrow, time: b.time }, today))).toBe("slot-taken");
    expect(codeOf(() => bookAppointment(data, { name: "ก", phone: "123", serviceId: "s-facial", staffId: "st-2", date: tomorrow, time: "10:00" }, today))).toBe("phone-invalid");
  });
});

describe("admin mutations and reports", () => {
  const data = buildClinicSeed(today);

  it("sets booking status", () => {
    const id = data.bookings[0].id;
    expect(setBookingStatus(data, id, "checked-in").bookings.find((b) => b.id === id)?.status).toBe("checked-in");
  });

  it("blocks deleting referenced customers and services with error codes", () => {
    const b = data.bookings[0];
    expect(codeOf(() => deleteCustomer(data, b.customerId))).toBe("customer-has-bookings");
    expect(codeOf(() => deleteService(data, b.serviceId))).toBe("service-has-bookings");
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

  it("bookingsByService counts every booking once, named in both languages", () => {
    const rows = bookingsByService(data);
    expect(rows.reduce((s, x) => s + x.count, 0)).toBe(data.bookings.length);
    expect(rows[0].name.en.length).toBeGreaterThan(0);
  });
});
```

  Create `tests/unit/clinic-copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import * as copy from "@/app/demos/clinic-booking/_components/copy";
import { BOOKING_STATUSES, SERVICES, STAFF } from "@/lib/demos/clinic-booking/data";
import { missingTranslations } from "./helpers/missing-translations";

describe("clinic copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations(copy)).toEqual([]);
    expect(missingTranslations(SERVICES)).toEqual([]);
    expect(missingTranslations(STAFF)).toEqual([]);
  });

  it("labels every status and every error code", () => {
    for (const s of BOOKING_STATUSES) expect(copy.statusLabel[s].en.length).toBeGreaterThan(0);
    for (const code of ["name-required", "phone-invalid", "slot-taken", "customer-has-bookings", "service-has-bookings"] as const) {
      expect(copy.errorText[code].th.length).toBeGreaterThan(0);
    }
  });
});
```

  Run `pnpm vitest run tests/unit/clinic.test.ts tests/unit/clinic-copy.test.ts`. Expected: FAIL. The new exports and `copy.ts` don't exist yet.

- [ ] **Step 2: Update `lib/demos/clinic-booking/data.ts`.**

  Make these changes. Everything not listed stays exactly as it is.

  1. **Imports and types.** Add `import type { L } from "@/lib/demos/lang";`. Change `Service.name` to `L`, and `Staff.name` and `Staff.role` to `L`.
  2. **Error codes.** Add them after the `ClinicData` interface:

```ts
export type ClinicErrorCode =
  | "name-required"
  | "phone-invalid"
  | "slot-taken"
  | "customer-has-bookings"
  | "service-has-bookings";

/** Data errors carry a code, so each screen can word them in the visitor's language. */
export class ClinicError extends Error {
  constructor(readonly code: ClinicErrorCode) {
    super(code);
    this.name = "ClinicError";
  }
}
```

  3. **Services and staff.** Replace `SERVICES` and `STAFF` with:

```ts
export const SERVICES: Service[] = [
  { id: "s-consult", name: { th: "ปรึกษาแพทย์", en: "Doctor consultation" }, durationMin: 30, price: 0 },
  { id: "s-facial", name: { th: "ทรีตเมนต์หน้าใส", en: "Brightening facial" }, durationMin: 60, price: 1500 },
  { id: "s-hydra", name: { th: "ไฮดราเฟเชียล", en: "Deep hydrating facial" }, durationMin: 60, price: 2500 },
  { id: "s-acne", name: { th: "รักษาสิว", en: "Acne treatment" }, durationMin: 45, price: 1200 },
  { id: "s-laser", name: { th: "เลเซอร์ปรับสีผิว", en: "Laser toning" }, durationMin: 30, price: 1800 },
  { id: "s-mask", name: { th: "มาสก์ฟื้นฟูผิว", en: "Skin recovery mask" }, durationMin: 30, price: 600 },
];

const THERAPIST = { th: "นักบำบัดผิว", en: "Skin therapist" };

export const STAFF: Staff[] = [
  { id: "st-1", name: { th: "พญ. ลลิตา", en: "Dr. Lalita" }, role: { th: "แพทย์ผิวหนัง", en: "Dermatologist" }, serviceIds: ["s-consult", "s-laser", "s-acne"] },
  { id: "st-2", name: { th: "คุณมิว", en: "Khun Mew" }, role: THERAPIST, serviceIds: ["s-facial", "s-hydra", "s-mask", "s-acne"] },
  { id: "st-3", name: { th: "คุณบีม", en: "Khun Beam" }, role: THERAPIST, serviceIds: ["s-facial", "s-hydra", "s-mask"] },
];
```

  4. **Day in progress.** Add `progressStatus` above `buildClinicSeed`:

```ts
/** Where a booking stands at `nowMin` minutes past midnight on its own day. */
export function progressStatus(startMin: number, endMin: number, nowMin: number): BookingStatus {
  if (nowMin >= endMin) return "done";
  if (nowMin >= startMin) return "checked-in";
  return "booked";
}
```

  In `buildClinicSeed`, compute `const nowMin = today.getHours() * 60 + today.getMinutes();` once. Replace the status line with:

```ts
        const start = toMinutes(time);
        const duration = SERVICES.find((s) => s.id === serviceId)!.durationMin;
        const status: BookingStatus =
          offset < 0 ? (n % 5 === 0 ? "no-show" : "done") : offset === 0 ? progressStatus(start, start + duration, nowMin) : "booked";
```

  5. **Error codes in mutations.** In `bookAppointment`, throw `new ClinicError("name-required")`, `new ClinicError("phone-invalid")` and `new ClinicError("slot-taken")` in place of the Thai strings. In `deleteCustomer` throw `new ClinicError("customer-has-bookings")`, and in `deleteService` throw `new ClinicError("service-has-bookings")`.
  6. **New helpers.** Add after `availableSlots`:

```ts
/** The day the 3-tap booking offers: today while an hour is left before closing, otherwise tomorrow. */
export function bookingDay(now: Date): { date: string; isToday: boolean } {
  const isToday = now.getHours() * 60 + now.getMinutes() < toMinutes(CLOSE) - 60;
  return { date: toISODate(isToday ? now : addDays(now, 1)), isToday };
}

/** The earliest free start times for a service on one day, each with the first staff member free then. */
export function freeTimes(
  data: ClinicData,
  { serviceId, date, now, limit = 6 }: { serviceId: string; date: string; now?: Date; limit?: number },
): { time: string; staffId: string }[] {
  const byTime = new Map<string, string>();
  for (const staff of STAFF) {
    for (const time of availableSlots(data, { date, staffId: staff.id, serviceId, now })) {
      if (!byTime.has(time)) byTime.set(time, staff.id);
    }
  }
  return [...byTime.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, limit)
    .map(([time, staffId]) => ({ time, staffId }));
}

/** The next free time for any treatment on the booking day, for the "next opening" chip. */
export function nextOpening(data: ClinicData, now: Date) {
  const { date, isToday } = bookingDay(now);
  const firsts = data.services
    .map((s) => freeTimes(data, { serviceId: s.id, date, now, limit: 1 })[0])
    .filter((o): o is { time: string; staffId: string } => Boolean(o))
    .sort((a, b) => a.time.localeCompare(b.time));
  return firsts[0] ? { date, isToday, ...firsts[0] } : null;
}

export const GUEST_ID = "c-guest";

// Bookings made on the LINE booking page get "line-" ids; seeded ones are b-1, b-2…
export const isLineBooking = (b: Booking) => b.id.startsWith("line-");

/**
 * The 3-tap booking. The visitor books as one guest customer. There is no phone number,
 * because LINE already knows who is chatting; the latest name typed wins.
 */
export function bookAsGuest(
  data: ClinicData,
  input: { name: string; serviceId: string; staffId: string; date: string; time: string },
  now: Date = new Date(),
): { data: ClinicData; booking: Booking } {
  const name = input.name.trim();
  if (!name) throw new ClinicError("name-required");
  const free = availableSlots(data, { date: input.date, staffId: input.staffId, serviceId: input.serviceId, now });
  if (!free.includes(input.time)) throw new ClinicError("slot-taken");
  const booking: Booking = {
    id: newId("line"),
    customerId: GUEST_ID,
    serviceId: input.serviceId,
    staffId: input.staffId,
    date: input.date,
    time: input.time,
    status: "booked",
  };
  return {
    data: { ...data, customers: upsert(data.customers, { id: GUEST_ID, name, phone: "" }), bookings: [...data.bookings, booking] },
    booking,
  };
}
```

  `bookingsByService` keeps its shape; its `name` is now an `L`.

- [ ] **Step 3: Update `lib/demos/clinic-booking/store.ts`.**

```ts
import { createDemoStore } from "@/lib/demo-store";
import { toISODate } from "@/lib/dates";
import { buildClinicSeed, type ClinicData } from "./data";

// The demo opens signed in, so the admin has no login wall. Logging out stores false and the
// login screen guards the admin until the visitor logs in again. "v2" so visitors who logged
// out under the old build also land on the admin.
export const clinicSession = createDemoStore<boolean>("clinic:session:v2", true);
// The seed is built relative to now (today's bookings show the day in progress). The data key
// is scoped by day so a visitor returning on a later day gets a fresh seed. "v2" drops data
// saved before service and staff names became bilingual.
export const clinicData = createDemoStore<ClinicData>(
  `clinic:data:v2:${toISODate(new Date())}`,
  buildClinicSeed(new Date()),
);
/** The booking the visitor just made on the LINE page, so the schedule and admin can highlight it. */
export const clinicLastBooking = createDemoStore<string | null>("clinic:last-booking", null);
```

- [ ] **Step 4: Create `app/demos/clinic-booking/_components/copy.ts`** with the shared copy. Tasks 2–5 add their own sections to `ui`.

```ts
import type { L } from "@/lib/demos/lang";
import type { BookingStatus, ClinicErrorCode } from "@/lib/demos/clinic-booking/data";

export const ui = {
  brand: { th: "ลูมิ คลินิก", en: "Lumi Clinic" },
  minutes: { th: "{n} นาที", en: "{n} min" },
  free: { th: "ฟรี", en: "Free" },
  clockTime: { th: "{time} น.", en: "{time}" },
  resetData: { th: "รีเซ็ตข้อมูล", en: "Reset data" },
} satisfies Record<string, L>;

export const statusLabel: Record<BookingStatus, L> = {
  booked: { th: "จองแล้ว", en: "Booked" },
  "checked-in": { th: "มาถึงแล้ว", en: "Arrived" },
  done: { th: "เสร็จสิ้น", en: "Done" },
  "no-show": { th: "ไม่มา", en: "No-show" },
};

export const errorText: Record<ClinicErrorCode, L> = {
  "name-required": { th: "กรุณากรอกชื่อ", en: "Please enter a name." },
  "phone-invalid": { th: "เบอร์โทรไม่ถูกต้อง", en: "That phone number doesn't look right." },
  "slot-taken": { th: "เวลานี้ไม่ว่างแล้ว กรุณาเลือกเวลาใหม่", en: "That time was just taken. Please pick another." },
  "customer-has-bookings": { th: "ลบไม่ได้ ลูกค้ารายนี้มีประวัติการจอง", en: "Can't delete: this customer has bookings." },
  "service-has-bookings": { th: "ลบไม่ได้ บริการนี้มีการจองอยู่", en: "Can't delete: this treatment has bookings." },
};
```

- [ ] **Step 5: Keep the current screens compiling.**

  Make the smallest edits to the files listed above so `pnpm typecheck` and `pnpm lint` pass:
  - Read `.th` from service and staff names and roles.
  - Replace `/^b-\d+$/` checks with `isLineBooking`.
  - Map caught errors with `err instanceof ClinicError ? errorText[err.code].th : …`.

  Don't restyle; later tasks rewrite these files.

  Also:
  - Remove the `demo:clinic:session` seed line from `tests/e2e/smoke.spec.ts` and `scripts/capture-thumbs.mjs`, since the session now defaults to signed in. Keep the shop line if one is there.
  - Correct the smoke test's comment.

- [ ] **Step 6: Run the checks.**

  Run `pnpm vitest run tests/unit/clinic.test.ts tests/unit/clinic-copy.test.ts && pnpm typecheck && pnpm lint && pnpm test`. Expected: all pass.

  `tests/e2e/clinic-booking.spec.ts` expects the old login wall and now fails. Task 3 rewrites it, so don't run it here.

- [ ] **Step 7: Commit.**

```bash
git add lib/demos/clinic-booking tests/unit/clinic.test.ts tests/unit/clinic-copy.test.ts app/demos/clinic-booking tests/e2e/smoke.spec.ts scripts/capture-thumbs.mjs
git commit -F - <<'EOF'
feat(clinic): bilingual services and staff, error codes, the day in progress, guest booking helpers and a signed-in demo session

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: The look and the public site (visual; use `frontend-design`)

**Invoke the `frontend-design` skill first.** Lumi Clinic is a small, calm skin clinic in Thonglor. It should look premium and warm: rose and wine with stronger contrast than today, Kanit at 400 or heavier, real portraits of the team, and generous space. Each demo on the site has its own look. Keep the clinic's own feel, and don't borrow the resort's arches or the shop admin's kraft.

**Files:**
- Modify: `app/demos/clinic-booking/layout.tsx`, `lib/images.ts`
- Rewrite: `app/demos/clinic-booking/(home)/page.tsx`, split into client pieces as needed (for example `_components/home-hero.tsx` and `_components/staff-portrait.tsx`)
- Modify: `app/demos/clinic-booking/_components/copy.ts` (add a `// Home` section)
- Create: `tests/e2e/clinic-home.spec.ts`

**Interfaces:**
- Consumes: from Task 1, `SERVICES`, `STAFF`, `OPEN`, `CLOSE`, `nextOpening`, `clinicData`, `ui`. Shared: `LangScope`, `useLang`, `DemoLangSwitch`, `fill`, `formatTHB`, `useHydrated`, `PHOTOS`, `unsplash`.
- Produces:
  - `PHOTOS.clinicStaffLalita`, `PHOTOS.clinicStaffMew` and `PHOTOS.clinicStaffBeam`.
  - A `StaffPortrait` component (`{ staffId, className, sizes }`) that Task 3 reuses for small faces.
  - The palette tokens.

**Fixed requirements:**

1. **Layout** (`layout.tsx`):
   - Use Kanit at 400/500/600 and the palette from the Global Constraints, set on a `LangScope`.
   - Keep `DemoPill packageId="app-premium"`.
   - `metadata.title`: `{ template: "%s | Lumi Clinic", default: "Lumi Clinic · ลูมิ คลินิก" }`.
   - `metadata.description`: `"Lumi Clinic, a fictional skin clinic in Bangkok: book a treatment on LINE in three taps and see it land in the clinic's schedule."`
   - The home page's title is `"Skin clinic · คลินิกดูแลผิว"`.
2. **Portraits:**
   - Find three tall Unsplash portraits that fit the team: a female doctor in a white coat for พญ. ลลิตา, and two skin therapists in clinic wear for คุณมิว and คุณบีม.
   - Search unsplash.com with WebFetch, take the photo ids, and check each with `curl -sI "https://images.unsplash.com/photo-<id>?w=600&q=80&auto=format&fit=crop"` until it returns 200.
   - Add them to `PHOTOS` in `lib/images.ts`.
   - Alt text comes from copy (for example `fill(ui.staffPhotoAlt, { name })`).
3. **Header:**
   - The brand, then in-page links (treatments, team, clinic) and a "book on LINE" link to `/demos/clinic-booking/book` (`data-testid="book-cta-header"`).
   - Exactly one `DemoLangSwitch`, with a visible focus ring.
   - Put the links in a `<nav aria-label={ui.mainNav[lang]}>`.
4. **Hero:**
   - The kicker, the brand as the `<h1>`, the promise, the body line, a primary "book on LINE" button (`data-testid="book-cta"`) to `/demos/clinic-booking/book`, and the opening hours.
   - The hero photo.
   - **Next-opening chip** (`data-testid="next-opening"`): after hydration, `nextOpening(data, new Date())` reads `fill(isToday ? ui.nextFreeToday : ui.nextFreeTomorrow, { time, staff })`. The staff value is the staff member's name in the current language. Before hydration, reserve the chip's space with an empty placeholder of the same size. If there is no opening, show `ui.nextFreeNone`.
   - A small LINE confirmation card over the photo (decorative, `aria-hidden`). Its wording comes from copy in both languages.
5. **Treatments:** every service with name, `fill(ui.minutes, { n })`, and the price (`ui.free` when 0).
6. **Team:**
   - One tall portrait card per staff member (`data-testid="staff-card"`), with the photo at a portrait aspect (about 4:5), name, role, and the treatments they do as chips.
   - No letter circles anywhere.
7. **Clinic info:** the interior photo, the "no waiting" copy, address, hours and parking. Use `fill(ui.hours, { open: OPEN, close: CLOSE })` for the hours and `ui.bookAhead` for the booking window.
8. **How booking works:** three steps that match the new flow (pick a treatment → pick a free time → confirm), and a button to `/book`.
9. **Footer:**
   - The fictional-clinic note.
   - A link to the admin, `/demos/clinic-booking/admin` (label `ui.footerAdmin`: `ดูระบบหลังร้านคลินิก` / `See the clinic's back office`, `prefetch={false}`). There is no login step now.
10. **Removed:** every inline Thai or English literal in the page. Remove `font-light`, and body text below 16px.

- [ ] **Step 1: Write the failing e2e tests.** Create `tests/e2e/clinic-home.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const t = new Date();
  t.setHours(10, 30, 0, 0);
  await page.clock.setFixedTime(t);
});

test.describe("in Thai", () => {
  test.use({ locale: "th-TH" });

  test("the hero shows the next free time and the team has portraits", async ({ page }) => {
    await page.goto("/demos/clinic-booking");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ลูมิ คลินิก");
    await expect(page.getByTestId("next-opening")).toContainText(/คิวว่างถัดไปวันนี้ \d{2}:\d{2}/);
    const cards = page.getByTestId("staff-card");
    await expect(cards).toHaveCount(3);
    await expect(cards.first().getByRole("img")).toBeVisible();
  });

  test("the book button opens the booking page and the footer opens the admin without a login", async ({ page }) => {
    await page.goto("/demos/clinic-booking");
    await page.getByTestId("book-cta").click();
    await expect(page).toHaveURL(/\/demos\/clinic-booking\/book$/);
    await page.goto("/demos/clinic-booking");
    await page.getByRole("link", { name: "ดูระบบหลังร้านคลินิก" }).click();
    await expect(page).toHaveURL(/\/demos\/clinic-booking\/admin$/);
  });
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the site reads in English with the staff named in English", async ({ page }) => {
    await page.goto("/demos/clinic-booking");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lumi Clinic");
    await expect(page.getByTestId("next-opening")).toContainText(/Next free time today \d{2}:\d{2}/);
    await expect(page.getByTestId("staff-card").first()).toContainText("Dr. Lalita");
    await expect(page.locator("main")).toContainText("Brightening facial");
  });
});
```

  Copy that these tests rely on:
  - `ui.nextFreeToday`: `{ th: "คิวว่างถัดไปวันนี้ {time} · {staff}", en: "Next free time today {time} · {staff}" }`
  - `ui.nextFreeTomorrow`: `{ th: "คิวว่างถัดไปพรุ่งนี้ {time} · {staff}", en: "Next free time tomorrow {time} · {staff}" }`
  - `ui.nextFreeNone`: `{ th: "ดูเวลาว่างในหน้าจองคิว", en: "See free times on the booking page" }`
  - `ui.footerAdmin`, as given in item 9.

  Run `pnpm test:e2e tests/e2e/clinic-home.spec.ts`. Expected: FAIL.

- [ ] **Step 2: Build it.** Invoke `frontend-design`, then build the requirements above.

- [ ] **Step 3: Visual check.**
  - Run `pnpm dev --port 3000` and use a screenshot script in `.superpowers/sdd/`.
  - Pin the clock to today at 10:30 with `page.clock.setFixedTime`, set the language with `localStorage.setItem("demo:lang", JSON.stringify("th"))` (or `"en"`) in `addInitScript`, and hide `[data-testid=demo-pill]`.
  - Take full-page shots at 1440×900 and 375×812 in both languages.
  - Fix anything clipped, overlapping, empty or overflowing.
  - Save them as `.superpowers/sdd/clinic-home-{desk,phone}-{th,en}.jpg`, then stop the server.

- [ ] **Step 4: Checks.** Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/clinic-home.spec.ts tests/e2e/smoke.spec.ts`. Expected: all pass on both projects.

- [ ] **Step 5: Commit.**

```bash
git add app/demos/clinic-booking lib/images.ts tests/e2e/clinic-home.spec.ts
git commit -F - <<'EOF'
feat(clinic): stronger rose and wine look, team portraits and a live next-free-time chip on the public site, in Thai and English

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: The booking page shows both sides (visual; use `frontend-design`)

**Invoke the `frontend-design` skill first**, and match the look Task 2 set up: read `layout.tsx`, `(home)/page.tsx`, the staff portrait component and `copy.ts`.

This page is the demo's payoff:
- **Left:** the customer books in their LINE chat in three taps.
- **Right:** the booking drops into the clinic's schedule for the day, highlighted.

It must be obvious without instructions what is happening on each side.

**Files:**
- Rewrite: `app/demos/clinic-booking/book/page.tsx`, `app/demos/clinic-booking/_components/booking-flow.tsx`
- Create, as you see fit: `_components/line-phone.tsx` (the device frame and LINE chrome), `_components/day-schedule.tsx` (the clinic's day), `_components/booking-toast.tsx`
- Modify: `app/demos/clinic-booking/_components/copy.ts` (add a `// Booking page` section)
- Modify: `lib/demos/clinic-booking/data.ts` and `tests/unit/clinic.test.ts`. Remove `bookAppointment`, its test block, the `phone-invalid` code and its `errorText` entry, but only if nothing else uses them; `customers-crud.tsx` validates phones itself. Then update the copy test's code list.
- Rewrite: `tests/e2e/clinic-booking.spec.ts`

**Interfaces:**
- Consumes:
  - From Task 1: `bookingDay`, `freeTimes`, `bookAsGuest`, `ClinicError`, `progressStatus`, `isLineBooking`, `STAFF`, `OPEN`, `CLOSE`, `toMinutes`, `fromMinutes`, `clinicData`, `clinicLastBooking`, `ui`, `statusLabel`, `errorText`.
  - From Task 2: `StaffPortrait` and the palette.
  - Shared: `useLang`, `DemoLangSwitch`, `fill`, `formatTHB`, `formatDate`, `useHydrated`.
- Produces, for Task 4: `clinicLastBooking` is set to the new booking's id on every confirm.

**Fixed requirements:**

1. **Page frame** (`book/page.tsx`, title `"Book on LINE · จองคิวผ่าน LINE"`):
   - A slim header: back to the clinic, the brand, and one `DemoLangSwitch`.
   - Then an `<h1>`: `ui.bookTitle` = `{ th: "จองคิวใน 3 แตะ แล้วดูคิวเข้าตารางคลินิก", en: "Book in three taps, then watch it land in the clinic's schedule" }`.
   - Then the two sides:
     - The left side's label is `ui.sideCustomer` = `{ th: "มุมลูกค้า · LINE", en: "Customer · LINE" }`.
     - The right side's label is `ui.sideClinic` = `{ th: "มุมคลินิก · ตารางวันนี้", en: "Clinic · today's schedule" }`. When `bookingDay(now).isToday` is false, it uses `ui.sideClinicTomorrow` (`"มุมคลินิก · ตารางพรุ่งนี้"` / `"Clinic · tomorrow's schedule"`).
2. **The LINE phone** (left):
   - An original, modern device frame (see Global Constraints) with the LINE-style chat: header, chat background, bubbles and a composer bar. All chat copy comes from copy.
   - The chat runs in three taps:
     1. **Treatment.** The bot greets, then asks which treatment. A card lists every service: name, duration, and price or `ui.free`. Each is a button with `data-testid="service-<id>"`. Tapping one adds the visitor's reply bubble.
     2. **Time.**
        - The bot offers free times on the booking day.
        - The options are `freeTimes(data, { serviceId, date: bookingDay(now).date, now })`, each a button (`data-testid="slot"`, `data-time`, `data-staff`) showing the time and the staff member, with a small `StaffPortrait` and the name in the current language.
        - If there are no options, the bot says so (`ui.noTimes`) and offers the back chip.
        - Tapping a time adds the reply bubble.
     3. **Confirm.**
        - A summary card shows the treatment, staff, day (`formatDate`, plus "today" or "tomorrow" wording from copy), time and price.
        - It has a name field (`data-testid="book-name"`, label `ui.nameLabel`) pre-filled with `ui.guestName` = `{ th: "คุณลูกค้าเดโม", en: "Demo guest" }`.
        - The confirm button is `data-testid="book-confirm"`.
        - Confirming calls `bookAsGuest`. On a `ClinicError`, show `errorText[code]` inline: by the field for `name-required`, and as an alert for `slot-taken`.
   - **On success:**
     - Store the data and set `clinicLastBooking` to the booking id.
     - The bot posts a confirmation card (`data-testid="booking-confirmed"`) with the time, treatment and staff name.
     - Show two actions: `ui.restart` ("เริ่มใหม่"), which resets the chat to step 1 and keeps the data, and `ui.openAdmin`, a link to `/demos/clinic-booking/admin` (`prefetch={false}`).
   - **Chips under the chat:**
     - a back chip (`data-testid="book-back"`) that steps back one tap, or links to the clinic home on step 1;
     - from step 2, a `ui.restart` chip.
   - **Chat semantics:** the chat log is `role="log"` with a label. Move focus to each new step's first control, as today.
3. **The clinic's day** (right; `data-testid="clinic-schedule"`):
   - A header with the day (`formatDate(date, lang, "full")`) and a link to the full admin (`ui.openAdmin`).
   - **Lanes:** one per staff member, with a small portrait, name and role. They span `OPEN`–`CLOSE` with hour ticks.
   - **Blocks:** each of the day's bookings is a block (`data-testid="schedule-block"`, `data-booking-id`, `data-staff`, `data-time`, `data-status`). It shows the customer name and the treatment, coloured by status: booked, arrived, done or no-show. Add a legend with `statusLabel`.
   - **Now line:** when the day is today and now is within opening hours, draw a "now" line (`data-testid="schedule-now"`) labelled `fill(ui.nowAt, { time })`.
   - **The visitor's booking:** the block gets `data-new="true"`, an accent highlight, and an entrance animation (none under reduced motion).
   - **Phones:** the schedule must stay readable at 375px with no sideways page scroll. A vertical layout (time down, staff across) is fine there.
   - **Before hydration:** render a same-size placeholder.
4. **Toast** (`data-testid="booking-toast"`, `role="status"`):
   - On success, show `fill(ui.toastLanded, { staff, time })` = `{ th: "คิวใหม่เข้าตารางของ{staff}แล้ว · {time} น.", en: "New booking in {staff}'s schedule · {time}" }`.
   - It is visible on both desktop and phones and sits above the demo pill.
   - It hides after about 6 seconds, or when dismissed.
5. **Phones (below `lg`):**
   - The two sides become tabs: `role="tablist"` with `ui.tabCustomer` ("ลูกค้า" / "Customer") and `ui.tabClinic` ("คลินิก" / "Clinic").
   - The customer tab is active first.
   - After a booking lands, the clinic tab shows a badge (`data-testid="clinic-tab-badge"`) until it is opened.
   - From `lg` up, both sides show and there are no tabs.
6. **Removed:**
   - the old six-step flow, the phone and date fields, and the "behind the scenes" aside;
   - every inline Thai or English literal in these files.

- [ ] **Step 1: Write the failing e2e tests.** Replace `tests/e2e/clinic-booking.spec.ts` with this spec. Tasks 4 and 5 add to it.

```ts
import { expect, test, type Page } from "@playwright/test";

const BOOK = "/demos/clinic-booking/book";
const STAFF_TH: Record<string, string> = { "st-1": "พญ. ลลิตา", "st-2": "คุณมิว", "st-3": "คุณบีม" };

test.use({ locale: "th-TH" });

test.beforeEach(async ({ page }) => {
  // Pin "now" to 10:30 today so the day is in progress and there are free times left.
  const t = new Date();
  t.setHours(10, 30, 0, 0);
  await page.clock.setFixedTime(t);
});

// On phones the two sides are tabs; on desktop both are always showing.
async function show(page: Page, side: "ลูกค้า" | "คลินิก") {
  const tab = page.getByRole("tab", { name: new RegExp(`^${side}`) });
  if (await tab.isVisible()) await tab.click();
}

async function bookFacial(page: Page) {
  await page.goto(BOOK);
  await page.getByTestId("service-s-facial").click();
  const slot = page.getByTestId("slot").first();
  const time = (await slot.getAttribute("data-time"))!;
  const staff = (await slot.getAttribute("data-staff"))!;
  await slot.click();
  await expect(page.getByTestId("book-name")).toHaveValue("คุณลูกค้าเดโม");
  await page.getByTestId("book-confirm").click();
  return { time, staff };
}

test("the clinic's day is already in progress", async ({ page }) => {
  await page.goto(BOOK);
  await show(page, "คลินิก");
  const schedule = page.getByTestId("clinic-schedule");
  await expect(schedule.getByTestId("schedule-now")).toBeVisible();
  await expect(schedule.locator('[data-testid="schedule-block"][data-status="done"]').first()).toBeAttached();
  await expect(schedule.locator('[data-testid="schedule-block"][data-status="checked-in"]').first()).toBeAttached();
  await expect(schedule.locator('[data-testid="schedule-block"][data-status="booked"]').first()).toBeAttached();
});

test("three taps book a facial, and it lands highlighted in that staff member's schedule", async ({ page }) => {
  const { time, staff } = await bookFacial(page);
  await expect(page.getByTestId("booking-confirmed")).toContainText(time);
  await expect(page.getByTestId("booking-toast")).toContainText(STAFF_TH[staff]);
  await show(page, "คลินิก");
  const block = page.locator('[data-testid="schedule-block"][data-new="true"]');
  await expect(block).toBeVisible();
  await expect(block).toHaveAttribute("data-staff", staff);
  await expect(block).toHaveAttribute("data-time", time);
  await expect(block).toHaveAttribute("data-status", "booked");
});

test("a booked time is no longer offered, and restart goes back to the first tap", async ({ page }) => {
  const { time, staff } = await bookFacial(page);
  await page.getByRole("button", { name: "เริ่มใหม่" }).first().click();
  await page.getByTestId("service-s-facial").click();
  await expect(page.locator(`[data-testid="slot"][data-time="${time}"][data-staff="${staff}"]`)).toHaveCount(0);
});

test("a blank name shows an inline error and books nothing", async ({ page }) => {
  await page.goto(BOOK);
  await page.getByTestId("service-s-mask").click();
  await page.getByTestId("slot").first().click();
  await page.getByTestId("book-name").fill("");
  await page.getByTestId("book-confirm").click();
  await expect(page.getByText("กรุณากรอกชื่อ")).toBeVisible();
  await expect(page.getByTestId("booking-confirmed")).toHaveCount(0);
});

test("on phones the clinic tab shows a badge when the booking lands", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile", "tabs exist on phones only");
  await bookFacial(page);
  await expect(page.getByTestId("clinic-tab-badge")).toBeVisible();
  await page.getByRole("tab", { name: /^คลินิก/ }).click();
  await expect(page.getByTestId("clinic-tab-badge")).toHaveCount(0);
  await expect(page.locator('[data-testid="schedule-block"][data-new="true"]')).toBeVisible();
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the chat and the schedule read in English", async ({ page }) => {
    await page.goto(BOOK);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Book in three taps");
    await expect(page.getByTestId("service-s-facial")).toContainText("Brightening facial");
    await page.getByTestId("service-s-facial").click();
    await expect(page.getByTestId("slot").first()).toContainText(/Khun|Dr\./);
    await page.getByTestId("slot").first().click();
    await expect(page.getByTestId("book-name")).toHaveValue("Demo guest");
    await page.getByTestId("book-confirm").click();
    await expect(page.getByTestId("booking-toast")).toContainText("schedule");
  });
});
```

  Run `pnpm test:e2e tests/e2e/clinic-booking.spec.ts`. Expected: FAIL.

- [ ] **Step 2: Build it.** Invoke `frontend-design`, then build the requirements above.

- [ ] **Step 3: Visual check.**
  - Use the same method as Task 2, with the clock pinned at 10:30.
  - Take shots of the booking page at 1440×900 and 375×812 in both languages:
    - before booking;
    - after a completed booking on desktop;
    - on phones, the clinic tab after booking.
  - Fix anything clipped, overlapping or overflowing.
  - Save them as `.superpowers/sdd/clinic-book-{desk,phone}-{th,en}-{start,booked}.jpg`.

- [ ] **Step 4: Checks.**
  - Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/clinic-booking.spec.ts tests/e2e/clinic-home.spec.ts tests/e2e/smoke.spec.ts`. Expected: all pass on both projects.
  - Then run `pnpm test:e2e tests/e2e/clinic-booking.spec.ts --repeat-each=3`. Expected: no flakes.

- [ ] **Step 5: Commit.**

```bash
git add -A app/demos/clinic-booking lib/demos/clinic-booking tests/unit/clinic.test.ts tests/unit/clinic-copy.test.ts tests/e2e/clinic-booking.spec.ts
git commit -F - <<'EOF'
feat(clinic): booking page shows both sides — a 3-tap LINE chat and the clinic's day, with the new booking landing highlighted

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Admin without a login wall, bilingual shell, login and today's queue (visual; use `frontend-design`)

**Invoke the `frontend-design` skill first**, and match the look of Tasks 2 and 3.

**Files:**
- Rewrite: `app/demos/clinic-booking/_components/clinic-shell.tsx`, `clinic-login-form.tsx`, `queue.tsx`, `app/demos/clinic-booking/admin/login/page.tsx`
- Modify: `app/demos/clinic-booking/_components/admin-format.ts`. Dates go through `formatDate`; drop `thLongDate`, `thDayMonth` and `weekdayShort` once nothing uses them; keep `STATUS_TONE`, `formatPhone`, `focusRing` and `fieldClass` (16px).
- Modify: the admin page files' `metadata` titles: `"Today's queue · คิววันนี้"`, `"Customers · ลูกค้า"`, `"Treatments · บริการ"`, `"Reports · รายงาน"`, `"Staff log in · เข้าสู่ระบบเจ้าหน้าที่"`.
- Modify: `copy.ts` (add a `// Admin` section)
- Modify: `tests/e2e/clinic-booking.spec.ts` (append)

**Interfaces:**
- Consumes: from Task 1, `clinicSession`, `clinicData`, `clinicLastBooking`, `STAFF`, `BOOKING_STATUSES`, `setBookingStatus`, `isLineBooking`, `statusLabel`, `ui`; from Task 3, `clinicLastBooking` being set on confirm. Shared: `RequireSession`, `ResetDemoButton` (16px label via `!text-base`), `DemoLangSwitch`, `useLang`, `fill`, `formatDate`, `formatTHB`.

**Fixed requirements:**

1. **Shell:**
   - Keep `ClinicFrame` wrapping `RequireSession store={clinicSession} loginPath="/demos/clinic-booking/admin/login"`.
   - **Demo-session banner** (`data-testid="demo-session"`) on every admin page:
     - It shows `ui.demoBanner` = `{ th: "กำลังดูในฐานะเจ้าหน้าที่คลินิก (เดโม)", en: "Viewing as clinic staff (demo)" }` and a log-out button (`ui.logout`: `ออกจากระบบ` / `Log out`).
     - That button is the only log-out control. It runs `clinicSession.set(false)` then `router.push("/demos/clinic-booking/admin/login")`.
   - **Navigation:** `<nav aria-label={ui.mainNav[lang]}>`.
     - Labels: `ui.navQueue` (`คิววันนี้` / `Today's queue`), `ui.navCustomers` (`ลูกค้า` / `Customers`), `ui.navServices` (`บริการ` / `Treatments`) and `ui.navReports` (`รายงาน` / `Reports`).
     - Each link's accessible name starts with its label, and the active one has `aria-current="page"`.
   - **Also in the shell:** a link to the LINE booking page; `ResetDemoButton` (resets `clinicData` and `clinicLastBooking`); exactly one `DemoLangSwitch`.
2. **Login:** same behaviour as today (any input logs in, and an already signed-in visit redirects to the queue). It is bilingual, restyled, keeps `data-testid="login-submit"`, and has its own `DemoLangSwitch`.
3. **Queue** (today first):
   - **Header:** the heading (today, tomorrow or the weekday, from copy), the date via `formatDate`, the number of bookings, and the expected takings.
   - **Day chips:** keep `queue-date-<i>`. The labels come from copy and dates from `formatDate`, at 14px or larger.
   - **Status summary:** labels from `statusLabel`.
   - **Staff timeline:** the same idea as the booking page's schedule, with the "now" line.
   - **List rows:** keep `queue-row`, `data-status` and `queue-status`.
     - The status select is labelled `fill(ui.queueStatusLabel, { name, time })`.
     - The customer phone shows `formatPhone`. The guest has no phone, so show `ui.viaLine` (`ติดต่อผ่าน LINE` / `Contact via LINE`).
     - LINE bookings (`isLineBooking`) show a `ui.lineBadge` chip.
   - **Highlight the visitor's booking:**
     - The row whose id equals `clinicLastBooking` gets `data-highlight="true"`, an accent ring, and a `ui.justBooked` label (`เพิ่งจองผ่าน LINE` / `Just booked on LINE`).
     - The queue opens on that booking's day if it is within the 7 days shown, and on today otherwise.
     - The highlighted row scrolls into view on first render.
   - **Empty day:** bilingual copy, with a link to the booking page.
   - Body text and rows at least 16px.

- [ ] **Step 1: Write the failing e2e tests.**

  Append to `tests/e2e/clinic-booking.spec.ts`, after the Thai tests and before `test.describe("in English"`:

```ts
test("the admin opens without a login and highlights the booking just made", async ({ page }) => {
  const { time } = await bookFacial(page);
  await page.goto("/demos/clinic-booking/admin");
  await expect(page).toHaveURL(/\/demos\/clinic-booking\/admin$/);
  await expect(page.getByTestId("demo-session")).toContainText("กำลังดูในฐานะเจ้าหน้าที่คลินิก (เดโม)");
  const row = page.locator('[data-testid="queue-row"][data-highlight="true"]');
  await expect(row).toBeVisible();
  await expect(row).toContainText("คุณลูกค้าเดโม");
  await expect(row).toContainText(time);
  await row.getByTestId("queue-status").selectOption("checked-in");
  await expect(row).toHaveAttribute("data-status", "checked-in");
});

test("the queue shows today in progress", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin");
  await expect(page.locator('[data-testid="queue-row"][data-status="done"]').first()).toBeVisible();
  await expect(page.locator('[data-testid="queue-row"][data-status="booked"]').first()).toBeVisible();
});

test("logging out shows the login, and logging in returns to the queue", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin");
  await page.getByTestId("demo-session").getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/demos/clinic-booking/admin/customers");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/demos\/clinic-booking\/admin$/);
  await expect(page.getByTestId("demo-session")).toBeVisible();
});
```

  Inside `test.describe("in English", …)` add:

```ts
  test("the admin reads in English", async ({ page }) => {
    await page.goto("/demos/clinic-booking/admin");
    await expect(page.getByTestId("demo-session")).toContainText("Viewing as clinic staff (demo)");
    await expect(page.getByRole("navigation", { name: "Main menu" })).toContainText("Customers");
    await expect(page.getByTestId("queue-row").first()).toContainText(/Khun|Dr\./);
  });
```

  Run `pnpm test:e2e tests/e2e/clinic-booking.spec.ts`. Expected: the new tests FAIL.

- [ ] **Step 2: Build it.** Invoke `frontend-design`, then build the requirements above.
- [ ] **Step 3: Visual check.**
  - Use the same method, with the clock pinned at 10:30.
  - Take shots of the admin queue (after one booking, so the highlight shows) and the login, at 1440 and 375, in both languages.
  - Save them as `.superpowers/sdd/clinic-{queue,login}-{desk,phone}-{th,en}.jpg`.
- [ ] **Step 4: Checks.**
  - Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/clinic-booking.spec.ts tests/e2e/smoke.spec.ts`. Expected: all pass on both projects.
  - Then run `pnpm test:e2e tests/e2e/clinic-booking.spec.ts --repeat-each=3`. Expected: no flakes.
- [ ] **Step 5: Commit.**

```bash
git add -A app/demos/clinic-booking tests/e2e/clinic-booking.spec.ts
git commit -F - <<'EOF'
feat(clinic): admin opens without a login, highlights the booking just made, and reads in Thai and English

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: Customers, treatments and reports in both languages

Read `copy.ts`, `clinic-shell.tsx` and `queue.tsx` first, and match their look. This task is mostly translation plus a restyle to the new palette; keep the screens' behaviour.

**Files:**
- Modify: `app/demos/clinic-booking/_components/customers-crud.tsx`, `services-crud.tsx`, `reports.tsx`, `crud-parts.tsx`
- Modify: `copy.ts` (add `// Customers`, `// Treatments` and `// Reports` sections)
- Modify: `tests/e2e/clinic-booking.spec.ts` (append)

**Interfaces:**
- Consumes: `upsertCustomer`, `deleteCustomer`, `upsertService`, `deleteService`, `ClinicError`, `errorText`, `revenueByDay`, `bookingsByService`, `isThaiPhone`, `normalizePhone`, `formatPhone`, `ui`, `useLang`, `fill`, `formatDate`, `formatTHB`.

**Fixed requirements:**

1. **Customers:**
   - Every label, placeholder, hint, button, empty state and `aria-label` comes from copy.
   - The phone validation message is `ui.phoneHint` (`เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 9–10 หลัก` / `Phone numbers start with 0 and have 9–10 digits.`).
   - A failed delete shows `errorText[err.code]` with the customer's name.
   - The guest customer has no phone, so show `ui.viaLine`.
   - Keep every `customer-*` test id and `crud-error`.
2. **Treatments:**
   - Same as Customers for copy.
   - Each service name is an `L`.
     - The form edits the current language's name.
     - Creating a service writes the typed name to both `th` and `en`.
     - Editing changes only the current language's name.
   - Durations use `fill(ui.minutes, …)`.
   - Keep every `service-*` test id.
3. **Reports:**
   - Titles, notes, tooltips, axis labels and chart `aria-label`s come from copy.
   - Dates use `formatDate`, and service names use the current language.
   - Keep `revenue-chart` and `service-chart`.
   - Chart colours come from the new palette.
4. **Shared:** `CrudError` and `Saved` take already-translated strings. Text at least 16px, captions at least 14px. No `font-light`.

- [ ] **Step 1: Write the failing e2e tests.**

  Append to `tests/e2e/clinic-booking.spec.ts`, before `test.describe("in English"`:

```ts
test("customers CRUD blocks deleting customers with bookings", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin/customers");
  await page.getByTestId("customer-add").click();
  await page.getByTestId("customer-name").fill("ลูกค้าใหม่ ทดสอบ");
  await page.getByTestId("customer-phone").fill("0800000077");
  await page.getByTestId("customer-save").click();
  const newRow = page.getByTestId("customer-row").filter({ hasText: "ลูกค้าใหม่ ทดสอบ" });
  await expect(newRow).toBeVisible();
  await newRow.getByTestId("customer-delete").click();
  await expect(newRow).toHaveCount(0);
  await page.locator('[data-testid="customer-row"]:not([data-bookings="0"])').first().getByTestId("customer-delete").click();
  await expect(page.getByTestId("crud-error")).toContainText("ลบไม่ได้");
});

test("reports render charts", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin/reports");
  await expect(page.getByTestId("revenue-chart")).toBeVisible();
  await expect(page.getByTestId("service-chart")).toBeVisible();
});
```

  Inside `test.describe("in English", …)` add:

```ts
  test("customers, treatments and reports read in English", async ({ page }) => {
    await page.goto("/demos/clinic-booking/admin/customers");
    await page.locator('[data-testid="customer-row"]:not([data-bookings="0"])').first().getByTestId("customer-delete").click();
    await expect(page.getByTestId("crud-error")).toContainText("Can't delete");
    await page.goto("/demos/clinic-booking/admin/services");
    await expect(page.getByTestId("service-row").first()).toContainText("Doctor consultation");
    await page.goto("/demos/clinic-booking/admin/reports");
    await expect(page.locator("main")).toContainText("Reports");
  });
```

  Run `pnpm test:e2e tests/e2e/clinic-booking.spec.ts`. Expected: the English test FAILS. The two Thai tests may already pass; keep them.

- [ ] **Step 2: Build it.**
- [ ] **Step 3: Visual check.**
  - Take shots of customers, treatments and reports at 1440 and 375, in both languages.
  - Save them as `.superpowers/sdd/clinic-{customers,services,reports}-{desk,phone}-{th,en}.jpg`.
  - Fix anything clipped or overflowing.
- [ ] **Step 4: Checks.**
  - Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/clinic-booking.spec.ts tests/e2e/smoke.spec.ts`. Expected: all pass.
  - Grep `app/demos/clinic-booking` for Thai characters outside `copy.ts`: `grep -rlP "[\x{0E00}-\x{0E7F}]" app/demos/clinic-booking` or an equivalent. Expected: only `copy.ts`, plus `admin-format.ts` if a regex still needs Thai title prefixes.
- [ ] **Step 5: Commit.**

```bash
git add -A app/demos/clinic-booking tests/e2e/clinic-booking.spec.ts
git commit -F - <<'EOF'
feat(clinic): customers, treatments and reports in Thai and English, restyled

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 6: Shared language test, hub thumbnails, full verification

**Files:** `tests/e2e/demo-lang.spec.ts`. Regenerate `public/thumbs/app-premium.jpg` and `public/thumbs/pages/app-premium-{1,2,3,4,5}.jpg`.

- [ ] **Step 1: Add the clinic to `DEMOS`.**

  Append this to `DEMOS` in `tests/e2e/demo-lang.spec.ts`. Both pages carry the word in `main`: the home page's book button, and the booking page's `<h1>`.

```ts
  { name: "clinic", home: "/demos/clinic-booking", next: "/demos/clinic-booking/book", where: "main", en: "Book", th: "จองคิว" },
```

  Run `pnpm test:e2e tests/e2e/demo-lang.spec.ts`. Expected: PASS on both projects.

- [ ] **Step 2: Regenerate the thumbnails.**

  The capture script pins the clock at 10:30 and shoots the booking page as the cover.

```bash
lsof -ti tcp:3100 | xargs kill 2>/dev/null
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
git add public/thumbs/app-premium.jpg public/thumbs/pages/app-premium-*.jpg
git checkout -- public/thumbs
```

  Open each image. The cover should show the booking page with both sides in Thai. The pages should show the booking page, the queue (with today in progress), customers, treatments and reports.

  Run `ls public/thumbs/pages | grep app-premium` first to confirm the page count.

- [ ] **Step 3: Full verification.** Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`. Expected: everything passes.

- [ ] **Step 4: Commit.**

```bash
git add tests/e2e/demo-lang.spec.ts public/thumbs/app-premium.jpg public/thumbs/pages/
git commit -F - <<'EOF'
test(clinic): shared language test; hub thumbnails for the new clinic

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

  Commit only the `app-premium` thumbnails.
