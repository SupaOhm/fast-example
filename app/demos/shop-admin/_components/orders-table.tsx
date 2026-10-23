"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useState } from "react";
import {
  SHOP_ORDER_STATUSES,
  matchesQuery,
  setOrderStatus,
  type ShopOrder,
  type ShopOrderStatus,
} from "@/lib/demos/shop-admin/data";
import { shopData } from "@/lib/demos/shop-admin/store";
import { formatTHB } from "@/lib/packages";
import { useDemoStore } from "@/lib/use-demo-store";
import { channelLabel, statusLabel } from "./copy";
import { CHANNEL_ICON, itemCount, shortDate } from "./format";

const PAGE_SIZE = 15;
const NEUTRAL_STATUS = "bg-[#eef1ef] text-(--muted) border-(--line)";

function Channel({ channel }: { channel: ShopOrder["channel"] }) {
  const Icon = CHANNEL_ICON[channel];
  return (
    <span className="inline-flex items-center gap-1.5 text-(--muted)">
      <Icon className="size-3.5" aria-hidden />
      {channelLabel[channel].th}
    </span>
  );
}

function StatusSelect({ order, onChange }: { order: ShopOrder; onChange: (s: ShopOrderStatus) => void }) {
  return (
    <span className="relative inline-flex">
      <select
        aria-label={`สถานะคำสั่งซื้อ ${order.id}`}
        value={order.status}
        onChange={(e) => onChange(e.target.value as ShopOrderStatus)}
        className={`cursor-pointer appearance-none rounded-full border py-1 pl-3 pr-7 text-xs font-medium leading-[1.3] outline-none focus-visible:ring-2 focus-visible:ring-(--brand)/40 ${NEUTRAL_STATUS}`}
      >
        {SHOP_ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabel[s].th}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 opacity-70" aria-hidden />
    </span>
  );
}

export function OrdersTable() {
  const [data, setData] = useDemoStore(shopData);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ShopOrderStatus | "all">("all");
  const [page, setPage] = useState(1);

  const byStatus = status === "all" ? data.orders : data.orders.filter((o) => o.status === status);
  const rows = byStatus.filter((o) => matchesQuery(o, query));
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  const counts = Object.fromEntries(
    SHOP_ORDER_STATUSES.map((s) => [s, data.orders.filter((o) => o.status === s).length]),
  ) as Record<ShopOrderStatus, number>;

  const changeStatus = (id: string, next: ShopOrderStatus) => setData((d) => setOrderStatus(d, id, next));
  const clear = () => {
    setQuery("");
    setStatus("all");
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold leading-[1.25] sm:text-[28px]">คำสั่งซื้อ</h1>
      <p className="mt-1 text-sm leading-[1.5] text-(--muted)">
        {data.orders.length} บิลใน 30 วันล่าสุด รอแพ็กหรือรอส่ง {counts.paid + counts.packed} บิล
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1 sm:max-w-sm">
          <label htmlFor="orders-search" className="sr-only">
            ค้นหาด้วยเลขที่บิลหรือชื่อลูกค้า
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--muted)" aria-hidden />
          <input
            id="orders-search"
            type="search"
            data-testid="orders-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาเลขที่บิล หรือชื่อลูกค้า"
            className="w-full rounded-lg border border-(--line) bg-(--panel) py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-(--muted) focus:border-(--brand) focus:ring-3 focus:ring-(--brand)/15"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="orders-status" className="shrink-0 text-sm text-(--muted)">
            สถานะ
          </label>
          <span className="relative flex-1 sm:flex-none">
            <select
              id="orders-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ShopOrderStatus | "all");
                setPage(1);
              }}
              className="w-full cursor-pointer appearance-none rounded-lg border border-(--line) bg-(--panel) py-2.5 pl-3 pr-9 text-sm outline-none focus:border-(--brand) focus:ring-3 focus:ring-(--brand)/15 sm:w-48"
            >
              <option value="all">ทั้งหมด ({data.orders.length})</option>
              {SHOP_ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s].th} ({counts[s]})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-(--muted)" aria-hidden />
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-(--line) bg-(--panel)">
        {rows.length === 0 ? (
          <div data-testid="orders-empty" className="px-6 py-14 text-center">
            <p className="font-medium leading-[1.4]">ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง</p>
            <p className="mt-1 text-sm leading-[1.5] text-(--muted)">
              ลองค้นด้วยเลขที่บิล เช่น RD-2001 หรือชื่อลูกค้า เช่น คุณเมย์
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-(--line) px-3 py-2 text-sm font-medium hover:bg-(--bg)"
            >
              <X className="size-4" aria-hidden />
              ล้างตัวกรอง
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm leading-[1.4]">
                <thead>
                  <tr className="border-b border-(--line) bg-[#f9faf9] text-left text-xs text-(--muted)">
                    <th scope="col" className="px-5 py-3 font-medium">เลขที่</th>
                    <th scope="col" className="px-3 py-3 font-medium">วันที่</th>
                    <th scope="col" className="px-3 py-3 font-medium">ลูกค้า</th>
                    <th scope="col" className="px-3 py-3 font-medium">ช่องทาง</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">จำนวน</th>
                    <th scope="col" className="px-3 py-3 text-right font-medium">ยอดรวม</th>
                    <th scope="col" className="px-5 py-3 font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--line)">
                  {visible.map((o) => (
                    <tr key={o.id} className={`hover:bg-[#f9faf9] ${o.status === "cancelled" ? "text-(--muted)" : ""}`}>
                      <td className="whitespace-nowrap px-5 py-3 font-medium tabular-nums">{o.id}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-(--muted)">{shortDate(o.date, "th")}</td>
                      <td className="whitespace-nowrap px-3 py-3">{o.customer.th}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <Channel channel={o.channel} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">{itemCount(o)} ชิ้น</td>
                      <td className={`whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums ${o.status === "cancelled" ? "line-through" : ""}`}>
                        {formatTHB(o.total)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-2">
                        <StatusSelect order={o} onChange={(s) => changeStatus(o.id, s)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-(--line) sm:hidden">
              {visible.map((o) => (
                <li key={o.id} className="px-4 py-3.5 text-sm leading-[1.4]">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium">
                      {o.customer.th} <span className="font-normal tabular-nums text-(--muted)">{o.id}</span>
                    </p>
                    <p className={`shrink-0 font-semibold tabular-nums ${o.status === "cancelled" ? "text-(--muted) line-through" : ""}`}>
                      {formatTHB(o.total)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--muted)">
                      <span>{shortDate(o.date, "th")}</span>
                      <Channel channel={o.channel} />
                      <span>{itemCount(o)} ชิ้น</span>
                    </p>
                    <StatusSelect order={o} onChange={(s) => changeStatus(o.id, s)} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-(--line) px-4 py-3 text-sm sm:px-5">
              <p className="text-(--muted) tabular-nums">
                {start + 1}–{start + visible.length} จาก {rows.length} บิล
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="หน้าก่อนหน้า"
                  disabled={current === 1}
                  onClick={() => setPage(current - 1)}
                  className="grid size-9 place-items-center rounded-lg border border-(--line) hover:bg-(--bg) disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <span className="min-w-[64px] text-center tabular-nums text-(--muted)">
                  {current} / {pageCount}
                </span>
                <button
                  type="button"
                  aria-label="หน้าถัดไป"
                  disabled={current === pageCount}
                  onClick={() => setPage(current + 1)}
                  className="grid size-9 place-items-center rounded-lg border border-(--line) hover:bg-(--bg) disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
