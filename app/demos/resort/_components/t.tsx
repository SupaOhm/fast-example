"use client";

import Image, { type ImageProps } from "next/image";
import type { L, Lang } from "@/lib/demos/resort/logic";
import { resortLang } from "@/lib/demos/resort/lang-store";
import { useDemoStore } from "@/lib/use-demo-store";

export function useLang(): Lang {
  return useDemoStore(resortLang)[0];
}

/** Renders one bilingual string in the current demo language. */
export function T({ value }: { value: L }) {
  const lang = useLang();
  return <>{value[lang]}</>;
}

/** Sets the `lang` attribute so screen readers and line breaking follow the switch. */
export function LangScope({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const lang = useLang();
  return (
    <div lang={lang} className={className} style={style}>
      {children}
    </div>
  );
}

/** next/image with bilingual alt text, usable from server pages. */
export function TImage({ alt, ...props }: Omit<ImageProps, "alt"> & { alt: L }) {
  const lang = useLang();
  return <Image alt={alt[lang]} {...props} />;
}
