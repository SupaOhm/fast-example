"use client";

import { Store } from "lucide-react";
import { DemoLangSwitch, useLang } from "@/components/demo/lang";
import { ui } from "./copy";

const LINKS = [
  { href: "#how", label: ui.navHow },
  { href: "#try", label: ui.navTry },
  { href: "#reference", label: ui.navReference },
];

const ring = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text)";

export function SiteHeader() {
  const lang = useLang();
  return (
    <header className="border-b border-(--line) bg-(--bg)">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-4 px-4 lg:px-8">
        <a href="#hero-title" className={`flex items-center gap-2.5 rounded-md py-3 ${ring}`}>
          <span className="grid size-9 place-items-center rounded-[11px] bg-(--line-green) text-white" aria-hidden>
            <Store className="size-[18px]" />
          </span>
          <span className="text-[17px] leading-[1.3] font-semibold">{ui.brand[lang]}</span>
        </a>
        <DemoLangSwitch
          className={`order-2 ml-auto grid h-9 min-w-11 place-items-center rounded-full border border-(--line) bg-(--panel) px-3 text-sm font-semibold transition-colors hover:border-(--muted) sm:order-3 sm:ml-0 ${ring}`}
        />
        <nav
          aria-label={ui.pageNavLabel[lang]}
          className="order-3 -mx-4 flex w-[calc(100%+2rem)] gap-1 overflow-x-auto border-t border-(--line) px-2 py-1.5 sm:order-2 sm:mx-0 sm:ml-auto sm:w-auto sm:border-t-0 sm:px-0 sm:py-0"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[15px] leading-[1.4] text-(--muted) transition-colors hover:bg-(--panel-2) hover:text-(--text) ${ring}`}
            >
              {l.label[lang]}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
