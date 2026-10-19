"use client";

import type { Locale } from "@/lib/i18n/config";

export function LocaleSwitch({ locale, label, ariaLabel }: { locale: Locale; label: string; ariaLabel: string }) {
  const target = locale === "th" ? "en" : "th";
  return (
    <a
      href={`/${target}`}
      hrefLang={target}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        // Full navigation on purpose: hub and demos use different root layouts.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(`/${target}${window.location.hash}`);
      }}
      className="rounded-full border border-ink/15 px-3.5 py-1.5 text-sm font-semibold transition hover:border-ink"
    >
      {label}
    </a>
  );
}
