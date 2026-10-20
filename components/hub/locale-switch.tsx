"use client";

import type { Locale } from "@/lib/i18n/config";

export function LocaleSwitch({
  locale,
  label,
  ariaLabel,
  path = "",
}: {
  locale: Locale;
  label: string;
  ariaLabel: string;
  path?: string;
}) {
  const target = locale === "th" ? "en" : "th";
  return (
    <a
      href={`/${target}${path}`}
      hrefLang={target}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        // Full navigation on purpose: hub and demos use different root layouts.
        // Keep ?service= and #anchors so the visitor stays where they were.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(`/${target}${path}${window.location.search}${window.location.hash}`);
      }}
      className="rounded-md border border-cream/40 px-3 py-1.5 text-sm font-semibold transition hover:border-cream"
    >
      {label}
    </a>
  );
}
