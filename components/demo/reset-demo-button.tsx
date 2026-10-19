"use client";

import { RotateCcw } from "lucide-react";
import type { DemoStore } from "@/lib/demo-store";

export function ResetDemoButton({
  stores,
  label = "รีเซ็ตข้อมูลตัวอย่าง",
  className = "",
}: {
  stores: DemoStore<unknown>[];
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-testid="reset-demo"
      onClick={() => stores.forEach((s) => s.reset())}
      className={`inline-flex items-center gap-2 text-sm ${className}`}
    >
      <RotateCcw className="size-4" aria-hidden />
      {label}
    </button>
  );
}
