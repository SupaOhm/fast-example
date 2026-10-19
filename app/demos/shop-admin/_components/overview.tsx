"use client";

import { AlertTriangle, ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { addDays, toISODate } from "@/lib/dates";
import { dailySales, isLowStock, kpis, topProducts, type ShopOrder } from "@/lib/demos/shop-admin/data";
import { shopData } from "@/lib/demos/shop-admin/store";
import { formatTHB } from "@/lib/packages";
import { useDemoStore } from "@/lib/use-demo-store";
import { CHANNEL_ICON, STATUS_LABEL, STATUS_STYLE, dayMonth, thLong, thShort, thWeekday } from "./format";

const BRAND = "#1f7a5a";
const GRID = "#e3e8e4";
const TICK = "#56655c";

const sum = (xs: { revenue: number }[]) => xs.reduce((s, d) => s + d.revenue, 0);
const nf = new Intl.NumberFormat("en-US");

function SalesTooltip({ active, payload }: TooltipContentProps) {
  const point = payload?.[0]?.payload as { date: string; revenue: number } | undefined;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border border-(--line) bg-white px-3 py-2 text-sm leading-[1.4] shadow-[0_8px_24px_-12px_rgba(23,32,27,0.3)]">
      <p className="text-xs text-(--muted)">{thWeekday(point.date)}</p>
      <p className="font-semibold tabular-nums">{formatTHB(point.revenue)}</p>
    </div>
  );
}

