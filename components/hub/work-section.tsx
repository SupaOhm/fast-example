import type { Dictionary, Locale } from "@/lib/i18n";
import { serviceTiles, services } from "@/lib/packages";
import { Lineup } from "./lineup";
import { WorkTabs } from "./work-tabs";

export function WorkSection({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="work" className="scroll-mt-16 overflow-x-clip bg-forest text-cream">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <h2 className="display-heading font-display text-5xl leading-none font-extrabold tracking-[-0.04em] sm:text-7xl">
          {t.work.heading}
        </h2>
        <div className="mt-8">
          <WorkTabs
            tiles={serviceTiles(locale)}
            label={t.work.servicesLabel}
            plansFrom={t.work.plansFrom}
            panels={services.map((s) => (
              <Lineup key={s.id} service={s} locale={locale} t={t} />
            ))}
          />
        </div>
      </div>
    </section>
  );
}
