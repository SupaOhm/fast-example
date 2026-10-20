import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatTHB,
  getPackage,
  getService,
  packages,
  packagesByService,
  serviceTiles,
  services,
} from "@/lib/packages";

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
        expect(p.tagline[locale]).not.toBe("");
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

describe("services", () => {
  it("has the two Fastwork services in order, each with three plans", () => {
    expect(services.map((s) => s.id)).toEqual(["web", "app"]);
    for (const s of services) expect(packagesByService(s.id)).toHaveLength(3);
  });

  it("getService finds by id and throws on unknown ids", () => {
    expect(getService("app").accent).toBe("sky");
    expect(getService("web").accent).toBe("lime");
    // @ts-expect-error unknown id
    expect(() => getService("nope")).toThrow();
  });

  it("picks four lineup rows that exist in the service's rows", () => {
    for (const s of services) {
      const keys = s.rows.map((r) => r.key);
      expect(new Set(keys).size).toBe(keys.length);
      expect(s.rows[0].group).toBeDefined();
      expect(s.lineupRows).toHaveLength(4);
      for (const k of s.lineupRows) expect(keys).toContain(k);
    }
  });

  it("gives every package exactly one value per row of its service, of the row's kind", () => {
    for (const p of packages) {
      const s = getService(p.service);
      expect(Object.keys(p.values).sort()).toEqual(s.rows.map((r) => r.key).sort());
      for (const row of s.rows) {
        const v = p.values[row.key];
        if (row.kind === "count") {
          expect(v).toMatchObject({ n: expect.any(Number), unit: { th: expect.any(String), en: expect.any(String) } });
        }
        if (row.kind === "bool") expect(typeof v).toBe("boolean");
        if (row.kind === "text") {
          expect(v === false || (typeof v === "object" && "th" in v && "en" in v)).toBe(true);
        }
      }
    }
  });

  it("shows one screenshot per page or screen the plan includes", () => {
    for (const p of packages) {
      const size = (p.values.pages ?? p.values.screens) as { n: number };
      expect(p.pages).toHaveLength(size.n);
    }
  });

  it("points every lineup and tile image at a file in public/", () => {
    const paths = [...packages.flatMap((p) => p.pages), ...services.flatMap((s) => s.fan)];
    for (const path of paths) expect(existsSync(join("public", path)), path).toBe(true);
  });

  it("matches the confirmed feature matrix", () => {
    const col = (service: "web" | "app", key: string) => packagesByService(service).map((p) => p.values[key]);
    expect(col("web", "form")).toEqual([false, true, true]);
    expect(col("web", "seo")).toEqual([true, true, true]);
    expect(col("web", "comps")).toEqual([false, false, true]);
    expect(col("web", "inter")).toEqual([false, false, true]);
    expect(col("web", "live")).toEqual([true, true, true]);
    expect(col("app", "charts")).toEqual([false, true, true]);
    expect(col("app", "db")).toEqual([true, true, true]);
    expect(col("app", "resp")).toEqual([false, false, true]);
    expect(col("app", "live")).toEqual([false, false, true]);
    expect(getPackage("app-basic").values.login).toBe(false);
    expect(getPackage("app-standard").values.login).toEqual({ th: "ล็อกอินพื้นฐาน", en: "Basic login" });
    expect(packagesByService("web").map((p) => (p.values.rev as { n: number }).n)).toEqual([1, 2, 3]);
  });

  it("builds tiles with the cheapest plan as the from-price", () => {
    expect(serviceTiles("en").map((t) => [t.id, t.name, t.from, t.count, t.accent])).toEqual([
      ["web", "Websites", "฿4,900", 3, "lime"],
      ["app", "Web apps", "฿5,900", 3, "sky"],
    ]);
    expect(serviceTiles("th").map((t) => t.name)).toEqual(["เว็บไซต์", "เว็บแอป"]);
  });
});
