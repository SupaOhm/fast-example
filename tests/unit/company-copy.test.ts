import { describe, expect, it } from "vitest";
import { ui } from "@/app/demos/company/_components/copy";
import * as content from "@/lib/demos/company/content";
import { missingTranslations } from "./helpers/missing-translations";

describe("company copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations({ ui, content })).toEqual([]);
  });

  it("keeps the phone placeholder in both languages", () => {
    expect(ui.orCall.th).toContain("{phone}");
    expect(ui.orCall.en).toContain("{phone}");
  });

  it("has four services and five clients", () => {
    expect(content.SERVICES.map((s) => s.id)).toEqual(["cnc", "fabrication", "automation", "design"]);
    expect(content.clients).toHaveLength(5);
  });
});
