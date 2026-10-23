"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { nextDays, toISODate } from "@/lib/dates";
import { bookingsByService, revenueByDay, STAFF } from "@/lib/demos/clinic-booking/data";
import { clinicData } from "@/lib/demos/clinic-booking/store";
import { formatTHB } from "@/lib/packages";
import { useDemoStore } from "@/lib/use-demo-store";
import { monogramOf, thDayMonth, thLongDate, weekdayShort } from "./admin-format";

const BAR = "#8e3e4d";
const BAR_SOFT = "#c86b7a";
const GRID = "#efdfe2";
const TICK = "#6b5960";
const CURSOR = "#fbeff0";

function RevenueTooltip({ active, payload }: TooltipContentProps) {
  const p = payload?.[0]?.payload as { date: string; revenue: number } | undefined;
  if (!active || !p) return null;
  return (
    <div className="rounded-xl border border-(--line) bg-white px-3 py-2 text-sm leading-[1.4] shadow-[0_12px_28px_-14px_rgb(43_34_38/0.35)]">
      <p className="text-xs text-(--muted)">{thLongDate(p.date)}</p>
      <p className="text-base tabular-nums">{formatTHB(p.revenue)}</p>
    </div>
  );
}

function ServiceTooltip({ active, payload }: TooltipContentProps) {
  const p = payload?.[0]?.payload as { name: string; count: number } | undefined;
  if (!active || !p) return null;
  return (
    <div className="rounded-xl border border-(--line) bg-white px-3 py-2 text-sm leading-[1.4] shadow-[0_12px_28px_-14px_rgb(43_34_38/0.35)]">
      <p className="text-xs text-(--muted)">{p.name}</p>
      <p className="text-base tabular-nums">{p.count} คิว</p>
    </div>
  );
}

