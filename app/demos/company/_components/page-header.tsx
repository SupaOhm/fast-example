import Link from "next/link";
import { T } from "@/components/demo/lang";
import type { L } from "@/lib/demos/lang";
import { ui } from "./copy";
import { gridStyle } from "./drawing";

export function PageHeader({ title, intro, crumb }: { title: L; intro: L; crumb: L }) {
  return (
    <section style={gridStyle} className="bg-(--navy) text-white">
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-12 lg:px-8 lg:pt-14 lg:pb-16">
        <p className="text-sm leading-[1.4] text-white/60">
          <Link href="/demos/company" className="hover:text-white hover:underline">
            <T value={ui.home} />
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-white/90">
            <T value={crumb} />
          </span>
        </p>
        <h1 className="mt-4 text-[2.25rem] leading-[1.25] font-bold sm:text-5xl">
          <T value={title} />
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-[1.75] text-pretty text-white/75 sm:text-lg">
          <T value={intro} />
        </p>
      </div>
    </section>
  );
}
