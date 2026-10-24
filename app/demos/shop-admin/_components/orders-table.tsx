"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useLang } from "@/components/demo/lang";
import { fill, formatTHB } from "@/lib/demos/format";
import {
  SHOP_ORDER_STATUSES,
  matchesQuery,
  parseOrderFilter,
  setOrderStatus,
  toPack,
  type OrderFilter,
  type ShopOrder,
  type ShopOrderStatus,
} from "@/lib/demos/shop-admin/data";
import { shopData } from "@/lib/demos/shop-admin/store";
import { useDemoStore } from "@/lib/use-demo-store";
import { byCount, channelLabel, statusLabel, ui } from "./copy";
import { CHANNEL_ICON, itemCount, shortDate } from "./format";
import { ProductIcon } from "./product-icon";
import { STATUS_PILL } from "./status-pill";
import { PANEL } from "./shop-css";

const PAGE_SIZE = 15;

const FIELD =
  "min-h-11 w-full rounded-lg border border-(--line) bg-(--panel) text-base leading-[1.3] text-(--ink) transition-colors hover:border-(--muted) focus:border-(--brand)";

/** The status as a pill that is also the picker: a native `<select>` styled like `StatusPill`. */
function StatusSelect({
  order,
  fresh,
  onChange,
}: {
  order: ShopOrder;
  fresh: boolean;
  onChange: (s: ShopOrderStatus) => void;
}) {
  const lang = useLang();
  return (
    <span className="relative inline-flex">
      <select
        aria-label={fill(ui.orderStatusLabel[lang], { id: order.id })}
        value={order.status}
        onChange={(e) => onChange(e.target.value as ShopOrderStatus)}
        className={`min-h-10 cursor-pointer appearance-none rounded-full border py-1.5 pl-3.5 pr-9 text-base font-medium leading-[1.3] ${STATUS_PILL[order.status]} ${
          fresh ? "motion-safe:animate-[rd-fade_.25s_ease-out]" : ""
        }`}
      >
        {SHOP_ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabel[s][lang]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 opacity-70" aria-hidden />
    </span>
  );
}

/** Up to three product drawings, then "+n", then the piece count. */
function Items({ order }: { order: ShopOrder }) {
  const lang = useLang();
  const count = itemCount(order);
  const shown = order.items.slice(0, 3);
  const extra = order.items.length - shown.length;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-1">
        {shown.map((item) => (
          <ProductIcon key={item.sku} sku={item.sku} className="size-7" />
        ))}
        {extra > 0 && <span className="text-sm font-medium tabular-nums text-(--muted)">+{extra}</span>}
      </span>
      <span className="whitespace-nowrap leading-none tabular-nums text-(--muted)">
        {fill(byCount(count, ui.piecesOne, ui.pieces)[lang], { n: String(count) })}
      </span>
    </span>
  );
}

/**
 * One order: a grid block on phones, a table row from `sm`. Cells carry their phone position
 * (`col-start`/`row-start`) and reset it with `sm:` so the table lays them out in column order.
 */
