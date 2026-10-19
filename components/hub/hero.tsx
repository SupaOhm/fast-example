import type { Dictionary } from "@/lib/i18n";
import { FASTWORK_PROFILE_URL } from "@/lib/packages";

export function Hero({ t }: { t: Dictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
      <p className="text-sm font-medium tracking-wide text-muted">{t.hero.eyebrow}</p>
      <h1 className="mt-5 max-w-4xl font-display text-[2.6rem] font-bold leading-[1.15] tracking-tight sm:text-7xl">
        {t.hero.title}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t.hero.subtitle}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href="#services"
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent"
        >
          {t.hero.ctaDemos}
        </a>
        <a
          href={FASTWORK_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold transition hover:border-ink"
        >
          {t.hero.ctaFastwork}
        </a>
      </div>
    </section>
  );
}
