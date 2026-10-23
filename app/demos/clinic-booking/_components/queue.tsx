"use client";

import { CalendarX2, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";
import { nextDays, parseISODate } from "@/lib/dates";
import {
  BOOKING_STATUSES,
  CLOSE,
  isLineBooking,
  OPEN,
  setBookingStatus,
  STAFF,
  toMinutes,
  fromMinutes,
  type Booking,
  type BookingStatus,
} from "@/lib/demos/clinic-booking/data";
import { clinicData } from "@/lib/demos/clinic-booking/store";
import type { L } from "@/lib/demos/lang";
import { formatTHB } from "@/lib/packages";
import { useDemoStore } from "@/lib/use-demo-store";
import {
  focusRing,
  formatPhone,
  monogramOf,
  shortName,
  STATUS_LABEL,
  STATUS_TONE,
  thDayMonth,
  thLongDate,
  weekdayShort,
} from "./admin-format";

const DAY_START = toMinutes(OPEN);
const DAY_END = toMinutes(CLOSE);
const DAY_SPAN = DAY_END - DAY_START;
const HOURS = Array.from({ length: DAY_SPAN / 60 + 1 }, (_, i) => DAY_START / 60 + i);
const STAFF_ORDER = new Map(STAFF.map((s, i) => [s.id, i]));

// Seeded bookings have ids b-1, b-2…; anything else came in through the LINE booking page.
const fromLine = isLineBooking;

interface Row {
  booking: Booking;
  start: number;
  end: number;
  customer: { name: string; phone: string };
  service: { name: L; durationMin: number; price: number };
  staff: { name: L; role: L };
}

export function Queue() {
  const [data, setData] = useDemoStore(clinicData);
  // Queue renders only after hydration (RequireSession), so this is the browser's "now".
  const [clock] = useState(() => {
    const d = new Date();
    return { days: nextDays(d, 7), now: d.getHours() * 60 + d.getMinutes() };
  });
  const [index, setIndex] = useState(0);
  const date = clock.days[index];

  const customers = new Map(data.customers.map((c) => [c.id, c]));
  const services = new Map(data.services.map((s) => [s.id, s]));
  const staffById = new Map(STAFF.map((s) => [s.id, s]));

  const perDay = new Map<string, number>();
  for (const b of data.bookings) perDay.set(b.date, (perDay.get(b.date) ?? 0) + 1);

  const rows: Row[] = data.bookings
    .filter((b) => b.date === date)
    .sort((a, b) => a.time.localeCompare(b.time) || (STAFF_ORDER.get(a.staffId) ?? 0) - (STAFF_ORDER.get(b.staffId) ?? 0))
    .map((b) => {
      const service = services.get(b.serviceId) ?? { name: { th: "บริการที่ถูกลบ", en: "Deleted treatment" }, durationMin: 30, price: 0 };
      const start = toMinutes(b.time);
      return {
        booking: b,
        start,
        end: start + service.durationMin,
        customer: customers.get(b.customerId) ?? { name: "ลูกค้าที่ถูกลบ", phone: "" },
        service,
        staff: staffById.get(b.staffId) ?? { name: { th: "-", en: "-" }, role: { th: "", en: "" } },
      };
    });

  const counts = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0])) as Record<BookingStatus, number>;
  for (const r of rows) counts[r.booking.status]++;
  const expected = rows.filter((r) => r.booking.status !== "no-show").reduce((sum, r) => sum + r.service.price, 0);

  const isToday = index === 0;
  const showNow = isToday && clock.now >= DAY_START && clock.now <= DAY_END;
  const nowIndex = showNow ? rows.findIndex((r) => r.start >= clock.now) : -1;

  function changeStatus(id: string, status: BookingStatus) {
    setData((d) => setBookingStatus(d, id, status));
  }

  const title = index === 0 ? "คิววันนี้" : index === 1 ? "คิวพรุ่งนี้" : `คิว${parseISODate(date).toLocaleDateString("th-TH", { weekday: "long" })}`;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="text-[1.75rem] leading-[1.25] font-normal sm:text-[2rem]">{title}</h1>
          <p className="mt-1 text-[15px] text-(--muted)">{thLongDate(date)}</p>
        </div>
        <div className="flex items-baseline gap-5 text-sm text-(--muted)">
          <p>
            <span className="text-xl text-(--ink) tabular-nums">{rows.length}</span> คิว
          </p>
          <p>
            ยอดที่คาดว่าจะได้ <span className="text-xl text-(--ink) tabular-nums">{formatTHB(expected)}</span>
          </p>
        </div>
      </header>

      {/* Date chips */}
      <div role="group" aria-label="เลือกวัน" className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {clock.days.map((d, i) => {
          const selected = i === index;
          const n = perDay.get(d) ?? 0;
          return (
            <button
              key={d}
              type="button"
              data-testid={`queue-date-${i}`}
              aria-pressed={selected}
              aria-label={`${thLongDate(d)} ${n} คิว`}
              onClick={() => setIndex(i)}
              className={`flex flex-col items-center rounded-2xl border px-1 pt-1.5 pb-2 leading-[1.25] sm:flex-row sm:items-baseline sm:justify-center sm:gap-2 sm:px-3 sm:py-2.5 ${focusRing} ${
                selected
                  ? "border-(--rose-deep) bg-(--rose-deep) text-white"
                  : "border-(--line) bg-white text-(--ink) hover:border-(--rose)"
              }`}
            >
              <span className={`text-xs ${selected ? "text-white/85" : "text-(--muted)"}`}>
                {i === 0 ? "วันนี้" : weekdayShort(d)}
              </span>
              <span className="text-lg tabular-nums sm:text-base">
                <span className="sm:hidden">{parseISODate(d).getDate()}</span>
                <span className="hidden sm:inline">{thDayMonth(d)}</span>
              </span>
              <span className={`text-[11px] tabular-nums sm:text-xs ${selected ? "text-white/85" : "text-(--muted)"}`}>
                {n}
                <span className="hidden sm:inline"> คิว</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Status summary */}
      <section aria-label="สรุปสถานะคิว" className="mt-5 overflow-hidden rounded-2xl border border-(--line) bg-white">
        <div aria-hidden className="flex h-1.5 gap-0.5 bg-white">
          {rows.length === 0 ? (
            <span className="flex-1 bg-(--blush-2)" />
          ) : (
            BOOKING_STATUSES.filter((s) => counts[s] > 0).map((s) => (
              <span key={s} className={STATUS_TONE[s].dot} style={{ flexGrow: counts[s] }} />
            ))
          )}
        </div>
        <dl className="grid grid-cols-4 divide-x divide-(--line)">
          {BOOKING_STATUSES.map((s) => (
            <div key={s} className="flex flex-col-reverse px-2.5 py-3 sm:flex-col sm:px-5 sm:py-4">
              <dt className="flex items-center gap-1.5 text-xs leading-[1.3] whitespace-nowrap text-(--muted) sm:text-sm">
                <span aria-hidden className={`hidden size-2 shrink-0 rounded-full sm:block ${STATUS_TONE[s].dot}`} />
                {STATUS_LABEL[s]}
              </dt>
              <dd className="flex items-center gap-1.5 text-2xl leading-[1.2] tabular-nums sm:mt-1 sm:text-[1.75rem]">
                <span aria-hidden className={`size-2 shrink-0 rounded-full sm:hidden ${STATUS_TONE[s].dot}`} />
                {counts[s]}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {rows.length > 0 && <StaffTimeline rows={rows} now={showNow ? clock.now : null} />}

      {/* Queue list */}
      <section aria-labelledby="queue-list-title" className="mt-6">
        <h2 id="queue-list-title" className="sr-only">
          รายการคิวเรียงตามเวลา
        </h2>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--line) bg-white/60 px-6 py-12 text-center">
            <CalendarX2 className="mx-auto size-8 text-(--rose)" aria-hidden />
            <p className="mt-3 text-lg leading-[1.4]">ยังไม่มีคิวในวันนี้</p>
            <p className="mx-auto mt-1 max-w-sm text-[15px] leading-[1.6] text-(--muted)">
              คิวที่จองผ่าน LINE จะขึ้นที่นี่ทันที ลองจองคิวเองแล้วกลับมาดูได้
            </p>
            <Link
              href="/demos/clinic-booking/book"
              target="_blank"
              rel="noopener"
              className={`mt-5 inline-flex items-center gap-2 rounded-full border border-(--rose-deep)/40 px-4 py-2 text-[15px] text-(--rose-deep) hover:bg-white ${focusRing}`}
            >
              <ExternalLink className="size-4" aria-hidden />
              เปิดหน้าจองคิว
            </Link>
          </div>
        ) : (
          <ol className="overflow-hidden rounded-2xl border border-(--line) bg-white">
            {rows.map((r, i) => (
              <Fragment key={r.booking.id}>
                {i === nowIndex && <NowLine now={clock.now} />}
                <QueueRow row={r} onStatus={changeStatus} />
              </Fragment>
            ))}
            {showNow && nowIndex === -1 && <NowLine now={clock.now} />}
          </ol>
        )}
      </section>
    </div>
  );
}

function NowLine({ now }: { now: number }) {
  return (
    <li aria-label={`ตอนนี้ ${fromMinutes(now)} น.`} className="relative flex items-center gap-2 px-4 py-1 sm:px-5">
      <span className="rounded-full bg-(--rose-deep) px-2 py-0.5 text-xs leading-[1.3] text-white tabular-nums">
        ตอนนี้ {fromMinutes(now)}
      </span>
      <span aria-hidden className="h-px flex-1 bg-(--rose-deep)" />
    </li>
  );
}

function QueueRow({ row, onStatus }: { row: Row; onStatus: (id: string, s: BookingStatus) => void }) {
  const { booking: b, customer, service, staff } = row;
  const tone = STATUS_TONE[b.status];
  const past = b.status === "done" || b.status === "no-show";
  return (
    <li
      data-testid="queue-row"
      data-status={b.status}
      className="relative grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 border-t border-(--line) px-4 py-4 first:border-t-0 sm:grid-cols-[5.5rem_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_10.5rem] sm:items-center sm:gap-x-5 sm:px-5"
    >
      <span aria-hidden className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${tone.dot}`} />
      <div className="row-span-3 leading-[1.2] sm:row-span-1">
        <p className={`text-[1.6rem] font-light tabular-nums sm:text-[1.9rem] ${past ? "text-(--muted)" : "text-(--ink)"}`}>
          {b.time}
        </p>
        <p className="mt-0.5 text-xs text-(--muted) tabular-nums">ถึง {fromMinutes(row.end)}</p>
      </div>

      <div className="min-w-0 leading-[1.35]">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-[17px]">{customer.name}</span>
          {fromLine(b) && (
            <span className="rounded-full bg-[#e3f7ea] px-2 py-0.5 text-[11px] leading-[1.3] text-(--line-green-ink)">
              จองผ่าน LINE
            </span>
          )}
        </p>
        <p className="mt-0.5 text-sm text-(--muted) tabular-nums">{formatPhone(customer.phone)}</p>
      </div>

      <div className="mt-2 min-w-0 leading-[1.35] sm:mt-0">
        <p className="truncate text-[15px]">{service.name.th}</p>
        <p className="text-sm text-(--muted)">
          {service.durationMin} นาที{service.price > 0 ? ` ${formatTHB(service.price)}` : " ไม่มีค่าใช้จ่าย"}
        </p>
      </div>

      <div className="col-start-2 mt-2 flex min-w-0 items-center justify-between gap-3 sm:col-start-auto sm:mt-0 sm:contents">
        <p className="flex min-w-0 items-center gap-2 leading-[1.35]">
          <span
            aria-hidden
            className="hidden size-8 shrink-0 place-items-center rounded-full bg-(--blush-2) text-[13px] text-(--rose-deep) sm:grid"
          >
            {monogramOf(staff.name.th)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm sm:text-[15px]">{staff.name.th}</span>
            <span className="hidden truncate text-xs text-(--muted) sm:block">{staff.role.th}</span>
          </span>
        </p>
        <div className="relative shrink-0">
          <select
            data-testid="queue-status"
            aria-label={`สถานะคิว ${customer.name} เวลา ${b.time}`}
            value={b.status}
            onChange={(e) => onStatus(b.id, e.target.value as BookingStatus)}
            className={`w-[7.75rem] cursor-pointer appearance-none rounded-full py-2 pr-8 pl-3.5 text-sm leading-[1.3] sm:w-full ${tone.pill} ${focusRing}`}
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-70" />
        </div>
      </div>
    </li>
  );
}

// A visual day plan per staff member (the list below is the accessible version).
function StaffTimeline({ rows, now }: { rows: Row[]; now: number | null }) {
  const pct = (m: number) => `${((m - DAY_START) / DAY_SPAN) * 100}%`;
  return (
    <section aria-hidden className="mt-6 hidden rounded-2xl border border-(--line) bg-white px-5 pt-4 pb-5 md:block">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base leading-[1.3] font-medium">ตารางผู้ดูแล</h2>
        <p className="text-xs text-(--muted)">
          เปิด {OPEN}–{CLOSE} น.
        </p>
      </div>
      <div className="mt-3 grid grid-cols-[9.5rem_minmax(0,1fr)] gap-x-4">
        <div />
        <div className="relative h-5">
          {HOURS.map((h) => (
            <span
              key={h}
              className="absolute -translate-x-1/2 text-[11px] text-(--muted) tabular-nums first:translate-x-0 last:-translate-x-full"
              style={{ left: pct(h * 60) }}
            >
              {String(h).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        {STAFF.map((st) => {
          const lane = rows.filter((r) => r.booking.staffId === st.id);
          return (
            <Fragment key={st.id}>
              <div className="flex items-center gap-2.5 border-t border-(--line) py-2.5 leading-[1.3]">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--blush-2) text-[13px] text-(--rose-deep)">
                  {monogramOf(st.name.th)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm">{st.name.th}</span>
                  <span className="block text-xs text-(--muted)">{lane.length} คิว</span>
                </span>
              </div>
              <div className="relative border-t border-(--line)">
                {HOURS.map((h) => (
                  <span key={h} className="absolute inset-y-0 w-px bg-(--line)/70" style={{ left: pct(h * 60) }} />
                ))}
                {lane.map((r) => (
                  <div
                    key={r.booking.id}
                    title={`${r.booking.time} ${r.customer.name} ${r.service.name.th}`}
                    className={`absolute inset-y-1.5 overflow-hidden rounded-lg border-l-[3px] py-1 leading-[1.25] ${r.end - r.start < 45 ? "px-1.5" : "px-2"} ${STATUS_TONE[r.booking.status].block}`}
                    style={{ left: `calc(${pct(r.start)} + 2px)`, width: `calc(${pct(DAY_START + r.end - r.start)} - 4px)` }}
                  >
                    <p className="truncate text-xs">{shortName(r.customer.name)}</p>
                    <p className="truncate text-[11px] tabular-nums">{r.end - r.start < 45 ? r.booking.time : r.service.name.th}</p>
                  </div>
                ))}
                {now !== null && (
                  <span className="absolute -inset-y-px z-10 w-0.5 bg-(--rose-deep)" style={{ left: pct(now) }} />
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
