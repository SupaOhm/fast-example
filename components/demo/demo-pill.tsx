"use client";

import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/components/demo/lang";
import type { Lang } from "@/lib/demos/lang";
import { formatTHB, getPackage, type PackageId } from "@/lib/packages";

const copy: Record<Lang, Record<"back" | "order" | "note" | "collapse" | "expand", string>> = {
  th: {
    back: "กลับหน้าผลงาน",
    order: "สั่งแพ็กเกจนี้",
    note: "เว็บตัวอย่าง · ธุรกิจสมมติ",
    collapse: "ย่อแถบ",
    expand: "แสดงแถบตัวอย่าง",
  },
  en: {
    back: "Back to showcase",
    order: "Order this package",
    note: "Demo · fictional business",
    collapse: "Collapse bar",
    expand: "Show demo bar",
  },
};

export function DemoPill({ packageId }: { packageId: PackageId }) {
  const pkg = getPackage(packageId);
  // The bar speaks the demo's language, so one screen never mixes two. Hub and demo locales share the same codes.
  const locale = useLang();
  const [open, setOpen] = useState(true);
  const c = copy[locale];
  const font = { fontFamily: "var(--font-demo-pill), ui-sans-serif, system-ui, sans-serif" };

  if (!open) {
    return (
      <button
        type="button"
        data-testid="demo-pill"
        aria-label={c.expand}
        onClick={() => setOpen(true)}
        style={font}
        className="fixed bottom-4 right-4 z-[100] grid size-11 place-items-center rounded-full bg-neutral-950 text-white shadow-lg"
      >
        <ChevronUp className="size-5" aria-hidden />
      </button>
    );
  }

  return (
    <div
      data-testid="demo-pill"
      style={font}
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-xl items-center gap-1 rounded-full bg-neutral-950/95 p-1.5 text-white shadow-2xl backdrop-blur"
    >
      <Link
        href={`/${locale}#work`}
        aria-label={c.back}
        className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm hover:bg-white/10"
      >
        <ArrowLeft className="size-4" aria-hidden />
        <span className="hidden sm:inline">{c.back}</span>
      </Link>
      <div className="min-w-0 flex-1 px-1 leading-[1.2]">
        <p className="truncate text-sm font-semibold">
          {pkg.title[locale]} · {formatTHB(pkg.priceTHB)}
        </p>
        <p className="truncate text-[11px] text-white/60">{c.note}</p>
      </div>
      <a
        href={pkg.fastworkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-neutral-950 hover:bg-white/90"
      >
        {c.order}
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
      <button
        type="button"
        aria-label={c.collapse}
        onClick={() => setOpen(false)}
        className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/10"
      >
        <ChevronDown className="size-4" aria-hidden />
      </button>
    </div>
  );
}
