"use client";

import { useLang } from "@/components/demo/lang";
import { STAFF, nextOpening } from "@/lib/demos/clinic-booking/data";
import { clinicData } from "@/lib/demos/clinic-booking/store";
import { fill } from "@/lib/demos/format";
import { useDemoStore, useHydrated } from "@/lib/use-demo-store";
import { ui } from "./copy";
import { useMinuteTick } from "./use-minute-tick";

const box = "inline-flex min-h-11 items-center gap-3 rounded-full px-4 py-2";

/** "Next free time today 11:00 · Khun Mew". It reads the clock, so it only renders after hydration. */
export function NextOpening() {
  const hydrated = useHydrated();
  const lang = useLang();
  const [data] = useDemoStore(clinicData);
  // Re-read the clock every minute so a page left open doesn't offer a time that has passed.
  useMinuteTick();

  if (!hydrated) return <span aria-hidden className={`${box} w-72 max-w-full bg-(--paper)/60`} />;

  const next = nextOpening(data, new Date());
  const text = next
    ? fill((next.isToday ? ui.nextFreeToday : ui.nextFreeTomorrow)[lang], {
        time: next.time,
        staff: STAFF.find((s) => s.id === next.staffId)?.name[lang] ?? "",
      })
    : ui.nextFreeNone[lang];

  return (
    <p data-testid="next-opening" className={`${box} border border-(--line) bg-(--paper) font-medium leading-[1.4]`}>
      <span aria-hidden className="relative flex size-2.5 shrink-0">
        <span className="absolute inset-0 rounded-full bg-(--accent) opacity-60 motion-safe:animate-ping" />
        <span className="relative size-2.5 rounded-full bg-(--accent)" />
      </span>
      {text}
    </p>
  );
}
