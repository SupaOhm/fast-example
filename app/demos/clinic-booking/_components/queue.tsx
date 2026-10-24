"use client";

import { CalendarPlus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { useLang } from "@/components/demo/lang";
import { nextDays } from "@/lib/dates";
import {
  BOOKING_STATUSES,
  CLOSE,
  displayStatus,
  fromMinutes,
  isLineBooking,
  OPEN,
  setBookingStatus,
  STAFF,
  toMinutes,
  type Booking,
  type BookingStatus,
  type Service,
  type Staff,
} from "@/lib/demos/clinic-booking/data";
import { clinicData, clinicLastBooking } from "@/lib/demos/clinic-booking/store";
import { fill, formatDate, formatTHB } from "@/lib/demos/format";
import type { Lang } from "@/lib/demos/lang";
import { useDemoStore } from "@/lib/use-demo-store";
import { focusRing, formatPhone, shortName, STATUS_TONE } from "./admin-format";
import { BookingMotion } from "./booking-motion";
import { countText, statusLabel, ui } from "./copy";
import { LineGlyph } from "./line-glyph";
import { StaffPortrait } from "./staff-portrait";
import { DemoClockNote } from "./demo-clock-note";
import { clock } from "./time-format";
import { useClinicNow } from "./use-clinic-now";

const DAY_START = toMinutes(OPEN);
const DAY_END = toMinutes(CLOSE);
const DAY_SPAN = DAY_END - DAY_START;
const HOURS = Array.from({ length: DAY_SPAN / 60 + 1 }, (_, i) => DAY_START + i * 60);
const STAFF_ORDER = new Map(STAFF.map((s, i) => [s.id, i]));
const BOOK = "/demos/clinic-booking/book";

interface Row {
  booking: Booking;
  /** What the booking shows now: the stored status moved on by the clock (see `displayStatus`). */
  status: BookingStatus;
  start: number;
  end: number;
  customer: { name: string; phone: string };
  service: Pick<Service, "name" | "durationMin" | "price">;
  staff?: Staff;
}

const priceText = (price: number, lang: Lang) => (price === 0 ? ui.free[lang] : formatTHB(price));

export function Queue() {
  const lang = useLang();
  const [data, setData] = useDemoStore(clinicData);
  const [lastId] = useDemoStore(clinicLastBooking);
  // The queue renders only after hydration (RequireSession), so this is the clinic's clock in the browser.
  const { now, isDemo } = useClinicNow();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  // The seven days shown, and the one to open on: the day of the booking just made on LINE, if it is one of them.
  const [{ days, firstIndex }] = useState(() => {
    const list = nextDays(now, 7);
    const justBooked = data.bookings.find((b) => b.id === lastId);
    const i = justBooked ? list.indexOf(justBooked.date) : -1;
    return { days: list, firstIndex: Math.max(i, 0) };
  });
  const [index, setIndex] = useState(firstIndex);
  const date = days[index];
  const isToday = index === 0;

  const customers = new Map(data.customers.map((c) => [c.id, c]));
  const services = new Map(data.services.map((s) => [s.id, s]));
  const staffById = new Map(STAFF.map((s) => [s.id, s]));

  const perDay = new Map<string, number>();
  for (const b of data.bookings) perDay.set(b.date, (perDay.get(b.date) ?? 0) + 1);
  const lastDate = data.bookings.find((b) => b.id === lastId)?.date;

  const rows: Row[] = data.bookings
    .filter((b) => b.date === date)
    .sort((a, b) => a.time.localeCompare(b.time) || (STAFF_ORDER.get(a.staffId) ?? 0) - (STAFF_ORDER.get(b.staffId) ?? 0))
    .map((b) => {
      const service = services.get(b.serviceId) ?? { name: ui.deletedService, durationMin: 30, price: 0 };
      const start = toMinutes(b.time);
      return {
        booking: b,
        status: displayStatus(b, service.durationMin, now),
        start,
        end: start + service.durationMin,
        customer: customers.get(b.customerId) ?? { name: ui.deletedCustomer[lang], phone: "" },
        service,
        staff: staffById.get(b.staffId),
      };
    });

  const counts = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0])) as Record<BookingStatus, number>;
  for (const r of rows) counts[r.status]++;
  const expected = rows.filter((r) => r.status !== "no-show").reduce((sum, r) => sum + r.service.price, 0);

  const showNow = isToday && nowMin >= DAY_START && nowMin <= DAY_END;
  const nowIndex = showNow ? rows.findIndex((r) => r.start >= nowMin) : -1;

  // Bring the visitor's booking into view once, when the queue first opens on its day.
  const highlightRef = useRef<HTMLLIElement>(null);
  const scrolled = useRef(false);
  useEffect(() => {
    if (scrolled.current || !highlightRef.current) return;
    scrolled.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    highlightRef.current.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, []);

  function changeStatus(id: string, status: BookingStatus) {
    setData((d) => setBookingStatus(d, id, status));
  }

  const title =
    index === 0
      ? ui.queueToday[lang]
      : index === 1
        ? ui.queueTomorrow[lang]
        : fill(ui.queueWeekday[lang], { day: formatDate(date, lang, "weekdayLong") });

  return (
    <div>
      <BookingMotion />
      <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] leading-[1.25] font-medium text-(--wine) sm:text-[2.25rem]">{title}</h1>
          <p className="mt-1.5 text-(--muted)">{formatDate(date, lang, "full")}</p>
          {isDemo && <DemoClockNote className="mt-1" />}
        </div>
        <dl className="flex gap-8 sm:gap-10">
          <div>
            <dt className="text-[14px] leading-[1.4] text-(--muted)">{ui.bookingsLabel[lang]}</dt>
            <dd className="text-2xl leading-[1.3] font-medium tabular-nums">{rows.length}</dd>
          </div>
          <div>
            <dt className="text-[14px] leading-[1.4] text-(--muted)">{ui.expectedTakings[lang]}</dt>
            <dd className="text-2xl leading-[1.3] font-medium tabular-nums">{formatTHB(expected)}</dd>
          </div>
        </dl>
      </header>

      {/* Day chips */}
      <div role="group" aria-label={ui.daysLabel[lang]} className="mt-6 grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((d, i) => {
          const selected = i === index;
          const n = perDay.get(d) ?? 0;
          // Phones have about 45px a chip: Thai calendars' one-letter weekdays fit, and English keeps "Mon".
          const short = i === 0 ? ui.chipToday[lang] : formatDate(d, lang, lang === "th" ? "weekdayNarrow" : "weekday");
          const long = i === 0 ? ui.chipToday[lang] : formatDate(d, lang, "weekday");
          return (
            <button
              key={d}
              type="button"
              data-testid={`queue-date-${i}`}
              aria-pressed={selected}
              aria-label={fill(ui.chipLabel[lang], { date: formatDate(d, lang, "full"), count: countText(n, lang) })}
              onClick={() => setIndex(i)}
              className={`flex min-w-0 flex-col items-center rounded-2xl border px-0.5 pt-2 pb-2 leading-[1.3] transition-colors sm:px-2 sm:py-2.5 ${focusRing} ${
                selected ? "border-(--wine) bg-(--wine) text-white" : "border-(--line) bg-(--paper) text-(--ink) hover:border-(--accent)/50"
              }`}
            >
              <span className={`max-w-full text-[14px] whitespace-nowrap ${selected ? "text-white/85" : "text-(--muted)"}`}>
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{long}</span>
              </span>
              <span className="text-lg font-medium tabular-nums sm:text-base">
                <span className="sm:hidden">{formatDate(d, lang, "day")}</span>
                <span className="hidden sm:inline">{formatDate(d, lang, "dayMonth")}</span>
              </span>
              <span className={`flex items-center gap-1 text-[14px] tabular-nums ${selected ? "text-white/85" : "text-(--muted)"}`}>
                {d === lastDate && <span aria-hidden className={`size-1.5 rounded-full ${selected ? "bg-white" : "bg-(--accent)"}`} />}
                <span className="sm:hidden">{n}</span>
                <span className="hidden sm:inline">{countText(n, lang)}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Status summary */}
      <section aria-label={ui.statusSummary[lang]} className="mt-5 overflow-hidden rounded-[1.25rem] border border-(--line) bg-(--paper)">
        <div aria-hidden className="flex h-1.5 gap-0.5">
          {rows.length === 0 ? (
            <span className="flex-1 bg-(--rose-2)" />
          ) : (
            BOOKING_STATUSES.filter((s) => counts[s] > 0).map((s) => (
              <span key={s} className={STATUS_TONE[s].dot} style={{ flexGrow: counts[s] }} />
            ))
          )}
        </div>
        <dl className="grid grid-cols-4 divide-x divide-(--line)">
          {BOOKING_STATUSES.map((s) => (
            <div key={s} className="flex flex-col px-2 py-3 sm:px-5 sm:py-4">
              <dt className="flex items-center gap-1.5 text-[14px] leading-[1.3] text-(--muted) sm:text-base">
                <span aria-hidden className={`hidden size-2 shrink-0 rounded-full sm:block ${STATUS_TONE[s].dot}`} />
                {statusLabel[s][lang]}
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-2xl leading-[1.2] font-medium tabular-nums sm:text-[1.75rem]">
                <span aria-hidden className={`size-2 shrink-0 rounded-full sm:hidden ${STATUS_TONE[s].dot}`} />
                {counts[s]}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {rows.length > 0 && <StaffTimeline rows={rows} now={showNow ? now : null} highlightId={lastId} />}

      {/* Queue list: the accessible version of the day. */}
      <section aria-labelledby="queue-list-title" className="mt-6">
        <h2 id="queue-list-title" className="sr-only">
          {ui.queueListTitle[lang]}
        </h2>
        {rows.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-(--wine)/25 bg-(--paper) px-6 py-12 text-center">
            <CalendarPlus className="mx-auto size-8 text-(--accent)" aria-hidden />
            <p className="mt-3 text-lg leading-[1.4] font-medium text-(--wine)">{ui.queueEmptyTitle[lang]}</p>
            <p className="mx-auto mt-1.5 max-w-md leading-[1.6] text-(--muted)">{ui.queueEmptyBody[lang]}</p>
            <Link
              href={BOOK}
              className={`mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-(--wine) px-5 font-medium text-white transition-colors hover:bg-[#561830] ${focusRing}`}
            >
              <LineGlyph className="size-4.5 text-(--line-green)" />
              {ui.queueEmptyCta[lang]}
            </Link>
          </div>
        ) : (
          <ol className="rounded-[1.75rem] border border-(--line) bg-(--paper) p-1.5 sm:p-2">
            {rows.map((r, i) => {
              const highlight = r.booking.id === lastId;
              return (
                <Fragment key={r.booking.id}>
                  {i === nowIndex && <NowLine now={now} />}
                  <QueueRow row={r} highlight={highlight} ref={highlight ? highlightRef : undefined} onStatus={changeStatus} />
                </Fragment>
              );
            })}
            {showNow && nowIndex === -1 && <NowLine now={now} />}
          </ol>
        )}
      </section>
    </div>
  );
}

function NowLine({ now }: { now: Date }) {
  const lang = useLang();
  return (
    <li className="flex items-center gap-2 px-3 py-1.5 sm:px-4">
      <span className="rounded-full bg-(--accent) px-2.5 py-0.5 text-[14px] leading-[1.4] font-medium whitespace-nowrap text-white tabular-nums">
        {fill(ui.nowAt[lang], { time: clock(now) })}
      </span>
      <span aria-hidden className="h-0.5 flex-1 rounded-full bg-(--accent)" />
    </li>
  );
}

function QueueRow({
  row,
  highlight,
  ref,
  onStatus,
}: {
  row: Row;
  highlight: boolean;
  ref?: React.Ref<HTMLLIElement>;
  onStatus: (id: string, s: BookingStatus) => void;
}) {
  const lang = useLang();
  const { booking: b, status, customer, service, staff } = row;
  const tone = STATUS_TONE[status];
  const past = status === "done" || status === "no-show";
  return (
    <li
      ref={ref}
      data-testid="queue-row"
      data-booking-id={b.id}
      data-status={status}
      data-highlight={highlight ? "true" : undefined}
      className={`relative grid scroll-mt-40 grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 px-4 py-4 [grid-template-areas:'time_status'_'who_who'_'what_what'_'staff_staff'] sm:px-5 xl:grid-cols-[5.5rem_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,0.95fr)_9.5rem] xl:items-center xl:gap-x-5 xl:[grid-template-areas:'time_who_what_staff_status'] ${
        highlight
          ? "z-10 my-1 rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgb(107_31_58/0.55)] outline-2 outline-(--accent) motion-safe:animate-[lumi-glow_1.1s_ease-out_.5s_3] [&+li]:border-t-0"
          : "border-t border-(--line) first:border-t-0"
      }`}
    >
      <span aria-hidden className={`absolute inset-y-4 left-0 w-1 rounded-r-full ${tone.dot}`} />

      <div className="flex items-baseline gap-2.5 [grid-area:time] xl:block">
        <p className={`text-[1.6rem] leading-[1.15] font-medium tabular-nums xl:text-[1.75rem] ${past ? "text-(--muted)" : "text-(--wine)"}`}>
          {b.time}
        </p>
        <p className="text-[14px] leading-[1.4] text-(--muted) tabular-nums">{fill(ui.until[lang], { time: fromMinutes(row.end) })}</p>
      </div>

      <div className="min-w-0 leading-[1.4] [grid-area:who]">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[17px] font-medium">{customer.name}</span>
          {highlight ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-(--accent) py-0.5 pr-2.5 pl-2 text-[14px] leading-[1.4] font-medium text-white">
              <LineGlyph className="size-3.5" />
              {ui.justBooked[lang]}
            </span>
          ) : (
            isLineBooking(b) && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3f7ea] py-0.5 pr-2.5 pl-2 text-[14px] leading-[1.4] text-(--line-green-ink)">
                <LineGlyph className="size-3.5" />
                {ui.lineBadge[lang]}
              </span>
            )
          )}
        </p>
        {customer.phone ? (
          <p className="text-(--muted) tabular-nums">{formatPhone(customer.phone)}</p>
        ) : (
          <p className="flex items-center gap-1.5 text-(--line-green-ink)">
            <LineGlyph className="size-4 shrink-0" />
            {ui.viaLine[lang]}
          </p>
        )}
      </div>

      <div className="min-w-0 leading-[1.4] [grid-area:what]">
        <p>{service.name[lang]}</p>
        <p className="text-(--muted)">
          <span className="tabular-nums">{fill(ui.minutes[lang], { n: String(service.durationMin) })}</span>
          <span aria-hidden className="mx-2 text-(--line)">|</span>
          <span className="tabular-nums">{priceText(service.price, lang)}</span>
        </p>
      </div>

      <div className="mt-1 flex min-w-0 items-center gap-2.5 leading-[1.3] [grid-area:staff] xl:mt-0">
        {staff && <StaffPortrait decorative staffId={staff.id} sizes="36px" className="size-8 shrink-0 rounded-full xl:size-9" />}
        <span className="min-w-0">
          <span className="block truncate">{staff?.name[lang] ?? "-"}</span>
          <span className="hidden truncate text-[14px] text-(--muted) xl:block">{staff?.role[lang]}</span>
        </span>
      </div>

      <div className="relative self-start [grid-area:status] xl:self-center">
        <select
          data-testid="queue-status"
          aria-label={fill(ui.queueStatusLabel[lang], { name: customer.name, time: b.time })}
          value={status}
          onChange={(e) => onStatus(b.id, e.target.value as BookingStatus)}
          className={`w-[8.5rem] cursor-pointer appearance-none rounded-full py-2 pr-9 pl-4 text-base leading-[1.3] font-medium xl:w-full ${tone.pill} ${focusRing}`}
        >
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s][lang]}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-70" />
      </div>
    </li>
  );
}

