"use client";

import Link from "next/link";
import { nav, resort } from "@/lib/demos/resort/content";
import { ui } from "./copy";
import { MoonMark } from "./moon-mark";
import { useLang } from "@/components/demo/lang";

export function ResortFooter() {
  const lang = useLang();
  return (
    <footer className="bg-(--night) text-(--sand)">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-16 pb-28 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <div className="flex items-center gap-2.5">
            <MoonMark className="size-8" />
            <p className="font-(family-name:--font-display) text-2xl leading-[1.25] font-semibold">{resort.name[lang]}</p>
          </div>
          <p className="mt-4 max-w-sm leading-[1.7] text-(--sand)/80">{resort.intro[lang]}</p>
        </div>
        <address className="space-y-1.5 leading-[1.7] not-italic text-(--sand)/85">
          <p>{ui.address[lang]}</p>
          <p>{ui.phone[lang]}</p>
          <p>{ui.visitTimes[lang]}</p>
        </address>
        <nav aria-label={ui.footerNav[lang]}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="leading-[1.7] text-(--sand)/85 underline-offset-4 hover:text-(--sun) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sun)"
                >
                  {item.label[lang]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="border-t border-white/15 pt-6 text-sm text-(--sand)/70 md:col-span-3">
          © 2026 {resort.name[lang]}. {ui.footerNote[lang]}
        </p>
      </div>
    </footer>
  );
}
