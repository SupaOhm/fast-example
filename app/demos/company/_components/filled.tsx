"use client";

import { useLang } from "@/components/demo/lang";
import type { L } from "@/lib/demos/lang";
import { fill } from "@/lib/demos/format";

/** A copy entry with `{placeholders}`, rendered in the current demo language. Values may be bilingual too. */
export function Filled({ value, vars }: { value: L; vars: Record<string, string | L> }) {
  const lang = useLang();
  const resolved = Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, typeof v === "string" ? v : v[lang]]));
  return <>{fill(value[lang], resolved)}</>;
}
