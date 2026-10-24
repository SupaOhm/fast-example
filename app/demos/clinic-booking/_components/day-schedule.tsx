"use client";

import Link from "next/link";
import { useLang } from "@/components/demo/lang";
import { toISODate } from "@/lib/dates";
import {
  BOOKING_STATUSES,
  bookingDay,
  CLOSE,
  displayStatus,
  fromMinutes,
  isLineBooking,
  OPEN,
  SLOT_STEP_MIN,
  STAFF,
  toMinutes,
  type Booking,
  type ClinicData,
} from "@/lib/demos/clinic-booking/data";
import { clinicData } from "@/lib/demos/clinic-booking/store";
import { fill, formatDate } from "@/lib/demos/format";
import { useDemoStore, useHydrated } from "@/lib/use-demo-store";
import { focusRing, STATUS_TONE } from "./admin-format";
import { statusLabel, ui } from "./copy";
import { LineGlyph } from "./line-glyph";
import { StaffPortrait } from "./staff-portrait";
import { DemoClockNote } from "./demo-clock-note";
import { clock } from "./time-format";
import { useClinicNow } from "./use-clinic-now";

const START = toMinutes(OPEN);
const SPAN = toMinutes(CLOSE) - START;
const HOURS = Array.from({ length: SPAN / 60 + 1 }, (_, i) => START + i * 60);
/** Where a minute of the day sits down the grid, as a percentage of its height. */
const at = (min: number) => `${((min - START) / SPAN) * 100}%`;
const cols = "grid grid-cols-[2.5rem_repeat(3,minmax(0,1fr))] sm:grid-cols-[3.25rem_repeat(3,minmax(0,1fr))]";

/**
 * The day the schedule shows: the day of the booking made during this visit while it exists, so a time picked at
 * 17:59 and confirmed at 18:00 still lands in view; otherwise the day the booking page offers.
 */
export function scheduleDay(data: ClinicData, newId: string | null, now: Date): { date: string; isToday: boolean } {
  const landed = newId ? data.bookings.find((b) => b.id === newId) : undefined;
  return landed ? { date: landed.date, isToday: landed.date === toISODate(now) } : bookingDay(now);
}

/**
 * The clinic's day for the booking page: one lane per staff member, time running down.
 * Phones get a taller day (2px a minute) so a 30-minute block still fits a name and a treatment, one line each.
 * `newId` is the booking made during this page visit, if any; only that one is marked and animated as new.
 */
