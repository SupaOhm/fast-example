import { describe, expect, it } from "vitest";
import {
  bookingHref,
  isFullNight,
  nightlyRate,
  pickNight,
  stayTotal,
  upcomingNights,
  type Night,
} from "@/lib/demos/resort/availability";

describe("nightlyRate", () => {
  it("charges the base rate Sunday to Thursday", () => {
    expect(nightlyRate(3600, "2026-10-22")).toBe(3600); // Thursday
    expect(nightlyRate(3600, "2026-10-25")).toBe(3600); // Sunday
  });

  it("adds 25% on Friday and Saturday, rounded to the nearest ฿100", () => {
    expect(nightlyRate(3600, "2026-10-23")).toBe(4500); // Friday
    expect(nightlyRate(2900, "2026-10-24")).toBe(3600); // Saturday: 3625 rounds to 3600
  });
});

describe("isFullNight", () => {
  it("is the same for the same night and room", () => {
    expect(isFullNight("2026-10-22", "pool-villa")).toBe(isFullNight("2026-10-22", "pool-villa"));
  });

  it("leaves most nights open but fills some", () => {
    const nights = upcomingNights(new Date(2026, 9, 1), "sea-deluxe", 3600, 60);
    const full = nights.filter((n) => n.full).length;
    expect(full).toBeGreaterThan(0);
    expect(full).toBeLessThan(30);
  });
});

describe("upcomingNights", () => {
  it("lists 14 consecutive nights starting on the given day", () => {
    const nights = upcomingNights(new Date(2026, 9, 22, 18, 30), "sea-deluxe", 3600);
    expect(nights).toHaveLength(14);
    expect(nights[0].iso).toBe("2026-10-22");
    expect(nights[13].iso).toBe("2026-11-04");
    expect(nights[1].price).toBe(4500); // Friday
  });
});

describe("stayTotal", () => {
  it("sums each night from check-in up to check-out", () => {
    // Thu 3600 + Fri 4500 + Sat 4500
    expect(stayTotal(3600, "2026-10-22", "2026-10-25")).toBe(12600);
  });

  it("is zero when check-out is not after check-in", () => {
    expect(stayTotal(3600, "2026-10-22", "2026-10-22")).toBe(0);
    expect(stayTotal(3600, "2026-10-23", "2026-10-22")).toBe(0);
  });

  it("crosses month and year ends", () => {
    // Tue 30 Dec + Wed 31 Dec + Thu 1 Jan, all weekdays
    expect(stayTotal(3600, "2025-12-30", "2026-01-02")).toBe(10800);
  });

  it("is zero for a malformed or absurd check-out instead of looping", () => {
    expect(stayTotal(3600, "2026-10-22", "abc")).toBe(0);
    expect(stayTotal(3600, "2026-10-22", "9999-12-31")).toBe(0);
  });
});

describe("pickNight", () => {
  const n = (full: boolean): Night => ({ iso: "x", price: 1, full });
  const nights = [n(false), n(false), n(true), n(false), n(false)];
  const none = { checkIn: null, checkOut: null };

  it("starts a stay on the first click", () => {
    expect(pickNight(none, 1, nights)).toEqual({ checkIn: 1, checkOut: null });
  });

  it("ends the stay on a later night", () => {
    expect(pickNight({ checkIn: 0, checkOut: null }, 1, nights)).toEqual({ checkIn: 0, checkOut: 1 });
  });

  it("restarts when the clicked night is not after check-in", () => {
    expect(pickNight({ checkIn: 3, checkOut: null }, 1, nights)).toEqual({ checkIn: 1, checkOut: null });
  });

  it("restarts at the clicked night when the range would cross a full night", () => {
    expect(pickNight({ checkIn: 0, checkOut: null }, 4, nights)).toEqual({ checkIn: 4, checkOut: null });
  });

  it("starts over after a finished stay", () => {
    expect(pickNight({ checkIn: 0, checkOut: 1 }, 3, nights)).toEqual({ checkIn: 3, checkOut: null });
  });

  it("ignores full nights", () => {
    expect(pickNight({ checkIn: 0, checkOut: null }, 2, nights)).toEqual({ checkIn: 0, checkOut: null });
  });

  it("restarts when check-out would sit right after a full night", () => {
    expect(pickNight({ checkIn: 1, checkOut: null }, 3, nights)).toEqual({ checkIn: 3, checkOut: null });
  });

  it("ignores indexes outside the strip", () => {
    expect(pickNight(none, -1, nights)).toEqual(none);
    expect(pickNight(none, 5, nights)).toEqual(none);
  });
});

describe("bookingHref", () => {
  it("links to the booking form with the room and dates", () => {
    expect(bookingHref("pool-villa", "2026-10-22", "2026-10-25")).toBe(
      "/demos/resort/booking?room=pool-villa&checkIn=2026-10-22&checkOut=2026-10-25",
    );
  });
});
