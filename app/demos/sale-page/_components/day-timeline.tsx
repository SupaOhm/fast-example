"use client";

import { useLang } from "@/components/demo/lang";
import { days } from "@/lib/demos/sale-page/content";
import { ui } from "./copy";
import { Phrased } from "./phrases";

// The dots brighten from deep green to jasmine gold, the way the copy says skin does.
const dots = ["bg-(--green-deep)", "bg-[#6f8f5f]", "bg-(--gold) ring-4 ring-(--gold)/35"];

export function DayTimeline() {
  const lang = useLang();
  return (
    <section
      aria-labelledby="days-title"
      className="bg-(--cream) px-5 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12 lg:pt-32 lg:pb-24"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="days-title"
          className="max-w-[18ch] text-[26px] leading-[1.25] font-extrabold sm:text-4xl lg:max-w-none"
        >
          <Phrased text={ui.daysHeading[lang]} lang={lang} />
        </h2>

        <ol className="relative mt-10 grid gap-9 sm:mt-12 md:grid-cols-3 md:gap-8">
          {/* the track: vertical on phones, horizontal from tablet up */}
          <span
            aria-hidden
            className="absolute top-3 bottom-3 left-[9px] w-0.5 bg-[linear-gradient(180deg,var(--green-deep),#6f8f5f,var(--gold))] md:top-[9px] md:right-[calc(33.333%-2rem)] md:bottom-auto md:left-0 md:h-0.5 md:w-auto md:bg-[linear-gradient(90deg,var(--green-deep),#6f8f5f,var(--gold))]"
          />
          {days.map((d, i) => (
            <li key={d.day} className="relative grid grid-cols-[20px_1fr] gap-x-5 md:block">
              <span aria-hidden className={`relative mt-1.5 block size-5 rounded-full md:mt-0 ${dots[i]}`} />
              <div className="md:mt-7">
                <p className="flex items-baseline gap-3 leading-none">
                  <span className="text-lg font-semibold text-(--gold-ink)">{ui.dayLabel[lang]}</span>{" "}
                  <span className="text-[64px] font-extrabold tracking-[-0.03em] text-(--ink) lg:text-[88px]">
                    {d.day}
                  </span>
                </p>
                <p className="mt-3 text-lg leading-[1.5] text-(--ink) lg:text-xl">
                  <Phrased text={d.text[lang]} lang={lang} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
