"use client";

import { Clock } from "lucide-react";
import { useLang } from "@/components/demo/lang";
import { DEMO_TIME } from "@/lib/demos/clinic-booking/data";
import { fill } from "@/lib/demos/format";
import { ui } from "./copy";

/** A calm line saying the demo runs at `DEMO_TIME` because the clinic is closed. Callers show it only while `isDemo`. */
export function DemoClockNote({ className = "" }: { className?: string }) {
  const lang = useLang();
  return (
    <p data-testid="demo-clock-note" className={`flex items-start gap-1.5 text-[14px] leading-[1.45] text-(--muted) ${className}`}>
      <Clock aria-hidden className="mt-[0.2em] size-3.5 shrink-0" />
      {fill(ui.demoClock[lang], { time: DEMO_TIME })}
    </p>
  );
}
