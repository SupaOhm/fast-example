"use client";

import { ArrowLeft, ArrowRight, Maximize2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROOMS } from "@/lib/demos/resort/content";
import { unsplash } from "@/lib/images";
import { formatTHB } from "@/lib/packages";
import { ui } from "./copy";
import { useLang } from "@/components/demo/lang";

const pad = (n: number) => String(n).padStart(2, "0");
const TOTAL = pad(ROOMS.length);
// Pixels a mouse must travel before a press becomes a drag instead of a click.
const DRAG_SLOP = 6;

/*
 * The rail starts on the page's content edge and bleeds off the right of the screen.
 * These match the container's max-w-7xl and its px-4 / sm:px-6 / lg:px-10 gutters.
 */
const EDGE =
  "pl-4 scroll-pl-4 sm:pl-6 sm:scroll-pl-6 lg:pl-[calc(max(0px,(100%_-_80rem)/2)_+_2.5rem)] lg:scroll-pl-[calc(max(0px,(100%_-_80rem)/2)_+_2.5rem)]";
/*
 * Trailing space so the last room can snap to the start edge like every other room:
 * the rail's content width, minus the last card and one gap. Card and spacer % resolve against that content width.
 */
const TAIL =
  "w-[calc(30%_-_0.75rem)] sm:w-[calc(100%_-_300px_-_0.75rem)] md:w-[calc(100%_-_300px_-_1.25rem)] lg:w-[calc(100%_-_340px_-_1.25rem)]";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cardsOf = (rail: HTMLElement) => Array.from(rail.querySelectorAll<HTMLElement>("[data-rail-card]"));
/** The rail's scrollLeft for each card when that card is snapped to the start edge. */
function positionsOf(rail: HTMLElement) {
  const list = cardsOf(rail);
  const first = list[0]?.offsetLeft ?? 0;
  return list.map((c) => c.offsetLeft - first);
}
const nearest = (left: number, pos: number[]) =>
  pos.reduce((best, p, i) => (Math.abs(p - left) < Math.abs(pos[best] - left) ? i : best), 0);

