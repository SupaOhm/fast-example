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
    expect(getDictionary("en").services.viewDemo).toBe("View demo");
    expect(getDictionary("th").services.viewDemo).toBe("ดูตัวอย่าง");
  });

  it("defaults to English", () => {
    expect(defaultLocale).toBe("en");
  });

  it("validates locales", () => {
    expect(isLocale("th")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });
});
