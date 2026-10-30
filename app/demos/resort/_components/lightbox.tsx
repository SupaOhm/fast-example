"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { L } from "@/lib/demos/lang";
import { unsplash } from "@/lib/images";
import { LightboxDialog } from "./lightbox-dialog";
import { useLang } from "@/components/demo/lang";

// Row spans on a 3-column grid give a masonry rhythm while keeping row-by-row reading order,
// so ArrowRight in the lightbox moves the way the eye does. All three columns end on row 7.
const SPANS = ["lg:row-span-3", "lg:row-span-2", "lg:row-span-2", "lg:row-span-2", "lg:row-span-3", "lg:row-span-2", "lg:row-span-3", "lg:row-span-2", "lg:row-span-2"];

// Chrome starts lazy images up to ~2,500px before they scroll in on a slow connection, which on a phone is
// most of this page, and they all fight the first photo for bandwidth. This waits until a tile is 300px away.
function useNearViewport(initial: boolean) {
  const [near, setNear] = useState(initial);
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (near || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return [ref, near] as const;
}

function Tile({ index, className, children }: { index: number; className: string; children: (near: boolean) => React.ReactNode }) {
  const [ref, near] = useNearViewport(index === 0);
  return (
    <li ref={ref} className={className}>
      {children(near)}
    </li>
  );
}

export function Lightbox({ items }: { items: { id: string; alt: L }[] }) {
  const lang = useLang();
  const [index, setIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const count = items.length;

  const openedFrom = useRef(0);

  const open = (i: number) => {
    openedFrom.current = i;
    setIndex(i);
  };
  const close = useCallback(() => {
    setIndex(null);
    triggers.current[openedFrom.current]?.focus();
  }, []);
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + count) % count)), [count]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-flow-dense lg:auto-rows-[150px] lg:grid-cols-3 lg:gap-6">
        {items.map((item, i) => (
          <Tile key={item.id} index={i} className={`${i === 0 ? "col-span-2 lg:col-span-1" : ""} ${SPANS[i % SPANS.length]}`}>
            {(near) => (
              <button
                type="button"
                data-testid="gallery-item"
                ref={(el) => {
                  triggers.current[i] = el;
                }}
                onClick={() => open(i)}
                className={`group relative block w-full overflow-hidden rounded-md bg-(--sand-2) ${i === 0 ? "aspect-[4/3]" : "aspect-[4/5]"} lg:aspect-auto lg:h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--sea)`}
              >
                {/* The caption below names the button, so the photo's alt stays empty and it isn't read twice. */}
                {near && (
                  <Image
                    src={unsplash(item.id, 900)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 52vw, 100vw"
                    // The first tile is the page's largest picture; let it go ahead of the other eight.
                    loading={i === 0 ? "eager" : undefined}
                    fetchPriority={i === 0 ? "high" : undefined}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-(--sea-deep)/80 to-transparent px-4 pt-10 pb-3 text-left text-base leading-[1.4] text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                  {item.alt[lang]}
                </span>
              </button>
            )}
          </Tile>
        ))}
      </ul>

      {index !== null && <LightboxDialog items={items} index={index} onStep={step} onClose={close} />}
    </>
  );
}