export function DaySchedule({ newId, banner }: { newId: string | null; banner?: React.ReactNode }) {
  const lang = useLang();
  const hydrated = useHydrated();
  const [data] = useDemoStore(clinicData);
  const clinic = useClinicNow();

  const now = hydrated ? clinic.now : null;
  const day = now ? scheduleDay(data, newId, now) : null;
  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : -1;
  const showNow = Boolean(day?.isToday) && nowMin >= START && nowMin <= START + SPAN;
  const bookings = day ? data.bookings.filter((b) => b.date === day.date) : [];

  return (
    <section
      data-testid="clinic-schedule"
      aria-labelledby="schedule-day"
      className="overflow-hidden rounded-[1.75rem] border border-(--line) bg-(--paper) shadow-[0_30px_60px_-40px_rgb(107_31_58/0.45)]"
    >
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-(--line) px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h3 id="schedule-day" className="text-xl leading-[1.35] font-medium text-(--wine)">
            {day ? formatDate(day.date, lang, "full") : <span className="inline-block h-[1.35em] w-64 max-w-full rounded-md bg-(--rose)" />}
          </h3>
          {hydrated && clinic.isDemo && <DemoClockNote className="mt-1" />}
        </div>
        <Link
          href="/demos/clinic-booking/admin"
          prefetch={false}
          className={`rounded-sm font-medium text-(--wine) underline decoration-(--accent)/40 decoration-2 underline-offset-6 hover:decoration-(--accent) ${focusRing}`}
        >
          {ui.openAdmin[lang]}
        </Link>
      </header>
      {banner}

      <ul aria-label={ui.scheduleLegend[lang]} className="flex flex-wrap gap-x-5 gap-y-2 px-4 pt-4 text-[14px] leading-[1.4] text-(--muted) sm:px-6">
        {BOOKING_STATUSES.map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span aria-hidden className={`size-3.5 rounded-[4px] border-l-[3px] ${STATUS_TONE[s].block}`} />
            {statusLabel[s][lang]}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-3.5 rounded-[4px] bg-[#f8dbe1] outline-2 outline-(--accent)" />
          {ui.newFromLine[lang]}
        </li>
      </ul>

      <div className="px-2 pt-3 pb-4 sm:px-4 sm:pb-5">
        {/* Who works each lane. */}
        <div className={`${cols} pb-3`}>
          <span />
          {STAFF.map((st) => (
            <div key={st.id} data-testid="schedule-lane-head" className="flex min-w-0 flex-col gap-1.5 px-1 sm:flex-row sm:items-center sm:gap-2.5 sm:px-1.5">
              <StaffPortrait decorative staffId={st.id} sizes="40px" className="size-8 shrink-0 rounded-full sm:size-10" />
              <span className="min-w-0 leading-[1.3]">
                <span className="block truncate text-[14px] font-medium sm:text-base">{st.name[lang]}</span>
                <span className="block truncate text-[14px] text-(--muted)">{st.role[lang]}</span>
              </span>
            </div>
          ))}
        </div>

        <div className={`${cols} relative h-[1080px] sm:h-[756px]`}>
          {/* Hour ticks: decorative, so they may run at 12px. */}
          <div aria-hidden className="relative">
            {HOURS.map((m) => (
              <span
                key={m}
                className="absolute right-1 -translate-y-1/2 text-[12px] leading-none text-(--muted) tabular-nums sm:right-2.5"
                style={{ top: at(m) }}
              >
                {fromMinutes(m)}
              </span>
            ))}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 left-[2.5rem] sm:left-[3.25rem]">
            {HOURS.map((m) => (
              <span key={m} className="absolute inset-x-0 border-t border-(--line)" style={{ top: at(m) }} />
            ))}
            {HOURS.slice(0, -1).map((m) => (
              <span key={m} className="absolute inset-x-0 border-t border-dashed border-(--line)/60" style={{ top: at(m + SLOT_STEP_MIN) }} />
            ))}
            {showNow && <span className="absolute inset-x-0 top-0 bg-(--rose)/70" style={{ height: at(nowMin) }} />}
          </div>

          {STAFF.map((st) => (
            <ul key={st.id} aria-label={st.name[lang]} className="relative border-l border-(--line)">
              {bookings
                .filter((b) => b.staffId === st.id)
                .map((b) => (
                  <Block key={b.id} booking={b} data={data} now={now!} isNew={b.id === newId} />
                ))}
            </ul>
          ))}

          {showNow && (
            <div
              data-testid="schedule-now"
              className="pointer-events-none absolute right-0 left-[2rem] z-20 h-0.5 -translate-y-1/2 bg-(--accent) sm:left-[2.75rem]"
              style={{ top: at(nowMin) }}
            >
              <span aria-hidden className="absolute top-1/2 left-0 size-2.5 -translate-y-1/2 rounded-full bg-(--accent)" />
              <span className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full bg-(--accent) px-2.5 py-0.5 text-[14px] leading-[1.4] font-medium whitespace-nowrap text-white shadow-[0_4px_12px_-4px_rgb(194_24_91/0.6)]">
                {fill(ui.nowAt[lang], { time: clock(now!) })}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Block({
  booking: b,
  data,
  now,
  isNew,
}: {
  booking: Booking;
  data: ClinicData;
  now: Date;
  isNew: boolean;
}) {
  const lang = useLang();
  const service = data.services.find((s) => s.id === b.serviceId);
  const start = toMinutes(b.time);
  const duration = service?.durationMin ?? SLOT_STEP_MIN;
  const status = displayStatus(b, duration, now);
  const customer = data.customers.find((c) => c.id === b.customerId)?.name ?? "";
  const range = fill(ui.timeRange[lang], { start: b.time, end: fromMinutes(start + duration) });
  return (
    <li
      data-testid="schedule-block"
      data-booking-id={b.id}
      data-staff={b.staffId}
      data-time={b.time}
      data-status={status}
      data-new={isNew ? "true" : undefined}
      className={`absolute inset-x-0.5 overflow-hidden rounded-lg border-l-[3px] px-1 py-0.5 text-[14px] leading-[1.3] sm:inset-x-1.5 sm:px-2 ${
        STATUS_TONE[status].block
      } ${
        isNew
          ? "z-10 outline-2 outline-offset-1 outline-(--accent) motion-safe:animate-[lumi-land_.65s_cubic-bezier(.2,.8,.2,1)_both,lumi-glow_1.1s_ease-out_.55s_3]"
          : ""
      }`}
      style={{ top: `calc(${at(start)} + 1px)`, height: `calc(${(duration / SPAN) * 100}% - 2px)` }}
    >
      <span className="sr-only">
        {range}, {statusLabel[status][lang]}
        {isNew ? `, ${ui.newFromLine[lang]}` : isLineBooking(b) ? `, ${ui.bookedOnLine[lang]}` : ""},{" "}
      </span>
      <span className="flex items-center gap-1">
        <span className="min-w-0 truncate font-medium">{customer}</span>
        {isLineBooking(b) && (
          <LineGlyph className={`hidden size-3.5 shrink-0 sm:block ${isNew ? "text-(--line-green-ink)" : "opacity-70"}`} />
        )}
      </span>
      <span className="block truncate">{service?.name[lang]}</span>
      {duration >= 45 && (
        <span aria-hidden className="hidden truncate tabular-nums sm:block">
          {range}
        </span>
      )}
    </li>
  );
}
