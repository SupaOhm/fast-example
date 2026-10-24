# Lumi Clinic: a Demo Clock When the Clinic Is Closed — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every visitor sees the clinic's day in progress, whatever their local time. While the clinic is open for booking, the demo uses the real time. Outside those hours it runs on a fixed demo time of **10:30 today**, and shows a small note saying so.

**Why:** Today the "day in progress" look only appears between 10:00 and 18:00 on the visitor's own clock. That look is the red "now" line, with bookings done or arrived, and later ones booked. Before 10:00 everything shows as booked with no "now" line, and after 18:00 the page switches to tomorrow. The hub thumbnails were shot at 10:30. Evening visitors and visitors in other time zones never see what the thumbnail promised. Ohm chose the demo clock on 2026-10-24.

**Architecture:**
- One pure function in `lib/demos/clinic-booking/data.ts` decides the clinic's "now" from the real time.
- One client hook, `app/demos/clinic-booking/_components/use-clinic-now.ts`, wraps it with the existing minute tick.
- Every place that reads "now" for clinic logic or display uses that function or the hook. That covers the seed, the schedule, the queue, the shell badge, the booking flow, the next-opening chip, the LINE phone's clock, the reports and the customers.
- `Date.now()` used only for timer arithmetic (the toast's pause/resume and the minute tick's alignment) stays as it is.

**Tech stack:** Next.js 16.4 static export, React 19, TS strict, Vitest, Playwright.

## Global Constraints

- Static export. No new dependencies.
- The global constraints in `docs/superpowers/plans/2026-10-23-clinic-rework.md` still apply: copy from `copy.ts` in both languages, 16px body text, 14px labels, AA contrast, hydration-safe rendering, and reduced motion.
- The clinic's open-for-booking window is `OPEN` (10:00) up to one hour before `CLOSE` (19:00), so 10:00 ≤ now < 18:00. Reuse the constants; don't hard-code the numbers.
- `DEMO_TIME = "10:30"`, exported from `data.ts`.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, with no other attribution line.
- Branch: `feat/clinic-demo-clock`, cut from `main`. Never push or merge without Ohm's OK.

---

### Task 1: Demo clock everywhere, with a visible note

**Files:**
- Modify: `lib/demos/clinic-booking/data.ts`, `lib/demos/clinic-booking/store.ts`, `tests/unit/clinic.test.ts`
- Create: `app/demos/clinic-booking/_components/use-clinic-now.ts`
- Modify every clinic component that reads the current time for clinic logic or display: `booking-flow.tsx`, `day-schedule.tsx`, `queue.tsx`, `clinic-shell.tsx`, `next-opening.tsx`, `line-phone.tsx`, `reports.tsx` and `customers-crud.tsx`. Find them with `grep -rn "new Date()" app/demos/clinic-booking`.
- Modify: `copy.ts` (the note), `tests/e2e/clinic-booking.spec.ts` and `tests/e2e/clinic-home.spec.ts`

**Interfaces:**
- Produces:
  - `DEMO_TIME: string`
  - `clinicNow(real: Date): { now: Date; isDemo: boolean }`, pure
  - `useClinicNow(): { now: Date; isDemo: boolean }`, a client hook that re-renders on each minute and is only meaningful after hydration (all its callers already render after hydration)

**Requirements:**
1. **`clinicNow(real)`:**
   - If `toMinutes(OPEN) <= realMin < toMinutes(CLOSE) - 60`, it returns `{ now: real, isDemo: false }`.
   - Otherwise it returns `{ now: <real's calendar day at DEMO_TIME, seconds 0>, isDemo: true }`. That covers before opening, the last hour, after closing and after midnight. It is always the visitor's own today, never shifted to another day.
2. **Seed:** in `store.ts`, build the seed from `clinicNow(new Date()).now`, so today's seeded bookings show the day in progress at 10:30 when the clinic is closed. Keep the day-scoped key using the real date (it is the same calendar day).
3. **Every clinic "now" read** goes through `useClinicNow()` in components, or `clinicNow(new Date()).now` where a hook can't be used (event handlers such as confirm and pick may call `clinicNow(new Date())` directly). This covers:
   - the booking page's offered times, confirm, and the chat's reply timestamps;
   - the LINE phone status-bar time;
   - the schedule's "now" line and `displayStatus`;
   - the queue's day list, "now" and statuses;
   - the shell's waiting badge;
   - the next-opening chip on the home page;
   - the reports' "today" and customers' "next booking".
