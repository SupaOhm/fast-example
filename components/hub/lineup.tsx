import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatTHB, packagesByService, type Package, type Service } from "@/lib/packages";
import { PlanStack } from "./plan-stack";
import { SpecCell } from "./spec-cell";

// One service's plans side by side. On md+ each column is a subgrid, so the same row lines up across plans.
export function Lineup({ service, locale, t }: { service: Service; locale: Locale; t: Dictionary }) {
  return (
    <div className={`acc-${service.accent}`}>
      <h3 className="display-heading font-display text-3xl leading-tight font-extrabold tracking-[-0.03em]">
        {service.lede[locale]}
      </h3>
      <p className="mt-2 max-w-[60ch] leading-relaxed text-cream-muted">{service.sub[locale]}</p>
      <div className="relative -mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-x-7 md:gap-y-0 md:overflow-visible md:px-0 md:pb-0">
        {packagesByService(service.id).map((pkg) => (
          <PlanCard key={pkg.id} pkg={pkg} service={service} locale={locale} t={t} />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Link
          href={`/${locale}/compare?service=${service.id}`}
          prefetch={false}
          className="rounded-full border border-cream/40 px-6 py-3 font-semibold transition hover:border-cream"
        >
          {t.work.compare}
        </Link>
      </div>
    </div>
  );
}

function PlanCard({ pkg, service, locale, t }: { pkg: Package; service: Service; locale: Locale; t: Dictionary }) {
  const rows = service.lineupRows.flatMap((key) => service.rows.filter((r) => r.key === key));
  return (
    // 10 children = 10 subgrid rows: stack, name, tagline, price, buttons, demo line, 4 specs.
    <article
      data-testid={`plan-${pkg.id}`}
      className="flex w-[85%] shrink-0 snap-center flex-col text-center md:row-span-10 md:grid md:w-auto md:grid-rows-subgrid"
    >
      <PlanStack pages={pkg.pages} className="mb-10 aspect-[5/2] w-full" />
      <h4 className="font-display text-[32px] leading-none font-extrabold tracking-[-0.04em]">{t.work.tiers[pkg.tier]}</h4>
      <p className="mx-auto mt-2 max-w-[30ch] text-sm leading-relaxed text-cream-muted">{pkg.tagline[locale]}</p>
      <p className="mt-3 font-display text-2xl font-extrabold tracking-[-0.02em]">{formatTHB(pkg.priceTHB)}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2.5">
        <Link
          href={pkg.demoPath}
          prefetch={false}
          className="rounded-full bg-(--acc) px-[18px] py-2.5 text-sm font-bold text-forest transition hover:bg-cream"
        >
          {t.work.tryDemo}
        </Link>
        <a
          href={pkg.fastworkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-(--acc)/55 px-[18px] py-2.5 text-sm font-bold text-(--acc) transition hover:border-(--acc)"
        >
          {t.work.order} ↗<span className="sr-only"> {t.nav.newTab}</span>
        </a>
      </div>
      <p className="mt-2.5 text-xs text-cream-muted">{t.work.demo.replace("{name}", pkg.demoName[locale])}</p>
      {rows.map((row, i) => (
        <div key={row.key} className={i === 0 ? "mt-7 border-t border-rule px-1.5 pt-5" : "px-1.5 pt-4"}>
          <SpecCell
            row={row}
            value={pkg.values[row.key]}
            locale={locale}
            yes={t.work.included}
            no={t.work.notIncluded}
          />
        </div>
      ))}
    </article>
  );
}
