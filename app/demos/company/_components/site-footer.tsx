"use client";

import Link from "next/link";
import { useLang } from "@/components/demo/lang";
import { company, SERVICES } from "@/lib/demos/company/content";
import { otherLang } from "@/lib/demos/lang";
import { ui } from "./copy";
import { Filled } from "./filled";
import { CentreMark } from "./mark";

const pages = [
  { href: "/demos/company", label: ui.home },
  { href: "/demos/company/services", label: ui.services },
  { href: "/demos/company/contact", label: ui.contact },
];

const link =
  "text-white/80 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function SiteFooter() {
  const lang = useLang();
  return (
    <footer className="bg-(--navy) text-white">
      <div className="mx-auto max-w-6xl px-5 pt-12 pb-24 md:pb-20 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
          <p className="flex items-center gap-3 self-start">
            <CentreMark className="size-10 shrink-0 [&_rect]:fill-white/10" />
            <span className="leading-[1.25]">
              <span className="block text-lg font-bold">{company.name[lang]}</span>
              <span className="block text-sm text-white/70">{company.name[otherLang(lang)]}</span>
            </span>
          </p>
          <div className="text-sm leading-[1.7]">
            <h2 className="font-bold text-(--orange)">{ui.factory[lang]}</h2>
            <p className="mt-2 text-white/80">{company.address[lang]}</p>
            <p className="mt-1 text-white/80">
              <Filled value={ui.openHours} vars={{ hours: company.hours }} />
            </p>
          </div>
          <div className="text-sm leading-[1.7]">
            <h2 className="font-bold text-(--orange)">{ui.services[lang]}</h2>
            <ul className="mt-2 space-y-1">
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <Link href="/demos/company/services" className={link}>
                    {s.name[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar. Plain list, not a <nav>: the header nav stays the page's only navigation landmark. */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-5 text-sm leading-[1.6] md:flex-row md:items-center md:justify-between md:gap-8">
          <p className="text-white/70">{company.legal[lang]}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className={link}>
                  {p.label[lang]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
