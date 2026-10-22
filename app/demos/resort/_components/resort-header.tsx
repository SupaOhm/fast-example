"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, resort } from "@/lib/demos/resort/content";
import { ui } from "./copy";
import { MoonMark } from "./moon-mark";
import { DemoLangSwitch, T, useLang } from "@/components/demo/lang";

const HOME = "/demos/resort";
const BOOK = "/demos/resort/booking";

export function ResortHeader() {
  const pathname = usePathname();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === HOME;

  useEffect(() => {
    if (!isHome) return;
    // Clear over the hero: past 48px, or for as long as the moonrise stage is pinned, whichever is longer.
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>("[data-hero-pin]");
      const pinned = hero ? hero.offsetHeight - window.innerHeight : 0;
      setScrolled(window.scrollY > Math.max(48, pinned));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const overHero = isHome && !scrolled && !open;

  return (
    <header
      className={`${isHome ? "fixed" : "sticky"} inset-x-0 top-0 z-50 transition-colors duration-300 ${
        overHero
          ? "bg-transparent text-white"
          : "border-b border-(--line) bg-(--sand)/95 text-(--sea-deep) backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 md:h-20 lg:px-10">
        <Link
          href={HOME}
          onClick={() => setOpen(false)}
          className="mr-auto flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
        >
          <MoonMark className="size-7 shrink-0" />
          <span className="font-(family-name:--font-display) text-lg leading-[1.25] font-semibold md:text-xl">
            <T value={resort.name} />
          </span>
        </Link>

        <DemoLangSwitch className="grid h-10 min-w-10 place-items-center rounded-full border border-current/35 px-3 text-sm font-semibold tracking-wide transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:order-2" />

        {/* The nav stays in the DOM at every width; on mobile only its list collapses behind the menu button. */}
        <nav aria-label={ui.mainNav[lang]} className="md:order-1">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="resort-menu"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:hidden"
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
            <span className="sr-only">{open ? ui.closeMenu[lang] : ui.menu[lang]}</span>
          </button>
          <ul
            id="resort-menu"
            className={`${
              open ? "flex" : "hidden"
            } absolute inset-x-0 top-full flex-col border-b border-(--line) bg-(--sand) px-4 pt-2 pb-6 text-(--sea-deep) shadow-[0_24px_40px_-24px_rgb(18_59_57/0.35)] md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:text-inherit md:shadow-none`}
          >
            {nav.map((item) => {
              const active = item.href === HOME ? pathname === HOME : pathname.startsWith(item.href);
              const isBook = item.href === BOOK;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center border-b border-(--line) py-4 font-(family-name:--font-display) text-2xl leading-[1.3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:border-0 md:py-2 md:font-(family-name:--font-body) md:text-base ${
                      isBook
                        ? `md:ml-3 md:rounded-full md:px-5 md:font-semibold ${
                            overHero ? "md:bg-white md:text-(--sea-deep)" : "md:bg-(--sea) md:text-white"
                          } md:hover:opacity-90`
                        : `md:rounded-full md:px-3.5 ${active ? "" : "md:opacity-80 md:hover:opacity-100"}`
                    } ${active ? "text-(--sea) md:text-inherit" : ""}`}
                  >
                    <span
                      className={
                        active && !isBook
                          ? "md:underline md:decoration-(--sun) md:decoration-2 md:underline-offset-[10px]"
                          : undefined
                      }
                    >
                      <T value={item.label} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