function Panel({ title, note, className = "", children }: { title: string; note?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-(--line) bg-white ${className}`}>
      <header className="px-5 pt-5">
        <h2 className="text-lg leading-[1.3] font-medium">{title}</h2>
        {note && <p className="mt-0.5 text-sm leading-[1.5] text-(--muted)">{note}</p>}
      </header>
      {children}
    </section>
  );
}

export function Reports() {
  const [data] = useDemoStore(clinicData);
  // Reports render only after hydration (RequireSession), so "today" is the browser's day.
  const [today] = useState(() => new Date());
  const todayISO = toISODate(today);

  const revenue = revenueByDay(data, today, 7);
  const revenueTotal = revenue.reduce((s, d) => s + d.revenue, 0);
  const best = revenue.reduce((a, b) => (b.revenue > a.revenue ? b : a), revenue[0]);

  const pastDays = new Set(revenue.map((d) => d.date));
  const past = data.bookings.filter((b) => pastDays.has(b.date));
  const done = past.filter((b) => b.status === "done").length;
  const noShow = past.filter((b) => b.status === "no-show").length;
  const noShowRate = done + noShow ? noShow / (done + noShow) : 0;

  const upcomingDays = new Set(nextDays(today, 7));
  const upcoming = data.bookings.filter((b) => upcomingDays.has(b.date) && b.status !== "no-show");
  const todayCount = upcoming.filter((b) => b.date === todayISO).length;

  const byService = bookingsByService(data).map((r) => ({ ...r, name: r.name.th })).sort((a, b) => b.count - a.count);
  const top = byService[0];

  const price = new Map(data.services.map((s) => [s.id, s.price]));
  const staffRows = STAFF.map((st) => {
    const mine = past.filter((b) => b.staffId === st.id);
    const doneMine = mine.filter((b) => b.status === "done");
    return {
      ...st,
      done: doneMine.length,
      noShow: mine.filter((b) => b.status === "no-show").length,
      revenue: doneMine.reduce((s, b) => s + (price.get(b.serviceId) ?? 0), 0),
      upcoming: upcoming.filter((b) => b.staffId === st.id).length,
    };
  });

  const range = `${thDayMonth(revenue[0].date)} – ${thDayMonth(todayISO)}`;
  const tiles = [
    {
      label: "รายได้ 7 วันล่าสุด",
      value: formatTHB(revenueTotal),
      foot: `จาก ${done} คิวที่เสร็จสิ้น`,
    },
    {
      label: "คิวใน 7 วันข้างหน้า",
      value: `${upcoming.length} คิว`,
      foot: `วันนี้ ${todayCount} คิว`,
    },
    {
      label: "อัตราไม่มาตามนัด 7 วันล่าสุด",
      value: `${Math.round(noShowRate * 100)}%`,
      foot: `ไม่มา ${noShow} จาก ${done + noShow} คิว`,
    },
  ];

  return (
    <div>
      <header>
        <h1 className="text-[1.75rem] leading-[1.25] font-normal sm:text-[2rem]">รายงาน</h1>
        <p className="mt-1 text-[15px] text-(--muted)">ข้อมูล {range} คำนวณจากคิวในระบบ</p>
      </header>

      <dl className="mt-6 grid overflow-hidden rounded-2xl border border-(--line) bg-white sm:grid-cols-3 sm:divide-x sm:divide-(--line)">
        {tiles.map((t, i) => (
          <div key={t.label} className={`px-5 py-4 sm:py-5 ${i > 0 ? "border-t border-(--line) sm:border-t-0" : ""}`}>
            <dt className="text-sm leading-[1.4] text-(--muted)">{t.label}</dt>
            <dd className="mt-1 text-[2rem] leading-[1.2] font-light tabular-nums">{t.value}</dd>
            <dd className="mt-1 text-sm text-(--muted)">{t.foot}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel
          title="รายได้รายวัน"
          note={best.revenue > 0 ? `วันที่รายได้สูงสุดคือ ${thLongDate(best.date)} ${formatTHB(best.revenue)}` : "ยังไม่มีคิวที่เสร็จสิ้นในช่วงนี้"}
        >
          <div
            data-testid="revenue-chart"
            role="img"
            aria-label={`กราฟแท่งรายได้รายวัน ${range} รวม ${formatTHB(revenueTotal)}`}
            className="min-w-0 px-2 pt-4 pb-3 sm:px-3"
          >
            <ResponsiveContainer width="100%" height={260} minWidth={0}>
              <BarChart data={revenue} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => (d === todayISO ? "วันนี้" : `${weekdayShort(d)} ${Number(d.slice(8))}`)}
                  tick={{ fill: TICK, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: GRID }}
                  interval={0}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={(v: number) => (v >= 1000 ? `฿${v / 1000}k` : `฿${v}`)}
                  tick={{ fill: TICK, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip content={RevenueTooltip} cursor={{ fill: CURSOR }} />
                <Bar dataKey="revenue" fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="บริการยอดนิยม" note={top && top.count > 0 ? `${top.name} ถูกจองมากที่สุด ${top.count} คิว` : undefined}>
          <div
            data-testid="service-chart"
            role="img"
            aria-label={`กราฟแท่งจำนวนการจองตามบริการ ${byService.map((s) => `${s.name} ${s.count} คิว`).join(", ")}`}
            className="min-w-0 px-2 pt-4 pb-3 sm:px-3"
          >
            <ResponsiveContainer width="100%" height={260} minWidth={0}>
              <BarChart
                data={byService}
                layout="vertical"
                margin={{ top: 0, right: 36, bottom: 0, left: 0 }}
                barCategoryGap={8}
                accessibilityLayer={false}
              >
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={112}
                  tick={{ fill: "#2b2226", fontSize: 13 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={ServiceTooltip} cursor={{ fill: CURSOR }} />
                <Bar dataKey="count" fill={BAR_SOFT} radius={[0, 4, 4, 0]} maxBarSize={18} animationDuration={600}>
                  <LabelList dataKey="count" position="right" fill={TICK} fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="ผู้ดูแล" note="คิวที่เสร็จ ไม่มา และรายได้ 7 วันล่าสุด กับคิวที่รออยู่ 7 วันข้างหน้า" className="mt-5">
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-[15px]">
            <thead>
              <tr className="border-y border-(--line) bg-(--paper) text-[13px] whitespace-nowrap text-(--muted)">
                <th scope="col" className="pl-4 pr-2 py-2.5 font-normal sm:px-5">ผู้ดูแล</th>
                <th scope="col" className="px-2 py-2.5 text-right font-normal sm:px-3">เสร็จ</th>
                <th scope="col" className="px-2 py-2.5 text-right font-normal sm:px-3">ไม่มา</th>
                <th scope="col" className="px-2 py-2.5 text-right font-normal sm:px-3">รายได้</th>
                <th scope="col" className="py-2.5 pr-4 pl-2 text-right font-normal sm:px-5">รออยู่</th>
              </tr>
            </thead>
            <tbody>
              {staffRows.map((st) => (
                <tr key={st.id} className="border-t border-(--line) first:border-t-0">
                  <th scope="row" className="py-3 pr-2 pl-4 font-normal sm:px-5">
                    <span className="flex items-center gap-3 leading-[1.35]">
                      <span aria-hidden className="hidden size-9 shrink-0 place-items-center rounded-full bg-(--blush-2) text-sm sm:grid text-(--rose-deep)">
                        {monogramOf(st.name.th)}
                      </span>
                      <span>
                        <span className="block">{st.name.th}</span>
                        <span className="hidden text-[13px] text-(--muted) sm:block">{st.role.th}</span>
                      </span>
                    </span>
                  </th>
                  <td className="px-2 py-3 text-right tabular-nums sm:px-3">{st.done}</td>
                  <td className="px-2 py-3 text-right tabular-nums sm:px-3">{st.noShow}</td>
                  <td className="px-2 py-3 text-right tabular-nums sm:px-3">{formatTHB(st.revenue)}</td>
                  <td className="py-3 pr-4 pl-2 text-right tabular-nums sm:px-5">{st.upcoming}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
