"use client";

import { ChevronDown, ChevronRight, PackageOpen, TriangleAlert, Undo2, Wallet } from "lucide-react";
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
import { byCount, channelLabel, ui } from "./copy";
import { CHANNEL_ICON, fullDate, shortDate } from "./format";
import { ProductIcon } from "./product-icon";
import { SalesPanels } from "./sales-panels";
import { PANEL } from "./shop-css";
import { StatusPill } from "./status-pill";

const ORDERS_TO_PACK = "/demos/shop-admin/orders?status=paid";

/** Renders a `{n}` template with the number set large, keeping the words around it as they are. */
function BigCount({ template, n, numberClass = "text-(--ink)" }: { template: string; n: number; numberClass?: string }) {
  const [before, after = ""] = template.split("{n}");
  return (
    <span className="block pr-8 text-base font-medium leading-[1.35] text-(--muted)">
      {before}
      <span
        className={`my-1 block text-[34px] font-semibold leading-[1.15] tabular-nums lg:my-0 lg:inline lg:px-1.5 lg:text-[40px] ${numberClass}`}
      >
        {n}
      </span>
      {after}
    </span>
  );
}

/** The tile's call to action; the icon flows with the words, so it stays beside the last one when they wrap. */
function TileAction({ children, icon: Icon }: { children: React.ReactNode; icon: typeof ChevronRight }) {
  return (
    <span className="text-base font-medium leading-[1.4] text-(--brand-ink) group-hover:underline">
      {children}
      <Icon className="ml-0.5 inline size-4 align-[-0.15em]" aria-hidden />
    </span>
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
      className={`grid gap-x-6 gap-y-3 px-4 py-4 transition-colors sm:px-5 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto_11rem] lg:items-center ${
        packed ? "bg-(--bg)/60" : ""
      }`}
    >
      <div className="min-w-0 leading-[1.35]">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold">{order.customer[lang]}</span>
          <span className="tabular-nums text-(--muted)">{order.id}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-(--muted)">
          <ChannelIcon className="size-4 shrink-0" aria-hidden />
          {channelLabel[order.channel][lang]}
          <span aria-hidden>·</span>
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
              <span className="shrink-0 tabular-nums text-(--muted)">×{item.qty}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-4 lg:contents">
        <p className="font-semibold tabular-nums lg:text-right">{formatTHB(order.total)}</p>

        <div aria-live="polite" className="flex min-h-11 items-center justify-end gap-2">
          {packed ? (
            <>
              <StatusPill status="packed" fresh />
              <button
                type="button"
                id={`undo-${order.id}`}
                onClick={() => onUndo(order.id)}
                aria-label={fill(ui.undoLabel[lang], { id: order.id })}
                className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-base font-medium text-(--brand-ink) transition-colors hover:bg-(--brand-soft)"
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
              className="min-h-11 rounded-lg bg-(--brand) px-4 text-base font-semibold text-white transition-colors hover:bg-(--brand-ink)"
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

  const tile = `${PANEL} group relative flex flex-col justify-between gap-4 p-4 transition-colors hover:border-(--brand)/45 sm:p-5`;

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold leading-[1.25] sm:text-[28px]">{ui.greeting[lang]}</h1>
        <p className="mt-1 text-base text-(--muted)">{fill(ui.todayIs[lang], { date: fullDate(today, lang) })}</p>
      </header>

      <section aria-labelledby="todo-heading" className="mt-6">
        <h2 id="todo-heading" className="text-lg font-semibold leading-[1.3]">
          {ui.todoHeading[lang]}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
          <Link href={ORDERS_TO_PACK} data-testid="todo-pack" className={tile}>
            <PackageOpen className="absolute right-4 top-4 size-5 text-(--muted) sm:right-5 sm:top-5" aria-hidden />
            <BigCount template={byCount(packCount, ui.tileToPackOne, ui.tileToPack)[lang]} n={packCount} />
            <TileAction icon={ChevronRight}>{ui.tileToPackAction[lang]}</TileAction>
          </Link>

          <Link href="/demos/shop-admin/stock" data-testid="todo-low" className={tile}>
            <TriangleAlert
              className={`absolute right-4 top-4 size-5 sm:right-5 sm:top-5 ${lowCount > 0 ? "text-(--warn)" : "text-(--muted)"}`}
              aria-hidden
            />
            <BigCount
              template={byCount(lowCount, ui.tileLowOne, ui.tileLow)[lang]}
              n={lowCount}
              numberClass={lowCount > 0 ? "text-(--warn-ink)" : undefined}
            />
            <TileAction icon={ChevronRight}>{ui.tileLowAction[lang]}</TileAction>
          </Link>

          <a href="#sales" data-testid="todo-sold" className={`${tile} col-span-2 lg:col-span-1`}>
            <Wallet className="absolute right-4 top-4 size-5 text-(--muted) sm:right-5 sm:top-5" aria-hidden />
            <span className="block pr-8 leading-[1.35]">
              <span className="block text-base font-medium text-(--muted)">{ui.tileSoldToday[lang]}</span>
              <span className="mt-1 block text-[34px] font-semibold leading-[1.15] tabular-nums lg:text-[40px]">
                {formatTHB(sold.revenue)}
              </span>
            </span>
            <TileAction icon={ChevronDown}>
              {fill(byCount(sold.orders, ui.tileSoldTodayFootOne, ui.tileSoldTodayFoot)[lang], { n: String(sold.orders) })}
            </TileAction>
          </a>
        </div>
      </section>

      <section aria-labelledby="queue-heading" className={`${PANEL} mt-8 overflow-hidden`}>
        <header className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <h2 id="queue-heading" className="text-lg font-semibold leading-[1.3]">
            {ui.queueHeading[lang]}
          </h2>
          <p className="mt-0.5 text-sm leading-[1.5] text-(--muted)">{ui.queueHint[lang]}</p>
        </header>

        {queue.length === 0 ? (
          <p className="border-t border-(--line) px-5 py-10 text-center text-base text-(--muted)">{ui.queueEmpty[lang]}</p>
        ) : (
          <ul className="divide-y divide-(--line) border-t border-(--line)">
            {queue.map((o) => (
              <PackRow key={o.id} order={o} products={data.products} onPack={pack} onUndo={undo} />
            ))}
          </ul>
        )}
        {more > 0 && (
          <Link
            href={ORDERS_TO_PACK}
            className="flex items-center justify-center gap-1 border-t border-(--line) px-4 py-3 text-base font-medium text-(--brand-ink) transition-colors hover:bg-(--bg)"
          >
            {fill(byCount(more, ui.queueMoreOne, ui.queueMore)[lang], { n: String(more) })}
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        )}
      </section>

      <SalesPanels data={data} today={today} />
    </div>
  );
}
