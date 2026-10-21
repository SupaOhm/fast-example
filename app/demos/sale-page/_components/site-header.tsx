"use client";

import { DemoLangSwitch, useLang } from "@/components/demo/lang";
import { brand } from "@/lib/demos/sale-page/content";
import { ui } from "./copy";
import { JasmineMark } from "./marks";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--gold)";

/** Sticks under the countdown strip once it scrolls away, so ordering is always one tap off. */
export function SiteHeader() {
  const lang = useLang();
  return (
    <header className="sticky top-0 z-40 border-b border-(--mint)/10 bg-(--green-deep) px-5 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3">
        <p className="mr-auto flex items-center gap-2.5">
          <JasmineMark className="size-7 shrink-0 text-(--cream)" />
          <span className="text-lg leading-[1.25] font-semibold tracking-tight sm:text-xl">{brand.name}</span>
        </p>
        <DemoLangSwitch
          className={`grid h-10 min-w-11 place-items-center rounded-full border border-(--mint)/40 px-3 text-base leading-none font-semibold text-(--mint) transition-colors hover:border-(--mint) hover:bg-(--mint)/10 ${focus}`}
        />
        <a
          href="#order"
          className={`inline-flex h-10 items-center rounded-full bg-(--gold) px-5 text-base leading-none font-semibold text-(--green-deep) transition-colors hover:bg-(--cream) ${focus}`}
        >
          {ui.order[lang]}
        </a>
      </div>
    </header>
  );
}
