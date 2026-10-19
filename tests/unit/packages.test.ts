import { describe, expect, it } from "vitest";
import { formatTHB, getPackage, packages, packagesByService } from "@/lib/packages";

describe("packages", () => {
  it("has exactly the six Fastwork packages at the listed prices", () => {
    expect(packages.map((p) => [p.id, p.priceTHB])).toEqual([
      ["web-basic", 4900],
      ["web-standard", 7900],
      ["web-premium", 14900],
      ["app-basic", 5900],
      ["app-standard", 14900],
      ["app-premium", 29900],
    ]);
  });

  it("groups three tiers per service in order", () => {
    for (const service of ["web", "app"] as const) {
      expect(packagesByService(service).map((p) => p.tier)).toEqual(["basic", "standard", "premium"]);
    }
  });

  it("links every package to a demo route and its Fastwork listing", () => {
    for (const p of packages) {
      expect(p.demoPath).toMatch(/^\/demos\/[a-z-]+$/);
      expect(p.fastworkUrl).toMatch(/^https:\/\/fastwork\.com\/user\/devohm\/gigs\//);
    }
  });

  it("has non-empty copy in both locales", () => {
    for (const p of packages) {
      for (const locale of ["th", "en"] as const) {
        expect(p.title[locale]).not.toBe("");
        expect(p.demoName[locale]).not.toBe("");
        expect(p.scope[locale].length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("getPackage finds by id and throws on unknown ids", () => {
    expect(getPackage("app-premium").priceTHB).toBe(29900);
    // @ts-expect-error unknown id
    expect(() => getPackage("nope")).toThrow();
  });

  it("formats baht with thousands separators", () => {
    expect(formatTHB(4900)).toBe("฿4,900");
    expect(formatTHB(29900)).toBe("฿29,900");
  });
});
