import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/en.json";
import th from "@/lib/i18n/th.json";
import { defaultLocale, getDictionary, isLocale } from "@/lib/i18n";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, shape(v)]),
    );
  }
  return typeof value;
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("i18n", () => {
  it("th and en dictionaries have identical shape", () => {
    expect(shape(en)).toEqual(shape(th));
  });

  it("has no empty strings", () => {
    for (const s of [...strings(th), ...strings(en)]) expect(s.trim()).not.toBe("");
  });

  it("never uses gendered Thai first-person pronouns", () => {
    for (const s of strings(th)) expect(s).not.toMatch(/ผม|ฉัน|ดิฉัน/);
  });

  it("returns the dictionary per locale", () => {
    expect(getDictionary("en").work.tryDemo).toBe("Try the demo");
    expect(getDictionary("th").work.tryDemo).toBe("ลองเดโม่");
  });

  it("lineup copy keeps its placeholders", () => {
    for (const dict of [en, th]) {
      expect(dict.work.plansFrom).toContain("{count}");
      expect(dict.work.plansFrom).toContain("{price}");
      expect(dict.work.demo).toContain("{name}");
    }
  });

  it("defaults to English", () => {
    expect(defaultLocale).toBe("en");
  });

  it("validates locales", () => {
    expect(isLocale("th")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("hero title marks exactly one accent word and one line break", () => {
    for (const dict of [en, th]) {
      const [line1, line2, ...rest] = dict.hero.title.split("\n");
      expect(rest).toEqual([]);
      expect(line2.trim()).not.toBe("");
      expect(line1.split("*")).toHaveLength(3);
      expect(line1.split("*")[1].trim()).not.toBe("");
    }
  });

  it("price CTA has a {price} placeholder", () => {
    expect(en.hero.ctaPrice).toContain("{price}");
    expect(th.hero.ctaPrice).toContain("{price}");
  });

  it("about bio names the developer and lists four facts", () => {
    for (const dict of [en, th]) {
      expect(dict.about.body).toContain("{name}");
      expect(dict.about.facts).toHaveLength(4);
    }
    expect("stackHeading" in en.about).toBe(false);
  });
});
