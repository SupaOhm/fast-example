import Link from "next/link";
import { gridStyle } from "./drawing";

export function PageHeader({ title, intro, crumb }: { title: string; intro: string; crumb: string }) {
  return (
    <section style={gridStyle} className="bg-(--navy) text-white">
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-12 lg:px-8 lg:pt-14 lg:pb-16">
        <p className="text-sm leading-[1.4] text-white/60">
          <Link href="/demos/company" className="hover:text-white hover:underline">
            หน้าแรก
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-white/90">{crumb}</span>
        </p>
        <h1 className="mt-4 text-[2.25rem] leading-[1.25] font-bold sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-[1.75] text-pretty text-white/75 sm:text-lg">{intro}</p>
      </div>
    </section>
  );
}
