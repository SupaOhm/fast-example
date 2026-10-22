import { describe, expect, it } from "vitest";
import { ui } from "@/app/demos/sale-page/_components/copy";
import * as content from "@/lib/demos/sale-page/content";
import { missingTranslations } from "./helpers/missing-translations";

describe("sale page copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations({ ui, content })).toEqual([]);
  });

  it("keeps the price placeholders in both languages", () => {
    for (const t of [ui.promoBar, ui.orderSub, ui.perBottle]) {
      expect(t.th).toContain("{price}");
      expect(t.en).toContain("{price}");
    }
  });

  it("has now and was placeholders in the screen reader price", () => {
    expect(ui.priceSr.th).toContain("{now}");
    expect(ui.priceSr.th).toContain("{was}");
    expect(ui.priceSr.en).toContain("{now}");
    expect(ui.priceSr.en).toContain("{was}");
  });

  it("has bundles of 1, 2 and 3 bottles with one highlighted", () => {
    expect(content.bundles.map((b) => b.qty)).toEqual([1, 2, 3]);
    expect(content.bundles.filter((b) => b.highlight)).toHaveLength(1);
  });
});

describe("fill", () => {
  it("replaces every named placeholder and leaves unknown ones alone", () => {
    expect(content.fill("Usually {price} a bottle, {price} each", { price: "฿590" })).toBe(
      "Usually ฿590 a bottle, ฿590 each",
    );
    expect(content.fill("{other} stays", { price: "x" })).toBe("{other} stays");
  });
});

describe("derived numbers", () => {
  it("rounds the launch discount and averages the sample reviews", () => {
    expect(content.discountPercent).toBe(34);
    expect(content.avgRating).toBeCloseTo(14 / 3);
  });
});
