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
import { bookingsByService, displayStatus, revenueByDay, STAFF } from "@/lib/demos/clinic-booking/data";
import { clinicData } from "@/lib/demos/clinic-booking/store";
import { useLang } from "@/components/demo/lang";
import { fill, formatDate, formatTHB } from "@/lib/demos/format";
import { useDemoStore } from "@/lib/use-demo-store";
import { countText, ui } from "./copy";
import { StaffPortrait } from "./staff-portrait";
import { useMinuteTick } from "./use-minute-tick";

// The clinic palette (see layout.tsx); recharts takes plain colours, so they are written out here.
const BAR = "#6b1f3a"; // --wine
const BAR_SOFT = "#c2185b"; // --accent
const GRID = "#f5dde2"; // --rose-2
const TICK = "#6b5560"; // --muted
const INK = "#2a1d22"; // --ink
const CURSOR = "#fbeef0"; // --rose

function RevenueTooltip({ active, payload }: TooltipContentProps) {
  const lang = useLang();
  const p = payload?.[0]?.payload as { date: string; revenue: number } | undefined;
  if (!active || !p) return null;
  return (
    <div className="rounded-xl border border-(--line) bg-white px-3 py-2 text-sm leading-[1.4] shadow-[0_12px_28px_-14px_rgb(43_34_38/0.35)]">
      <p className="text-[14px] text-(--muted)">{formatDate(p.date, lang, "full")}</p>
      <p className="text-base tabular-nums">{formatTHB(p.revenue)}</p>
    </div>
  );
}

function ServiceTooltip({ active, payload }: TooltipContentProps) {
  const lang = useLang();
  const p = payload?.[0]?.payload as { name: string; count: number } | undefined;
  if (!active || !p) return null;
  return (
    <div className="rounded-xl border border-(--line) bg-white px-3 py-2 text-sm leading-[1.4] shadow-[0_12px_28px_-14px_rgb(43_34_38/0.35)]">
      <p className="text-[14px] text-(--muted)">{p.name}</p>
      <p className="text-base tabular-nums">{countText(p.count, lang)}</p>
    </div>
  );
}

