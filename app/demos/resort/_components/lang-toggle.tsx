"use client";

import { resortLang } from "@/lib/demos/resort/lang-store";
import { ui } from "./copy";
import { useLang } from "./t";

export function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang();
  const next = lang === "th" ? "en" : "th";
  return (
    <button
      type="button"
      data-testid="lang-toggle"
      onClick={() => resortLang.set(next)}
      aria-label={lang === "th" ? ui.switchToEn.th : ui.switchToTh.en}
      className={`grid h-10 min-w-10 place-items-center rounded-full border border-current/35 px-3 text-[13px] font-semibold tracking-wide transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${className}`}
    >
      {lang === "th" ? "EN" : "TH"}
    </button>
  );
}
