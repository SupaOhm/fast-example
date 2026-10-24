import type { Dictionary } from "@/lib/i18n";

export function AboutSection({ t }: { t: Dictionary }) {
  const [before, after] = t.about.body.split("{name}");
  return (
    <section id="about" className="scroll-mt-16 border-t border-rule bg-forest text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1.3fr_1fr] lg:py-24">
        <div>
          <h2 className="display-heading font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-5xl">
            {t.about.heading}
          </h2>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-cream-muted">
            {before}
            <strong className="font-semibold text-cream">{t.about.name}</strong>
            {after}
          </p>
          <a
            href="https://supakornohm.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm font-semibold underline decoration-lime decoration-2 underline-offset-4 transition hover:text-lime"
          >
            {t.about.portfolio} <span aria-hidden>↗</span><span className="sr-only"> {t.nav.newTab}</span>
          </a>
        </div>
        <dl className="grid content-start gap-3 md:pt-3">
          {t.about.facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-[7rem_1fr] gap-3 border-b border-rule pb-3 text-sm">
              <dt className="text-cream-muted">{fact.label}</dt>
              <dd>
                {fact.value.split("\n").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
