"use client";

import Image from "next/image";
import { useRef, type KeyboardEvent } from "react";
import type { ServiceId, ServiceTile } from "@/lib/packages";

// Equal, full-size tile per Fastwork service, built as an ARIA tab list (arrow keys, Home, End).
export function ServiceTiles({
  idPrefix,
  tiles,
  selected,
  onSelect,
  label,
  plansFrom,
  compact = false,
}: {
  idPrefix: string;
  tiles: ServiceTile[];
  selected: ServiceId;
  onSelect: (id: ServiceId) => void;
  label: string;
  plansFrom: string;
  compact?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent, i: number) {
    const last = tiles.length - 1;
    const next =
      e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    onSelect(tiles[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className="grid grid-cols-2 gap-3 md:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] md:gap-4"
    >
      {tiles.map((tile, i) => {
        const on = tile.id === selected;
        const [before, after] = plansFrom.replace("{count}", String(tile.count)).split("{price}");
        return (
          <button
            key={tile.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${idPrefix}-${tile.id}`}
            aria-selected={on}
            aria-controls={`panel-${idPrefix}-${tile.id}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(tile.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`acc-${tile.accent} group relative isolate flex flex-col overflow-hidden rounded-[18px] p-4 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--acc) sm:p-6 ${
              compact ? "min-h-[120px]" : "min-h-[150px] md:min-h-[210px]"
            } ${on ? "bg-(--acc) text-forest" : "bg-forest-2 text-cream ring-1 ring-rule ring-inset hover:ring-cream/40"}`}
          >
            <span
              className={`relative z-10 font-display leading-none font-extrabold tracking-[-0.04em] ${
                compact ? "text-xl sm:text-2xl" : "max-w-[9ch] text-2xl md:text-[34px]"
              }`}
            >
              {tile.name}
            </span>
            {!compact && (
              <span className="relative z-10 mt-3 hidden max-w-[22ch] text-sm leading-relaxed opacity-80 md:block">
                {tile.blurb}
              </span>
            )}
            <span className="relative z-10 mt-auto pt-5 text-xs font-semibold sm:text-sm">
              {before}
              <span className="font-display text-base font-extrabold tracking-[-0.02em] sm:text-xl">{tile.from}</span>
              {after}
            </span>
            <span
              aria-hidden
              className={`absolute -right-10 -bottom-6 z-0 hidden h-[72%] w-[55%] transition-transform duration-500 group-hover:-translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 sm:block md:w-[min(46%,300px)] ${
                on ? "-translate-y-2 motion-reduce:translate-y-0" : ""
              }`}
            >
              {tile.fan.map((src, j) => (
                <span
                  key={src}
                  className="absolute right-0 bottom-0 block aspect-[16/10] w-[88%] overflow-hidden rounded-md bg-white shadow-[0_10px_30px_#0008]"
                  style={{ transform: `translate(${-j * 26}px, ${-j * 18}px) rotate(${-j * 6}deg)`, zIndex: 3 - j }}
                >
                  <Image src={src} alt="" width={640} height={400} sizes="300px" className="h-full w-full object-cover object-top" />
                </span>
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
