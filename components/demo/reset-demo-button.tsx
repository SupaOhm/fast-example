"use client";

import { RotateCcw } from "lucide-react";
import type { DemoStore } from "@/lib/demo-store";

export function ResetDemoButton({
  stores,
  label = "รีเซ็ตข้อมูลตัวอย่าง",
  className = "",
  onReset,
}: {
  stores: Pick<DemoStore<unknown>, "reset">[];
  label?: string;
  className?: string;
  onReset?: () => void;
}) {
  return (
    <button
      type="button"
      data-testid="reset-demo"
      onClick={() => {
        stores.forEach((s) => s.reset());
        onReset?.();
      }}
      className={`inline-flex items-center gap-2 text-sm ${className}`}
    >
      <RotateCcw className="size-4" aria-hidden />
      {label}
    </button>
  );
}
