"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { PackageId } from "@/lib/packages";

const COLUMNS: { ids: PackageId[]; direction: "up" | "down" }[] = [
  { ids: ["web-premium", "app-standard", "web-basic"], direction: "up" },
  { ids: ["app-premium", "web-standard", "app-basic"], direction: "down" },
  { ids: ["web-basic", "app-premium", "web-premium"], direction: "up" },
];

// Decorative, tilted wall of demo screenshots that streams up/down. The pause toggle satisfies WCAG 2.2.2.
export function HeroWall({ pauseLabel, playLabel }: { pauseLabel: string; playLabel: string }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className="relative h-72 sm:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[52%]">
      <div aria-hidden className="hero-wall absolute inset-0 overflow-hidden" data-paused={paused || undefined}>
        <div className="absolute -inset-x-[12%] -inset-y-[15%] flex rotate-[-8deg] gap-3 sm:gap-4">
          {COLUMNS.map((col, i) => {
            // Each half of the track must be taller than the tilted box (wall height + overscan) so no loop point leaves a gap.
            const half = [...col.ids, ...col.ids];
            return (
              <div key={i} className="min-w-0 flex-1">
                <div className={`hero-wall-${col.direction}`}>
                  {[...half, ...half].map((id, j) => (
                    <div key={j} className="mb-3 overflow-hidden rounded-lg shadow-2xl shadow-black/50 sm:mb-4">
                      <Image
                        src={`/thumbs/${id}.jpg`}
                        alt=""
                        width={1440}
                        height={900}
                        loading="eager"
                        sizes="(min-width: 1024px) 18vw, 33vw"
                        className="aspect-[16/10] w-full object-cover object-top"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-forest via-transparent to-forest lg:hidden" />
        <div className="absolute inset-0 hidden bg-linear-to-r from-forest via-forest/30 to-transparent lg:block" />
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        className="absolute right-4 bottom-4 z-10 flex items-center gap-1.5 rounded-md border border-rule bg-forest/80 px-3 py-1.5 text-xs font-semibold text-cream backdrop-blur transition hover:border-cream motion-reduce:hidden"
      >
        {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
        {paused ? playLabel : pauseLabel}
      </button>
    </div>
  );
}
