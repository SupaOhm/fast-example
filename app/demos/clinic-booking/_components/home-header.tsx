"use client";

import Link from "next/link";
import { DemoLangSwitch, useLang } from "@/components/demo/lang";
import { ui } from "./copy";
import { LineGlyph } from "./line-glyph";
import { RingMark } from "./ring-mark";

const ring = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--wine)";
const LINKS = [
  { href: "#treatments", label: ui.navTreatments },
  { href: "#team", label: ui.navTeam },
  { href: "#clinic", label: ui.navClinic },
];

export function HomeHeader() {
  const lang = useLang();
  return (
    <header className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex h-18 items-center gap-2 sm:gap-3">
        <Link
          href="/demos/clinic-booking"
          aria-label={ui.homeLink[lang]}
          className={`mr-auto flex items-center gap-2.5 rounded-lg text-(--wine) ${ring}`}
        >
          <RingMark className="size-8 shrink-0" />
          <span className="text-lg leading-[1.2] font-semibold whitespace-nowrap sm:text-xl">{ui.brand[lang]}</span>
        </Link>

        <nav aria-label={ui.mainNav[lang]} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={`rounded-full px-3.5 py-2 text-(--muted) transition-colors hover:text-(--wine) ${ring}`}>
                  {l.label[lang]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <DemoLangSwitch
          className={`grid h-10 min-w-11 place-items-center rounded-full border border-(--wine)/25 px-3 font-medium text-(--wine) transition-colors hover:bg-(--paper) md:order-last ${ring}`}
        />
        <Link
          href="/demos/clinic-booking/book"
          data-testid="book-cta-header"
          className={`inline-flex h-10 items-center gap-2 rounded-full bg-(--wine) px-3.5 font-medium whitespace-nowrap text-white transition-colors hover:bg-[#561830] sm:px-4.5 ${ring}`}
        >
          <LineGlyph className="hidden size-4.5 text-(--line-green) min-[400px]:block" />
          {ui.bookOnLine[lang]}
        </Link>
      </div>

      {/* Phones get the same three links on a row of their own, always visible. */}
      <nav aria-label={ui.mainNav[lang]} className="border-t border-(--line) md:hidden">
        <ul className="grid grid-cols-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={`block py-3 text-center text-(--muted) hover:text-(--wine) ${ring}`}>
                {l.label[lang]}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
