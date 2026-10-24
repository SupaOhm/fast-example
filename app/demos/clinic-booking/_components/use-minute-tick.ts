"use client";

import { useEffect, useState } from "react";

/**
 * Re-renders on each turn of the clock's minute, so a "now" line, the status bar and clock-driven statuses keep
 * moving on a page left open, and change together with the device clock rather than up to a minute behind it.
 */
export function useMinuteTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    let interval: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      bump();
      interval = setInterval(bump, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);
}
