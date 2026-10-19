import { describe, expect, it } from "vitest";
import { addDays, nextDays, parseISODate, toISODate } from "@/lib/dates";

describe("dates", () => {
  it("formats local dates as YYYY-MM-DD", () => {
    expect(toISODate(new Date(2026, 9, 9))).toBe("2026-10-09");
  });

  it("adds days across month boundaries", () => {
    expect(toISODate(addDays(new Date(2026, 9, 30), 3))).toBe("2026-11-02");
  });

  it("lists the next n days starting today", () => {
    expect(nextDays(new Date(2026, 9, 19), 3)).toEqual(["2026-10-19", "2026-10-20", "2026-10-21"]);
  });

  it("parses ISO dates to local midnight", () => {
    const d = parseISODate("2026-10-19");
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 9, 19, 0]);
  });
});
