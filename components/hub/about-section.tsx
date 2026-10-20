import type { Dictionary } from "@/lib/i18n";

const STACK = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Python", "PostgreSQL", "Supabase", "Vercel"];

export function AboutSection({ t }: { t: Dictionary }) {
  return (
    <section id="about" className="scroll-mt-16 border-t border-rule bg-forest text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[3fr_2fr] lg:py-24">
        <div>
          <h2 className="display-heading font-display text-4xl leading-none font-extrabold tracking-[-0.04em] sm:text-5xl">
            {t.about.heading}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-cream-muted">{t.about.body}</p>
          <a
            href="https://supakornohm.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm font-semibold underline decoration-lime decoration-2 underline-offset-4 transition hover:text-lime"
          >
            {t.about.portfolio} ↗
            <span className="sr-only"> {t.nav.newTab}</span>
          </a>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-cream-muted">{t.about.stackHeading}</h3>
          <p className="mt-2 text-sm leading-relaxed text-cream-muted">{t.about.stackBody}</p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-display text-2xl font-extrabold tracking-[-0.02em]">
            {STACK.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
