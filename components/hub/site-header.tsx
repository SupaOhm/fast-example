import type { Dictionary, Locale } from "@/lib/i18n";
import { LocaleSwitch } from "./locale-switch";

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    ["#services", t.nav.services],
    ["#process", t.nav.process],
    ["#stack", t.nav.stack],
    ["#about", t.nav.about],
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href={`/${locale}`} className="font-display text-lg font-bold tracking-tight">
          SupaOhm
        </a>
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="transition hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
        <LocaleSwitch locale={locale} label={t.nav.switchLocale} ariaLabel={t.nav.switchLocaleLabel} />
      </div>
    </header>
  );
}
