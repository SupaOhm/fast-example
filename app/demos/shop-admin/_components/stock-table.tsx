"use client";

import { Check, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/components/demo/lang";
import { fill, formatTHB } from "@/lib/demos/format";
import { isLowStock, updateStock, type Product } from "@/lib/demos/shop-admin/data";
import { shopData } from "@/lib/demos/shop-admin/store";
import { useDemoStore } from "@/lib/use-demo-store";
import { byCount, ui } from "./copy";
import { ProductIcon } from "./product-icon";
import { PANEL } from "./shop-css";

// updateStock throws this when the count isn't a whole number ≥ 0; anything else is shown as it comes.
const STOCK_ERROR = "Stock must be a whole number ≥ 0";

/** A `{n}` template with the number set in semibold and the words around it smaller. */
function Figure({ template, n, className = "" }: { template: string; n: number; className?: string }) {
  const [before, after = ""] = template.split("{n}");
  return (
    <dd className={`text-lg font-semibold leading-[1.3] ${className}`}>
      {before}
      <span className="tabular-nums">{n}</span>
      <span className="text-base font-medium">{after}</span>
    </dd>
  );
}

function LowBadge() {
  const lang = useLang();
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-(--warn-soft) px-2 py-0.5 text-sm font-semibold leading-[1.3] text-(--warn-ink)">
      <TriangleAlert className="size-3.5" aria-hidden />
      {ui.lowStock[lang]}
    </span>
  );
}

// The bar runs to 4× the reorder point; the tick marks where to reorder.
function StockBar({ product }: { product: Product }) {
  const max = Math.max(product.reorderAt * 4, product.stock);
  const pct = (product.stock / max) * 100;
  const tick = (product.reorderAt / max) * 100;
  const low = isLowStock(product);
  return (
    <div aria-hidden className="relative h-2 w-full max-w-45 rounded-full bg-(--bg)">
      <div className={`h-full rounded-full ${low ? "bg-(--warn)" : "bg-(--brand)"}`} style={{ width: `${pct}%` }} />
      <div className="absolute -inset-y-1 w-0.5 rounded-full bg-(--ink)/45" style={{ left: `${tick}%` }} />
    </div>
  );
}

function StockRow({ product, onSave }: { product: Product; onSave: (stock: number) => void }) {
  const lang = useLang();
  const [draft, setDraft] = useState(String(product.stock));
  const [seen, setSeen] = useState(product.stock);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Keep the input in sync when the stored value changes elsewhere (e.g. reset).
  if (seen !== product.stock) {
    setSeen(product.stock);
    setDraft(String(product.stock));
    setError(null);
  }

  const low = isLowStock(product);
  const inputId = `stock-${product.sku}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const saved = savedAt === product.stock && draft === String(product.stock) && !error;
  const errorText = error === STOCK_ERROR ? ui.stockError[lang] : error;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = draft.trim() === "" ? Number.NaN : Number(draft);
    try {
      onSave(value);
      setError(null);
      setSavedAt(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <tr
      data-testid={`stock-row-${product.sku}`}
      className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 px-4 py-4 sm:table-row sm:p-0 ${
        low ? "bg-(--warn-soft)/45" : ""
      }`}
    >
      <td className="min-w-0 sm:py-3 sm:pl-5 sm:pr-3">
        <div className="flex items-center gap-3">
          <ProductIcon sku={product.sku} className="size-10 shrink-0" />
          <div className="min-w-0 leading-[1.35]">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium">{product.name[lang]}</span>
              {low && <LowBadge />}
            </p>
            <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-(--muted)">
              <span className="tabular-nums">{product.sku}</span>
              <span className="md:hidden lg:inline xl:hidden">{product.category[lang]}</span>
            </p>
          </div>
        </div>
      </td>
      <td className="hidden px-3 py-3 text-base text-(--muted) md:table-cell lg:hidden xl:table-cell">
        {product.category[lang]}
      </td>
      <td className="pt-2 text-right text-base font-semibold tabular-nums sm:px-3 sm:py-3">{formatTHB(product.price)}</td>
      <td className="hidden min-w-28 px-3 py-3 lg:table-cell">
        <StockBar product={product} />
      </td>
      <td className="col-span-2 sm:py-3 sm:pl-3 sm:pr-5">
        <form
          onSubmit={submit}
          noValidate
          className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 gap-y-1 sm:grid-cols-[auto_auto] sm:justify-end"
        >
          <label htmlFor={inputId} className="sr-only">
            {fill(ui.onHandLabel[lang], { name: product.name[lang] })}
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            data-testid="stock-input"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hintId}
            className={`min-h-11 w-20 rounded-lg border bg-(--panel) px-2.5 text-right text-base font-semibold tabular-nums transition-colors ${
              error ? "border-(--warn)" : "border-[#8a958f] hover:border-(--muted) focus:border-(--brand)"
            }`}
          />
          <button
            type="submit"
            data-testid="stock-save"
            className="min-h-11 rounded-lg border border-(--brand) bg-(--panel) px-3.5 text-base font-semibold text-(--brand-ink) transition-colors hover:bg-(--brand-soft)"
          >
            {ui.save[lang]}
          </button>
          <span id={hintId} className="order-first text-sm leading-[1.4] text-(--muted) sm:order-none sm:col-span-2 sm:text-right">
            {saved ? (
              <span className="inline-flex items-center gap-1 font-semibold text-(--brand-ink)">
                <Check className="size-4" strokeWidth={2.6} aria-hidden />
                {ui.saved[lang]}
              </span>
            ) : (
              fill(ui.reorderAt[lang], { n: String(product.reorderAt) })
            )}
          </span>
        </form>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-sm font-semibold leading-[1.4] text-(--warn-ink) sm:text-right">
            {errorText}
          </p>
        )}
      </td>
    </tr>
  );
}

