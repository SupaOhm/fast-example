"use client";

import { Truck } from "lucide-react";
import { useLang } from "@/components/demo/lang";
import { bundles, fill, product } from "@/lib/demos/sale-page/content";
import { formatTHB } from "@/lib/packages";
import { ui } from "./copy";
import { MaliBottle } from "./mali-bottle";
import { Phrased } from "./phrases";
import { LineBubble, lineButtonClass } from "./marks";

export function OrderSection() {
  const lang = useLang();
  return (
    <section
      id="order"
      aria-labelledby="order-title"
      className="scroll-mt-20 bg-(--cream) px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2
            id="order-title"
            className="text-[34px] leading-[1.2] font-extrabold sm:text-5xl sm:leading-[1.15] lg:text-[56px]"
          >
            {ui.orderHeading[lang]}
          </h2>
          <p className="mt-4 text-lg leading-[1.65] text-pretty text-(--muted)">
            <Phrased text={fill(ui.orderSub[lang], { price: formatTHB(product.fullPrice) })} lang={lang} />
          </p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3 md:items-center lg:mt-16 lg:gap-8">
          {bundles.map((b) => {
            const hi = b.highlight;
            return (
              <li
                key={b.id}
                data-testid="bundle"
                className={`relative flex flex-col rounded-[24px] p-5 sm:p-7 ${
                  hi
                    ? "bg-(--green-deep) text-white shadow-[0_30px_50px_-30px_rgb(23_51_31/0.8)] md:py-10"
                    : "bg-(--paper) ring-1 ring-(--ink)/10"
                }`}
              >
                {hi && (
                  <span className="absolute top-6 right-6 rounded-full bg-(--gold) px-3.5 py-1 text-base leading-[1.4] font-semibold text-(--green-deep) sm:top-7 sm:right-7">
                    {ui.bestSeller[lang]}
                  </span>
                )}

                {/* the bottles in the set, standing on a shelf line */}
                <div
                  className={`flex h-[136px] items-end gap-2 border-b-2 pl-1 ${
                    hi ? "border-(--gold)/40" : "border-(--ink)/12"
                  }`}
                >
                  {Array.from({ length: b.qty }, (_, k) => (
                    <MaliBottle key={k} decorative className="-mb-1 h-[128px] w-auto" />
                  ))}
                </div>

                <h3 className="mt-6 text-[28px] leading-[1.25] font-extrabold">{b.label[lang]}</h3>
                <p
                  className={`mt-1 text-base leading-[1.5] font-semibold ${hi ? "text-(--gold)" : "text-(--gold-ink)"}`}
                >
                  {b.note[lang]}
                </p>

                <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className={`text-[52px] leading-none font-extrabold tracking-[-0.03em] ${hi ? "text-(--gold)" : "text-(--ink)"}`}
                  >
                    {formatTHB(b.price)}
                  </span>
                  {b.qty > 1 && (
                    <span className={`text-base leading-[1.4] ${hi ? "text-(--mint)" : "text-(--muted)"}`}>
                      {fill(ui.perBottle[lang], { price: formatTHB(Math.round(b.price / b.qty)) })}
                    </span>
                  )}
                </p>
                <p
                  className={`mt-3 flex items-center gap-2 text-base leading-[1.5] ${hi ? "text-(--mint)" : "text-(--muted)"}`}
                >
                  <Truck className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
                  {ui.delivery[lang]}
                </p>

                <a href="#order" className={`${lineButtonClass(hi ? "gold" : "ink")} mt-7 px-4 text-[19px] sm:px-5`}>
                  <LineBubble className="size-6 shrink-0" />
                  {ui.bundleCta[lang]}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
