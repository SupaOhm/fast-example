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
 * End padding, so the last card stops on the right-hand gutter: the gutter minus one gap.
 * A spacer rather than padding-right, which some engines leave out of a flex scroller's scroll width.
 * At lg, 100% is the rail's content width C (the screen minus EDGE's padding), and that padding equals max(2.5rem, C - 75rem).
 */
const TAIL = "w-1 sm:w-3 md:w-1 lg:w-[calc(max(2.5rem,100%_-_75rem)_-_1.25rem)]";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cardsOf = (rail: HTMLElement) => Array.from(rail.querySelectorAll<HTMLElement>("[data-rail-card]"));
const maxScroll = (rail: HTMLElement) => Math.max(0, rail.scrollWidth - rail.clientWidth);
// Within this many pixels of either end counts as being there (scroll positions can land on fractions).
const END_SLOP = 2;
const atEnd = (rail: HTMLElement) => rail.scrollLeft >= maxScroll(rail) - END_SLOP;
/**
 * The rail's scrollLeft for each card when that card is snapped to the start edge, capped at the scroll end.
 * On wide screens the last few cards can't reach the start edge, so they share the end position.
 */
function positionsOf(rail: HTMLElement) {
  const list = cardsOf(rail);
  const first = list[0]?.offsetLeft ?? 0;
  const max = maxScroll(rail);
  return list.map((c) => Math.min(max, c.offsetLeft - first));
}
const nearest = (left: number, pos: number[]) =>
  pos.reduce((best, p, i) => (Math.abs(p - left) < Math.abs(pos[best] - left) ? i : best), 0);
/** The next snap position after `left` in either direction, ending at the scroll end or the start. */
function snapFrom(rail: HTMLElement, left: number, dir: 1 | -1) {
  const pos = positionsOf(rail);
  return dir === 1 ? (pos.find((p) => p > left + END_SLOP) ?? maxScroll(rail)) : (pos.findLast((p) => p < left - END_SLOP) ?? 0);
}
/** The room under the start edge, or the last room once the rail is scrolled to its end. */
const activeOf = (rail: HTMLElement) => (atEnd(rail) && rail.scrollLeft > END_SLOP ? cardsOf(rail).length - 1 : nearest(rail.scrollLeft, positionsOf(rail)));

