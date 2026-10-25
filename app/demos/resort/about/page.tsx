import { Clock, Fish, MapPin, Phone, Plane, Sailboat, Waves } from "lucide-react";
import type { Metadata } from "next";
import { about, highlights, resort } from "@/lib/demos/resort/content";
import { unsplash } from "@/lib/images";
import { ui } from "../_components/copy";
import { Reveal } from "../_components/reveal";
import { T, TImage } from "@/components/demo/lang";

export const metadata: Metadata = { title: "About" };

const HIGHLIGHT_ICONS = [Waves, Fish, Sailboat];

export default function AboutPage() {
  return (
    <main className="pb-24">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-14 pb-20 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16 md:pt-20 lg:px-10">
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-md bg-(--sand-2)">
          <TImage
            src={unsplash(resort.aboutImage, 1000)}
            alt={resort.aboutAlt}
            fill
            preload
            sizes="(min-width: 768px) 45vw, 120vw"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="font-(family-name:--font-display) text-[2.4rem] leading-[1.25] text-balance text-(--sea-deep) md:text-[3.4rem] md:leading-[1.2]">
            <T value={about.heading} />
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-[1.8] text-(--ink)">
            <T value={about.body} />
          </p>
        </div>
      </section>

      <section className="bg-(--sand-2) py-20 md:py-24" aria-labelledby="about-expect">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <h2 id="about-expect" className="font-(family-name:--font-display) text-3xl leading-[1.3] text-(--sea-deep) md:text-4xl">
            <T value={ui.whatToExpect} />
          </h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {highlights.map((h, i) => {
              const Icon = HIGHLIGHT_ICONS[i];
              return (
                <li key={h.title.en} className="border-t border-(--sea)/30 pt-6">
                  <Reveal delay={i * 120}>
                    <Icon className="size-7 text-(--sea)" strokeWidth={1.4} aria-hidden />
                    <h3 className="mt-4 font-(family-name:--font-display) text-xl leading-[1.35] font-semibold text-(--sea-deep)">
                      <T value={h.title} />
                    </h3>
                    <p className="mt-2 leading-[1.7] text-(--muted)">
                      <T value={h.body} />
                    </p>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-10" aria-labelledby="about-visit">
        <Reveal>
          <h2 id="about-visit" className="font-(family-name:--font-display) text-3xl leading-[1.3] text-(--sea-deep) md:text-4xl">
            <T value={ui.visitHeading} />
          </h2>
          <ul className="mt-8 grid gap-x-8 gap-y-5 text-lg leading-[1.6] sm:grid-cols-2">
            {[
              { Icon: MapPin, value: ui.address },
              { Icon: Plane, value: ui.visitAirport },
              { Icon: Clock, value: ui.visitTimes },
              { Icon: Phone, value: ui.phone },
            ].map(({ Icon, value }) => (
              <li key={value.en} className="flex gap-3">
                <Icon className="mt-1 size-5 shrink-0 text-(--sea)" aria-hidden />
                <T value={value} />
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </main>
  );
}