4. **`bookingDay`:** keep it, but with a demo clock it now always returns today for any `clinicNow` output, because the demo time is inside hours. The "tomorrow" branch stays for completeness. The schedule label switches to tomorrow only through `bookingDay`, so with the demo clock it always shows today.
5. **Visible note:** when `isDemo` is true, show a small, calm note.
   - Where:
     - in the clinic side's schedule header on the booking page, near the date;
     - in the admin queue header, under the date.
   - Text:
     - `ui.demoClock`: `{ th: "คลินิกปิดอยู่ตอนนี้ เดโมนี้จึงแสดงคลินิกตอน {time} น.", en: "The clinic is closed right now, so this demo shows it at {time}" }`, filled with `DEMO_TIME`.
   - Style:
     - at least 14px, AA, with a small clock icon;
     - no animation;
     - `data-testid="demo-clock-note"`.
   - It must not appear when `isDemo` is false.
6. **No hydration change:** these components already render time-dependent content only after hydration. Keep it that way; the server markup is unchanged.

- [ ] **Step 1: Unit tests first** (`tests/unit/clinic.test.ts`). Add:

```ts
describe("clinicNow", () => {
  it("uses the real time while the clinic is open for booking", () => {
    const real = new Date(2026, 9, 24, 14, 5);
    expect(clinicNow(real)).toEqual({ now: real, isDemo: false });
    expect(clinicNow(new Date(2026, 9, 24, 10, 0)).isDemo).toBe(false);
    expect(clinicNow(new Date(2026, 9, 24, 17, 59)).isDemo).toBe(false);
  });

  it("shows today at the demo time when the clinic is closed", () => {
    for (const [h, m] of [[0, 30], [8, 0], [9, 59], [18, 0], [21, 45]]) {
      const { now, isDemo } = clinicNow(new Date(2026, 9, 24, h, m));
      expect(isDemo).toBe(true);
      expect(toISODate(now)).toBe("2026-10-24");
      expect(`${now.getHours()}:${now.getMinutes()}`).toBe("10:30");
    }
    expect(DEMO_TIME).toBe("10:30");
  });

  it("gives evening visitors a day in progress and today's free times", () => {
    const { now } = clinicNow(new Date(2026, 9, 24, 21, 0));
    const data = buildClinicSeed(now);
    const statuses = new Set(data.bookings.filter((b) => b.date === "2026-10-24").map((b) => b.status));
    expect(statuses).toContain("done");
    expect(statuses).toContain("booked");
    expect(bookingDay(now)).toEqual({ date: "2026-10-24", isToday: true });
    expect(freeTimes(data, { serviceId: "s-facial", date: "2026-10-24", now }).length).toBeGreaterThan(0);
  });
});
```

  Import `clinicNow`, `DEMO_TIME` and `toISODate` as needed. Run them. Expected: FAIL.

- [ ] **Step 2: Implement** `clinicNow`, `DEMO_TIME`, `useClinicNow`, the store seed, every caller and the note.
- [ ] **Step 3: e2e.** Update the time-of-day tests in `tests/e2e/clinic-booking.spec.ts` and `tests/e2e/clinic-home.spec.ts`.
  - **At 18:30:**
    - the booking page shows `demo-clock-note`;
    - the clinic label reads today's schedule;
    - a `schedule-now` line exists;
    - blocks show done or arrived;
    - a booking lands on today;
    - the home chip says "today".
  - **At 08:00:** the same.
  - **At 10:30:** the existing tests; `demo-clock-note` has count 0.
  - **Admin queue at 21:00:** the note shows, and there are done rows.
  - Remove or rewrite the old assertions that expected tomorrow or all-booked outside hours.
- [ ] **Step 4: Visual check.** Use a production build (`pnpm build && pnpm start --port 3000`), because the dev server's Google font fetch can fail. Take shots of the booking page (desktop, Thai) and the admin queue (phone, English) with the clock pinned at 21:00, and look at the note. Save them as `.superpowers/sdd/clinic-demo-clock-{book-desk-th,queue-phone-en}.jpg`.
- [ ] **Step 5: Checks.**
  - `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/clinic-booking.spec.ts tests/e2e/clinic-home.spec.ts tests/e2e/demo-lang.spec.ts tests/e2e/smoke.spec.ts`
  - Then `--repeat-each=3` on `clinic-booking.spec.ts`.
- [ ] **Step 6: Commit.**

```
feat(clinic): when the clinic is closed, the demo runs at 10:30 today with a note, so every visitor sees the day in progress

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
