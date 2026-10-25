"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { formatTHB } from "@/lib/demos/format";
import type { Lang } from "@/lib/demos/lang";
import { dayMonth, weekdayDate } from "./format";

// Chart colours mirror --brand, --line and --muted in layout.tsx.
const BRAND = "#1f7a5a";
const GRID = "#e3e8e4";
const TICK = "#56655c";

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

/** The 30-day sales area chart. Loaded on its own (see SalesPanels), so recharts doesn't hold up the dashboard. */
export function SalesChart({ series, lang }: { series: { date: string; revenue: number }[]; lang: Lang }) {
  return (
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
  );
}
