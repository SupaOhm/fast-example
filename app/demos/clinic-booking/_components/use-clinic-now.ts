"use client";

import { clinicNow } from "@/lib/demos/clinic-booking/data";
import { useMinuteTick } from "./use-minute-tick";

/**
 * The clinic's "now" (see `clinicNow`): the browser's clock while the clinic takes bookings, otherwise today at the
 * demo time, with `isDemo` set. It re-renders on each minute. It reads the browser's clock, so it is only meaningful
 * after hydration; every caller renders time-dependent content only once hydrated.
 * `now` is a new Date on every render, so don't use it as a hook dependency; derive a string (such as the ISO date) first.
 */
export function useClinicNow(): { now: Date; isDemo: boolean } {
  useMinuteTick();
  return clinicNow(new Date());
}
