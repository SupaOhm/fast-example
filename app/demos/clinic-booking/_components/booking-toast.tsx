"use client";

import { CalendarCheck, X } from "lucide-react";
import { useEffect } from "react";
import { useLang } from "@/components/demo/lang";
import { ui } from "./copy";

const SHOW_MS = 6000;

/**
 * "New booking in Khun Mew's schedule · 11:00". The live region is always in the page so
 * screen readers announce the message when it appears; it sits just above the demo pill, and on wide screens over the clinic's side.
 */
export function BookingToast({
  message,
  onDismiss,
  onSee,
}: {
  /** The text to show, keyed by booking so a second booking restarts the timer. */
  message: { key: string; text: string } | null;
  onDismiss: () => void;
  /** Phones only: switch to the clinic tab. */
  onSee: () => void;
}) {
  const lang = useLang();
  const key = message?.key;
  useEffect(() => {
    if (!key) return;
    const id = setTimeout(onDismiss, SHOW_MS);
    return () => clearTimeout(id);
  }, [key, onDismiss]);

  return (
    <div
      data-testid="booking-toast"
      role="status"
      className="pointer-events-none fixed inset-x-3 bottom-[5.25rem] z-[110] mx-auto flex max-w-md justify-center lg:inset-x-auto lg:right-6 lg:w-[27rem] lg:max-w-none"
    >
      {message && (
        <div
          key={message.key}
          className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-(--wine) py-2.5 pr-2 pl-4 text-white shadow-[0_20px_40px_-16px_rgb(42_29_34/0.6)] motion-safe:animate-[lumi-toast_.35s_cubic-bezier(.2,.8,.2,1)_both]"
        >
          <style>{"@keyframes lumi-toast{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}"}</style>
          <CalendarCheck className="size-5 shrink-0 text-(--rose-2)" aria-hidden />
          <p className="min-w-0 flex-1 leading-[1.45]">{message.text}</p>
          <button
            type="button"
            onClick={onSee}
            className="shrink-0 rounded-full bg-white px-3.5 py-1.5 font-medium text-(--wine) hover:bg-(--rose) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
          >
            {ui.toastSee[lang]}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={ui.toastDismiss[lang]}
            className="grid size-9 shrink-0 place-items-center rounded-full text-white/85 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="size-4.5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
