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
  type Product,
  type ShopOrder,
  type ShopOrderStatus,
} from "@/lib/demos/shop-admin/data";
import { shopData } from "@/lib/demos/shop-admin/store";
import { useDemoStore } from "@/lib/use-demo-store";
import { byCount, channelLabel, statusLabel, ui } from "./copy";
import { CHANNEL_ICON, itemCount, shortDate } from "./format";
import { ProductIcon } from "./product-icon";
import { Stamp } from "./stamp";

const PAGE_SIZE = 15;

const FIELD =
  "min-h-11 w-full rounded-md border-[1.5px] border-(--line) bg-(--paper) text-base leading-[1.3] text-(--ink) transition-colors hover:border-(--muted) focus:border-(--ink)";

const MONO = "font-(family-name:--font-mono)";

/** Each receipt is stamped at its own slight angle, the same one every time. */
const tiltFor = (id: string) => ((Number(id.replace(/\D/g, "")) * 7) % 9) - 6;

/**
 * The status stamp is the picker: a native `<select>` lies over it, invisible, so a tap
 * on the stamp opens the list of statuses. The ring shows on the stamp when the select has focus.
 */
function StampPicker({
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
    <span className="relative inline-flex min-h-11 shrink-0 items-center rounded-md px-1.5 transition-colors hover:bg-(--bg)/70 has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-2 has-[select:focus-visible]:outline-(--ink)">
      <Stamp key={order.status} status={order.status} fresh={fresh} tilt={tiltFor(order.id)}>
        <ChevronDown className="-mr-0.5 size-4 shrink-0 opacity-80" strokeWidth={2.4} aria-hidden />
      </Stamp>
      <select
        aria-label={fill(ui.orderStatusLabel[lang], { id: order.id })}
        value={order.status}
        onChange={(e) => onChange(e.target.value as ShopOrderStatus)}
        className="absolute inset-0 cursor-pointer appearance-none text-base opacity-0"
      >
        {SHOP_ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabel[s][lang]}
          </option>
        ))}
      </select>
    </span>
  );
}

