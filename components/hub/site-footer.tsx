import type { Dictionary, Locale } from "@/lib/i18n";
import { FASTWORK_PROFILE_URL, packagesByService, services } from "@/lib/packages";
import { LocaleSwitch } from "./locale-switch";

const TIERS = ["basic", "standard", "premium"] as const;

// "Brand — what it is". When it wraps, the dash ends the first line and the description moves down whole.
function DemoName({ name }: { name: string }) {
  const [brand, what] = name.split(" — ");
  if (what === undefined) return name;
  return (
    <>
      {brand}&nbsp;— <span className="inline-block">{what}</span>
    </>
  );
}

export function SiteFooter({ locale, t, path = "" }: { locale: Locale; t: Dictionary; path?: string }) {
  const links = [
    [`/${locale}#work`, t.nav.work],
    [`/${locale}/compare`, t.nav.compare],
    [`/${locale}#process`, t.nav.process],
    [`/${locale}#about`, t.nav.about],
  ] as const;
  return (
    <footer className="bg-forest text-cream">
      <div className="bg-lime text-forest">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="display-heading max-w-3xl font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-6xl">
            {t.cta.heading}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg">{t.cta.body}</p>
          <a
            href={FASTWORK_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-md bg-forest px-6 py-3.5 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest text-lime transition hover:bg-forest-2"
          >
            {t.cta.button}
            <span className="sr-only"> {t.nav.newTab}</span>
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 lg:pt-20 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-lime">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.6fr)_minmax(0,2.1fr)] lg:gap-x-12">
          {/* Brand block. Trust signals (BACKLOG #3) will go under the profile row once Ohm has the real numbers. */}
          <div className="@container">
            {/* Sized to the column: the wordmark is 4.48em wide, so 22cqw spans the brand block at every width. */}
            <p className="font-display text-[min(22cqw,7rem)] leading-[0.85] font-extrabold tracking-[-0.055em]">
              SupaOhm
            </p>
            <p className="mt-5 max-w-[34ch] leading-relaxed text-cream-muted">{t.footer.tagline}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href={FASTWORK_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-semibold underline decoration-lime decoration-2 underline-offset-[6px] transition hover:text-lime"
              >
                {t.footer.profile} ↗<span className="sr-only"> {t.nav.newTab}</span>
              </a>
              {/* LocaleSwitch is shared with the header; here its two halves grow to a 44px tap target. */}
              <div className="[&>div>*]:flex [&>div>*]:min-h-11 [&>div>*]:items-center [&>div>*]:px-3.5">
                <LocaleSwitch locale={locale} path={path} ariaLabel={t.nav.switchLocaleLabel} />
              </div>
            </div>
          </div>
          <nav aria-label={t.footer.siteLabel}>
            <h2 className="text-sm font-semibold text-cream-muted">{t.footer.siteLabel}</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 md:grid-cols-1">
              {links.map(([href, label]) => {
                const current = href === `/${locale}/compare` && path === "/compare";
                return (
                  <li key={href}>
                    <a
                      href={href}
                      aria-current={current ? "page" : undefined}
                      className={`flex min-h-11 items-center text-lg font-semibold transition hover:text-lime ${current ? "underline decoration-lime decoration-2 underline-offset-8" : ""}`}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <nav aria-label={t.footer.demosLabel} className="md:col-span-2 lg:col-span-1">
            <h2 className="text-sm font-semibold text-cream-muted">{t.footer.demosLabel}</h2>
            {/* From sm the two groups share row tracks (subgrid), so the tiers and their rules line up across. */}
            <div className="mt-4 grid gap-y-10 sm:grid-cols-2 sm:grid-rows-[repeat(4,auto)] sm:gap-x-10 sm:gap-y-0">
              {services.map((service) => {
                const pkgs = packagesByService(service.id).sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier));
                return (
                  <div key={service.id} className={`acc-${service.accent} sm:row-span-4 sm:grid sm:grid-rows-subgrid`}>
                    <h3 className="flex items-center gap-2.5 border-b border-rule pb-3 font-display text-2xl leading-none font-extrabold tracking-[-0.03em]">
                      <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-(--acc)" />
                      {service.name[locale]}
                    </h3>
                    <ul className="sm:row-span-3 sm:grid sm:grid-rows-subgrid">
                      {pkgs.map((pkg) => (
                        <li key={pkg.id} className="border-b border-rule">
                          <a href={pkg.demoPath} className="group block min-h-11 py-3">
                            <span className="block text-sm font-semibold text-(--acc)">
                              {pkg.tier[0].toUpperCase() + pkg.tier.slice(1)}
                            </span>
                            <span className="sr-only"> · </span>
                            <span className="mt-0.5 block leading-snug text-cream decoration-(--acc) decoration-2 underline-offset-4 transition group-hover:underline">
                              <DemoName name={pkg.demoName[locale]} />
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
        <div className="mt-16 flex flex-col gap-2 border-t border-rule py-6 text-sm text-cream-muted sm:flex-row sm:items-center sm:justify-between lg:mt-20">
          <p className="text-pretty">{t.footer.note}</p>
          <p>© {new Date().getFullYear()} SupaOhm</p>
        </div>
      </div>
    </footer>
  );
}
