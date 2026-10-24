"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { useLang } from "@/components/demo/lang";
import { fill, formatTHB } from "@/lib/demos/format";
import type { Lang } from "@/lib/demos/lang";
import { channelSales, dailySales, topProducts, type ShopData } from "@/lib/demos/shop-admin/data";
import { byCount, channelLabel, ui } from "./copy";
import { CHANNEL_ICON, dayMonth, shortDate, weekdayDate } from "./format";
import { ProductIcon } from "./product-icon";
import { PANEL } from "./shop-css";

// Chart colours mirror --brand, --line and --muted in layout.tsx.
const BRAND = "#1f7a5a";
const GRID = "#e3e8e4";
const TICK = "#56655c";

const sum = (xs: { revenue: number }[]) => xs.reduce((s, d) => s + d.revenue, 0);

// The draw-in animation is motion; skip it when the visitor asked for less. Only read inside the chart (client-only).
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function SalesTooltip({ active, payload, lang }: TooltipContentProps & { lang: Lang }) {
  const point = payload?.[0]?.payload as { date: string; revenue: number } | undefined;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border border-(--line) bg-white px-3 py-2 leading-[1.4] shadow-[0_8px_24px_-12px_rgba(23,32,27,0.3)]">
      <p className="text-sm text-(--muted)">{weekdayDate(point.date, lang)}</p>
      <p className="font-semibold tabular-nums">{formatTHB(point.revenue)}</p>
    </div>
  );
}

/** A thin brand-green bar showing a share from 0 to 100. */
function ShareBar({ pct }: { pct: number }) {
  return (
    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--bg)">
      <span className="block h-full rounded-full bg-(--brand)" style={{ width: `${pct}%` }} />
    </span>
  );
}

/** The sales section: 30-day chart, best sellers and channels. */
export function SalesPanels({ data, today }: { data: ShopData; today: Date }) {
  const lang = useLang();
  const series = dailySales(data, today);
  const total30 = sum(series);
  const last7 = sum(series.slice(-7));
  const prev7 = sum(series.slice(-14, -7));
  const delta = prev7 ? Math.round(((last7 - prev7) / prev7) * 100) : 0;
  const best = series.reduce((a, b) => (b.revenue > a.revenue ? b : a), series[0]);
  const top = topProducts(data, 5);
  const topMax = top[0]?.revenue || 1;
  const channels = channelSales(data, today);
  const channelTotal = channels.reduce((s, c) => s + c.revenue, 0) || 1;

  return (
    <section id="sales" aria-labelledby="sales-heading" className="mt-10 scroll-mt-32 lg:scroll-mt-6">
      <h2 id="sales-heading" className="text-lg font-semibold leading-[1.3]">
        {ui.salesHeading[lang]}
      </h2>

      <div className={`${PANEL} mt-3 grid gap-5 p-4 sm:p-5 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8`}>
        <div className="flex flex-col gap-2.5">
          <h3 className="text-base font-semibold leading-[1.3]">{ui.dailySales[lang]}</h3>
          <div>
            <p className="text-sm text-(--muted)">{ui.last30[lang]}</p>
            <p className="text-[28px] font-semibold leading-[1.2] tabular-nums">{formatTHB(total30)}</p>
          </div>
          <p className={`flex items-center gap-1 text-sm font-medium ${delta >= 0 ? "text-(--brand-ink)" : "text-(--warn-ink)"}`}>
            {delta >= 0 ? <ArrowUpRight className="size-4" aria-hidden /> : <ArrowDownRight className="size-4" aria-hidden />}
            {fill(ui.salesDelta[lang], { delta: `${delta >= 0 ? "+" : "−"}${Math.abs(delta)}` })}
          </p>
          <p className="text-sm text-(--muted)">
            {fill(ui.bestDay[lang], { date: shortDate(best.date, lang) })}{" "}
            <span className="font-semibold tabular-nums text-(--ink)">{formatTHB(best.revenue)}</span>
          </p>
        </div>

        <div
          data-testid="sales-chart"
          role="img"
          aria-label={fill(ui.salesChartLabel[lang], {
            total: formatTHB(total30),
            date: shortDate(best.date, lang),
            best: formatTHB(best.revenue),
          })}
          className="min-w-0"
        >
          <ResponsiveContainer width="100%" height={220} minWidth={0}>
            <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
              <defs>
                <linearGradient id="shop-sales-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis
                dataKey="date"
                tickFormatter={dayMonth}
                tick={{ fill: TICK, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
                minTickGap={22}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={(v: number) => (v >= 1000 ? `฿${v / 1000}k` : `฿${v}`)}
                tick={{ fill: TICK, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                content={(props) => <SalesTooltip {...props} lang={lang} />}
                cursor={{ stroke: BRAND, strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={BRAND}
                strokeWidth={2}
                fill="url(#shop-sales-fill)"
                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2, fill: BRAND }}
                animationDuration={700}
                isAnimationActive={!reducedMotion()}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:items-start">
        <section aria-labelledby="top-heading" className={`${PANEL} min-w-0 p-4 sm:p-5`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 id="top-heading" className="text-base font-semibold leading-[1.3]">
              {ui.topHeading[lang]}
            </h3>
            <p className="text-sm text-(--muted)">{ui.topHint[lang]}</p>
          </div>
          <ol className="mt-3 divide-y divide-(--line)">
            {top.map((p) => (
              <li key={p.sku} className="flex items-center gap-3 py-2.5">
                <ProductIcon sku={p.sku} className="size-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate font-medium">{p.name[lang]}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatTHB(p.revenue)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <ShareBar pct={(p.revenue / topMax) * 100} />
                    <span className="w-16 shrink-0 text-right text-sm tabular-nums text-(--muted)">
                      {fill(byCount(p.qty, ui.piecesOne, ui.pieces)[lang], { n: String(p.qty) })}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="channel-heading" className={`${PANEL} min-w-0 p-4 sm:p-5`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 id="channel-heading" className="text-base font-semibold leading-[1.3]">
              {ui.channelHeading[lang]}
            </h3>
            <p className="text-sm text-(--muted)">{ui.last30[lang]}</p>
          </div>
          <ul className="mt-3 divide-y divide-(--line)">
            {channels.map(({ channel, count, revenue }) => {
              const Icon = CHANNEL_ICON[channel];
              const share = Math.round((revenue / channelTotal) * 100);
              return (
                <li key={channel} className="flex items-center gap-3 py-3">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-(--bg) text-(--muted)">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate font-medium">{channelLabel[channel][lang]}</span>
                      <span className="shrink-0 font-semibold tabular-nums">{formatTHB(revenue)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <ShareBar pct={share} />
                      <span className="shrink-0 text-sm tabular-nums text-(--muted)">
                        {fill(byCount(count, ui.orderCountOne, ui.orderCount)[lang], { n: String(count) })}
                      </span>
                      <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums">{share}%</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </section>
  );
}
