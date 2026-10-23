"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, type TooltipContentProps } from "recharts";
import { useLang } from "@/components/demo/lang";
import { fill, formatTHB } from "@/lib/demos/format";
import type { Lang } from "@/lib/demos/lang";
import { channelSales, dailySales, topProducts, type ShopData } from "@/lib/demos/shop-admin/data";
import { byCount, channelLabel, ui } from "./copy";
import { CHANNEL_ICON, dayMonth, shortDate, weekdayDate } from "./format";
import { ProductIcon } from "./product-icon";

const MUSTARD = "#e2b04a";
const WOOD = "#2b2217";
const TICK = "#665540";

const sum = (xs: { revenue: number }[]) => xs.reduce((s, d) => s + d.revenue, 0);

// The bar-grow animation is motion; skip it when the visitor asked for less. Only read inside the chart (client-only).
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function SalesTooltip({ active, payload, lang }: TooltipContentProps & { lang: Lang }) {
  const point = payload?.[0]?.payload as { date: string; revenue: number } | undefined;
  if (!active || !point) return null;
  return (
    <div className="rounded-md border border-(--line) bg-(--paper) px-3 py-2 leading-[1.4] shadow-[0_8px_20px_-10px_rgba(43,34,23,.45)]">
      <p className="text-sm text-(--muted)">{weekdayDate(point.date, lang)}</p>
      <p className="font-(family-name:--font-mono) font-semibold">{formatTHB(point.revenue)}</p>
    </div>
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
    <section id="sales" aria-labelledby="sales-heading" className="mt-12 scroll-mt-32 lg:scroll-mt-6">
      <h2 id="sales-heading" className="text-[22px] font-bold leading-[1.3]">
        {ui.salesHeading[lang]}
      </h2>

      <div className="mt-4 grid gap-5 rounded-lg border-[1.5px] border-(--line) bg-(--paper) p-4 sm:p-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col gap-3">
          <h3 className="font-bold leading-[1.3]">{ui.dailySales[lang]}</h3>
          <div>
            <p className="text-sm text-(--muted)">{ui.last30[lang]}</p>
            <p className="font-(family-name:--font-mono) text-[28px] font-semibold leading-[1.2]">{formatTHB(total30)}</p>
          </div>
          <p className={`flex items-center gap-1 text-sm font-semibold ${delta >= 0 ? "text-(--ok)" : "text-(--warn)"}`}>
            {delta >= 0 ? <ArrowUpRight className="size-4" aria-hidden /> : <ArrowDownRight className="size-4" aria-hidden />}
            {fill(ui.salesDelta[lang], { delta: `${delta >= 0 ? "+" : "−"}${Math.abs(delta)}` })}
          </p>
          <p className="text-sm text-(--muted)">
            {fill(ui.bestDay[lang], { date: shortDate(best.date, lang) })}{" "}
            <span className="font-(family-name:--font-mono) font-semibold text-(--ink)">{formatTHB(best.revenue)}</span>
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
          <ResponsiveContainer width="100%" height={184} minWidth={0}>
            <BarChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: 4 }} accessibilityLayer={false}>
              <XAxis
                dataKey="date"
                tickFormatter={dayMonth}
                tick={{ fill: TICK, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: WOOD, strokeWidth: 1.5 }}
                minTickGap={22}
                tickMargin={6}
              />
              <Tooltip
                content={(props) => <SalesTooltip {...props} lang={lang} />}
                cursor={{ fill: "rgba(226,176,74,.18)" }}
              />
              <Bar dataKey="revenue" radius={[3, 3, 0, 0]} animationDuration={500} isAnimationActive={!reducedMotion()}>
                {series.map((d, i) => (
                  <Cell
                    key={d.date}
                    fill={i === series.length - 1 || d.date === best.date ? WOOD : MUSTARD}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:items-start">
        <section aria-labelledby="top-heading" className="min-w-0 rounded-lg border-[1.5px] border-(--line) bg-(--paper) p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 id="top-heading" className="font-bold leading-[1.3]">
              {ui.topHeading[lang]}
            </h3>
            <p className="text-sm text-(--muted)">{ui.topHint[lang]}</p>
          </div>
          <ol className="mt-3 divide-y divide-dashed divide-(--line)">
            {top.map((p) => (
              <li key={p.sku} className="flex items-center gap-3 py-2.5">
                <ProductIcon sku={p.sku} className="size-11" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate font-semibold">{p.name[lang]}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatTHB(p.revenue)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--bg)">
                      <span className="block h-full rounded-full bg-(--mustard)" style={{ width: `${(p.revenue / topMax) * 100}%` }} />
                    </span>
                    <span className="w-16 shrink-0 text-right text-sm text-(--muted)">
                      {fill(byCount(p.qty, ui.piecesOne, ui.pieces)[lang], { n: String(p.qty) })}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="channel-heading" className="min-w-0 rounded-lg border-[1.5px] border-(--line) bg-(--paper) p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 id="channel-heading" className="font-bold leading-[1.3]">
              {ui.channelHeading[lang]}
            </h3>
            <p className="text-sm text-(--muted)">{ui.last30[lang]}</p>
          </div>
          <ul className="mt-3 space-y-4">
            {channels.map(({ channel, count, revenue }) => {
              const Icon = CHANNEL_ICON[channel];
              const share = Math.round((revenue / channelTotal) * 100);
              return (
                <li key={channel} className="pt-1">
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-(--bg)">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate font-semibold">{channelLabel[channel][lang]}</span>
                        <span className="shrink-0 font-semibold tabular-nums">{formatTHB(revenue)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-(--bg)">
                          <span className="block h-full rounded-full bg-(--wood)" style={{ width: `${share}%` }} />
                        </span>
                        <span className="shrink-0 text-sm text-(--muted)">{fill(byCount(count, ui.orderCountOne, ui.orderCount)[lang], { n: String(count) })}</span>
                        <span className="w-10 shrink-0 text-right text-sm font-semibold">{share}%</span>
                      </div>
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
