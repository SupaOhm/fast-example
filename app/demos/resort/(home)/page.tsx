import type { Metadata } from "next";
import Link from "next/link";
import { GALLERY } from "@/lib/demos/resort/content";
import { unsplash } from "@/lib/images";
import { AvailabilityStrip } from "../_components/availability-strip";
import { ui } from "../_components/copy";
import { EditorialFacts } from "../_components/editorial-facts";
import { Moonrise } from "../_components/moonrise";
import { MoonriseHero } from "../_components/moonrise-hero";
import { Reveal } from "../_components/reveal";
import { RoomRail } from "../_components/room-rail";
import { T, TImage } from "@/components/demo/lang";

export const metadata: Metadata = { title: "Boutique resort in Ao Nang" };

const [, , poolVilla, , longtail, , breakfast, daybeds] = GALLERY;

const btn =
  "inline-flex h-12 items-center justify-center rounded-full px-7 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

export default function ResortHome() {
  return (
    <main>
      <MoonriseHero />

      <AvailabilityStrip />

      <EditorialFacts />

      <RoomRail />

      {/* Gallery teaser */}
      <section className="bg-(--sand-2) py-20 md:py-28" aria-labelledby="home-gallery">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="home-gallery" className="font-(family-name:--font-display) text-3xl leading-[1.25] text-(--sea-deep) md:text-5xl">
                <T value={ui.galleryHeading} />
              </h2>
              <Link
                href="/demos/resort/gallery"
                className="font-semibold text-(--sea) underline decoration-(--sun) decoration-2 underline-offset-8 hover:text-(--sea-deep) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--sea)"
              >
                <T value={ui.openGallery} />
              </Link>
            </div>
          </Reveal>
          <Reveal className="mt-10 md:mt-14">
            <div className="grid grid-cols-2 gap-3 md:h-[600px] md:grid-cols-4 md:grid-rows-2 md:gap-4">
              {[
                { photo: poolVilla, cls: "col-span-2 aspect-[4/3] md:aspect-auto md:row-span-2" },
                { photo: longtail, cls: "row-span-2 md:aspect-auto" },
                { photo: breakfast, cls: "aspect-square md:aspect-auto" },
                { photo: daybeds, cls: "aspect-square md:aspect-auto" },
              ].map(({ photo, cls }) => (
                <div key={photo.id} className={`relative overflow-hidden rounded-md bg-(--sand) ${cls}`}>
                  <TImage
                    src={unsplash(photo.id, 1100)}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Booking CTA: the moonrise */}
      <section className="overflow-hidden bg-(--sea-deep) text-(--sand)">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-24 lg:px-10">
          <Reveal className="md:order-2">
            <Moonrise className="mx-auto w-full max-w-md" />
          </Reveal>
          <Reveal>
            <h2 className="font-(family-name:--font-display) text-3xl leading-[1.35] text-balance md:text-5xl md:leading-[1.3]">
              <T value={ui.ctaHeading} />
            </h2>
            <p className="mt-5 max-w-md text-lg leading-[1.7] text-(--sand)/80">
              <T value={ui.ctaBody} />
            </p>
            <Link
              href="/demos/resort/booking"
              className={`${btn} mt-8 bg-(--sun) text-(--sea-deep) hover:bg-[#e6b75a] focus-visible:outline-(--sun)`}
            >
              <T value={ui.ctaButton} />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
