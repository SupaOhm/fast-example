import { createDemoStore } from "@/lib/demo-store";
import { LOCALE_STORAGE_KEY, isLocale } from "@/lib/i18n/config";

export type Lang = "th" | "en";
/** One piece of demo copy in both languages. */
export type L = Record<Lang, string>;

/**
 * The language a visitor's first demo opens in: the hub choice if there is one,
 * otherwise Thai for Thai browsers and English for everyone else.
 */
export function initialDemoLang(
  hubLocale: string | null | undefined,
  navigatorLanguage: string | null | undefined,
): Lang {
  if (hubLocale && isLocale(hubLocale)) return hubLocale;
  return navigatorLanguage?.toLowerCase().startsWith("th") ? "th" : "en";
}

function readHubLocale(): string | null {
  try {
    return globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

/** The language the visitor saved on the hub, or null if they never picked one there. */
export function savedHubLang(): Lang | null {
  const saved = readHubLocale();
  return saved && isLocale(saved) ? saved : null;
}

// One choice shared by every demo. The server renders Thai; on the client an unset
// choice follows the hub, then the browser. Switching never touches the hub's own choice.
export const demoLang = createDemoStore<Lang>("lang", "th", {
  initial: () => initialDemoLang(readHubLocale(), globalThis.navigator?.language),
});

export const otherLang = (lang: Lang): Lang => (lang === "th" ? "en" : "th");
