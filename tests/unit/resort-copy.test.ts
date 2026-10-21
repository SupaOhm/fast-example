import { describe, expect, it } from "vitest";
import * as copy from "@/app/demos/resort/_components/copy";
import * as content from "@/lib/demos/resort/content";
import { missingTranslations } from "./helpers/missing-translations";

describe("missingTranslations", () => {
  it("reports blank or missing sides with their path", () => {
    expect(missingTranslations({ a: { th: "ก", en: " " }, b: [{ th: "ข" }], c: { th: "ค", en: "c" } })).toEqual([
      "$.a (en)",
      "$.b[0] (en)",
    ]);
  });
});

describe("resort copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations({ copy, content })).toEqual([]);
  });

  it("no longer carries the old switch labels", () => {
    expect(Object.keys(copy.ui)).not.toContain("switchToEn");
    expect(Object.keys(copy.ui)).not.toContain("switchToTh");
  });
});