function Panel({
  title,
  aside,
  className = "",
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-(--line) bg-(--panel) ${className}`}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 pt-4 sm:px-5 sm:pt-5">
        <h2 className="text-base font-semibold leading-[1.3]">{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

export function Overview() {
  const [data] = useDemoStore(shopData);
  // Rendered only after hydration (RequireSession), so reading the clock here is safe.
  const [today] = useState(() => new Date());

  const k = kpis(data, today);
  const series = dailySales(data, today);
  const last7 = sum(series.slice(-7));
  const prev7 = sum(series.slice(-14, -7));
  const delta = prev7 ? Math.round(((last7 - prev7) / prev7) * 100) : 0;
  const best = series.reduce((a, b) => (b.revenue > a.revenue ? b : a), series[0]);
  const top = topProducts(data, 5);
  const topMax = top[0]?.revenue ?? 1;
  const low = data.products.filter(isLowStock).sort((a, b) => a.stock / a.reorderAt - b.stock / b.reorderAt);
  const queue = data.orders
    .filter((o) => o.status === "paid" || o.status === "packing")
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
    .slice(0, 7);

  const from = toISODate(addDays(today, -29));
  const channels = (["LINE", "Shopee", "หน้าร้าน"] as ShopOrder["channel"][])
    .map((channel) => {
      const orders = data.orders.filter((o) => o.channel === channel && o.status !== "cancelled" && o.date >= from);
      return { channel, count: orders.length, revenue: orders.reduce((s, o) => s + o.total, 0) };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const tiles = [
    {
      label: "ยอดขาย 30 วัน",
      value: formatTHB(k.revenue30d),
      foot: (
        <span className={`inline-flex items-center gap-1 ${delta >= 0 ? "text-(--brand-ink)" : "text-(--warn-ink)"}`}>
          {delta >= 0 ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
          <span>
            <span className="font-semibold">{delta >= 0 ? "+" : ""}{delta}%</span> จากสัปดาห์ก่อน
          </span>
        </span>
      ),
    },
    {
      label: "คำสั่งซื้อ 30 วัน",
      value: nf.format(k.orders30d),
      unit: "บิล",
      foot: <span>เฉลี่ยวันละ {(k.orders30d / 30).toFixed(1)} บิล</span>,
    },
    {
      label: "ยอดเฉลี่ยต่อบิล",
      value: formatTHB(k.avgOrderValue),
      foot: <span>ไม่รวมบิลที่ยกเลิก</span>,
    },
    {
      label: "สินค้าใกล้หมด",
      value: String(k.lowStockCount),
      unit: "รายการ",
      warn: k.lowStockCount > 0,
      foot: <span>{k.lowStockCount > 0 ? "ถึงจุดสั่งซื้อแล้ว ควรสั่งเพิ่ม" : "สต็อกพอทุกรายการ"}</span>,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <h1 className="text-2xl font-semibold leading-[1.25] sm:text-[28px]">สวัสดี คุณนิ่ม</h1>
          <p className="mt-1 text-sm leading-[1.5] text-(--muted)">
            สรุปร้าน 30 วันล่าสุด ถึง {thLong(today)}
          </p>
        </div>
      </div>

      <section
        aria-label="ตัวเลขสำคัญ"
        className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-(--line) bg-(--line) [gap:1px] lg:grid-cols-4"
      >
        {tiles.map((t) => (
          <div
            key={t.label}
            data-testid="kpi"
            className={`flex flex-col gap-1 px-4 py-4 sm:px-5 sm:py-5 ${t.warn ? "bg-(--warn-soft)" : "bg-(--panel)"}`}
          >
            <p className={`flex items-center gap-1.5 text-sm leading-[1.4] ${t.warn ? "text-(--warn-ink)" : "text-(--muted)"}`}>
              {t.warn && <AlertTriangle className="size-3.5" aria-hidden />}
              {t.label}
            </p>
            <p className={`text-[26px] font-semibold leading-[1.2] tabular-nums sm:text-[32px] ${t.warn ? "text-(--warn-ink)" : ""}`}>
              {t.value}
              {t.unit && <span className="ml-1.5 text-sm font-medium text-(--muted)">{t.unit}</span>}
            </p>
            <div className={`mt-auto text-xs leading-[1.45] ${t.warn ? "text-(--warn-ink)" : "text-(--muted)"}`}>{t.foot}</div>
          </div>
        ))}
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel
          title="ยอดขายรายวัน"
          className="min-w-0 lg:col-span-2"
          aside={
            <p className="text-xs leading-[1.45] text-(--muted)">
              วันที่ขายดีที่สุด {thShort(best.date)}{" "}
              <span className="font-semibold text-(--ink) tabular-nums">{formatTHB(best.revenue)}</span>
            </p>
          }
        >
          <div
            data-testid="sales-chart"
            role="img"
            aria-label={`กราฟยอดขายรายวัน 30 วันล่าสุด รวม ${formatTHB(k.revenue30d)} วันที่ขายดีที่สุดคือ ${thShort(best.date)} ${formatTHB(best.revenue)}`}
            className="min-w-0 px-1 pb-3 pt-4 sm:px-3"
          >
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }} accessibilityLayer={false}>
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
                  minTickGap={18}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={(v: number) => (v >= 1000 ? `฿${v / 1000}k` : `฿${v}`)}
                  tick={{ fill: TICK, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  content={SalesTooltip}
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
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="สินค้าขายดี" aside={<p className="text-xs text-(--muted)">ตามยอดขาย 30 วัน</p>}>
          <ol className="space-y-4 px-4 pb-5 pt-4 sm:px-5">
            {top.map((p, i) => (
              <li key={p.sku}>
                <div className="flex items-baseline gap-2.5 text-sm leading-[1.4]">
                  <span className="w-4 shrink-0 text-xs font-semibold tabular-nums text-(--muted)">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                  <span className="shrink-0 font-semibold tabular-nums">{formatTHB(p.revenue)}</span>
                </div>
                <div className="ml-6.5 mt-1.5 flex items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--bg)">
                    <div className="h-full rounded-full bg-(--brand)" style={{ width: `${(p.revenue / topMax) * 100}%` }} />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs tabular-nums text-(--muted)">{p.qty} ชิ้น</span>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel
          title="รอแพ็กและรอส่ง"
          className="lg:col-span-2"
          aside={
            <Link
              href="/demos/shop-admin/orders"
              className="inline-flex items-center gap-0.5 text-sm font-medium text-(--brand-ink) hover:underline"
            >
              เปิดหน้าจัดการบิล
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          }
        >
          {queue.length === 0 ? (
            <p className="px-5 py-8 text-sm text-(--muted)">ไม่มีบิลค้างแพ็ก ส่งครบทุกบิลแล้ว</p>
          ) : (
            <ul className="mt-2 divide-y divide-(--line) pb-2">
              {queue.map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-4 py-3 text-sm leading-[1.4] sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {o.customer} <span className="font-normal text-(--muted)">{o.id}</span>
                    </p>
                    <p className="text-xs text-(--muted)">
                      {thShort(o.date)} ผ่าน {o.channel}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">{formatTHB(o.total)}</span>
                  <span className={`w-[76px] shrink-0 rounded-full border px-2 py-0.5 text-center text-xs font-medium ${STATUS_STYLE[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel
            title="สินค้าใกล้หมด"
            aside={
              <Link
                href="/demos/shop-admin/stock"
                className="inline-flex items-center gap-0.5 text-sm font-medium text-(--brand-ink) hover:underline"
              >
                อัปเดตสต็อก
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            }
          >
            {low.length === 0 ? (
              <p className="px-5 py-8 text-sm text-(--muted)">สต็อกพอทุกรายการ</p>
            ) : (
              <ul className="mt-2 divide-y divide-(--line) pb-2">
                {low.map((p) => (
                  <li key={p.sku} className="flex items-center gap-3 px-4 py-3 text-sm leading-[1.4] sm:px-5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="text-xs text-(--muted)">จุดสั่งซื้อ {p.reorderAt} ชิ้น</p>
                    </div>
                    <p className="shrink-0 text-right">
                      <span className="text-lg font-semibold tabular-nums text-(--warn-ink)">{p.stock}</span>
                      <span className="ml-1 text-xs text-(--muted)">ชิ้นเหลือ</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="ยอดขายตามช่องทาง" aside={<p className="text-xs text-(--muted)">30 วัน</p>}>
            <ul className="space-y-4 px-4 pb-5 pt-4 sm:px-5">
              {channels.map(({ channel, count, revenue }) => {
                const Icon = CHANNEL_ICON[channel];
                const share = k.revenue30d ? Math.round((revenue / k.revenue30d) * 100) : 0;
                return (
                  <li key={channel}>
                    <div className="flex items-baseline gap-2 text-sm leading-[1.4]">
                      <Icon className="size-4 shrink-0 self-center text-(--muted)" aria-hidden />
                      <span className="flex-1 font-medium">{channel}</span>
                      <span className="text-xs tabular-nums text-(--muted)">{count} บิล</span>
                      <span className="w-[76px] text-right font-semibold tabular-nums">{formatTHB(revenue)}</span>
                    </div>
                    <div className="ml-6 mt-1.5 flex items-center gap-2.5">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--bg)">
                        <div className="h-full rounded-full bg-(--brand)" style={{ width: `${share}%` }} />
                      </div>
                      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-(--muted)">{share}%</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
