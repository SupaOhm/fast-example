"use client";

import { locales, type Locale } from "@/lib/i18n/config";

// Language names are shown in their own language, so they don't go through the dictionaries.
const NAMES: Record<Locale, string> = { en: "EN", th: "ไทย" };

// "lg" grows each half to a 44px tap target, for places with room (the footer).
const HALF = { sm: "px-2.5 py-1", lg: "flex min-h-11 items-center px-3.5" } as const;

// Both languages side by side; the current one is filled, the other is the link.
export function LocaleSwitch({
  locale,
  ariaLabel,
  path = "",
  size = "sm",
}: {
  locale: Locale;
  ariaLabel: string;
  path?: string;
  size?: keyof typeof HALF;
}) {
  return (
    <div className="flex items-center rounded-md border border-cream/40 p-0.5 text-sm font-semibold">
      {[...locales].reverse().map((l) =>
        l === locale ? (
          <span key={l} aria-current="true" className={`rounded bg-cream text-forest ${HALF[size]}`}>
            {NAMES[l]}
          </span>
        ) : (
          <a
            key={l}
            href={`/${l}${path}`}
            hrefLang={l}
            aria-label={ariaLabel}
            onClick={(e) => {
              e.preventDefault();
              // Full navigation on purpose: hub and demos use different root layouts.
              // Keep ?service= and #anchors so the visitor stays where they were.
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination
              window.location.assign(`/${l}${path}${window.location.search}${window.location.hash}`);
            }}
            className={`rounded text-cream-muted transition hover:text-cream ${HALF[size]}`}
          >
            {NAMES[l]}
          </a>
        ),
      )}
    </div>
  );
}
