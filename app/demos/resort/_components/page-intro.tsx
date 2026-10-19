import type { L } from "@/lib/demos/resort/logic";
import { T } from "./t";

/** Title block for inner pages: a large serif title and an optional lede. */
export function PageIntro({ title, lede }: { title: L; lede?: L }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 md:pt-20 md:pb-14 lg:px-10">
      <h1 className="max-w-3xl font-(family-name:--font-display) text-[2.5rem] leading-[1.2] text-(--sea-deep) md:text-6xl">
        <T value={title} />
      </h1>
      {lede && (
        <p className="mt-5 max-w-2xl text-lg leading-[1.7] text-pretty text-(--muted)">
          <T value={lede} />
        </p>
      )}
    </div>
  );
}
