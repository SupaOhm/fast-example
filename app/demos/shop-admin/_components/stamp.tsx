"use client";

import { useLang } from "@/components/demo/lang";
import type { ShopOrderStatus } from "@/lib/demos/shop-admin/data";
import { statusLabel } from "./copy";

/**
 * Status ink colours. Each one is text on paper or kraft only (4.8:1 or better);
 * never on mustard or wood.
 */
export const STATUS_TEXT: Record<ShopOrderStatus, string> = {
  paid: "text-(--mustard-ink)",
  packed: "text-(--ok)",
  shipped: "text-(--ok)",
  cancelled: "text-(--warn)",
};

/** Border colour to pair with STATUS_TEXT, e.g. for a stamped `<select>`. */
export const STATUS_BORDER: Record<ShopOrderStatus, string> = {
  paid: "border-(--mustard-ink)",
  packed: "border-(--ok)",
  shipped: "border-(--ok)",
  cancelled: "border-(--warn)",
};

/**
 * A rubber stamp with the order status in the current language. It is tilted a little,
 * like it was pressed by hand. `fresh` plays the stamp-down animation once.
 */
export function Stamp({
  status,
  fresh = false,
  tilt = -6,
  className = "",
}: {
  status: ShopOrderStatus;
  fresh?: boolean;
  tilt?: number;
  className?: string;
}) {
  const lang = useLang();
  return (
    <span
      style={{ "--stamp-tilt": `${tilt}deg`, transform: `rotate(${tilt}deg)` } as React.CSSProperties}
      className={`inline-block rounded-[5px] border-2 px-2 py-px text-base font-bold leading-[1.45] whitespace-nowrap shadow-[inset_0_0_0_1.5px_var(--paper),inset_0_0_0_2.5px_currentColor] ${STATUS_TEXT[status]} ${STATUS_BORDER[status]} ${fresh ? "rd-stamp-in" : ""} ${className}`}
    >
      {statusLabel[status][lang]}
    </span>
  );
}
