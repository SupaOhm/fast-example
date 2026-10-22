"use client";

import Link from "next/link";
import { DemoLangSwitch, useLang } from "@/components/demo/lang";
import { company } from "@/lib/demos/company/content";
import { otherLang } from "@/lib/demos/lang";
import { ui } from "./copy";
import { CentreMark } from "./mark";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  const lang = useLang();
  return (
    <header className="z-40 border-b border-(--line) bg-white md:sticky md:top-0">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-5 px-5 lg:px-8">
        <Link
          href="/demos/company"
          className="order-1 flex items-center gap-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) md:py-0"
        >
          <CentreMark className="size-10 shrink-0" />
          <span className="leading-[1.25]">
            <span className="block text-[17px] font-bold text-(--navy)">{company.name[lang]}</span>
            <span className="block text-sm text-(--muted)">{company.name[otherLang(lang)]}</span>
          </span>
        </Link>
        <DemoLangSwitch className="order-2 grid h-10 min-w-10 place-items-center rounded-[3px] border border-(--line) px-3 text-sm font-bold text-(--navy) transition-colors hover:border-(--navy) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy) md:order-3" />
        <div className="order-3 -mx-5 flex w-[calc(100%+2.5rem)] items-center border-t border-(--line) md:order-2 md:mx-0 md:ml-auto md:w-auto md:gap-5 md:border-t-0">
          <SiteNav />
          <Link
            href="/demos/company/contact"
            className="hidden rounded-[3px] bg-(--orange) px-5 py-2.5 text-base leading-[1.3] font-bold whitespace-nowrap text-(--navy) transition-colors hover:bg-[#f7a24f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy) lg:block"
          >
            {ui.requestQuote[lang]}
          </Link>
        </div>
      </div>
    </header>
  );
}
