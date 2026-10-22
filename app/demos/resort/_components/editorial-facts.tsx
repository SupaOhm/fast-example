import { facts, resort } from "@/lib/demos/resort/content";
import { unsplash } from "@/lib/images";
import { Reveal } from "./reveal";
import { T, TImage } from "@/components/demo/lang";

/** The intro sentence, then three big facts set like a magazine spread. */
export function EditorialFacts() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-10">
      <Reveal>
        <p className="max-w-4xl font-(family-name:--font-display) text-[1.75rem] leading-[1.5] text-(--sea-deep) md:text-[2.6rem] md:leading-[1.45]">
          <T value={resort.intro} />
        </p>
      </Reveal>
      <ul className="mt-14 grid gap-14 md:mt-20 md:grid-cols-3 md:gap-8 lg:gap-12">
        {facts.map((fact, i) => (
          <li key={fact.figure}>
            <Reveal delay={i * 120}>
              <p className="flex items-baseline gap-2 border-t border-(--sea)/25 pt-6 font-(family-name:--font-display) text-(--sea)">
                <span className="text-[4.5rem] leading-[0.95] tracking-[-0.02em] tabular-nums lg:text-[5.5rem]">{fact.figure}</span>
                {fact.unit && (
                  <span className="text-2xl leading-none lg:text-[1.75rem]">
                    <T value={fact.unit} />
                  </span>
                )}
              </p>
              <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-[6px] bg-(--sand-2)">
                <TImage
                  src={unsplash(fact.photo, 900)}
                  alt={fact.alt}
                  fill
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="object-cover"
                />
              </div>
              <h2 className="mt-6 font-(family-name:--font-display) text-xl leading-[1.35] text-(--sea-deep) md:text-[1.375rem]">
                <T value={fact.title} />
              </h2>
              <p className="mt-2 max-w-[38ch] leading-[1.7] text-(--muted)">
                <T value={fact.body} />
              </p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
