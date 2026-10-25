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
                        src={`/thumbs/pages/${id}-1.jpg`}
                        alt=""
                        width={640}
                        height={400}
                        unoptimized
                        loading="eager"
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
      </div>
      {/* Hidden until keyboard focus: keeps the WCAG 2.2.2 pause control without a visible button on the wall. */}
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:right-4 focus-visible:bottom-4 focus-visible:z-10 focus-visible:flex focus-visible:items-center focus-visible:gap-1.5 focus-visible:rounded-md focus-visible:border focus-visible:border-cream focus-visible:bg-forest/90 focus-visible:px-3 focus-visible:py-1.5 focus-visible:text-xs focus-visible:font-semibold focus-visible:text-cream motion-reduce:hidden"
      >
        {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
        {paused ? playLabel : pauseLabel}
      </button>
    </div>
  );
}