/** One order as a till slip: torn edges, the items, a dashed rule, the total and its stamp. */
function Receipt({
  order,
  products,
  fresh,
  onChange,
}: {
  order: ShopOrder;
  products: Product[];
  fresh: boolean;
  onChange: (s: ShopOrderStatus) => void;
}) {
  const lang = useLang();
  const ChannelIcon = CHANNEL_ICON[order.channel];
  const cancelled = order.status === "cancelled";

  return (
    <li data-testid="receipt" data-order-id={order.id} className="min-w-0 [filter:drop-shadow(0_1.5px_0_var(--line))_drop-shadow(0_6px_8px_rgba(43,34,23,.09))]">
      <article
        aria-label={order.id}
        className="rd-receipt bg-(--paper) bg-[linear-gradient(90deg,rgba(43,34,23,.035),transparent_12%,transparent_88%,rgba(43,34,23,.035))] px-5 pb-7 pt-7 leading-[1.35]"
      >
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`${MONO} text-lg font-semibold leading-[1.3]`}>{order.id}</p>
            <p className="text-sm text-(--muted)">{shortDate(order.date, lang)}</p>
          </div>
          <StampPicker order={order} fresh={fresh} onChange={onChange} />
        </header>

        <p className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
          <span className="font-semibold">{order.customer[lang]}</span>
          <span className="inline-flex items-center gap-1.5 text-sm text-(--muted)">
            <ChannelIcon className="size-4 shrink-0" aria-hidden />
            {channelLabel[order.channel][lang]}
          </span>
        </p>

        <ul className="mt-3.5 flex flex-col gap-2.5 border-t-[1.5px] border-dashed border-(--line) pt-3.5">
          {order.items.map((item) => {
            const product = products.find((p) => p.sku === item.sku);
            return (
              <li key={item.sku} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5">
                <ProductIcon sku={item.sku} className="size-9" />
                <span className="min-w-0">
                  {product?.name[lang] ?? item.sku}
                  <span className="whitespace-nowrap tabular-nums text-(--muted)"> ×{item.qty}</span>
                </span>
                <span className={`${MONO} self-start pt-px text-base ${cancelled ? "text-(--muted)" : ""}`}>
                  {product ? formatTHB(product.price * item.qty) : ""}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-3.5 flex items-baseline justify-between gap-3 border-t-[1.5px] border-dashed border-(--line) pt-3">
          <span>
            <span className="font-bold">{ui.receiptTotal[lang]}</span>
            <span className="ml-2 text-sm text-(--muted)">{fill(byCount(itemCount(order), ui.piecesOne, ui.pieces)[lang], { n: String(itemCount(order)) })}</span>
          </span>
          <span
            className={`${MONO} text-[22px] font-semibold leading-[1.2] ${
              cancelled ? "text-(--muted) line-through decoration-(--warn) decoration-2" : ""
            }`}
          >
            {formatTHB(order.total)}
          </span>
        </p>
      </article>
    </li>
  );
}

const PAGE_BUTTON =
  "grid size-11 place-items-center rounded-md border-[1.5px] border-(--ink) bg-(--paper) transition-colors hover:bg-(--ink) hover:text-(--paper) disabled:cursor-not-allowed disabled:border-(--line) disabled:bg-transparent disabled:text-(--muted) disabled:opacity-60";

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
  // Receipts restamped during this visit play the stamp-down once, and stay in a status-filtered list
  // until the filter or the query string changes.
  const [restamped, setRestamped] = useState<string[]>([]);
  // The same page with a new query (e.g. the nav's plain orders link from ?status=paid) starts over from it.
  if (seenSearch !== search) {
    setSeenSearch(search);
    setStatus(parseOrderFilter(search));
    setPage(1);
    setRestamped([]);
  }
  const listTop = useRef<HTMLDivElement>(null);

  const byStatus =
    status === "all" ? data.orders : data.orders.filter((o) => o.status === status || restamped.includes(o.id));
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
    setRestamped((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }

  function clear() {
    setQuery("");
    setStatus("all");
    setPage(1);
    setRestamped([]);
  }

  function goTo(next: number) {
    setPage(next);
    // The pager is under the last receipt; bring the new page's first receipt back into view.
    if ((listTop.current?.getBoundingClientRect().top ?? 0) < 0) listTop.current?.scrollIntoView({ block: "start" });
  }

  return (
    <div>
      <header>
        <h1 className="text-[32px] font-bold leading-[1.2] lg:text-[40px]">{ui.navOrders[lang]}</h1>
        <p className="mt-1 text-base text-(--muted)">
          {fill(byCount(data.orders.length, ui.ordersSummaryOne, ui.ordersSummary)[lang], { n: String(data.orders.length) })}
          {fill(ui.ordersSummaryPack[lang], { pack: String(toPack(data).length) })}
        </p>
      </header>

      <div
        ref={listTop}
        className="mt-6 flex scroll-mt-32 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:scroll-mt-6"
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
          <label htmlFor="orders-status" className="shrink-0 font-semibold">
            {ui.statusFilter[lang]}
          </label>
          <span className="relative flex-1 sm:w-56 sm:flex-none">
            <select
              id="orders-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as OrderFilter);
                setPage(1);
                setRestamped([]);
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

      {rows.length === 0 ? (
        <div className="mt-6 [filter:drop-shadow(0_1.5px_0_var(--line))_drop-shadow(0_6px_8px_rgba(43,34,23,.09))]">
          <div
            data-testid="orders-empty"
            className="rd-receipt mx-auto max-w-md bg-(--paper) px-6 pb-10 pt-10 text-center leading-[1.4]"
          >
            <p className="text-lg font-bold">{ui.emptyTitle[lang]}</p>
            <p className="mt-1.5 text-base text-(--muted)">{ui.emptyHint[lang]}</p>
            <button
              type="button"
              onClick={clear}
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-md border-[1.5px] border-(--ink) px-4 text-base font-semibold transition-colors hover:bg-(--ink) hover:text-(--paper)"
            >
              <X className="size-4" aria-hidden />
              {ui.clearFilters[lang]}
            </button>
          </div>
        </div>
      ) : (
        <>
          <ul className="mt-6 grid items-start gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((o) => (
              <Receipt
                key={o.id}
                order={o}
                products={data.products}
                fresh={restamped.includes(o.id)}
                onChange={(s) => changeStatus(o.id, s)}
              />
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t-[1.5px] border-(--line) pt-4">
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
              <span className="min-w-16 text-center text-base font-semibold tabular-nums">
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
  );
}
