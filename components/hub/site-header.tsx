import type { Dictionary, Locale } from "@/lib/i18n";
import { FASTWORK_PROFILE_URL } from "@/lib/packages";
import { LocaleSwitch } from "./locale-switch";

export function SiteHeader({ locale, t, path = "" }: { locale: Locale; t: Dictionary; path?: string }) {
  const links = [
    [`/${locale}#work`, t.nav.work],
    [`/${locale}/compare`, t.nav.compare],
    [`/${locale}#process`, t.nav.process],
    [`/${locale}#about`, t.nav.about],
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-forest/85 text-cream backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Narrow phones: brand and Hire go short so Compare fits on one line (measured: the full row needs 450px in Thai).
            The full words stay in the accessible names. */}
        <a href={`/${locale}`} className="font-display text-lg font-extrabold tracking-tight whitespace-nowrap">
          <span aria-hidden className="min-[450px]:hidden">
            SO
          </span>
          <span className="max-[450px]:sr-only">SupaOhm</span>
        </a>
        <div className="flex items-center gap-2 sm:gap-6">
          {/* Below md only Compare shows: it's a separate page, the others are anchors on the hub. */}
          <nav className="flex items-center gap-6 text-sm text-cream-muted">
            {links.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`${href.endsWith("/compare") ? "" : "hidden md:inline "}whitespace-nowrap transition hover:text-cream`}
              >
                {label}
              </a>
            ))}
          </nav>
          <LocaleSwitch locale={locale} path={path} ariaLabel={t.nav.switchLocaleLabel} />
          <a
            href={FASTWORK_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-lime px-3 py-2 text-sm font-bold whitespace-nowrap text-forest transition hover:bg-cream"
          >
            <span aria-hidden className="min-[400px]:hidden">
              {t.nav.hireShort}
            </span>
            <span className="max-[400px]:sr-only">{t.nav.hire}</span>
            <span className="sr-only"> {t.nav.newTab}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
