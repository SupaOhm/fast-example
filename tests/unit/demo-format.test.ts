import { describe, expect, it } from "vitest";
import { formatDate, formatTHB } from "@/lib/demos/format";

const d = new Date(2026, 9, 21); // Wednesday 21 October 2026

describe("formatDate", () => {
  it("writes Thai dates with the Buddhist year", () => {
    expect(formatDate(d, "th", "dayMonth")).toBe("21 ต.ค.");
    expect(formatDate(d, "th", "dayMonthYear")).toBe("21 ต.ค. 2569");
    expect(formatDate(d, "th", "weekdayDayMonth")).toBe("พุธ 21 ต.ค.");
    expect(formatDate(d, "th", "full")).toBe("วันพุธที่ 21 ตุลาคม 2569");
  });

  it("writes English dates day first with the Gregorian year", () => {
    expect(formatDate(d, "en", "dayMonth")).toBe("21 Oct");
    expect(formatDate(d, "en", "dayMonthYear")).toBe("21 Oct 2026");
    expect(formatDate(d, "en", "weekdayDayMonth")).toBe("Wed 21 Oct");
    expect(formatDate(d, "en", "full")).toBe("Wednesday, 21 October 2026");
  });

  it("accepts ISO date strings as local dates", () => {
    expect(formatDate("2026-10-21", "en", "dayMonthYear")).toBe("21 Oct 2026");
    expect(formatDate("2026-10-21", "th", "dayMonthYear")).toBe("21 ต.ค. 2569");
  });
});

describe("formatTHB", () => {
  it("is the same in both languages", () => {
    expect(formatTHB(14500)).toBe("฿14,500");
  });
});
