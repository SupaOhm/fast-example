import { parseISODate } from "@/lib/dates";
import type { Lang } from "./lang";

export { formatTHB } from "@/lib/packages";

export type DateStyle = "dayMonth" | "dayMonthYear" | "weekdayDayMonth" | "weekday" | "full";

const OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  dayMonth: { day: "numeric", month: "short" },
  weekday: { weekday: "short" },
  dayMonthYear: { day: "numeric", month: "short", year: "numeric" },
  weekdayDayMonth: { weekday: "short", day: "numeric", month: "short" },
  full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
};

// th-TH uses the Buddhist calendar, which is what Thai customers read; en-GB puts the day first ("21 Oct 2026").
const LOCALE: Record<Lang, string> = { th: "th-TH", en: "en-GB" };

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Formats a Date, or an ISO `YYYY-MM-DD` string read as a local date. */
export function formatDate(date: Date | string, lang: Lang, style: DateStyle): string {
  const key = `${lang}:${style}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(LOCALE[lang], OPTIONS[style]);
    formatters.set(key, formatter);
  }
  return formatter.format(typeof date === "string" ? parseISODate(date) : date);
}

/** Replaces `{name}` placeholders, so Thai and English can put a value in different places. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (Object.hasOwn(vars, key) ? vars[key] : match));
}