/** All five rooms on one sideways rail: drag, swipe, or step through with the arrows. */
export function RoomRail() {
  const lang = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const drag = useRef({ id: -1, x: 0, left: 0, moved: false, from: 0 });
  const swallowClick = useRef(false);

  const scrollToCard = useCallback((i: number, onDone?: () => void) => {
    const rail = railRef.current;
    if (!rail) return;
    const pos = positionsOf(rail);
    const target = pos[Math.max(0, Math.min(pos.length - 1, i))] ?? 0;
    const smooth = !reducedMotion() && Math.abs(rail.scrollLeft - target) > 1;
    if (onDone) {
      if (!smooth) {
        rail.scrollLeft = target;
        onDone();
      } else {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          rail.removeEventListener("scrollend", finish);
          onDone();
        };
        rail.addEventListener("scrollend", finish);
        window.setTimeout(finish, 900);
      }
    }
    rail.scrollTo({ left: target, behavior: smooth ? "smooth" : "instant" });
  }, []);

  // Counter and progress line follow the scroll position: one rAF per frame, a CSS variable, and
  // React state only when the room number actually changes.
  useEffect(() => {
    const rail = railRef.current;
    const section = sectionRef.current;
    if (!rail || !section) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const pos = positionsOf(rail);
      const last = pos[pos.length - 1] || 1;
      section.style.setProperty("--rail", Math.min(1, Math.max(0, rail.scrollLeft / last)).toFixed(4));
      setActive(nearest(rail.scrollLeft, pos));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    rail.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      rail.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // Mouse drag. Touch and pen keep the browser's own swipe and snap.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const rail = e.currentTarget;
    swallowClick.current = false;
    drag.current = { id: e.pointerId, x: e.clientX, left: rail.scrollLeft, moved: false, from: active };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    const rail = e.currentTarget;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_SLOP) return;
      d.moved = true;
      rail.setPointerCapture(e.pointerId);
      rail.dataset.dragging = "";
    }
    rail.scrollLeft = d.left - dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    drag.current.id = -1;
    if (!d.moved) return;
    swallowClick.current = true;
    const rail = e.currentTarget;
    const dx = e.clientX - d.x;
    // A deliberate flick moves at least one room in its direction; otherwise settle on the nearest.
    const near = nearest(rail.scrollLeft, positionsOf(rail));
    const target = Math.abs(dx) > 48 && near === d.from ? d.from + (dx < 0 ? 1 : -1) : near;
    scrollToCard(target, () => delete rail.dataset.dragging);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (swallowClick.current) {
      e.preventDefault();
      e.stopPropagation();
      swallowClick.current = false;
    }
  };

  // Tabbing onto a card brings the whole card into view on the start edge.
  const onFocus = (e: React.FocusEvent) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-rail-card]");
    const rail = railRef.current;
    if (!card || !rail || !card.matches(":focus-visible")) return;
    scrollToCard(cardsOf(rail).indexOf(card));
  };

  const arrow =
    "grid size-12 place-items-center rounded-full border border-(--sea-deep)/35 text-(--sea-deep) transition-colors hover:border-(--sea) hover:bg-(--sea) hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sea) aria-disabled:pointer-events-none aria-disabled:opacity-35 motion-reduce:transition-none";

  return (
    <section
      ref={sectionRef}
      data-testid="room-rail"
      aria-labelledby="room-rail-heading"
      className="overflow-hidden pb-20 [--rail:0] md:pb-28"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-10 gap-y-6 px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <h2 id="room-rail-heading" className="font-(family-name:--font-display) text-3xl leading-[1.25] text-(--sea-deep) md:text-5xl">
            {ui.railHeading[lang]}
          </h2>
          <p className="mt-3 text-lg leading-[1.6] text-(--muted)">{ui.railSub[lang]}</p>
        </div>
        <div className="flex items-center gap-3">
          <p data-testid="rail-counter" className="mr-2 text-base text-(--muted) tabular-nums">
            <span className="font-semibold text-(--sea-deep)">{pad(active + 1)}</span> / {TOTAL}
          </p>
          <button
            type="button"
            data-testid="rail-prev"
            aria-label={ui.previousRoom[lang]}
            aria-disabled={active === 0 || undefined}
            onClick={() => scrollToCard(active - 1)}
            className={arrow}
          >
            <ArrowLeft className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            data-testid="rail-next"
            aria-label={ui.nextRoom[lang]}
            aria-disabled={active === ROOMS.length - 1 || undefined}
            onClick={() => scrollToCard(active + 1)}
            className={arrow}
          >
            <ArrowRight className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        onFocus={onFocus}
        className={`relative mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto py-3 [scrollbar-width:none] md:mt-12 md:cursor-grab md:gap-5 data-dragging:cursor-grabbing data-dragging:snap-none data-dragging:select-none [&::-webkit-scrollbar]:hidden ${EDGE}`}
      >
        {ROOMS.map((room, i) => {
          const featured = i === 0;
          return (
            <Link
              key={room.id}
              href={`/demos/resort/booking?room=${room.id}`}
              data-rail-card
              draggable={false}
              className={`group relative isolate flex h-[380px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[4px] bg-(--sea-deep) p-4 text-white focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--sea) md:h-[420px] md:p-5 ${
                featured ? "w-[84%] sm:w-[460px] lg:w-[600px]" : "w-[70%] sm:w-[300px] lg:w-[340px]"
              }`}
            >
              <Image
                src={unsplash(room.image, featured ? 1300 : 800)}
                alt={room.name[lang]}
                fill
                draggable={false}
                sizes={featured ? "(min-width: 1024px) 600px, (min-width: 640px) 460px, 84vw" : "(min-width: 1024px) 340px, (min-width: 640px) 300px, 70vw"}
                className="-z-20 object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045] group-focus-visible:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100"
              />
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(12_41_40/0.28)_0%,transparent_22%,transparent_44%,rgb(12_41_40/0.92)_100%)]"
              />
              <span className="self-start rounded-full bg-(--sun) px-3.5 py-1.5 text-sm leading-none font-semibold text-(--night)">
                {ui.fromPerNight[lang]} {formatTHB(room.pricePerNight)} {ui.perNight[lang]}
              </span>
              <span className="block">
                <span
                  className={`block font-(family-name:--font-display) leading-[1.2] ${featured ? "text-3xl md:text-[2.5rem]" : "text-[1.625rem]"}`}
                >
                  {room.name[lang]}
                </span>
                <span className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-4 text-(--sun)" aria-hidden />
                    {room.guests} {ui.guestsUnit[lang]}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="size-4 text-(--sun)" aria-hidden />
                    {room.sizeSqm} {ui.sqm[lang]}
                  </span>
                  <span>{room.features[0][lang]}</span>
                </span>
                <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none pointer-coarse:grid-rows-[1fr]">
                  <span className="overflow-hidden">
                    <span className="mt-4 flex items-center gap-2 border-t border-white/25 pt-3.5 text-base font-semibold text-(--sun) opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none pointer-coarse:opacity-100">
                      {ui.seeRoomAndDates[lang]}
                      <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                    </span>
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
        <span aria-hidden className={`shrink-0 ${TAIL}`} />
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-10">
        <div aria-hidden className="relative h-px bg-(--sea-deep)/15">
          <span className="absolute -top-px left-0 h-[3px] w-1/5 rounded-full bg-(--sea) [transform:translateX(calc(var(--rail)*400%))]" />
        </div>
      </div>
    </section>
  );
}
