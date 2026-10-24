"use client";

import { useLang } from "@/components/demo/lang";
import type { ShopOrderStatus } from "@/lib/demos/shop-admin/data";
import { statusLabel } from "./copy";

/** Background, text and border for each status. Every pair is AA on its own background. */
export const STATUS_PILL: Record<ShopOrderStatus, string> = {
  paid: "bg-[#fdf3dc] text-[#8a3c0b] border-[#f3dfae]",
  packed: "bg-[#e8effd] text-[#1d4ed8] border-[#c9d8fb]",
  shipped: "bg-(--brand-soft) text-(--brand-ink) border-[#c5e3d4]",
  cancelled: "bg-[#eef1ef] text-(--muted) border-(--line)",
};

/**
 * A small rounded pill with the order status in the current language. `fresh` fades it in
 * once (only when motion is allowed). `children` go after the label, e.g. a chevron when the
 * pill fronts a picker.
 */
export function StatusPill({
  status,
  fresh = false,
  className = "",
  children,
}: {
  status: ShopOrderStatus;
  fresh?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const lang = useLang();
  return (
    <span
      data-testid="status-pill"
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-sm font-medium leading-[1.45] ${STATUS_PILL[status]} ${
        fresh ? "motion-safe:animate-[rd-fade_.25s_ease-out]" : ""
      } ${className}`}
    >
      {statusLabel[status][lang]}
      {children}
    </span>
  );
}
