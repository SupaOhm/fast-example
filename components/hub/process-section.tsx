import type { Dictionary } from "@/lib/i18n";

export function ProcessSection({ t }: { t: Dictionary }) {
  return (
    <section id="process" className="scroll-mt-16 border-t border-rule bg-forest text-cream">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <h2 className="display-heading font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-5xl">
          {t.process.heading}
        </h2>
        <ol className="mt-12 grid gap-8 lg:grid-cols-5 lg:gap-6">
          {t.process.steps.map((step, i) => (
            <li key={step.title} className="border-l border-rule pl-6 lg:border-t lg:border-l-0 lg:pt-6 lg:pl-0">
              <span className="font-display text-sm font-extrabold text-lime">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
