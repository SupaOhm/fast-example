import { describe, expect, it } from "vitest";
import * as copy from "@/app/demos/clinic-booking/_components/copy";
import { BOOKING_STATUSES, SERVICES, STAFF } from "@/lib/demos/clinic-booking/data";
import { missingTranslations } from "./helpers/missing-translations";

describe("clinic copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations(copy)).toEqual([]);
    expect(missingTranslations(SERVICES)).toEqual([]);
    expect(missingTranslations(STAFF)).toEqual([]);
  });

  it("labels every status and every error code", () => {
    for (const s of BOOKING_STATUSES) expect(copy.statusLabel[s].en.length).toBeGreaterThan(0);
    for (const code of ["name-required", "phone-invalid", "slot-taken", "customer-has-bookings", "service-has-bookings"] as const) {
      expect(copy.errorText[code].th.length).toBeGreaterThan(0);
    }
  });
});
