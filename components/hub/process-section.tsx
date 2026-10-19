import type { Dictionary } from "@/lib/i18n";

export function ProcessSection({ t }: { t: Dictionary }) {
  return (
    <section id="process" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{t.process.heading}</h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {t.process.steps.map((step, i) => (
            <li key={step.title} className="bg-paper p-6">
              <span className="font-display text-sm font-bold text-accent">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
