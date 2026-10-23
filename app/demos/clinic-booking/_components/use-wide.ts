"use client";

import { useSyncExternalStore } from "react";

/** Tailwind's `lg`: from here up the booking page shows both sides at once, with no tabs. */
const WIDE = "(min-width: 64rem)";

function subscribe(fn: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", fn);
  return () => mq.removeEventListener("change", fn);
}

/** True on wide screens. False on the server and during hydration, so the first render matches the HTML. */
export function useWide(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
}
