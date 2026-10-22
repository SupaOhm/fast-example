import { addDays, parseISODate, toISODate } from "@/lib/dates";

export interface Night {
  iso: string;
  price: number;
  full: boolean;
}

/** Friday and Saturday nights cost 25% more, rounded to the nearest ฿100. */
export function nightlyRate(base: number, iso: string): number {
  const day = parseISODate(iso).getDay();
  return day === 5 || day === 6 ? Math.round((base * 1.25) / 100) * 100 : base;
}

/**
 * Whether a room is fully booked that night. Derived from the date and room alone,
 * so every visitor sees the same strip on the same day. Roughly one night in five is full.
 */
export function isFullNight(iso: string, roomId: string): boolean {
  let h = 2166136261;
  for (const c of `${iso}:${roomId}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) % 5 === 0;
}

export function upcomingNights(from: Date, roomId: string, base: number, count = 14): Night[] {
  return Array.from({ length: count }, (_, i) => {
    const iso = toISODate(addDays(from, i));
    return { iso, price: nightlyRate(base, iso), full: isFullNight(iso, roomId) };
  });
}

// The booking form reads its dates from the URL, so bound the stay instead of trusting it.
const MAX_STAY_NIGHTS = 366;

/** Sum of each night's rate from check-in up to (not including) check-out. Zero for an invalid or over-long stay. */
export function stayTotal(base: number, checkIn: string, checkOut: string): number {
  const start = parseISODate(checkIn);
  const nights = Math.round((parseISODate(checkOut).getTime() - start.getTime()) / 86_400_000);
  if (!Number.isFinite(nights) || nights < 1 || nights > MAX_STAY_NIGHTS) return 0;
  let total = 0;
  for (let i = 0; i < nights; i++) total += nightlyRate(base, toISODate(addDays(start, i)));
  return total;
}

export type Pick = { checkIn: number | null; checkOut: number | null };

/** The strip's two-click range picker: first night, then check-out. Full nights can't be picked or crossed. */
export function pickNight(current: Pick, index: number, nights: Night[]): Pick {
  if (!nights[index] || nights[index].full) return current;
  const { checkIn, checkOut } = current;
  if (checkIn === null || checkOut !== null || index <= checkIn) return { checkIn: index, checkOut: null };
  const crossesFull = nights.slice(checkIn, index).some((n) => n.full);
  return crossesFull ? { checkIn: index, checkOut: null } : { checkIn, checkOut: index };
}

export function bookingHref(roomId: string, checkIn: string, checkOut: string): string {
  return `/demos/resort/booking?${new URLSearchParams({ room: roomId, checkIn, checkOut })}`;
}
