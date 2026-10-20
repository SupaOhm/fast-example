import type { Dictionary, Locale } from "@/lib/i18n";
import { packages, packagesByService } from "@/lib/packages";
import { ProjectRow } from "./project-row";

export function WorkSection({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="work" className="scroll-mt-16 bg-forest text-cream">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <h2 className="display-heading font-display text-5xl leading-none font-extrabold tracking-[-0.04em] sm:text-7xl">
          {t.work.heading}
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream-muted">{t.work.intro}</p>
        {(["web", "app"] as const).map((service) => (
          <div key={service} className="mt-16">
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="display-heading font-display text-2xl font-extrabold text-lime">
                {t.work.groups[service].label}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-cream-muted">{t.work.groups[service].description}</p>
            </div>
            {packagesByService(service).map((pkg) => (
              <ProjectRow key={pkg.id} pkg={pkg} index={packages.indexOf(pkg)} locale={locale} t={t} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
