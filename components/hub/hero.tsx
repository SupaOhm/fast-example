import type { Dictionary } from "@/lib/i18n";
import { formatTHB, packages } from "@/lib/packages";
import { HeroWall } from "./hero-wall";
import { Scribble } from "./scribble";

const fromPrice = formatTHB(Math.min(...packages.map((p) => p.priceTHB)));

export function Hero({ t }: { t: Dictionary }) {
  // Title format: "before *accent* after\nsecond line" (checked by tests/unit/i18n.test.ts).
  const [line1, line2] = t.hero.title.split("\n");
  const [before, accent, after] = line1.split("*");
  return (
    <section className="relative overflow-hidden bg-forest text-cream">
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 lg:pt-28 lg:pb-36">
        <div className="lg:max-w-[40rem]">
          <h1 className="display-heading font-display text-[2.75rem] leading-[1.1] font-extrabold tracking-[-0.04em] sm:text-6xl lg:text-[4.5rem]">
            {before}
            <Scribble>{accent}</Scribble>
            {after}
            <br className="hidden sm:inline" /> {line2}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-cream-muted sm:text-lg">{t.hero.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#work"
              className="rounded-md bg-lime px-5 py-3 text-sm font-bold text-forest transition hover:bg-cream"
            >
              {t.hero.ctaWork}
            </a>
            <a
              href="#work"
              className="rounded-md border border-cream/25 px-5 py-3 text-sm font-semibold transition hover:border-cream"
            >
              {t.hero.ctaPrice.replace("{price}", fromPrice)}
            </a>
          </div>
        </div>
      </div>
      <HeroWall pauseLabel={t.hero.pauseMotion} playLabel={t.hero.playMotion} />
    </section>
  );
}
