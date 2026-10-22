"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useLang } from "@/components/demo/lang";
import { avgRating, benefits, brand, faqs, fill, ingredients, reviews } from "@/lib/demos/sale-page/content";
import { unsplash } from "@/lib/images";
import { ui } from "./copy";
import { JasmineMark, Stars } from "./marks";
import { Phrased } from "./phrases";

const wrap = "px-5 sm:px-8 lg:px-12";
const h2 = "text-[34px] leading-[1.2] font-extrabold sm:text-5xl sm:leading-[1.15] lg:text-[56px]";

export function Benefits() {
  const lang = useLang();
  return (
    <section aria-labelledby="benefits-title" className={`bg-(--green-deep) py-20 text-white lg:py-28 ${wrap}`}>
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <h2 id="benefits-title" className={`${h2} max-w-[16ch]`}>
          <Phrased text={ui.benefitsHeading[lang]} lang={lang} />
        </h2>
        <ul className="grid gap-x-12 sm:grid-cols-2">
          {benefits.map((b) => (
            <li key={b.title.en} className="border-t border-(--mint)/20 pt-6 pb-8 sm:pb-10">
              <h3 className="text-2xl leading-[1.3] font-extrabold text-(--gold) lg:text-[28px]">{b.title[lang]}</h3>
              <p className="mt-2 max-w-[30ch] text-lg leading-[1.6] text-(--mint)">
                <Phrased text={b.body[lang]} lang={lang} />
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Ingredients() {
  const lang = useLang();
  const [lead, ...rest] = ingredients;
  return (
    <section aria-labelledby="ingredients-title" className={`py-20 lg:py-28 ${wrap}`}>
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h2 id="ingredients-title" className={`${h2} max-w-[18ch]`}>
            <Phrased text={ui.ingredientsHeading[lang]} lang={lang} />
          </h2>
          <p className="mt-4 max-w-lg text-lg leading-[1.65] text-pretty text-(--muted)">
            <Phrased text={ui.ingredientsSub[lang]} lang={lang} />
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:grid-rows-2 lg:gap-6">
          {/* The base of the serum gets the big frame; the two supporting extracts sit beside it. */}
          <li className="flex flex-col overflow-hidden rounded-[20px] bg-(--green-deep) text-white sm:col-span-2 lg:col-span-1 lg:row-span-2">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[340px] lg:flex-1">
              <Image
                src={unsplash(lead.image, 1100)}
                alt={lead.name[lang]}
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="text-[28px] leading-[1.25] font-extrabold text-(--gold) lg:text-[32px]">
                {lead.name[lang]}
              </h3>
              <p className="mt-2 text-lg leading-[1.6] text-(--mint)">
                <Phrased text={lead.body[lang]} lang={lang} />
              </p>
            </div>
          </li>
          {rest.map((ing) => (
            <li
              key={ing.name.en}
              className="flex flex-col overflow-hidden rounded-[20px] bg-(--paper) ring-1 ring-(--ink)/8 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-7 lg:pr-7"
            >
              <div className="relative aspect-[16/9] lg:aspect-auto">
                <Image
                  src={unsplash(ing.image, 700)}
                  alt={ing.name[lang]}
                  fill
                  sizes="(min-width: 1024px) 260px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 lg:self-center lg:px-0 lg:py-8">
                <h3 className="text-[22px] leading-[1.3] font-extrabold sm:text-2xl">{ing.name[lang]}</h3>
                <p className="mt-1.5 text-base leading-[1.6] text-(--muted) sm:text-lg">
                  <Phrased text={ing.body[lang]} lang={lang} />
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Reviews() {
  const lang = useLang();
  return (
    <section aria-labelledby="reviews-title" className={`bg-(--green-deep) py-20 text-white lg:py-28 ${wrap}`}>
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
        <div>
          <h2 id="reviews-title" className={`${h2} max-w-[14ch]`}>
            <Phrased text={ui.reviewsHeading[lang]} lang={lang} />
          </h2>
          <div className="mt-8 flex items-end gap-5 lg:mt-12">
            <p className="text-[104px] leading-[0.8] font-extrabold tracking-[-0.04em] text-(--gold) lg:text-[128px]">
              {avgRating.toFixed(1)}
            </p>
            <div className="pb-1">
              <Stars
                count={Math.round(avgRating)}
                label={fill(ui.starsLabel[lang], { count: avgRating.toFixed(1) })}
                starClassName="size-6"
              />
              <p className="mt-2 text-base leading-[1.4] text-(--mint)">{ui.ratingSuffix[lang]}</p>
            </div>
          </div>
        </div>

        <div>
          <ul className="border-b border-(--mint)/20">
            {reviews.map((r) => (
              <li key={r.name.en} className="border-t border-(--mint)/20 py-7 lg:py-9">
                <figure className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-10">
                  <blockquote className="text-xl leading-[1.55] text-pretty lg:text-2xl lg:leading-[1.5]">
                    “<Phrased text={r.text[lang]} lang={lang} />”
                  </blockquote>
                  <figcaption className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2 sm:pt-1.5">
                    <Stars
                      count={r.stars}
                      label={fill(ui.starsLabel[lang], { count: String(r.stars) })}
                      empty="var(--mint)"
                    />
                    <span className="text-base leading-[1.4] font-semibold text-(--gold)">{r.name[lang]}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-[1.5] text-(--mint)">{ui.reviewsNote[lang]}</p>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const lang = useLang();
  return (
    <section aria-labelledby="faq-title" className={`bg-(--mint) py-20 lg:py-28 ${wrap}`}>
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28">
          <h2 id="faq-title" className={h2}>
            {ui.faqHeading[lang]}
          </h2>
          <p className="mt-4 max-w-sm text-lg leading-[1.65] text-pretty text-(--muted)">
            <Phrased text={ui.faqSub[lang]} lang={lang} />
          </p>
        </div>
        <div className="border-b border-(--ink)/15">
          {faqs.map((f) => (
            <details key={f.q.en} data-testid="faq-item" className="group border-t border-(--ink)/15">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-md py-6 text-lg leading-[1.45] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--green-deep) sm:text-xl [&::-webkit-details-marker]:hidden">
                <span>
                  <Phrased text={f.q[lang]} lang={lang} />
                </span>
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-(--green-deep) text-(--gold) transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                >
                  <Plus className="size-5" strokeWidth={2.25} />
                </span>
              </summary>
              <p className="max-w-[60ch] pr-14 pb-7 text-lg leading-[1.7] text-pretty text-(--muted)">
                <Phrased text={f.a[lang]} lang={lang} />
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const lang = useLang();
  return (
    <footer className={`bg-(--green-deep) pt-14 pb-28 text-white sm:pb-32 ${wrap}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2.5">
            <JasmineMark className="size-8 text-(--cream)" />
            <span className="text-2xl leading-[1.25] font-extrabold">{brand.name}</span>
          </p>
          <p className="mt-2 text-base leading-[1.5] text-(--mint)">
            <Phrased text={brand.tagline[lang]} lang={lang} />
          </p>
        </div>
        <p className="text-sm leading-[1.5] text-(--mint)">{ui.legal[lang]}</p>
      </div>
    </footer>
  );
}
