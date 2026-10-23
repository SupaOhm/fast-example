"use client";

import { CalendarCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/demo/lang";
import { ui } from "./copy";

const SHOW_MS = 6000;

/**
 * "New booking in Khun Mew's schedule · 11:00". The live region is always in the page so
 * screen readers announce the message when it appears. It sits just above the demo pill: centred on phones,
 * and on wide screens under the chat column, so it never covers the clinic's schedule.
 */
export function BookingToast({
  message,
  onDismiss,
  onSee,
  fallbackFocus,
}: {
  /** The text to show, keyed by booking so a second booking restarts the timer. */
  message: { key: string; text: string } | null;
  /** Hides the toast. Called by the timer and by the close button. */
  onDismiss: () => void;
  /** Phones only: switch to the clinic tab (the caller moves focus there). */
  onSee: () => void;
  /** Where focus goes when the close button is used and focus has nowhere earlier to return to. */
  fallbackFocus: () => HTMLElement | null;
}) {
  return (
    <div
      data-testid="booking-toast"
      role="status"
      className="pointer-events-none fixed inset-x-3 bottom-[5.25rem] z-[110] mx-auto flex max-w-md justify-center lg:inset-x-auto lg:left-[max(1.5rem,calc(50%-34.5rem))] lg:w-[400px] lg:max-w-none"
    >
      {message && (
        <ToastCard key={message.key} text={message.text} onDismiss={onDismiss} onSee={onSee} fallbackFocus={fallbackFocus} />
      )}
    </div>
  );
}

function ToastCard({
  text,
  onDismiss,
  onSee,
  fallbackFocus,
}: {
  text: string;
  onDismiss: () => void;
  onSee: () => void;
  fallbackFocus: () => HTMLElement | null;
}) {
  const lang = useLang();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  // Time left before the toast hides itself; hovering or focusing it pauses the count (WCAG 2.2.1).
  const left = useRef(SHOW_MS);
  // The element that had focus before focus moved into the toast, to hand it back on close.
  const before = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (paused) return;
    const started = Date.now();
    const id = setTimeout(onDismiss, left.current);
    return () => {
      clearTimeout(id);
      left.current = Math.max(0, left.current - (Date.now() - started));
    };
  }, [paused, onDismiss]);

  function close() {
    const back = before.current;
    const target = back && back.isConnected && back.getClientRects().length > 0 ? back : fallbackFocus();
    // Move focus out first, so it never drops to <body> when the toast unmounts.
    target?.focus({ preventScroll: true });
    onDismiss();
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => {
        const from = e.relatedTarget;
        if (from instanceof HTMLElement && !e.currentTarget.contains(from)) before.current = from;
        setFocused(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-(--wine) py-2.5 pr-2 pl-4 text-white shadow-[0_20px_40px_-16px_rgb(42_29_34/0.6)] motion-safe:animate-[lumi-toast_.35s_cubic-bezier(.2,.8,.2,1)_both]"
    >
      <CalendarCheck className="size-5 shrink-0 text-(--rose-2)" aria-hidden />
      <p className="min-w-0 flex-1 leading-[1.45]">{text}</p>
      <button
        type="button"
        onClick={onSee}
        className="shrink-0 rounded-full bg-white px-3.5 py-1.5 font-medium text-(--wine) hover:bg-(--rose) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
      >
        {ui.toastSee[lang]}
      </button>
      <button
        type="button"
        data-testid="booking-toast-close"
        onClick={close}
        aria-label={ui.toastDismiss[lang]}
        className="grid size-9 shrink-0 place-items-center rounded-full text-white/85 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <X className="size-4.5" aria-hidden />
      </button>
    </div>
  );
}
