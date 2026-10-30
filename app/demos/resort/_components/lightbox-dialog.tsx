"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { L } from "@/lib/demos/lang";
import { unsplash } from "@/lib/images";
import { ui } from "./copy";
import { useLang } from "@/components/demo/lang";

const FOCUSABLE = "button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])";

/** Where Tab should go to stay inside `root`, or null to let the browser move focus as usual. */
function trapTarget(root: HTMLElement, active: Element | null, backwards: boolean) {
  const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (items.length === 0) return null;
  const first = items[0];
  const last = items[items.length - 1];
  const outside = !(active instanceof Node && root.contains(active));
  if (backwards) return outside || active === first ? last : null;
  return outside || active === last ? first : null;
}

type Props = {
  items: { id: string; alt: L }[];
  index: number;
  onStep: (direction: number) => void;
  onClose: () => void;
};

export function LightboxDialog({ items, index, onStep, onClose }: Props) {
  const lang = useLang();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const current = items[index];

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowRight") return onStep(1);
      if (e.key === "ArrowLeft") return onStep(-1);
      if (e.key !== "Tab" || !dialogRef.current) return;
      const target = trapTarget(dialogRef.current, document.activeElement, e.shiftKey);
      if (target) {
        e.preventDefault();
        target.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onStep]);

  return (
    <div
      ref={dialogRef}
      data-testid="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={current.alt[lang]}
      className="fixed inset-0 z-[200] flex flex-col bg-(--night) text-(--sand)"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <p className="text-sm tabular-nums" aria-live="polite">
          {index + 1} / {items.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={ui.close[lang]}
          className="grid size-11 place-items-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-(--sun)"
        >
          <X className="size-6" aria-hidden />
        </button>
      </div>
      <div className="relative min-h-0 flex-1" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <Image
          key={current.id}
          src={unsplash(current.id, 1600)}
          alt={current.alt[lang]}
          fill
          sizes="100vw"
          className="object-contain px-2 sm:px-20"
        />
        <button
          type="button"
          onClick={() => onStep(-1)}
          aria-label={ui.previous[lang]}
          className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-(--sea-deep)/70 hover:bg-(--sea-deep) focus-visible:outline-2 focus-visible:outline-(--sun) sm:left-5"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label={ui.next[lang]}
          className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-(--sea-deep)/70 hover:bg-(--sea-deep) focus-visible:outline-2 focus-visible:outline-(--sun) sm:right-5"
        >
          <ChevronRight className="size-6" aria-hidden />
        </button>
      </div>
      <p className="px-4 pt-3 pb-6 text-center leading-[1.5] sm:pb-8">{current.alt[lang]}</p>
    </div>
  );
}
