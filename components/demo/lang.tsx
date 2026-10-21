"use client";

import Image, { type ImageProps } from "next/image";
import { demoLang, otherLang, type L, type Lang } from "@/lib/demos/lang";
import { useDemoStore } from "@/lib/use-demo-store";

export function useLang(): Lang {
  return useDemoStore(demoLang)[0];
}

/** Renders one bilingual string in the current demo language. */
export function T({ value }: { value: L }) {
  const lang = useLang();
  return <>{value[lang]}</>;
}

/** Sets the `lang` attribute so screen readers and line breaking follow the switch. */
export function LangScope({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
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

// Said in the language currently showing, so it reads naturally to whoever is looking.
const SWITCH_LABEL: Record<Lang, string> = { th: "เปลี่ยนเป็นภาษาอังกฤษ", en: "Switch to Thai" };

/** The EN/TH button every demo puts in its own header. It shows the language you'd switch to. */
export function DemoLangSwitch({
  className = "",
  labels = { th: "TH", en: "EN" },
}: {
  className?: string;
  labels?: Record<Lang, React.ReactNode>;
}) {
  const lang = useLang();
  const next = otherLang(lang);
  return (
    <button
      type="button"
      data-testid="lang-switch"
      onClick={() => demoLang.set(next)}
      aria-label={SWITCH_LABEL[lang]}
      className={className}
    >
      {labels[next]}
    </button>
  );
}
