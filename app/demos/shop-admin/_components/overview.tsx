"use client";

import { ChevronDown, ChevronRight, PackageOpen, TriangleAlert, Undo2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/components/demo/lang";
import { toISODate } from "@/lib/dates";
import { fill, formatTHB } from "@/lib/demos/format";
import {
  isLowStock,
  markPacked,
  packingQueue,
  salesOn,
  setOrderStatus,
  toPack,
  type ShopOrder,
  type Product,
} from "@/lib/demos/shop-admin/data";
import { shopData } from "@/lib/demos/shop-admin/store";
import { useDemoStore } from "@/lib/use-demo-store";
import { channelLabel, ui } from "./copy";
import { CHANNEL_ICON, fullDate, shortDate } from "./format";
import { ProductIcon } from "./product-icon";
import { SalesPanels } from "./sales-panels";
import { Stamp } from "./stamp";

const ORDERS_TO_PACK = "/demos/shop-admin/orders?status=paid";

/** Renders a `{n}` template with the number set large, keeping the words around it as they are. */
function BigCount({ template, n, numberClass }: { template: string; n: number; numberClass: string }) {
  const [before, after = ""] = template.split("{n}");
  return (
    <span className="block pr-8 text-lg font-semibold leading-[1.25]">
      {before}
      <span className={`my-1 block text-[44px] font-bold leading-none tabular-nums lg:my-0 lg:inline lg:px-1 lg:text-[56px] ${numberClass}`}>{n}</span>
      {after}
    </span>
  );
}

/** A strip of packing tape holding a paper tile to the counter. */
function Tape({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute -top-2.5 h-5 w-16 bg-(--mustard)/75 shadow-[0_1px_1px_rgba(43,34,23,.15)] ${className}`}
    />
  );
}

function PackRow({
  order,
  products,
  onPack,
  onUndo,
}: {
  order: ShopOrder;
  products: Product[];
  onPack: (id: string) => void;
  onUndo: (id: string) => void;
}) {
  const lang = useLang();
  const packed = order.status === "packed";
  const ChannelIcon = CHANNEL_ICON[order.channel];

  return (
    <li
      data-testid="pack-row"
      data-order-id={order.id}
      className={`grid gap-x-6 gap-y-3 px-4 py-4 transition-colors sm:px-5 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto_11.5rem] lg:items-center ${
        packed ? "bg-(--bg)/45" : ""
      }`}
    >
      <div className="min-w-0 leading-[1.35]">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-(family-name:--font-mono) text-base font-semibold">{order.id}</span>
          <span className="font-semibold">{order.customer[lang]}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-(--muted)">
          <ChannelIcon className="size-4 shrink-0" aria-hidden />
          {channelLabel[order.channel][lang]}
          <span aria-hidden className="mx-0.5 h-3.5 w-px bg-(--line)" />
          {shortDate(order.date, lang)}
        </p>
      </div>

      <ul className="flex min-w-0 flex-col gap-1.5">
        {order.items.map((item) => {
          const product = products.find((p) => p.sku === item.sku);
          return (
            <li key={item.sku} className="flex items-center gap-2.5 leading-[1.3]">
              <ProductIcon sku={item.sku} className="size-8" />
              <span className="min-w-0 truncate">{product?.name[lang] ?? item.sku}</span>
              <span className="shrink-0 text-base tabular-nums text-(--muted)">×{item.qty}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-4 border-t border-dashed border-(--line) pt-3 lg:contents">
        <p className="font-(family-name:--font-mono) text-base font-semibold lg:text-right">{formatTHB(order.total)}</p>

        <div aria-live="polite" className="flex min-h-11 items-center justify-end gap-3">
          {packed ? (
            <>
              <Stamp status="packed" fresh tilt={-7} />
              <button
                type="button"
                id={`undo-${order.id}`}
                onClick={() => onUndo(order.id)}
                aria-label={fill(ui.undoLabel[lang], { id: order.id })}
                className="inline-flex min-h-11 items-center gap-1 rounded-md px-1.5 text-base font-semibold underline decoration-(--line) decoration-2 underline-offset-4 hover:decoration-(--ink)"
              >
                <Undo2 className="size-4" aria-hidden />
                {ui.undo[lang]}
              </button>
            </>
          ) : (
            <button
              type="button"
              id={`pack-${order.id}`}
              onClick={() => onPack(order.id)}
              aria-label={fill(ui.markPackedLabel[lang], { id: order.id })}
              className="min-h-11 rounded-md border-2 border-(--ink) bg-(--mustard) px-4 font-bold text-(--ink) shadow-[0_3px_0_var(--ink)] transition-[box-shadow] motion-safe:transition-[transform,box-shadow] motion-safe:hover:-translate-y-px hover:shadow-[0_4px_0_var(--ink)] motion-safe:active:translate-y-[3px] active:shadow-none"
            >
              {ui.markPacked[lang]}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export function Overview() {
  const lang = useLang();
  const [data, setData] = useDemoStore(shopData);
  // Rendered only after hydration (RequireSession), so reading the clock here is safe.
  const [today] = useState(() => new Date());
  // Orders packed during this visit keep their row, so the owner can see it worked and undo.
  const [packedHere, setPackedHere] = useState<string[]>([]);

  const packCount = toPack(data).length;
  const lowCount = data.products.filter(isLowStock).length;
  const sold = salesOn(data, toISODate(today));
  const queue = packingQueue(data, packedHere);
  const more = packCount - queue.filter((o) => o.status === "paid").length;

  const focusLater = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus());

  function pack(id: string) {
    setData((d) => markPacked(d, id));
    setPackedHere((ids) => (ids.includes(id) ? ids : [...ids, id]));
    focusLater(`undo-${id}`);
  }

  function undo(id: string) {
    setData((d) => setOrderStatus(d, id, "paid"));
    setPackedHere((ids) => ids.filter((x) => x !== id));
    focusLater(`pack-${id}`);
  }

  const tileBase =
    "group relative flex flex-col justify-between gap-4 rounded-lg p-4 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 sm:p-5";

  return (
    <div>
      <header>
        <h1 className="text-[32px] font-bold leading-[1.2] lg:text-[40px]">{ui.greeting[lang]}</h1>
        <p className="mt-1 text-base text-(--muted)">{fill(ui.todayIs[lang], { date: fullDate(today, lang) })}</p>
      </header>

      <section aria-labelledby="todo-heading" className="mt-6">
        <h2 id="todo-heading" className="text-lg font-bold leading-[1.3]">
          {ui.todoHeading[lang]}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-[1fr_1fr_1.3fr] lg:gap-5">
          <Link
            href={ORDERS_TO_PACK}
            data-testid="todo-pack"
            className={`${tileBase} border-[1.5px] border-(--line) bg-(--paper) shadow-[0_2px_0_var(--line)]`}
          >
            <Tape className="left-6 -rotate-3" />
            <PackageOpen className="absolute right-4 top-4 size-6 text-(--muted)" aria-hidden />
            <BigCount template={ui.tileToPack[lang]} n={packCount} numberClass="" />
            <span className="inline-flex items-center gap-0.5 text-base font-semibold text-(--mustard-ink) group-hover:underline">
              {ui.tileToPackAction[lang]}
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </span>
          </Link>

          <Link
            href="/demos/shop-admin/stock"
            data-testid="todo-low"
            className={`${tileBase} border-[1.5px] border-(--line) bg-(--paper) shadow-[0_2px_0_var(--line)]`}
          >
            <Tape className="right-8 rotate-2" />
            <TriangleAlert className="absolute right-4 top-4 size-6 text-(--warn)" aria-hidden />
            <BigCount template={ui.tileLow[lang]} n={lowCount} numberClass="text-(--warn)" />
            <span className="inline-flex items-center gap-0.5 text-base font-semibold text-(--mustard-ink) group-hover:underline">
              {ui.tileLowAction[lang]}
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </span>
          </Link>

          <a
            href="#sales"
            data-testid="todo-sold"
            className={`${tileBase} rd-wood col-span-2 bg-(--wood) text-(--bg) shadow-[0_3px_0_#120d07] lg:col-span-1`}
          >
            <span className="text-base font-semibold">{ui.tileSoldToday[lang]}</span>
            <span className="block rounded-md border border-(--mustard)/35 bg-black/25 px-3.5 py-2.5 text-right shadow-[inset_0_2px_6px_rgba(0,0,0,.45)]">
              <span className="font-(family-name:--font-mono) text-[34px] font-semibold leading-[1.1] text-(--mustard) lg:text-[40px]">
                {formatTHB(sold.revenue)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-base group-hover:underline">
              {fill(ui.tileSoldTodayFoot[lang], { n: String(sold.orders) })}
              <ChevronDown className="size-4 shrink-0 text-(--mustard)" aria-hidden />
            </span>
          </a>
        </div>
      </section>

      <section aria-labelledby="queue-heading" className="mt-10">
        <h2 id="queue-heading" className="text-[22px] font-bold leading-[1.3]">
          {ui.queueHeading[lang]}
        </h2>
        <p className="mt-1 text-base text-(--muted)">{ui.queueHint[lang]}</p>

        <div className="mt-4 overflow-hidden rounded-lg border-[1.5px] border-(--line) bg-(--paper) shadow-[0_2px_0_var(--line)]">
          {queue.length === 0 ? (
            <p className="px-5 py-10 text-center text-lg font-semibold">{ui.queueEmpty[lang]}</p>
          ) : (
            <ul className="divide-y-[1.5px] divide-dashed divide-(--line)">
              {queue.map((o) => (
                <PackRow key={o.id} order={o} products={data.products} onPack={pack} onUndo={undo} />
              ))}
            </ul>
          )}
          {more > 0 && (
            <Link
              href={ORDERS_TO_PACK}
              className="flex items-center justify-center gap-1 border-t-[1.5px] border-(--line) bg-(--bg)/40 px-4 py-3 font-semibold text-(--mustard-ink) hover:underline"
            >
              {fill(ui.queueMore[lang], { n: String(more) })}
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </section>

      <SalesPanels data={data} today={today} />
    </div>
  );
}