function OrderRow({
  order,
  fresh,
  onChange,
}: {
  order: ShopOrder;
  fresh: boolean;
  onChange: (s: ShopOrderStatus) => void;
}) {
  const lang = useLang();
  const ChannelIcon = CHANNEL_ICON[order.channel];
  const cancelled = order.status === "cancelled";
  const cell = "whitespace-nowrap sm:table-cell sm:px-3 sm:py-3";

  return (
    <tr
      data-testid="order-row"
      data-order-id={order.id}
      className={`grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-4 py-3.5 sm:table-row sm:p-0 sm:hover:bg-[#f9faf9] ${
        cancelled ? "text-(--muted)" : ""
      }`}
    >
      <td className={`col-span-3 col-start-1 row-start-2 text-sm tabular-nums text-(--muted) sm:py-3 sm:pl-5 sm:pr-3 sm:text-base sm:font-medium sm:text-(--ink) sm:whitespace-nowrap sm:table-cell ${cancelled ? "sm:!text-(--muted)" : ""}`}>
        {order.id}
      </td>
      <td className={`col-start-1 row-start-3 text-(--muted) ${cell}`}>{shortDate(order.date, lang)}</td>
      <td className={`col-span-2 col-start-1 row-start-1 font-semibold sm:font-normal ${cell}`}>{order.customer[lang]}</td>
      <td className={`col-start-2 row-start-3 ${cell}`}>
        <span className="inline-flex items-center gap-1.5 text-(--muted)">
          <ChannelIcon className="size-4 shrink-0" aria-hidden />
          {channelLabel[order.channel][lang]}
        </span>
      </td>
      <td className={`col-span-2 col-start-1 row-start-4 mt-1 ${cell}`}>
        <Items order={order} />
      </td>
      <td
        className={`col-start-3 row-start-1 justify-self-end font-semibold tabular-nums sm:text-right ${cell} ${
          cancelled ? "line-through" : ""
        }`}
      >
        {formatTHB(order.total)}
      </td>
      <td className="col-start-3 row-start-4 mt-1 justify-self-end sm:table-cell sm:whitespace-nowrap sm:py-2 sm:pl-3 sm:pr-5">
        <StatusSelect order={order} fresh={fresh} onChange={onChange} />
      </td>
    </tr>
  );
}

const PAGE_BUTTON =
  "grid size-11 place-items-center rounded-lg border border-(--line) bg-(--panel) transition-colors hover:bg-(--bg) disabled:cursor-not-allowed disabled:opacity-40";