/** All five rooms on one sideways rail: drag, swipe, or step through with the arrows. */
export function RoomRail() {
  const lang = useLang();
  const progressRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const drag = useRef({ id: -1, x: 0, left: 0, moved: false });
  const swallowClick = useRef(false);
  // The scroll in flight that still owes an onDone: its scrollend listener and fallback timer.
  const pending = useRef<{ timer: number; finish: () => void } | null>(null);

  const scrollToLeft = useCallback((target: number, onDone?: () => void) => {
    const rail = railRef.current;
    if (!rail) return;
    // A new scroll settles the previous one now instead of leaving its timer to fire mid-flight.
    pending.current?.finish();
    const smooth = !reducedMotion() && Math.abs(rail.scrollLeft - target) > 1;
    if (onDone) {
      if (!smooth) {
        rail.scrollLeft = target;
        onDone();
      } else {
        const finish = () => {
          if (pending.current?.finish !== finish) return;
          window.clearTimeout(pending.current.timer);
          pending.current = null;
          rail.removeEventListener("scrollend", finish);
          onDone();
        };
        rail.addEventListener("scrollend", finish);
        pending.current = { timer: window.setTimeout(finish, 900), finish };
      }
    }
    rail.scrollTo({ left: target, behavior: smooth ? "smooth" : "instant" });
  }, []);

  const scrollToCard = useCallback(
    (i: number, onDone?: () => void) => {
      const rail = railRef.current;
      if (!rail) return;
      const pos = positionsOf(rail);
      scrollToLeft(pos[Math.max(0, Math.min(pos.length - 1, i))] ?? 0, onDone);
    },
    [scrollToLeft],
  );

  // The arrows go to the next snap position either way. Near the end, "next" is the end itself,
  // and "previous" from the end skips the cards that share the end position.
  // At an end the arrow is only aria-disabled (a native disabled would drop keyboard focus to <body>), so it does nothing here.
  const step = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail || (dir === -1 ? edges.start : edges.end)) return;
    scrollToLeft(snapFrom(rail, rail.scrollLeft, dir));
  };

  // Drop a pending scroll's timer and listener if the rail unmounts mid-scroll.
  useEffect(
    () => () => {
      const p = pending.current;
      if (!p) return;
      window.clearTimeout(p.timer);
      railRef.current?.removeEventListener("scrollend", p.finish);
      pending.current = null;
    },
    [],
  );

  // Counter and progress line follow the scroll position: one rAF per frame, a CSS variable, and
  // React state only when the room number actually changes.
  useEffect(() => {
    const rail = railRef.current;
    const progress = progressRef.current;
    if (!rail || !progress) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      // Every layout read first, then the one style write, so the frame never forces a second layout.
      const left = rail.scrollLeft;
      const max = maxScroll(rail);
      const room = activeOf(rail);
      const start = left <= END_SLOP;
      const end = atEnd(rail);
      progress.style.setProperty("--rail", (max > 0 ? Math.min(1, Math.max(0, left / max)) : 0).toFixed(4));
      // Both setters bail out when nothing changed, so React only renders when the room or an end changes.
      setActive(room);
      setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
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
    drag.current = { id: e.pointerId, x: e.clientX, left: rail.scrollLeft, moved: false };
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
    // The click that ends this drag fires before the next frame. If none comes (released outside the window),
    // don't let the flag swallow the next keyboard Enter on a card.
    requestAnimationFrame(() => (swallowClick.current = false));
    const rail = e.currentTarget;
    const dx = e.clientX - d.x;
    // A deliberate flick moves at least one snap in its direction; otherwise settle on the nearest.
    const pos = positionsOf(rail);
    const near = pos[nearest(rail.scrollLeft, pos)];
    const flick = Math.abs(dx) > 48 && near === pos[nearest(d.left, pos)];
    scrollToLeft(flick ? snapFrom(rail, d.left, dx < 0 ? 1 : -1) : near, () => delete rail.dataset.dragging);
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

  // At an end only the border and icon dim, never the whole button, so a keyboard focus ring stays at full strength.
  const arrow =
    "grid size-12 place-items-center rounded-full border border-(--sea-deep)/35 text-(--sea-deep) transition-colors hover:border-(--sea) hover:bg-(--sea) hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sea) aria-disabled:pointer-events-none aria-disabled:border-(--sea-deep)/12 aria-disabled:text-(--sea-deep)/30 motion-reduce:transition-none";

  return (
    <section data-testid="room-rail" aria-labelledby="room-rail-heading" className="overflow-hidden pb-20 md:pb-28">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-10 gap-y-6 px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <h2 id="room-rail-heading" className="font-(family-name:--font-display) text-3xl leading-[1.25] text-(--sea-deep) md:text-5xl">
            {ui.railHeading[lang]}
          </h2>
          <p className="mt-3 text-lg leading-[1.6] text-(--muted)">{ui.railSub[lang]}</p>
        </div>
        <div className="flex items-center gap-3">
          <p data-testid="rail-counter" aria-live="polite" className="mr-2 text-base text-(--muted) tabular-nums">
            <span className="font-semibold text-(--sea-deep)">{pad(active + 1)}</span> / {TOTAL}
          </p>
          <button
            type="button"
            data-testid="rail-prev"
            aria-label={ui.previousRoom[lang]}
            aria-disabled={edges.start || undefined}
            onClick={() => step(-1)}
            className={arrow}
          >
            <ArrowLeft className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            data-testid="rail-next"
            aria-label={ui.nextRoom[lang]}
            aria-disabled={edges.end || undefined}
            onClick={() => step(1)}
            className={arrow}
          >
            <ArrowRight className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        data-rail-scroller
        role="group"
        aria-label={ui.railHeading[lang]}
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
                alt=""
                fill
                draggable={false}
                sizes={featured ? "(min-width: 1024px) 600px, (min-width: 640px) 640px, 155vw" : "(min-width: 640px) 640px, 140vw"}
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
          <span
            ref={progressRef}
            className="absolute -top-px left-0 h-[3px] w-1/5 rounded-full bg-(--sea) [--rail:0] [transform:translateX(calc(var(--rail)*400%))]"
          />
        </div>
      </div>
    </section>
  );
}
