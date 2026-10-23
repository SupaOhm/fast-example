"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { focusRing } from "./admin-format";

export function CrudError({ message, hint, closeLabel, onClose }: { message: string; hint?: string; closeLabel: string; onClose: () => void }) {
  return (
    <div
      data-testid="crud-error"
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-[#efc4c0] bg-[#fdf1f0] px-4 py-3 text-base leading-[1.5] text-(--error)"
    >
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p>{message}</p>
        {hint && <p className="text-[14px] text-[#7a3b36]">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className={`grid size-8 shrink-0 place-items-center rounded-full hover:bg-white ${focusRing}`}
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function Saved({ message }: { message: string }) {
  return (
    <p role="status" className="flex items-center gap-2 text-base leading-[1.5] text-[#0d5c4c]">
      <CheckCircle2 className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
