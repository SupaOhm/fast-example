import type { Metadata } from "next";
import Link from "next/link";
import { T, TImage } from "@/components/demo/lang";
import { unsplash } from "@/lib/images";
import { clients, company, SERVICES, stats } from "@/lib/demos/company/content";
import { CtaBand } from "../_components/cta-band";
import { ui } from "../_components/copy";
import { CropMarks, DimensionLine, gridStyle } from "../_components/drawing";
import { LabelledDl } from "../_components/labelled-dl";

export const metadata: Metadata = { description: company.intro.en };

export default function CompanyHome() {
  return (
    <main>
      {/* Hero */}
      <section style={gridStyle} className="flow-root bg-(--navy) text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-8 lg:pt-20 lg:pb-16">
          <div>
            <p className="flex items-center gap-3 text-base leading-[1.4] text-white/75">
              <span className="h-px w-8 bg-(--orange)" aria-hidden />
              <T value={ui.heroKicker} />
            </p>
            <h1 className="mt-5 text-[2.35rem] leading-[1.22] font-bold text-balance sm:text-5xl lg:text-[3.4rem]">
              <T value={company.tagline} />
            </h1>
            <p className="mt-6 max-w-xl text-base leading-[1.8] text-pretty text-white/75 sm:text-lg">
              <T value={company.intro} />
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/demos/company/contact"
                data-testid="hero-cta"
                className="inline-flex items-center justify-center rounded-[3px] bg-(--orange) px-8 py-4 text-lg leading-[1.3] font-bold text-(--navy) transition-colors hover:bg-[#f7a24f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--orange)"
              >
                <T value={ui.requestQuote} />
              </Link>
              <Link
                href="/demos/company/services"
                className="inline-flex items-center justify-center rounded-[3px] border border-white/30 px-8 py-4 text-lg leading-[1.3] font-medium text-white transition-colors hover:border-white hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <T value={ui.allServices} />
              </Link>
            </div>
          </div>

          <figure className="relative">
            <DimensionLine label="±0.01 mm" className="mb-4" />
            <div className="relative">
              <CropMarks />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2px]">
                <TImage
                  src={unsplash(company.heroImage, 1400)}
                  alt={company.heroAlt}
                  fill
                  preload
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover object-[30%_50%]"
                />
              </div>
              <figcaption className="absolute -bottom-6 left-4 max-w-[17rem] border-l-[3px] border-(--orange) bg-white px-4 py-3 text-sm leading-[1.5] text-(--ink) sm:left-auto sm:-right-4">
                <span className="block font-bold text-(--navy)">
                  <T value={ui.captionTitle} />
                </span>
                <T value={ui.captionBody} />
              </figcaption>
            </div>
          </figure>
        </div>
        {/* Title block: company facts set like the corner block of an engineering drawing */}
        <div className="relative z-10 mx-auto -mb-24 max-w-6xl px-5 lg:-mb-14 lg:px-8">
          <LabelledDl label={ui.companyFacts} className="grid grid-cols-2 border-2 border-(--navy) bg-white lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label.en}
                className={`flex flex-col justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 ${i % 2 === 1 ? "border-l border-(--line)" : ""} ${i >= 2 ? "border-t border-(--line) lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
              >
                <dt className="text-sm leading-[1.3] text-(--muted)">
                  <T value={s.label} />
                </dt>
                <dd className="text-[1.6rem] leading-[1.2] font-bold text-(--navy) tabular-nums sm:text-[2rem]">
                  <T value={s.value} />
                </dd>
              </div>
            ))}
          </LabelledDl>
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-5 pt-40 pb-20 lg:px-8 lg:pt-32">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[1.9rem] leading-[1.3] font-bold text-(--navy) sm:text-4xl">
              <T value={ui.whatWeMake} />
            </h2>
            <p className="mt-3 text-base leading-[1.75] text-pretty text-(--muted) sm:text-lg">
              <T value={ui.whatWeMakeSub} />
            </p>
          </div>
          <Link
            href="/demos/company/services"
            className="shrink-0 text-base leading-[1.4] font-bold text-(--orange-ink) underline decoration-2 underline-offset-4 hover:text-(--navy)"
          >
            <T value={ui.serviceDetails} />
          </Link>
        </div>

        <ul className="mt-10 grid gap-px border border-(--line) bg-(--line) sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <li key={s.id} className="bg-white">
              <Link
                href="/demos/company/services"
                className="group flex h-full sm:block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--navy)"
              >
                <div className="relative w-28 shrink-0 overflow-hidden bg-(--steel) sm:aspect-[4/3] sm:w-auto">
                  <TImage
                    src={unsplash(s.image, 700)}
                    alt={s.name}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 112px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 border-l-[3px] border-transparent p-4 transition-colors group-hover:border-(--orange) sm:border-t-[3px] sm:border-l-0 sm:p-5">
                  <h3 className="text-lg leading-[1.35] font-bold text-(--navy) group-hover:underline">
                    <T value={s.name} />
                  </h3>
                  <p className="mt-2 text-base leading-[1.65] text-(--muted)">
                    <T value={s.short} />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Clients */}
      <section className="border-t border-(--line) bg-(--steel)/50">
        <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
          <h2 className="text-center text-base leading-[1.5] font-medium text-(--muted)">
            <T value={ui.clientsHeading} />
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-3 lg:grid lg:grid-cols-5">
            {clients.map((c) => (
              <li
                key={c.logo}
                className="grid h-14 place-items-center rounded-[2px] bg-(--steel) px-5 text-center text-base leading-[1.3] font-bold whitespace-nowrap text-[#5d6878] lg:h-16 lg:px-3"
              >
                <T value={c.name} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
