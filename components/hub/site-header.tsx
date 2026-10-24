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
    <>
      <header className="sticky top-0 z-40 border-b border-rule bg-forest/85 text-cream backdrop-blur">
        {/* Under 380px the Thai row ran 17px into the right padding (1px off screen at 360), so the gap, brand size and Hire padding tighten there. */}
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 max-[380px]:gap-2 sm:px-6">
          <a href={`/${locale}`} className="font-display text-lg font-extrabold tracking-tight max-[380px]:text-base">
            SupaOhm
          </a>
          <div className="flex items-center gap-2 sm:gap-6">
            <nav className="hidden items-center gap-6 text-sm text-cream-muted md:flex">
              {links.map(([href, label]) => (
                <a key={href} href={href} className="transition hover:text-cream">
                  {label}
                </a>
              ))}
            </nav>
            <LocaleSwitch locale={locale} path={path} ariaLabel={t.nav.switchLocaleLabel} />
            <a
              href={FASTWORK_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-lime px-3 py-2 text-sm font-bold whitespace-nowrap text-forest transition hover:bg-cream max-[380px]:px-2.5"
            >
              {t.nav.hire}
              <span className="sr-only"> {t.nav.newTab}</span>
            </a>
          </div>
        </div>
      </header>
      {/* Below md the inline nav is hidden, so the sections get their own quiet row. Not sticky: it scrolls away and the bar stays 64px. */}
      <nav aria-label={t.nav.sectionsLabel} className="border-b border-rule bg-forest text-sm text-cream-muted md:hidden">
        <div className="mx-auto flex max-w-6xl px-4 sm:px-6">
          {links.map(([href, label]) => {
            const current = href === `/${locale}/compare` && path === "/compare";
            return (
              <a
                key={href}
                href={href}
                aria-current={current ? "page" : undefined}
                className={`flex min-h-11 flex-1 items-center justify-center whitespace-nowrap transition hover:text-cream ${current ? "text-cream underline decoration-lime decoration-2 underline-offset-8" : ""}`}
              >
                {label}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
