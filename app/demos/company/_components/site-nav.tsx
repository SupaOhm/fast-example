"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/demo/lang";
import { ui } from "./copy";

const links = [
  { href: "/demos/company", label: ui.home },
  { href: "/demos/company/services", label: ui.services },
  { href: "/demos/company/contact", label: ui.contact },
];

/** Three links only, so they stay visible at every width instead of hiding behind a menu button. */
export function SiteNav() {
  const pathname = usePathname();
  const lang = useLang();
  return (
    <nav aria-label={ui.mainNav[lang]} className="w-full md:w-auto">
      <ul className="grid grid-cols-3 md:flex md:gap-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-12 items-center justify-center px-4 text-base leading-[1.3] font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--navy) md:h-[72px] ${
                  active ? "text-(--navy)" : "text-(--muted) hover:text-(--navy)"
                }`}
              >
                {l.label[lang]}
                <span
                  aria-hidden
                  className={`absolute inset-x-4 bottom-0 h-[3px] bg-(--orange) transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
