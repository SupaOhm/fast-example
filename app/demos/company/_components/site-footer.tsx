import Link from "next/link";
import { T } from "@/components/demo/lang";
import { company, SERVICES } from "@/lib/demos/company/content";
import { ui } from "./copy";
import { Filled } from "./filled";
import { CentreMark } from "./mark";

export function SiteFooter() {
  return (
    <footer className="bg-(--navy) text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 pb-28 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="flex items-center gap-3">
            <CentreMark className="size-10 shrink-0 [&_rect]:fill-white/10" />
            <span className="text-lg leading-[1.3] font-bold">
              <T value={company.name} />
            </span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-[1.7] text-white/70">
            <T value={company.legal} />
          </p>
        </div>
        <div className="text-sm leading-[1.7]">
          <h2 className="font-bold text-(--orange)">
            <T value={ui.factory} />
          </h2>
          <p className="mt-3 text-white/80">
            <T value={company.address} />
          </p>
          <p className="mt-2 text-white/80">
            <Filled value={ui.openHours} vars={{ hours: company.hours }} />
          </p>
        </div>
        <div className="text-sm leading-[1.7]">
          <h2 className="font-bold text-(--orange)">
            <T value={ui.services} />
          </h2>
          <ul className="mt-3 space-y-1.5">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <Link href="/demos/company/services" className="text-white/80 hover:text-white hover:underline">
                  <T value={s.name} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
