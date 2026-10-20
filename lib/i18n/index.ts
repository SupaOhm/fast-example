import type { Locale } from "./config";
import en from "./en.json";
import th from "./th.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { th, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export * from "./config";
