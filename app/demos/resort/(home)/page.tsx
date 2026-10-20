import { Fish, MapPin, Maximize2, Sailboat, Users, Waves } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GALLERY, ROOMS, highlights, resort } from "@/lib/demos/resort/content";
import { unsplash } from "@/lib/images";
import { formatTHB } from "@/lib/packages";
import { ui } from "../_components/copy";
import { Moonrise } from "../_components/moonrise";
import { Reveal } from "../_components/reveal";
import { T, TImage } from "../_components/t";

export const metadata: Metadata = { title: "Boutique resort in Ao Nang" };

const HIGHLIGHT_ICONS = [Waves, Fish, Sailboat];
const TEASER_ROOMS = ["sea-deluxe", "family-suite", "pool-villa"].map((id) => ROOMS.find((r) => r.id === id)!);
const [, , poolVilla, , longtail, , breakfast, daybeds] = GALLERY;

const btn =
  "inline-flex h-12 items-center justify-center rounded-full px-7 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

export default function ResortHome() {
  return (
    <main>
      {/* Hero */}
      <section className="relative isolate flex h-[100svh] min-h-[620px] items-end overflow-hidden bg-(--sea-deep) text-white">
        <TImage
          src={unsplash(resort.heroImage, 2000)}
          alt={{ th: "ชายหาดและทะเลอันดามันหน้ารีสอร์ท", en: "The beach and the Andaman Sea in front of the resort" }}
          fill
          preload
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(18_59_57/0.55)_0%,rgb(18_59_57/0)_28%,rgb(18_59_57/0.1)_50%,rgb(12_41_40/0.88)_100%)]"
        />
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 md:pb-28 lg:px-10">
          <p className="flex items-center gap-2 text-[15px] text-white/90">
            <MapPin className="size-4 text-(--sun)" aria-hidden />
            <T value={resort.location} />
          </p>
          <h1 className="mt-4 max-w-4xl font-(family-name:--font-display) text-[2.6rem] leading-[1.2] text-balance sm:text-6xl lg:text-[5.25rem] lg:leading-[1.15]">
            <T value={resort.tagline} />
          </h1>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/demos/resort/booking" className={`${btn} bg-(--sun) text-(--sea-deep) hover:bg-[#e6b75a] focus-visible:outline-(--sun)`}>
              <T value={ui.checkAvailability} />
            </Link>
            <Link
              href="/demos/resort/rooms"
              className={`${btn} border border-white/60 text-white backdrop-blur-sm hover:bg-white/10 focus-visible:outline-white`}
            >
              <T value={ui.viewRooms} />
            </Link>
          </div>
        </div>
      </section>

      {/* Intro and highlights */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-10">
        <Reveal>
          <p className="max-w-4xl font-(family-name:--font-display) text-[1.75rem] leading-[1.5] text-(--sea-deep) md:text-[2.6rem] md:leading-[1.45]">
            <T value={resort.intro} />
          </p>
        </Reveal>
        <ul className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
          {highlights.map((h, i) => {
            const Icon = HIGHLIGHT_ICONS[i];
            return (
              <li key={h.title.en} className="border-t border-(--sea)/30 pt-6">
                <Reveal delay={i * 120}>
                  <Icon className="size-7 text-(--sea)" strokeWidth={1.4} aria-hidden />
                  <h2 className="mt-4 font-(family-name:--font-display) text-xl leading-[1.35] font-semibold text-(--sea-deep)">
                    <T value={h.title} />
                  </h2>
                  <p className="mt-2 leading-[1.7] text-(--muted)">
                    <T value={h.body} />
                  </p>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Room teaser */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:pb-28 lg:px-10" aria-labelledby="home-rooms">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="home-rooms" className="font-(family-name:--font-display) text-3xl leading-[1.25] text-(--sea-deep) md:text-5xl">
              <T value={ui.roomsHeading} />
            </h2>
            <Link
              href="/demos/resort/rooms"
              className="font-semibold text-(--sea) underline decoration-(--sun) decoration-2 underline-offset-8 hover:text-(--sea-deep) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--sea)"
            >
              <T value={ui.allRooms} />
            </Link>
          </div>
        </Reveal>
        <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
          {TEASER_ROOMS.map((room, i) => (
            <li key={room.id} className={i === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}>
              <Reveal delay={i * 120}>
                <Link
                  href="/demos/resort/rooms"
                  className="group block rounded-t-[999px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--sea)"
                >
                  <div className={`relative overflow-hidden rounded-t-[999px] rounded-b-md bg-(--sand-2) ${i === 2 ? "aspect-[3/4] sm:aspect-[16/9] lg:aspect-[3/4]" : "aspect-[3/4]"}`}>
                    <TImage
                      src={unsplash(room.image, 900)}
                      alt={room.name}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </div>
                  <h3 className="mt-5 font-(family-name:--font-display) text-2xl leading-[1.3] text-(--sea-deep)">
                    <T value={room.name} />
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px] text-(--muted)">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4 text-(--sea)" aria-hidden />
                      {room.guests} <T value={ui.guestsUnit} />
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="size-4 text-(--sea)" aria-hidden />
                      {room.sizeSqm} <T value={ui.sqm} />
                    </span>
                    <span className="ml-auto text-(--ink)">
                      <T value={ui.fromPerNight} /> <strong className="font-semibold">{formatTHB(room.pricePerNight)}</strong>{" "}
                      <T value={ui.perNight} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

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
