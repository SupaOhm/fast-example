"use client";

import { locales, type Locale } from "@/lib/i18n/config";

// Language names are shown in their own language, so they don't go through the dictionaries.
const NAMES: Record<Locale, string> = { en: "EN", th: "ไทย" };

// Both languages side by side; the current one is filled, the other is the link.
export function LocaleSwitch({ locale, ariaLabel, path = "" }: { locale: Locale; ariaLabel: string; path?: string }) {
  return (
    <div className="flex items-center rounded-md border border-cream/40 p-0.5 text-sm font-semibold">
      {[...locales].reverse().map((l) =>
        l === locale ? (
          <span key={l} aria-current="true" className="rounded bg-cream px-2.5 py-1 text-forest">
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
            className="rounded px-2.5 py-1 text-cream-muted transition hover:text-cream"
          >
            {NAMES[l]}
          </a>
        ),
      )}
    </div>
  );
}
