import { describe, expect, it } from "vitest";
import * as copy from "@/app/demos/shop-admin/_components/copy";
import { PRODUCTS, SHOP_CHANNELS, SHOP_ORDER_STATUSES } from "@/lib/demos/shop-admin/data";
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
});