export function StockTable() {
  const lang = useLang();
  const [data, setData] = useDemoStore(shopData);
  const low = data.products.filter(isLowStock).length;
  const units = data.products.reduce((s, p) => s + p.stock, 0);
  const value = data.products.reduce((s, p) => s + p.stock * p.price, 0);
  const th = "whitespace-nowrap py-3 text-sm font-medium";

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold leading-[1.25] sm:text-[28px]">{ui.navStock[lang]}</h1>
        <p className="mt-1 max-w-[60ch] text-base text-(--muted)">{ui.stockIntro[lang]}</p>
      </header>

      <dl className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-(--line) bg-(--line) [gap:1px] sm:grid-cols-3">
        <div className="bg-(--panel) px-4 py-3 sm:px-5">
          <dt className="text-sm leading-[1.4] text-(--muted)">{ui.stockProducts[lang]}</dt>
          <Figure template={byCount(data.products.length, ui.stockItemsOne, ui.stockItems)[lang]} n={data.products.length} />
        </div>
        <div className={`px-4 py-3 sm:px-5 ${low ? "bg-(--warn-soft)" : "bg-(--panel)"} sm:order-last`}>
          <dt className={`text-sm leading-[1.4] ${low ? "text-(--warn-ink)" : "text-(--muted)"}`}>{ui.lowStock[lang]}</dt>
          <Figure template={byCount(low, ui.stockItemsOne, ui.stockItems)[lang]} n={low} className={low ? "text-(--warn-ink)" : ""} />
        </div>
        <div className="col-span-2 bg-(--panel) px-4 py-3 sm:col-span-1 sm:px-5">
          <dt className="text-sm leading-[1.4] text-(--muted)">{ui.stockValue[lang]}</dt>
          <dd className="text-lg font-semibold tabular-nums leading-[1.3]">{formatTHB(value)}</dd>
          <dd className="sr-only">{fill(byCount(units, ui.stockUnitsOne, ui.stockUnits)[lang], { n: String(units) })}</dd>
        </div>
      </dl>

      <div className={`mt-4 overflow-hidden ${PANEL}`}>
        <table className="block w-full leading-[1.4] sm:table">
          <thead className="sr-only sm:not-sr-only border-b border-(--line) bg-[#f9faf9] text-left text-(--muted) sm:table-header-group">
            <tr>
              <th scope="col" className={`${th} pl-5 pr-3`}>{ui.colProduct[lang]}</th>
              <th scope="col" className={`${th} hidden px-3 md:table-cell lg:hidden xl:table-cell`}>{ui.colCategory[lang]}</th>
              <th scope="col" className={`${th} px-3 text-right`}>{ui.colPrice[lang]}</th>
              <th scope="col" className={`${th} hidden px-3 lg:table-cell`}>{ui.colLevel[lang]}</th>
              <th scope="col" className={`${th} pl-3 pr-5 text-right`}>{ui.colOnHand[lang]}</th>
            </tr>
          </thead>
          <tbody className="block divide-y divide-(--line) sm:table-row-group">
            {data.products.map((p) => (
              <StockRow key={p.sku} product={p} onSave={(stock) => setData((d) => updateStock(d, p.sku, stock))} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
