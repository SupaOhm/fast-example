import Link from "next/link";
import { company } from "@/lib/demos/company/content";
import { CentreMark } from "./mark";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="z-40 border-b border-(--line) bg-white md:sticky md:top-0">
      <div className="mx-auto flex max-w-6xl flex-col px-5 md:flex-row md:items-center md:justify-between md:gap-8 lg:px-8">
        <Link
          href="/demos/company"
          className="flex items-center gap-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--navy) md:py-0"
        >
          <CentreMark className="size-10 shrink-0" />
          <span className="leading-[1.25]">
            <span className="block text-[17px] font-bold text-(--navy)">{company.name}</span>
            <span className="block text-[13px] text-(--muted)">{company.nameEn}</span>
          </span>
        </Link>
        <div className="-mx-5 flex items-center border-t border-(--line) md:mx-0 md:gap-5 md:border-t-0">
          <SiteNav />
          <Link
            href="/demos/company/contact"
            className="hidden rounded-[3px] bg-(--orange) px-5 py-2.5 text-[15px] leading-[1.3] font-bold whitespace-nowrap text-(--navy) transition-colors hover:bg-[#f7a24f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy) lg:block"
          >
            ขอใบเสนอราคา
          </Link>
        </div>
      </div>
    </header>
  );
}