export function OrdersTable() {
  const lang = useLang();
  const [data, setData] = useDemoStore(shopData);
  const [query, setQuery] = useState("");
  // `?status=` from the overview's to-pack tile. useSearchParams, not window.location: on a client-side
  // navigation the page renders before the router updates the address bar.
  const search = useSearchParams().toString();
  const [status, setStatus] = useState<OrderFilter>(() => parseOrderFilter(search));
  const [seenSearch, setSeenSearch] = useState(search);
  const [page, setPage] = useState(1);
  // Orders whose status changed this visit fade their status in once, and stay in a status-filtered
  // list until the filter or the query string changes.
  const [changedThisVisit, setChangedThisVisit] = useState<string[]>([]);
  // The same page with a new query (e.g. the nav's plain orders link from ?status=paid) starts over from it.
  if (seenSearch !== search) {
    setSeenSearch(search);
    setStatus(parseOrderFilter(search));
    setPage(1);
    setChangedThisVisit([]);
  }
  const listTop = useRef<HTMLDivElement>(null);

  const byStatus =
    status === "all" ? data.orders : data.orders.filter((o) => o.status === status || changedThisVisit.includes(o.id));
  const rows = byStatus.filter((o) => matchesQuery(o, query));
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  const counts = Object.fromEntries(
    SHOP_ORDER_STATUSES.map((s) => [s, data.orders.filter((o) => o.status === s).length]),
  ) as Record<ShopOrderStatus, number>;

  function changeStatus(id: string, next: ShopOrderStatus) {
    setData((d) => setOrderStatus(d, id, next));
    setChangedThisVisit((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }

  function clear() {
    setQuery("");
    setStatus("all");
    setPage(1);
    setChangedThisVisit([]);
  }

  function goTo(next: number) {
    setPage(next);
    // The pager is under the last row; bring the new page's first row back into view.
    if ((listTop.current?.getBoundingClientRect().top ?? 0) < 0) listTop.current?.scrollIntoView({ block: "start" });
  }

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold leading-[1.25] sm:text-[28px]">{ui.navOrders[lang]}</h1>
        <p className="mt-1 text-base text-(--muted)">
          {fill(byCount(data.orders.length, ui.ordersSummaryOne, ui.ordersSummary)[lang], { n: String(data.orders.length) })}
          {fill(ui.ordersSummaryPack[lang], { pack: String(toPack(data).length) })}
        </p>
      </header>

      <div
        ref={listTop}
        className="mt-5 flex scroll-mt-32 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:scroll-mt-6"
      >
        <div className="relative sm:w-80 lg:w-96">
          <label htmlFor="orders-search" className="sr-only">
            {ui.searchLabel[lang]}
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-(--muted)" aria-hidden />
          <input
            id="orders-search"
            type="search"
            data-testid="orders-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={ui.searchPlaceholder[lang]}
            className={`${FIELD} py-2 pl-10 pr-3 placeholder:text-(--muted)`}
          />
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="orders-status" className="shrink-0 text-(--muted)">
            {ui.statusFilter[lang]}
          </label>
          <span className="relative flex-1 sm:w-56 sm:flex-none">
            <select
              id="orders-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as OrderFilter);
                setPage(1);
                setChangedThisVisit([]);
              }}
              className={`${FIELD} cursor-pointer appearance-none py-2 pl-3 pr-10`}
            >
              <option value="all">
                {ui.statusAll[lang]} ({data.orders.length})
              </option>
              {SHOP_ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s][lang]} ({counts[s]})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2" aria-hidden />
          </span>
        </div>
      </div>

      <div className={`mt-4 overflow-x-auto ${PANEL}`}>
        {rows.length === 0 ? (
          <div data-testid="orders-empty" className="px-6 py-14 text-center">
            <p className="font-semibold leading-[1.4]">{ui.emptyTitle[lang]}</p>
            <p className="mt-1 text-base leading-[1.5] text-(--muted)">{ui.emptyHint[lang]}</p>
            <button
              type="button"
              onClick={clear}
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-(--line) px-4 text-base font-medium transition-colors hover:bg-(--bg)"
            >
              <X className="size-4" aria-hidden />
              {ui.clearFilters[lang]}
            </button>
          </div>
        ) : (
          <>
            <table className="block w-full leading-[1.4] sm:table">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-(--line) bg-[#f9faf9] text-left text-sm text-(--muted)">
                  <th scope="col" className="py-3 pl-5 pr-3 font-medium">{ui.colOrder[lang]}</th>
                  <th scope="col" className="px-3 py-3 font-medium">{ui.colDate[lang]}</th>
                  <th scope="col" className="px-3 py-3 font-medium">{ui.colCustomer[lang]}</th>
                  <th scope="col" className="px-3 py-3 font-medium">{ui.colChannel[lang]}</th>
                  <th scope="col" className="px-3 py-3 font-medium">{ui.colItems[lang]}</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">{ui.colTotal[lang]}</th>
                  <th scope="col" className="py-3 pl-3 pr-5 font-medium">{ui.statusFilter[lang]}</th>
                </tr>
              </thead>
              <tbody className="block divide-y divide-(--line) sm:table-row-group">
                {visible.map((o) => (
                  <OrderRow
                    key={o.id}
                    order={o}
                    fresh={changedThisVisit.includes(o.id)}
                    onChange={(s) => changeStatus(o.id, s)}
                  />
                ))}
              </tbody>
            </table>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-(--line) px-4 py-3 sm:px-5">
              <p className="text-base tabular-nums text-(--muted)">
                {fill(byCount(rows.length, ui.pageRangeOne, ui.pageRange)[lang], {
                  from: String(start + 1),
                  to: String(start + visible.length),
                  n: String(rows.length),
                })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={ui.prevPage[lang]}
                  disabled={current === 1}
                  onClick={() => goTo(current - 1)}
                  className={PAGE_BUTTON}
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <span className="min-w-16 text-center text-base font-medium tabular-nums text-(--muted)">
                  {current} / {pageCount}
                </span>
                <button
                  type="button"
                  aria-label={ui.nextPage[lang]}
                  disabled={current === pageCount}
                  onClick={() => goTo(current + 1)}
                  className={PAGE_BUTTON}
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
