"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { DemoLangSwitch, useLang } from "@/components/demo/lang";
import { focusRing } from "./admin-format";
import { ui } from "./copy";
import { RingMark } from "./ring-mark";

/** The booking page's slim header: back to the clinic, the brand, and the language switch. */
export function BookHeader() {
  const lang = useLang();
  return (
    <header className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
      <Link
        href="/demos/clinic-booking"
        aria-label={ui.backToClinic[lang]}
        className={`-ml-2 inline-flex h-10 items-center gap-1 rounded-full pr-3 pl-2 text-(--wine) hover:bg-(--paper) sm:pr-4 ${focusRing}`}
      >
        <ChevronLeft className="size-5" aria-hidden />
        <span className="hidden font-medium sm:inline">{ui.backToClinic[lang]}</span>
      </Link>
      <p className="mx-auto flex items-center gap-2 text-(--wine) sm:mx-0 sm:ml-auto">
        <RingMark className="size-7 shrink-0" />
        <span className="text-lg leading-[1.2] font-semibold whitespace-nowrap">{ui.brand[lang]}</span>
      </p>
      <DemoLangSwitch
        className={`grid h-10 min-w-11 place-items-center rounded-full border border-(--wine)/25 px-3 font-medium text-(--wine) transition-colors hover:bg-(--paper) ${focusRing}`}
      />
    </header>
  );
}
