"use client";

import { BedDouble, Maximize2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ROOMS } from "@/lib/demos/resort/content";
import { fill } from "@/lib/demos/format";
import { filterRooms, type RoomType } from "@/lib/demos/resort/logic";
import { unsplash } from "@/lib/images";
import { formatTHB } from "@/lib/packages";
import { roomTypeLabel, ui } from "./copy";
import { useLang } from "@/components/demo/lang";

const TYPES = ["all", "deluxe", "suite", "villa"] as const;
const GUEST_OPTIONS = [1, 2, 4, 6, 10];

export function RoomFilter() {
  const lang = useLang();
  const [type, setType] = useState<RoomType | "all">("all");
  const [guests, setGuests] = useState(1);
  const rooms = filterRooms(ROOMS, { type, guests });

  return (
    <div>
      <div className="flex flex-col gap-5 border-y border-(--line) py-5 md:flex-row md:items-end md:justify-between">
        <fieldset>
          <legend className="mb-2.5 text-sm text-(--muted)">{ui.roomType[lang]}</legend>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => {
              const active = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  data-testid={`filter-type-${t}`}
                  aria-pressed={active}
                  onClick={() => setType(t)}
                  className={`h-10 rounded-full border px-4 text-base leading-[1.2] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sea) ${
                    active
                      ? "border-(--sea-deep) bg-(--sea-deep) text-(--sand)"
                      : "border-(--line) bg-transparent text-(--ink) hover:border-(--sea)"
                  }`}
                >
                  {roomTypeLabel[t][lang]}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div>
          <label htmlFor="filter-guests" className="mb-2.5 block text-sm text-(--muted)">
            {ui.guests[lang]}
          </label>
          <select
            id="filter-guests"
            data-testid="filter-guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="h-10 w-full rounded-full border border-(--field) bg-(--paper) px-4 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sea) md:w-48"
          >
            {GUEST_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n === 1 ? ui.guestsAtLeastOne[lang] : fill(ui.guestsAtLeast[lang], { n: String(n) })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="sr-only" role="status">
        {rooms.length === 1 ? ui.roomsFoundOne[lang] : fill(ui.roomsFound[lang], { n: String(rooms.length) })}
      </p>

      {rooms.length === 0 ? (
        <div data-testid="rooms-empty" className="mx-auto max-w-lg py-20 text-center">
          <BedDouble className="mx-auto size-10 text-(--sea)" strokeWidth={1.25} aria-hidden />
          <h2 className="mt-4 font-(family-name:--font-display) text-2xl leading-[1.3] text-(--sea-deep)">
            {ui.emptyTitle[lang]}
          </h2>
          <p className="mt-3 leading-[1.7] text-(--muted)">{ui.emptyBody[lang]}</p>
          <button
            type="button"
            onClick={() => {
              setType("all");
              setGuests(1);
            }}
            className="mt-6 h-11 rounded-full bg-(--sea) px-6 font-semibold text-white hover:bg-(--sea-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sea)"
          >
            {ui.clearFilters[lang]}
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-(--line)">
          {rooms.map((room) => (
            <li key={room.id} data-testid="room-card" className="grid gap-6 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12 lg:gap-20 lg:py-14">
              <div className="relative aspect-square overflow-hidden rounded-t-[999px] rounded-b-md bg-(--sand-2)">
                <Image
                  src={unsplash(room.image, 900)}
                  alt={room.name[lang]}
                  fill
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm text-(--sun-ink)">{roomTypeLabel[room.type][lang]}</p>
                <h2 className="mt-1.5 font-(family-name:--font-display) text-3xl leading-[1.25] text-(--sea-deep) lg:text-4xl">
                  {room.name[lang]}
                </h2>
                <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-base text-(--ink)">
                  <div className="flex items-center gap-2">
                    <dt>
                      <Users className="size-4 text-(--sea)" aria-hidden />
                      <span className="sr-only">{ui.guests[lang]}</span>
                    </dt>
                    <dd>
                      {room.guests} {ui.guestsUnit[lang]}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt>
                      <Maximize2 className="size-4 text-(--sea)" aria-hidden />
                      <span className="sr-only">{ui.size[lang]}</span>
                    </dt>
                    <dd>
                      {room.sizeSqm} {ui.sqm[lang]}
                    </dd>
                  </div>
                </dl>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {room.features.map((f) => (
                    <li key={f.en} className="rounded-full bg-(--sand-2) px-3 py-1 text-sm leading-[1.5] text-(--ink)">
                      {f[lang]}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-(--line) pt-6">
                  <p className="leading-[1.3]">
                    <span className="font-(family-name:--font-display) text-3xl text-(--sea-deep)">
                      {formatTHB(room.pricePerNight)}
                    </span>{" "}
                    <span className="text-(--muted)">{ui.perNight[lang]}</span>
                  </p>
                  <Link
                    href={`/demos/resort/booking?room=${room.id}`}
                    className="inline-flex h-11 items-center rounded-full bg-(--sea) px-6 font-semibold text-white transition-colors hover:bg-(--sea-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sea)"
                  >
                    {ui.bookThisRoom[lang]}
                    <span className="sr-only"> {room.name[lang]}</span>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
