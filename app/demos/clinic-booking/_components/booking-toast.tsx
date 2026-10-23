"use client";

import { CalendarCheck, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLang } from "@/components/demo/lang";
import { ui } from "./copy";

const SHOW_MS = 6000;

/**
 * "New booking in Khun Mew's schedule · 11:00". The live region is always in the page so
 * screen readers announce the message when it appears.
 * - "fixed" (phones): a bar just above the demo pill, with a button that opens the clinic tab. It hides
 *   itself after 6 s, paused while a mouse is over it or focus is in it (WCAG 2.2.1).
 * - "inline" (wide screens): an in-flow banner inside the schedule, above the lanes, so nothing is overlaid.
 *   It stays until it is closed (or the chat restarts), so the lanes never jump without the reader acting.
 */
export function BookingToast({
  variant,
  message,
  onDismiss,
  onSee,
  fallbackFocus,
}: {
  variant: "fixed" | "inline";
  /** The text to show, keyed by booking so a second booking restarts the timer. */
  message: { key: string; text: string } | null;
  /** Hides the toast. Called by the phone bar's timer and once the close button's work is done. */
  onDismiss: () => void;
  /** Phones only: switch to the clinic tab (the caller moves focus there). */
  onSee: () => void;
  /** Where focus goes when the close button is used and focus has nowhere earlier to return to. */
  fallbackFocus: () => HTMLElement | null;
}) {
  if (variant === "inline") {
    return (
      <div data-testid="booking-toast" role="status">
        {message && <InlineBanner key={message.key} text={message.text} onDismiss={onDismiss} fallbackFocus={fallbackFocus} />}
      </div>
    );
  }
  return (
    <div
      data-testid="booking-toast"
      role="status"
      className="pointer-events-none fixed inset-x-3 bottom-[5.25rem] z-[110] mx-auto flex max-w-md justify-center"
    >
      {message && (
        <ToastCard
          key={message.key}
          text={message.text}
          onClose={onDismiss}
          onTimeout={onDismiss}
          onSee={onSee}
          fallbackFocus={fallbackFocus}
        />
      )}
    </div>
  );
}

/** The wide-screen banner: opens and, when closed, collapses on its own height, so the lanes move smoothly. */
function InlineBanner({
  text,
  onDismiss,
  fallbackFocus,
}: {
  text: string;
  onDismiss: () => void;
  fallbackFocus: () => HTMLElement | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  // The keyframes run max-height between 0 and the banner's real height, so neither direction stalls.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.style.setProperty("--banner-h", `${el.scrollHeight}px`);
  }, []);

  function collapse() {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return onDismiss();
    el.style.setProperty("--banner-h", `${el.scrollHeight}px`);
    setClosing(true);
  }

  return (
    <div
      ref={ref}
      onAnimationEnd={(e) => {
        if (closing && e.target === e.currentTarget) onDismiss();
      }}
      className={`overflow-hidden ${
        closing
          ? "motion-safe:animate-[lumi-banner-out_.3s_cubic-bezier(.4,0,.2,1)_both]"
          : "motion-safe:animate-[lumi-banner_.4s_cubic-bezier(.2,.8,.2,1)_backwards]"
      }`}
    >
      <div className="px-4 pt-4 sm:px-6">
        <ToastCard inline text={text} onClose={collapse} fallbackFocus={fallbackFocus} />
      </div>
    </div>
  );
}

function ToastCard({
  inline = false,
  text,
  onClose,
  onTimeout,
  onSee,
  fallbackFocus,
}: {
  inline?: boolean;
  text: string;
  /** The close button, after focus has moved out. */
  onClose: () => void;
  /** When set, the card hides itself after SHOW_MS. */
  onTimeout?: () => void;
  onSee?: () => void;
  fallbackFocus: () => HTMLElement | null;
}) {
  const lang = useLang();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  // Time left before the toast hides itself.
  const left = useRef(SHOW_MS);
  // The element that had focus before focus moved into the toast, to hand it back on close.
  const before = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!onTimeout || paused) return;
    const started = Date.now();
    const id = setTimeout(onTimeout, left.current);
    return () => {
      clearTimeout(id);
      left.current = Math.max(0, left.current - (Date.now() - started));
    };
  }, [paused, onTimeout]);

  function close() {
    const back = before.current;
    const target = back && back.isConnected && back.getClientRects().length > 0 ? back : fallbackFocus();
    // Move focus out first, so it never drops to <body> when the toast unmounts.
    target?.focus({ preventScroll: true });
    onClose();
  }

  return (
    <div
      // A mouse pointer pauses the timer; a tap must not, or the bar would never hide on a phone.
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onFocus={(e) => {
        const from = e.relatedTarget;
        if (from instanceof HTMLElement && !e.currentTarget.contains(from)) before.current = from;
        setFocused(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      className={`pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-(--wine) py-2.5 pr-2 pl-4 text-white ${
        inline ? "" : "shadow-[0_20px_40px_-16px_rgb(42_29_34/0.6)] motion-safe:animate-[lumi-toast_.35s_cubic-bezier(.2,.8,.2,1)_both]"
      }`}
    >
      <CalendarCheck className="size-5 shrink-0 text-(--rose-2)" aria-hidden />
      <p className="min-w-0 flex-1 leading-[1.45]">{text}</p>
      {!inline && (
        <button
          type="button"
          onClick={() => onSee?.()}
          className="shrink-0 rounded-full bg-white px-3.5 py-1.5 font-medium text-(--wine) hover:bg-(--rose) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {ui.toastSee[lang]}
        </button>
      )}
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
