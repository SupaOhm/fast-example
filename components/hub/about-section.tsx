import type { Dictionary } from "@/lib/i18n";

export function AboutSection({ t }: { t: Dictionary }) {
  return (
    <section id="about" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-[1fr_2fr]">
        <h2 className="font-display text-3xl leading-[1.2] font-bold sm:text-4xl">{t.about.heading}</h2>
        <div>
          <p className="text-lg leading-relaxed">{t.about.body}</p>
          <a
            href="https://supakornohm.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm font-semibold underline decoration-accent decoration-2 underline-offset-4"
          >
            {t.about.portfolio} ↗
          </a>
        </div>
      </div>
    </section>
  );
}
