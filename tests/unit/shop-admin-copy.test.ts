import { describe, expect, it } from "vitest";
import * as copy from "@/app/demos/shop-admin/_components/copy";
import { PRODUCTS, SHOP_CHANNELS, SHOP_ORDER_STATUSES } from "@/lib/demos/shop-admin/data";
import { fill } from "@/lib/demos/format";
import { missingTranslations } from "./helpers/missing-translations";

describe("shop admin copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations(copy)).toEqual([]);
    expect(missingTranslations(PRODUCTS)).toEqual([]);
  });

  it("labels every status and channel", () => {
    for (const s of SHOP_ORDER_STATUSES) expect(copy.statusLabel[s].en.length).toBeGreaterThan(0);
    for (const c of SHOP_CHANNELS) expect(copy.channelLabel[c].th.length).toBeGreaterThan(0);
  });

  it("keeps the banner wording from the spec", () => {
    expect(copy.ui.demoBanner.th).toBe("กำลังดูในฐานะเจ้าของร้าน (เดโม)");
    expect(copy.ui.tileToPack.th).toContain("{n}");
    expect(copy.ui.orderStatusLabel.en).toBe("Order status {id}");
  });

  it("has a singular English template for every counted noun", () => {
    const ones = Object.keys(copy.ui).filter((k) => k.endsWith("One"));
    expect(ones.length).toBeGreaterThanOrEqual(12);
    for (const k of ones) {
      const one = copy.ui[k as keyof typeof copy.ui];
      expect(one.en).not.toMatch(/\{n\} (orders|products|items|pcs|pieces)\b/);
      const many = copy.ui[k.slice(0, -3) as keyof typeof copy.ui];
      expect(many, k).toBeDefined();
      expect(one.th).toBe(many.th);
    }
    expect(fill(copy.byCount(1, copy.ui.tileToPackOne, copy.ui.tileToPack).en, { n: "1" })).toBe("1 order to pack");
    expect(fill(copy.byCount(2, copy.ui.tileToPackOne, copy.ui.tileToPack).en, { n: "2" })).toBe("2 orders to pack");
  });
});