// The day per staff member at a glance, like the booking page's schedule turned on its side.
// Decorative: the list below holds the same bookings for screen readers and keyboards.
function StaffTimeline({ rows, now, highlightId }: { rows: Row[]; now: Date | null; highlightId: string | null }) {
  const lang = useLang();
  const pct = (m: number) => `${((m - DAY_START) / DAY_SPAN) * 100}%`;
  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : null;
  return (
    <section aria-hidden className="mt-6 hidden overflow-hidden rounded-[1.75rem] border border-(--line) bg-(--paper) md:block">
      <div className="flex items-center justify-between gap-4 border-b border-(--line) px-6 py-3.5">
        <h2 className="text-lg leading-[1.35] font-medium text-(--wine)">{ui.timelineTitle[lang]}</h2>
        {now ? (
          <span className="rounded-full bg-(--accent) px-2.5 py-0.5 text-[14px] leading-[1.4] font-medium text-white tabular-nums">
            {fill(ui.nowAt[lang], { time: clock(now) })}
          </span>
        ) : (
          <span className="text-[14px] text-(--muted)">{fill(ui.hours[lang], { open: OPEN, close: CLOSE })}</span>
        )}
      </div>
      <div className="grid grid-cols-[9.5rem_minmax(0,1fr)] gap-x-4 px-6 pt-3 pb-5">
        <div />
        {/* Hour ticks: decorative, so they may run at 12px. */}
        <div className="relative h-6">
          {HOURS.map((m) => (
            <span
              key={m}
              className="absolute top-0 -translate-x-1/2 text-[12px] text-(--muted) tabular-nums first:translate-x-0 last:-translate-x-full"
              style={{ left: pct(m) }}
            >
              {fromMinutes(m)}
            </span>
          ))}
        </div>
        {STAFF.map((st) => {
          const lane = rows.filter((r) => r.booking.staffId === st.id);
          return (
            <Fragment key={st.id}>
              <div className="flex min-w-0 items-center gap-3 border-t border-(--line) py-2.5 leading-[1.3]">
                <StaffPortrait decorative staffId={st.id} sizes="40px" className="size-10 shrink-0 rounded-full" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{st.name[lang]}</span>
                  <span className="block truncate text-[14px] text-(--muted)">{countText(lane.length, lang)}</span>
                </span>
              </div>
              <div className="relative h-16 border-t border-(--line)">
                {nowMin !== null && <span className="absolute inset-y-0 left-0 bg-(--rose)/70" style={{ width: pct(nowMin) }} />}
                {HOURS.map((m) => (
                  <span key={m} className="absolute inset-y-0 w-px bg-(--line)/70" style={{ left: pct(m) }} />
                ))}
                {lane.map((r) => {
                  const mine = r.booking.id === highlightId;
                  const short = r.end - r.start < 45;
                  return (
                    <div
                      key={r.booking.id}
                      className={`absolute inset-y-1.5 overflow-hidden rounded-lg border-l-[3px] py-1 text-[14px] leading-[1.3] ${short ? "px-1.5" : "px-2"} ${
                        STATUS_TONE[r.status].block
                      } ${mine ? "z-10 outline-2 outline-offset-1 outline-(--accent)" : ""}`}
                      style={{ left: `calc(${pct(r.start)} + 2px)`, width: `calc(${pct(DAY_START + r.end - r.start)} - 4px)` }}
                    >
                      <p className="flex items-center gap-1">
                        <span className="min-w-0 truncate font-medium">{shortName(r.customer.name)}</span>
                        {isLineBooking(r.booking) && !short && (
                          <LineGlyph className={`size-3.5 shrink-0 ${mine ? "text-(--line-green-ink)" : "opacity-70"}`} />
                        )}
                      </p>
                      {!short && <p className="truncate">{r.service.name[lang]}</p>}
                    </div>
                  );
                })}
                {nowMin !== null && (
                  <span className="absolute -inset-y-px z-20 w-0.5 -translate-x-1/2 bg-(--accent)" style={{ left: pct(nowMin) }} />
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

