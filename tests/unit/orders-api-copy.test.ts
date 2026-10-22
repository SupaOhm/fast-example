import { describe, expect, it } from "vitest";
import * as copy from "@/app/demos/orders-api/_components/copy";
import { missingTranslations } from "./helpers/missing-translations";

describe("orders API copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations(copy)).toEqual([]);
  });

  it("words both kinds of LINE message with their placeholders", () => {
    for (const key of ["lineNewTitle", "lineNewBody", "lineStatusTitle", "lineStatusBody"] as const) {
      expect(copy.ui[key].th.length).toBeGreaterThan(0);
      expect(copy.ui[key].en.length).toBeGreaterThan(0);
    }
    expect(copy.ui.lineNewBody.en).toContain("{items}");
    expect(copy.ui.lineNewBody.en).toContain("{total}");
    expect(copy.ui.lineStatusBody.th).toContain("{to}");
  });
});
