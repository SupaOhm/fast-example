"use client";

import { useLang } from "@/components/demo/lang";
import type { L } from "@/lib/demos/lang";

/** A <dl> whose aria-label follows the demo language, so server pages can still label it. */
export function LabelledDl({ label, className, children }: { label: L; className?: string; children: React.ReactNode }) {
  const lang = useLang();
  return (
    <dl aria-label={label[lang]} className={className}>
      {children}
    </dl>
  );
}