function Panel({ title, note, className = "", children }: { title: string; note?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-(--line) bg-white ${className}`}>
      <header className="px-5 pt-5">
        <h2 className="text-lg leading-[1.3] font-medium text-(--wine)">{title}</h2>
        {note && <p className="mt-0.5 text-[14px] leading-[1.5] text-(--muted) sm:text-base">{note}</p>}
      </header>
      {children}
    </section>
  );
}

export function Reports() {
  const lang = useLang();
  const [stored] = useDemoStore(clinicData);
  useMinuteTick();
  // Below about 480px the seven day ticks only fit at 14px with one-letter weekdays, in English as in Thai.
  const [narrowChart, setNarrowChart] = useState(false);
  // Reports render only after hydration (RequireSession), so "today" is the browser's clock. Today's bookings
  // count with the status the queue shows (moved on by the clock), so the queue, reports and customers agree.
  const today = new Date();
  const todayISO = toISODate(today);
  const duration = (id: string) => stored.services.find((s) => s.id === id)?.durationMin ?? 30;
  const data = {
    ...stored,
    bookings: stored.bookings.map((b) => (b.date === todayISO ? { ...b, status: displayStatus(b, duration(b.serviceId), today) } : b)),
  };

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

  const byService = bookingsByService(data).map((r) => ({ ...r, name: r.name[lang] })).sort((a, b) => b.count - a.count);
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

  const range = `${formatDate(revenue[0].date, lang, "dayMonth")} – ${formatDate(todayISO, lang, "dayMonth")}`;
  const tiles = [
    {
      label: ui.repRevenueLabel[lang],
      value: formatTHB(revenueTotal),
      foot: fill(ui.repRevenueFoot[lang], { n: String(done) }),
    },
    {
      label: ui.repUpcomingLabel[lang],
      value: countText(upcoming.length, lang),
      foot: fill(ui.repUpcomingFoot[lang], { count: countText(todayCount, lang) }),
    },
    {
      label: ui.repNoShowLabel[lang],
      value: `${Math.round(noShowRate * 100)}%`,
      foot: fill(ui.repNoShowFoot[lang], { n: String(noShow), total: String(done + noShow) }),
    },
  ];

  return (
    <div>
      <header>
        <h1 className="text-[1.75rem] leading-[1.25] font-medium text-(--wine) sm:text-[2.25rem]">{ui.repTitle[lang]}</h1>
        <p className="mt-1.5 text-(--muted)">{fill(ui.repRange[lang], { range })}</p>
      </header>

      <dl className="mt-6 grid overflow-hidden rounded-2xl border border-(--line) bg-white sm:grid-cols-3 sm:divide-x sm:divide-(--line)">
        {tiles.map((t, i) => (
          <div key={t.label} className={`px-5 py-4 sm:py-5 ${i > 0 ? "border-t border-(--line) sm:border-t-0" : ""}`}>
            <dt className="text-[14px] leading-[1.4] text-(--muted)">{t.label}</dt>
            <dd className="mt-1 text-[2rem] leading-[1.2] font-medium tabular-nums">{t.value}</dd>
            <dd className="mt-1 text-[14px] text-(--muted)">{t.foot}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel
          title={ui.repDailyTitle[lang]}
          note={best.revenue > 0 ? fill(ui.repBest[lang], { date: formatDate(best.date, lang, "full"), amount: formatTHB(best.revenue) }) : ui.repNoRevenue[lang]}
        >
          <div
            data-testid="revenue-chart"
            role="img"
            aria-label={fill(ui.repDailyChart[lang], { range, total: formatTHB(revenueTotal) })}
            className="min-w-0 px-2 pt-4 pb-3 sm:px-3"
          >
            <ResponsiveContainer width="100%" height={260} minWidth={0} onResize={(w) => setNarrowChart(w < 480)}>
              <BarChart data={revenue} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => (d === todayISO ? ui.chipToday[lang] : `${formatDate(d, lang, lang === "th" || narrowChart ? "weekdayNarrow" : "weekday")} ${Number(d.slice(8))}`)}
                  tick={{ fill: TICK, fontSize: 14 }}
                  tickLine={false}
                  axisLine={{ stroke: GRID }}
                  interval={0}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={(v: number) => (v >= 1000 ? `\u0E3F${v / 1000}k` : `\u0E3F${v}`)}
                  tick={{ fill: TICK, fontSize: 14 }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                />
                <Tooltip content={RevenueTooltip} cursor={{ fill: CURSOR }} />
                <Bar dataKey="revenue" fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={ui.repPopularTitle[lang]} note={top && top.count > 0 ? fill(ui.repTop[lang], { name: top.name, count: countText(top.count, lang) }) : undefined}>
          <div
            data-testid="service-chart"
            role="img"
            aria-label={fill(ui.repPopularChart[lang], { list: byService.map((s) => `${s.name} ${countText(s.count, lang)}`).join(", ") })}
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
                  width={lang === "th" ? 128 : 150}
                  tick={{ fill: INK, fontSize: 14 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={ServiceTooltip} cursor={{ fill: CURSOR }} />
                <Bar dataKey="count" fill={BAR_SOFT} radius={[0, 4, 4, 0]} maxBarSize={18} animationDuration={600}>
                  <LabelList dataKey="count" position="right" fill={TICK} fontSize={14} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title={ui.repStaffTitle[lang]} note={ui.repStaffNote[lang]} className="mt-5">
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-y border-(--line) bg-(--paper) text-[14px] whitespace-nowrap text-(--muted)">
                <th scope="col" className="pl-3 pr-1 py-2.5 font-normal sm:px-5">{ui.colStaff[lang]}</th>
                <th scope="col" className="px-1 py-2.5 text-right font-normal sm:px-3">{ui.colDone[lang]}</th>
                <th scope="col" className="px-1 py-2.5 text-right font-normal sm:px-3">{ui.colNoShow[lang]}</th>
                <th scope="col" className="px-1 py-2.5 text-right font-normal sm:px-3">{ui.colRevenue[lang]}</th>
                <th scope="col" className="py-2.5 pr-3 pl-1 text-right font-normal sm:px-5">{ui.colWaiting[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {staffRows.map((st) => (
                <tr key={st.id} className="border-t border-(--line) first:border-t-0">
                  <th scope="row" className="py-3 pr-1 pl-3 font-normal sm:px-5">
                    <span className="flex items-center gap-2 leading-[1.35] sm:gap-3">
                      <StaffPortrait decorative staffId={st.id} sizes="36px" className="size-9 shrink-0 rounded-full" />
                      <span>
                        <span className="block">{st.name[lang]}</span>
                        <span className="hidden text-[14px] text-(--muted) sm:block">{st.role[lang]}</span>
                      </span>
                    </span>
                  </th>
                  <td className="px-1 py-3 text-right tabular-nums sm:px-3">{st.done}</td>
                  <td className="px-1 py-3 text-right tabular-nums sm:px-3">{st.noShow}</td>
                  <td className="px-1 py-3 text-right tabular-nums sm:px-3">{formatTHB(st.revenue)}</td>
                  <td className="py-3 pr-3 pl-1 text-right tabular-nums sm:px-5">{st.upcoming}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
