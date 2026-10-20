import type { Dictionary, Locale } from "@/lib/i18n";
import { packagesByService } from "@/lib/packages";
import { PackageCard } from "./package-card";

export function ServicesSection({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="work" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="max-w-2xl font-display text-3xl font-bold leading-[1.2] sm:text-4xl">{t.services.heading}</h2>
        {(["web", "app"] as const).map((service) => (
          <div key={service} className="mt-14">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h3 className="font-display text-2xl font-bold">{t.services[service].title}</h3>
              <p className="max-w-md text-sm leading-relaxed text-muted">{t.services[service].description}</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {packagesByService(service).map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} locale={locale} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
