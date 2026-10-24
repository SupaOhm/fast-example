"use client";

import { BatteryFull, Camera, ChevronLeft, ImageIcon, Menu, Mic, Phone, Plus, Search, ShieldCheck, Signal, Smile, Wifi } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useLang } from "@/components/demo/lang";
import { clinicNow } from "@/lib/demos/clinic-booking/data";
import { useHydrated } from "@/lib/use-demo-store";
import { focusRing } from "./admin-format";
import { ui } from "./copy";
import { RingMark } from "./ring-mark";
import { clock } from "./time-format";
import { useClinicNow } from "./use-clinic-now";

// The moment the chat opened in this browser, on the clinic's clock, for the greeting's timestamps. The server
// snapshot is empty, so the prerendered HTML never carries a build-time clock.
let openedAt: string | null = null;
const noopSubscribe = () => () => {};
const getOpenedAt = () => (openedAt ??= clock(clinicNow(new Date()).now));
const getNoTime = () => "";
export const useOpenedAt = () => useSyncExternalStore(noopSubscribe, getOpenedAt, getNoTime);

/** The status bar's time: empty on the server, then the clinic's clock, kept current each minute. */
function useStatusBarTime() {
  const hydrated = useHydrated();
  const { now } = useClinicNow();
  return hydrated ? clock(now) : "";
}

/**
 * An original device: a soft-cornered slab with a thin wine-black bezel and no maker's
 * features. Inside it, LINE's chrome (status bar, chat header, quick replies and composer)
 * frames whatever chat the caller passes in.
 */
export function LinePhone({ children, chips }: { children: React.ReactNode; chips?: React.ReactNode }) {
  const lang = useLang();
  const time = useStatusBarTime();
  return (
    <div className="relative mx-auto w-full max-w-[400px] rounded-[2.6rem] bg-[linear-gradient(150deg,#3b2630,#1d1216_55%,#2c1c23)] p-[7px] shadow-[0_44px_70px_-36px_rgb(107_31_58/0.6),inset_0_0_0_1px_rgb(255_255_255/0.12)] sm:p-[9px]">
      <div className="flex h-[640px] flex-col overflow-hidden rounded-[2.1rem] bg-(--chat) lg:h-[760px]">
        {/* Status bar: decorative, so it may run at 12px. */}
        <div aria-hidden className="flex h-8 shrink-0 items-center justify-between bg-white px-6 text-[12px] font-medium tabular-nums">
          <span className="min-w-8">{time}</span>
          <span className="flex items-center gap-1">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4.5" />
          </span>
        </div>

        <header className="flex shrink-0 items-center gap-2 border-b border-black/5 bg-white px-2 pt-1 pb-2.5">
          <Link
            href="/demos/clinic-booking"
            aria-label={ui.backToClinic[lang]}
            className={`grid size-9 place-items-center rounded-full text-(--ink) hover:bg-black/5 ${focusRing}`}
          >
            <ChevronLeft className="size-6" aria-hidden />
          </Link>
          <BotAvatar />
          <div className="min-w-0 flex-1 leading-[1.3]">
            <p className="flex items-center gap-1 font-medium">
              {ui.brand[lang]}
              <ShieldCheck className="size-4 shrink-0 fill-(--line-green) text-white" aria-hidden />
            </p>
            <p className="truncate text-[14px] text-(--muted)">{ui.chatAccount[lang]}</p>
          </div>
          <span aria-hidden className="flex items-center gap-3.5 pr-2 text-(--ink)/70">
            <Search className="size-5" />
            <Phone className="size-5" />
            <Menu className="size-5" />
          </span>
        </header>

        {children}

        <div className="shrink-0 border-t border-black/5 bg-white pb-2">
          {chips && <div className="flex gap-2 overflow-x-auto px-3 pt-2.5 [scrollbar-width:none]">{chips}</div>}
          <div aria-hidden className="flex items-center gap-3 px-3 pt-2.5 text-[#8a8f98]">
            <Plus className="size-5" />
            <Camera className="size-5" />
            <ImageIcon className="size-5" />
            <span className="flex h-9 flex-1 items-center justify-between rounded-full bg-[#f1f2f4] px-3.5 text-sm">
              {ui.chatComposer[lang]}
              <Smile className="size-4.5" />
            </span>
            <Mic className="size-5" />
          </div>
          <span aria-hidden className="mx-auto mt-2.5 block h-1 w-28 rounded-full bg-(--ink)/80" />
        </div>
      </div>
    </div>
  );
}

export const chip = `inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-(--line-green-ink)/35 bg-white px-3.5 text-base font-medium text-(--line-green-ink) hover:bg-(--line-green)/10 ${focusRing}`;

function BotAvatar({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`grid size-9 shrink-0 place-items-center rounded-full bg-(--rose) text-(--wine) ${className}`}>
      <RingMark className="size-6" />
    </span>
  );
}

function Stamp({ value, read }: { value?: string; read?: boolean }) {
  const lang = useLang();
  if (!value) return null;
  return (
    <span className="shrink-0 pb-0.5 text-[12px] leading-[1.3] text-(--chat-ink)">
      {read && <span className="block">{ui.chatRead[lang]}</span>}
      {value}
    </span>
  );
}

/** One message from the clinic. `first` opens a run with the avatar and name. */
export function BotSay({ first, time, children }: { first?: boolean; time?: string; children: React.ReactNode }) {
  const lang = useLang();
  return (
    <div className="flex items-start gap-2">
      {first ? <BotAvatar /> : <span className="w-9 shrink-0" />}
      <div className="min-w-0">
        {first && <p className="mb-1 text-[14px] leading-[1.3] text-(--chat-ink)">{ui.brand[lang]}</p>}
        <div className="flex items-end gap-1.5">
          <p className={`max-w-[15.5rem] rounded-[1.1rem] bg-white px-3.5 py-2 leading-[1.5] ${first ? "rounded-tl-sm" : ""}`}>
            {children}
          </p>
          <Stamp value={time} />
        </div>
      </div>
    </div>
  );
}

/** One reply from the visitor, in LINE's green. */
export function MeSay({ time, children }: { time?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-end justify-end gap-1.5 text-right">
      <Stamp value={time} read />
      <p className="max-w-[15.5rem] rounded-[1.1rem] rounded-tr-sm bg-(--bubble-me) px-3.5 py-2 text-left leading-[1.5]">{children}</p>
    </div>
  );
}

/** A rich card from the clinic, set under the avatar column like LINE's card messages. */
export function FlexCard({ children, className = "", ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`ml-11 w-[calc(100%-2.75rem)] max-w-[18rem] overflow-hidden rounded-[1.1rem] bg-white shadow-[0_1px_2px_rgb(0_0_0/0.06)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
