"use client";

import { useEffect, useState } from "react";

/** Re-renders every minute, so a "now" line and clock-driven statuses keep moving on a page left open. */
export function useMinuteTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);
}
