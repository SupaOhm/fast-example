"use client";

import { Truck } from "lucide-react";
import Image from "next/image";
import { useLang } from "@/components/demo/lang";
import { avgRating, brand, discountPercent, fill, product } from "@/lib/demos/sale-page/content";
import { unsplash } from "@/lib/images";
import { formatTHB } from "@/lib/packages";
import { ui } from "./copy";
import { MaliBottle } from "./mali-bottle";
import { LineBubble, Stars, lineButtonClass } from "./marks";
import { Phrased } from "./phrases";

const rating = avgRating.toFixed(1);

// The one piece of unprompted motion on the page: the price sticker is slapped on once.
const stamp = `@keyframes mali-stamp{from{opacity:0;scale:1.8;rotate:-34deg}60%{opacity:1}to{opacity:1;scale:1;rotate:-10deg}}`;

export function Hero() {
  const lang = useLang();
  const h = product.headline;
  const th = lang === "th";

  return (
    <section aria-labelledby="hero-title" className="relative z-10 overflow-x-clip bg-(--green-deep) text-white">
      <style>{stamp}</style>

      <div className="relative z-10 px-5 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-16 xl:min-h-[680px] lg:px-12 lg:pt-16 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-[40rem] lg:max-w-[42rem]">
            {/* Phones stack the two parts; from tablet up they share one line. */}
            <p className="flex flex-col text-base leading-[1.5] font-semibold text-(--mint) sm:block">
              <span className="tracking-[0.14em] whitespace-nowrap">MALI BOTANICS</span>
              <span aria-hidden className="mx-2 hidden text-(--gold) sm:inline">
                ·
              </span>
              <span className="whitespace-nowrap">{brand.tagline[lang]}</span>
            </p>

            <h1
              id="hero-title"
              className={`mt-4 font-extrabold text-balance ${
                th
                  ? "text-[52px] leading-[1.2] sm:text-[72px] lg:text-[88px] lg:leading-[1.16]"
                  : "text-[44px] leading-[1.05] tracking-[-0.02em] sm:text-[64px] lg:text-[76px] lg:leading-[1.02]"
              }`}
            >
              <span className="block">{h.before[lang]}</span>
              <span className="text-(--gold)">{h.accent[lang]}</span>{" "}
              <span className="whitespace-nowrap">{h.after[lang]}</span>
            </h1>

            <p className="mt-5 max-w-[31rem] text-lg leading-[1.65] text-pretty text-(--mint) lg:mt-6 lg:text-xl lg:leading-[1.6]">
              <Phrased text={product.sub[lang]} lang={lang} />
            </p>

            <div className="mt-8 flex items-end gap-4 sm:gap-6 lg:mt-10">
              <p className="text-[108px] leading-[0.8] font-extrabold tracking-[-0.04em] text-(--gold) sm:text-[148px] lg:text-[164px]">
                {product.promoPrice}
                <span className="ml-[0.04em] text-[0.34em] tracking-normal">.-</span>
              </p>
              <div className="pb-1 leading-[1.3]">
                <s className="block text-2xl font-semibold text-(--mint)/80 decoration-(--mint)/80 decoration-2 sm:text-[28px]">
                  {formatTHB(product.fullPrice)}
                </s>
                <p className="mt-1.5 text-base whitespace-nowrap text-(--mint)">
                  {ui.size[lang]} {product.size}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
              <a
                href="#order"
                data-testid="hero-cta"
                className={`${lineButtonClass("gold")} w-full px-8 text-xl sm:w-auto`}
              >
                <LineBubble className="size-7 shrink-0" />
                {ui.orderOnLine[lang]}
              </a>
              <div className="space-y-1.5 text-base leading-[1.45] text-(--mint)">
                <p className="flex items-center gap-2">
                  <Truck className="size-5 shrink-0 text-(--gold)" strokeWidth={1.75} aria-hidden />
                  {ui.freeShipping[lang]}
                </p>
                <p className="flex flex-wrap items-center gap-x-2">
                  <Stars
                    count={Math.round(avgRating)}
                    label={fill(ui.starsLabel[lang], { count: rating })}
                    empty="var(--mint)"
                  />
                  <span>
                    <span className="font-semibold text-white">{rating}</span> {ui.ratingSuffix[lang]}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below 1280px: a band under the text. From 1280px: bleeds off the right edge behind it. */}
      <div className="relative h-[360px] sm:h-[440px] xl:absolute xl:inset-y-0 xl:right-0 xl:left-[46%] xl:h-auto">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={unsplash(product.photo, 1600)}
            alt={product.photoAlt[lang]}
            fill
            preload
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover object-[50%_40%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(23_51_31)_0%,rgb(23_51_31/0.55)_22%,transparent_55%)] xl:bg-[linear-gradient(90deg,rgb(23_51_31)_0%,rgb(23_51_31/0.82)_16%,rgb(23_51_31/0.25)_44%,transparent_62%)]"
          />
        </div>

        <div className="absolute top-[16%] right-[calc(8%+124px)] z-20 grid size-[124px] rotate-[-10deg] place-items-center rounded-full bg-(--red) text-center text-white shadow-[0_16px_30px_-10px_rgb(0_0_0/0.6)] motion-safe:animate-[mali-stamp_650ms_cubic-bezier(.2,1.4,.45,1)_350ms_both] sm:right-[calc(12%+136px)] xl:top-[14%] xl:right-[calc(12%+190px)] lg:size-[148px]">
          <span aria-hidden className="absolute inset-[6px] rounded-full border border-dashed border-white/45" />
          <p className="relative">
            <span className="block text-[36px] leading-none font-extrabold tracking-[-0.03em] lg:text-[44px]">
              −{discountPercent}%
            </span>
            <span className="mt-1 block text-base leading-[1.2] font-semibold">{ui.todayOnly[lang]}</span>
          </p>
        </div>

        <MaliBottle className="absolute right-[8%] -bottom-14 z-10 h-[300px] w-auto drop-shadow-[0_24px_30px_rgb(0_0_0/0.45)] sm:right-[12%] sm:h-[380px] xl:right-[12%] xl:-bottom-[84px] xl:h-[560px]" />
      </div>
    </section>
  );
}
