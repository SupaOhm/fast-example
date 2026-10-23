"use client";

import { Ban, Clock3, PackageCheck, Truck, type LucideIcon } from "lucide-react";
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

/** Each status has its own mark, so packed and shipped (both green) differ by more than their words. */
export const STATUS_ICON: Record<ShopOrderStatus, LucideIcon> = {
  paid: Clock3,
  packed: PackageCheck,
  shipped: Truck,
  cancelled: Ban,
};

// Outlined stamps have a paper gap and a second ink ring inside the border.
const OUTLINE = "shadow-[inset_0_0_0_1.5px_var(--paper),inset_0_0_0_2.5px_currentColor]";

/**
 * The stamp's face. Shipped is the one solid stamp (paper on --ok, 5.9:1), so it reads
 * apart from the outlined "packed" stamp at a glance.
 */
const STATUS_FACE: Record<ShopOrderStatus, string> = {
  paid: `${STATUS_TEXT.paid} ${STATUS_BORDER.paid} ${OUTLINE}`,
  packed: `${STATUS_TEXT.packed} ${STATUS_BORDER.packed} ${OUTLINE}`,
  shipped: "border-(--ok) bg-(--ok) text-(--paper) shadow-[inset_0_0_0_1.5px_var(--ok),inset_0_0_0_2.5px_var(--paper)]",
  cancelled: `${STATUS_TEXT.cancelled} ${STATUS_BORDER.cancelled} ${OUTLINE}`,
};

/**
 * A rubber stamp with the order status in the current language. It is tilted a little,
 * like it was pressed by hand. `fresh` plays the stamp-down animation once. `children`
 * go inside the stamp after the label (e.g. a chevron when the stamp is a picker).
 */
export function Stamp({
  status,
  fresh = false,
  tilt = -6,
  className = "",
  children,
}: {
  status: ShopOrderStatus;
  fresh?: boolean;
  tilt?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const lang = useLang();
  const Icon = STATUS_ICON[status];
  return (
    <span
      style={{ "--stamp-tilt": `${tilt}deg`, transform: `rotate(${tilt}deg)` } as React.CSSProperties}
      className={`inline-flex items-center gap-1.5 rounded-[5px] border-2 px-2 py-px text-base font-bold leading-[1.45] whitespace-nowrap ${STATUS_FACE[status]} ${fresh ? "rd-stamp-in" : ""} ${className}`}
    >
      <Icon className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
      {statusLabel[status][lang]}
      {children}
    </span>
  );
}
