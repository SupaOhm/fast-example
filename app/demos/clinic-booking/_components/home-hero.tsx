"use client";

import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/components/demo/lang";
import { CLOSE, OPEN } from "@/lib/demos/clinic-booking/data";
import { fill } from "@/lib/demos/format";
import { PHOTOS, unsplash } from "@/lib/images";
import { ui } from "./copy";
import { LineGlyph } from "./line-glyph";
import { NextOpening } from "./next-opening";

export const lineButton =
  "inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-(--line-green) px-7 text-[17px] font-medium text-(--ink) shadow-[0_10px_28px_-12px_rgb(4_114_58/0.65)] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#05b84e] motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--ink)";

export function HomeHero() {
  const lang = useLang();
  return (
    <section className="relative overflow-x-clip">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:pt-12 lg:pb-28">
        <div className="lg:col-span-7">
          <p className="text-(--muted)">{ui.heroKicker[lang]}</p>
          <h1 className="mt-3 text-[3.5rem] leading-[1.2] font-medium text-(--wine) sm:text-[5rem] lg:text-[6rem] lg:leading-[1.15]">
            {ui.brand[lang]}
          </h1>
          <p className="mt-4 max-w-xl text-2xl leading-[1.45] text-balance sm:text-[1.875rem]">{ui.heroPromise[lang]}</p>
          <p className="mt-5 max-w-lg text-[17px] leading-[1.75] text-(--muted)">{ui.heroBody[lang]}</p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/demos/clinic-booking/book" data-testid="book-cta" className={lineButton}>
              <LineGlyph className="size-5" />
              {ui.heroCta[lang]}
            </Link>
            <a
              href="#treatments"
              className="rounded-sm font-medium text-(--wine) underline decoration-(--accent)/40 decoration-2 underline-offset-6 hover:decoration-(--accent) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--wine)"
            >
              {ui.heroPrices[lang]}
            </a>
          </div>

          <div className="mt-9 flex flex-col items-start gap-3">
            <NextOpening />
            <p className="flex items-center gap-2 pl-1 text-(--muted)">
              <Clock className="size-4.5 shrink-0" aria-hidden />
              {fill(ui.hours[lang], { open: OPEN, close: CLOSE })}
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          {/* The ring light: Lumi's mark, drawn large behind the room. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-14 -right-24 size-[26rem] rounded-full border-[14px] border-white/70 shadow-[0_0_80px_10px_rgb(255_255_255/0.7),inset_0_0_60px_rgb(255_255_255/0.6)] sm:-right-28 sm:size-[30rem] lg:-top-20 lg:-right-32 lg:size-[34rem]"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-(--rose-2) shadow-[0_40px_80px_-40px_rgb(107_31_58/0.45)]">
            <Image
              src={unsplash(PHOTOS.clinicHero, 1100)}
              alt={ui.heroPhotoAlt[lang]}
              fill
              preload
              sizes="(min-width: 1024px) 460px, (min-width: 448px) 448px, 100vw"
              className="object-cover"
            />
          </div>

          {/* The moment the customer gets after booking: a LINE confirmation. Decorative. */}
          <div
            aria-hidden
            className="absolute -bottom-16 left-3 w-[min(20rem,calc(100%-1.5rem))] rounded-2xl bg-white p-4 shadow-[0_24px_48px_-20px_rgb(42_29_34/0.45)] sm:-bottom-10 sm:left-6 lg:-left-14 lg:bottom-12"
          >
            <div className="flex items-center gap-2 text-[14px] text-(--muted)">
              <span className="grid size-5 place-items-center rounded-[6px] bg-(--line-green)">
                <LineGlyph className="size-3.5 text-white" />
              </span>
              <span className="font-medium text-(--ink)">{ui.lineCardApp[lang]}</span>
              <span className="ml-auto">{ui.lineCardNow[lang]}</span>
            </div>
            <p className="mt-2 font-medium leading-[1.4] text-(--wine)">{ui.brand[lang]}</p>
            <p className="mt-0.5 leading-[1.55]">{ui.lineCardText[lang]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
