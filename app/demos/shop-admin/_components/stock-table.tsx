"use client";

import { AlertTriangle, Check } from "lucide-react";
import { useState } from "react";
import { isLowStock, updateStock, type Product } from "@/lib/demos/shop-admin/data";
import { shopData } from "@/lib/demos/shop-admin/store";
import { formatTHB } from "@/lib/packages";
import { useDemoStore } from "@/lib/use-demo-store";

// updateStock throws English messages; show the shop owner a Thai one when we know it.
const THAI_ERRORS: Record<string, string> = {
  "Stock must be a whole number ≥ 0": "ใส่จำนวนเต็มตั้งแต่ 0 ขึ้นไป",
};

function LowBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-(--warn-soft) px-2 py-0.5 text-xs font-semibold leading-[1.3] text-(--warn-ink)">
      <AlertTriangle className="size-3" aria-hidden />
      ใกล้หมด
    </span>
  );
}

// Bar scaled to 4x the reorder point; the tick marks where to reorder.
function StockBar({ product }: { product: Product }) {
  const max = Math.max(product.reorderAt * 4, product.stock);
  const pct = (product.stock / max) * 100;
  const tick = (product.reorderAt / max) * 100;
  const low = isLowStock(product);
  return (
    <div aria-hidden className="relative h-2 w-full max-w-[180px] rounded-full bg-(--bg)">
      <div className={`h-full rounded-full ${low ? "bg-(--warn)" : "bg-(--brand)"}`} style={{ width: `${pct}%` }} />
      <div className="absolute -inset-y-1 w-0.5 rounded-full bg-(--ink)/45" style={{ left: `${tick}%` }} />
    </div>
  );
}

function StockRow({ product, onSave }: { product: Product; onSave: (stock: number) => void }) {
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
  const saved = savedAt === product.stock && draft === String(product.stock) && !error;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = draft.trim() === "" ? Number.NaN : Number(draft);
    try {
      onSave(value);
      setError(null);
      setSavedAt(value);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(THAI_ERRORS[message] ?? message);
    }
  }

  return (
    <tr
      data-testid={`stock-row-${product.sku}`}
      className={`grid grid-cols-[1fr_auto] gap-x-3 gap-y-3 px-4 py-4 sm:table-row sm:p-0 ${low ? "bg-(--warn-soft)/45" : ""}`}
    >
      <td className="min-w-0 sm:py-3.5 sm:pl-5 sm:pr-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium leading-[1.35]">{product.name}</span>
          {low && <LowBadge />}
        </div>
        <p className="mt-0.5 text-xs leading-[1.4] text-(--muted)">
          {product.sku}
          <span className="sm:hidden"> หมวด{product.category}</span>
        </p>
      </td>
      <td className="hidden px-3 py-3.5 text-(--muted) sm:table-cell">{product.category}</td>
      <td className="text-right font-medium tabular-nums sm:px-3 sm:py-3.5">{formatTHB(product.price)}</td>
      <td className="hidden px-3 py-3.5 lg:table-cell">
        <StockBar product={product} />
      </td>
      <td className="col-span-2 sm:py-2.5 sm:pl-3 sm:pr-5">
        <form onSubmit={submit} noValidate className="flex items-center gap-2 sm:justify-end">
          <label htmlFor={inputId} className="sr-only">
            จำนวนคงเหลือ {product.name}
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
            aria-describedby={error ? errorId : `${inputId}-hint`}
            className={`w-24 rounded-lg border bg-white px-3 py-2 text-right text-sm tabular-nums outline-none focus:ring-3 ${
              error
                ? "border-(--warn) focus:ring-(--warn)/20"
                : "border-(--line) focus:border-(--brand) focus:ring-(--brand)/15"
            }`}
          />
          <button
            type="submit"
            data-testid="stock-save"
            className="rounded-lg border border-(--brand) bg-(--panel) px-3.5 py-2 text-sm font-semibold text-(--brand-ink) hover:bg-(--brand-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
          >
            บันทึก
          </button>
          <span id={`${inputId}-hint`} className="ml-1 w-[104px] text-xs leading-[1.4] text-(--muted) sm:order-first sm:ml-0 sm:mr-1 sm:text-right">
            {saved ? (
              <span className="inline-flex items-center gap-1 font-medium text-(--brand-ink)">
                <Check className="size-3.5" aria-hidden />
                บันทึกแล้ว
              </span>
            ) : (
              <>จุดสั่งซื้อ {product.reorderAt} ชิ้น</>
            )}
          </span>
        </form>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs leading-[1.4] text-(--warn-ink) sm:text-right">
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}

export function StockTable() {
  const [data, setData] = useDemoStore(shopData);
  const low = data.products.filter(isLowStock).length;
  const units = data.products.reduce((s, p) => s + p.stock, 0);
  const value = data.products.reduce((s, p) => s + p.stock * p.price, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold leading-[1.25] sm:text-[28px]">สต็อกสินค้า</h1>
      <p className="mt-1 text-sm leading-[1.5] text-(--muted)">
        แก้จำนวนคงเหลือแล้วกดบันทึก ระบบจะแจ้งเตือนเมื่อสินค้าถึงจุดสั่งซื้อ
      </p>

      <dl className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-(--line) bg-(--line) [gap:1px]">
        <div className="bg-(--panel) px-4 py-3 sm:px-5">
          <dt className="text-xs leading-[1.4] text-(--muted)">สินค้า</dt>
          <dd className="text-lg font-semibold tabular-nums leading-[1.3]">
            {data.products.length} <span className="text-xs font-medium text-(--muted)">รายการ</span>
          </dd>
        </div>
        <div className="bg-(--panel) px-4 py-3 sm:px-5">
          <dt className="text-xs leading-[1.4] text-(--muted)">มูลค่าสต็อก</dt>
          <dd className="text-lg font-semibold tabular-nums leading-[1.3]">{formatTHB(value)}</dd>
          <dd className="sr-only">รวม {units} ชิ้น</dd>
        </div>
        <div className={`px-4 py-3 sm:px-5 ${low ? "bg-(--warn-soft)" : "bg-(--panel)"}`}>
          <dt className={`text-xs leading-[1.4] ${low ? "text-(--warn-ink)" : "text-(--muted)"}`}>ใกล้หมด</dt>
          <dd className={`text-lg font-semibold tabular-nums leading-[1.3] ${low ? "text-(--warn-ink)" : ""}`}>
            {low} <span className="text-xs font-medium">รายการ</span>
          </dd>
        </div>
      </dl>

      <div className="mt-4 overflow-hidden rounded-xl border border-(--line) bg-(--panel)">
        <table className="block w-full text-sm sm:table">
          <thead className="hidden sm:table-header-group">
            <tr className="border-b border-(--line) bg-[#f9faf9] text-left text-xs text-(--muted)">
              <th scope="col" className="py-3 pl-5 pr-3 font-medium">สินค้า</th>
              <th scope="col" className="px-3 py-3 font-medium">หมวด</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">ราคา</th>
              <th scope="col" className="hidden px-3 py-3 font-medium lg:table-cell">ระดับสต็อก</th>
              <th scope="col" className="py-3 pl-3 pr-5 text-right font-medium">คงเหลือ (ชิ้น)</th>
            </tr>
          </thead>
          <tbody className="block divide-y divide-(--line) sm:table-row-group">
            {data.products.map((p) => (
              <StockRow
                key={p.sku}
                product={p}
                onSave={(stock) => setData((d) => updateStock(d, p.sku, stock))}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
