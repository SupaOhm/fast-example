import { describe, expect, it } from "vitest";
import { formatCountdown, msUntilEndOfDay } from "@/lib/demos/sale-page/countdown";

describe("msUntilEndOfDay", () => {
  it("counts to the next local midnight", () => {
    expect(msUntilEndOfDay(new Date(2026, 9, 22, 20, 47, 15))).toBe((3 * 3600 + 12 * 60 + 45) * 1000);
  });

  it("is a full day exactly at midnight", () => {
    expect(msUntilEndOfDay(new Date(2026, 9, 22, 0, 0, 0))).toBe(86_400_000);
  });

  it("is one millisecond just before midnight", () => {
    expect(msUntilEndOfDay(new Date(2026, 9, 22, 23, 59, 59, 999))).toBe(1);
  });
});

describe("formatCountdown", () => {
  it("pads hours, minutes and seconds", () => {
    expect(formatCountdown((3 * 3600 + 12 * 60 + 45) * 1000)).toBe("03 : 12 : 45");
  });

  it("floors to whole seconds", () => {
    expect(formatCountdown(1999)).toBe("00 : 00 : 01");
  });

  it("never goes negative", () => {
    expect(formatCountdown(0)).toBe("00 : 00 : 00");
    expect(formatCountdown(-5000)).toBe("00 : 00 : 00");
  });

  it("shows a full day as 24 hours", () => {
    expect(formatCountdown(86_400_000)).toBe("24 : 00 : 00");
  });
});
