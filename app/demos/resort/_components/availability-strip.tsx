"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { useLang } from "@/components/demo/lang";
import type { Lang } from "@/lib/demos/lang";
import { ROOMS } from "@/lib/demos/resort/content";
import { bookingHref, pickNight, stayTotal, upcomingNights, type Night, type Pick } from "@/lib/demos/resort/availability";
import { fill, formatDate, formatTHB } from "@/lib/demos/format";
import { parseISODate } from "@/lib/dates";
import { useHydrated } from "@/lib/use-demo-store";
import { ui } from "./copy";

const DEFAULT_ROOM = "sea-deluxe";
const CELLS = 14;
const NO_PICK: Pick = { checkIn: null, checkOut: null };

// One column per night. 4.75rem leaves 68px inside a cell, room for "Check-out" on one line at 14px,
// so phones scroll sideways instead of squeezing. Desktop columns are wider than this anyway.
// The side padding sits on the grid, not the scroller, so the last cell keeps its gutter when scrolled to the end.
const row = "grid w-max min-w-full grid-cols-[repeat(14,minmax(4.75rem,1fr))] px-4 sm:px-6 lg:px-0";
const cellBox = "flex h-24 w-full flex-col items-center justify-center rounded-md border";

export function AvailabilityStrip() {
  const lang = useLang();
  const hydrated = useHydrated();
  const [roomId, setRoomId] = useState(DEFAULT_ROOM);
  const [pick, setPick] = useState<Pick>(NO_PICK);
  const [restarted, setRestarted] = useState(false);

  const room = ROOMS.find((r) => r.id === roomId) ?? ROOMS[0];
  // Today is only known in the browser, so the server and the first client render show empty cells.
  const nights: Night[] = useMemo(
    () => (hydrated ? upcomingNights(new Date(), room.id, room.pricePerNight, CELLS) : []),
    [hydrated, room.id, room.pricePerNight],
  );

  const { checkIn, checkOut } = pick;
  const range = checkIn !== null && checkOut !== null ? { from: nights[checkIn].iso, to: nights[checkOut].iso } : null;

  function choose(index: number) {
    const next = pickNight(pick, index, nights);
    // A second click past check-in that only moves check-in means the range crossed a full night.
    setRestarted(checkIn !== null && checkOut === null && index > checkIn && next.checkOut === null && next.checkIn === index);
    setPick(next);
  }

  function changeRoom(id: string) {
    setRoomId(id);
    setPick(NO_PICK);
    setRestarted(false);
  }

  let summary: React.ReactNode;
  if (range) {
    const n = checkOut! - checkIn!;
    summary = (
      <>
        {/* Non-breaking before each dot, so a wrapped line never starts with one. */}
        {n === 1 ? ui.nightOne[lang] : fill(ui.nightsMany[lang], { n: String(n) })}
        {"\u00a0· "}
        <span className="text-(--sun)">{formatTHB(stayTotal(room.pricePerNight, range.from, range.to))}</span>
        {"\u00a0· "}
        {room.name[lang]}
      </>
    );
  } else if (restarted) {
    summary = ui.crossesFull[lang];
  } else if (checkIn !== null) {
    summary = ui.pickCheckOutDay[lang];
  } else {
    summary = ui.pickFirstNight[lang];
  }

  return (
    <section data-testid="availability" aria-labelledby="availability-heading" className="bg-(--sea-deep) text-(--sand)">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-14 lg:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="availability-heading" className="font-(family-name:--font-display) text-2xl leading-[1.3] md:text-[2rem]">
              {ui.availabilityHeading[lang]}
            </h2>
            <p className="mt-1.5 min-h-[1.5em] text-sm leading-[1.5] text-(--sand)/70">
              {nights.length > 0 &&
                `${formatDate(nights[0].iso, lang, "dayMonth")} – ${formatDate(nights[nights.length - 1].iso, lang, "dayMonth")}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="availability-room" className="shrink-0 text-sm text-(--sand)/75">
              {ui.roomType[lang]}
            </label>
            <div className="relative min-w-0 flex-1 md:flex-none">
              <select
                id="availability-room"
                data-testid="availability-room"
                value={roomId}
                onChange={(e) => changeRoom(e.target.value)}
                className="h-11 w-full appearance-none rounded-full border border-white/30 bg-(--sea-deep) pr-11 pl-5 text-base text-(--sand) transition-colors hover:border-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sun) motion-reduce:transition-none md:w-60"
              >
                {ROOMS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name[lang]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-(--sand)/80" aria-hidden />
            </div>
          </div>
        </div>

        {/* Bleeds to the screen edge on phones so the cut-off cell shows there is more to scroll. */}
        <div className="-mx-4 mt-7 snap-x snap-mandatory scroll-px-4 overflow-x-auto pb-2 [scrollbar-color:rgb(255_255_255/0.25)_transparent] [scrollbar-width:thin] sm:-mx-6 sm:scroll-px-6 lg:mx-0">
          {nights.length === 0 ? (
            <div className={row} aria-hidden>
              {Array.from({ length: CELLS }, (_, i) => (
                <div key={i} className="px-[3px]">
                  <div className={`${cellBox} border-white/10`} />
                </div>
              ))}
            </div>
          ) : (
            <ul className={row}>
              {nights.map((night, i) => (
                <NightCell
                  key={night.iso}
                  night={night}
                  lang={lang}
                  premium={night.price > room.pricePerNight}
                  isEnd={i === checkIn || i === checkOut}
                  // A full night opens up only as a check-out day: the guest leaves that morning.
                  checkOutOnly={night.full && (i === checkOut || pickNight(pick, i, nights).checkOut === i)}
                  band={range ? (i === checkIn ? "start" : i === checkOut ? "end" : i > checkIn! && i < checkOut! ? "mid" : null) : null}
                  onPick={() => choose(i)}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-white/15 pt-6 sm:min-h-[5.5rem] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              data-testid="availability-summary"
              aria-live="polite"
              className="font-(family-name:--font-display) text-xl leading-[1.45] text-balance"
            >
              {summary}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-sm leading-[1.5] text-(--sand)/70">
              <span className="size-1.5 shrink-0 rounded-full bg-(--sun)" aria-hidden />
              {ui.weekendNote[lang]}
            </p>
          </div>
          {range && (
            <Link
              href={bookingHref(room.id, range.from, range.to)}
              data-testid="availability-book"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-(--sun) px-7 font-semibold text-(--night) transition-colors hover:bg-[#e6b75a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sun) motion-reduce:transition-none"
            >
              {ui.bookTheseDates[lang]}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

// The band joins the chosen nights into one stay: half-tinted at each end so it meets the gold cells.
const BAND = {
  start: "bg-[linear-gradient(to_right,transparent_50%,rgb(255_255_255/0.1)_50%)]",
  mid: "bg-white/10",
  end: "bg-[linear-gradient(to_left,transparent_50%,rgb(255_255_255/0.1)_50%)]",
};

function NightCell({
  night,
  lang,
  premium,
  isEnd,
  checkOutOnly,
  band,
  onPick,
}: {
  night: Night;
  lang: Lang;
  /** A Friday or Saturday rate, shown in gold to match the weekend note. */
  premium: boolean;
  isEnd: boolean;
  /** A full night that can still be picked (or is picked) as the check-out day. */
  checkOutOnly: boolean;
  band: keyof typeof BAND | null;
  onPick: () => void;
}) {
  const { iso, price, full } = night;
  const labelKey = checkOutOnly ? ui.nightLabelCheckOut : full ? ui.nightLabelFull : ui.nightLabel;
  const label = fill(labelKey[lang], {
    date: formatDate(iso, lang, "full"),
    price: formatTHB(price),
  });

  let tone: string;
  if (isEnd) tone = "border-(--sun) bg-(--sun) text-(--night)";
  else if (checkOutOnly) tone = "border-dashed border-(--sun)/55 hover:border-solid hover:border-(--sun) hover:bg-white/5";
  else if (full) tone = "cursor-not-allowed border-white/10 opacity-45";
  else if (band === "mid") tone = "border-transparent hover:border-(--sun)/60";
  else tone = "border-white/15 hover:border-(--sun)/60 hover:bg-white/5";

  return (
    <li className={`snap-start px-[3px] ${band ? BAND[band] : ""}`}>
      <button
        type="button"
        data-testid="night"
        data-iso={iso}
        disabled={full && !checkOutOnly}
        aria-pressed={isEnd}
        aria-label={label}
        onClick={onPick}
        className={`${cellBox} ${tone} transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sun) motion-reduce:transition-none`}
      >
        <span className={`text-sm leading-none ${isEnd ? "text-(--night)/75" : "text-(--sand)/70"}`}>
          {formatDate(iso, lang, "weekday")}
        </span>
        <span
          className={`mt-2 font-(family-name:--font-display) text-[1.75rem] leading-none tabular-nums ${
            full && !isEnd ? "line-through decoration-(--sand)/80 decoration-[1.5px]" : ""
          }`}
        >
          {parseISODate(iso).getDate()}
        </span>
        <span
          // inline-size containment keeps a two-word label from widening every column of the w-max grid; it wraps instead.
          className={`mt-2 w-full text-center text-sm leading-[1.15] text-balance tabular-nums [contain:inline-size] ${
            isEnd ? "font-semibold text-(--night)" : checkOutOnly ? "text-(--sun)" : full ? "text-(--sand)/80" : premium ? "text-(--sun)" : "text-(--sand)/80"
          }`}
        >
          {checkOutOnly ? <WholeWords text={ui.checkOutOnly[lang]} /> : full ? ui.fullNight[lang] : formatTHB(price)}
        </span>
      </button>
    </li>
  );
}

/** Wraps only between words, so "Check-out only" never splits at its hyphen in a narrow cell. */
function WholeWords({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="inline-block whitespace-nowrap">{word}</span>
    </Fragment>
  ));
}
