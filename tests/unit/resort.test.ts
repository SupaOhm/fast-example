import { describe, expect, it } from "vitest";
import { addDays, parseISODate, toISODate } from "@/lib/dates";
import { SPANS } from "@/app/demos/resort/_components/gallery-spans";
import { GALLERY, ROOMS } from "@/lib/demos/resort/content";
import { filterRooms, nightsBetween, validateInquiry, type InquiryInput } from "@/lib/demos/resort/logic";

describe("filterRooms", () => {
  it("returns all rooms for type all and 1 guest", () => {
    expect(filterRooms(ROOMS, { type: "all", guests: 1 })).toHaveLength(ROOMS.length);
  });

  it("filters by type and minimum capacity", () => {
    const result = filterRooms(ROOMS, { type: "villa", guests: 4 });
    expect(result.length).toBeGreaterThan(0);
    for (const room of result) {
      expect(room.type).toBe("villa");
      expect(room.guests).toBeGreaterThanOrEqual(4);
    }
  });

  it("returns empty when nothing fits", () => {
    expect(filterRooms(ROOMS, { type: "deluxe", guests: 10 })).toEqual([]);
  });
});

describe("nightsBetween", () => {
  it("counts nights across months", () => {
    expect(nightsBetween("2026-10-30", "2026-11-02")).toBe(3);
  });
});

describe("validateInquiry", () => {
  const ok: InquiryInput = {
    checkIn: "2026-11-01",
    checkOut: "2026-11-03",
    guests: 2,
    roomId: "",
    name: "Alex",
    email: "alex@example.com",
  };

  it("accepts a valid inquiry", () => {
    expect(validateInquiry(ok, "2026-10-19", "en")).toEqual({});
  });

  it("rejects past check-in and check-out before check-in", () => {
    const errors = validateInquiry({ ...ok, checkIn: "2026-10-01", checkOut: "2026-09-30" }, "2026-10-19", "en");
    expect(errors.checkIn).toBe("Check-in can't be in the past");
    expect(errors.checkOut).toBe("Check-out must be after check-in");
  });

  it("localizes messages and checks name, email, guests", () => {
    const errors = validateInquiry({ ...ok, name: "", email: "x", guests: 0 }, "2026-10-19", "th");
    expect(errors).toEqual({ name: "กรุณากรอกชื่อ", email: "อีเมลไม่ถูกต้อง", guests: "จำนวนผู้เข้าพัก 1–8 คน" });
  });

  it("requires dates", () => {
    const errors = validateInquiry({ ...ok, checkIn: "", checkOut: "" }, "2026-10-19", "en");
    expect(errors.checkIn).toBe("Choose a check-in date");
    expect(errors.checkOut).toBe("Choose a check-out date");
  });

  it("caps a stay at 30 nights", () => {
    const today = "2026-10-19";
    const plus = (n: number) => toISODate(addDays(parseISODate(today), n));
    // checkIn today+1 → checkOut today+32 is 31 nights
    expect(validateInquiry({ ...ok, checkIn: plus(1), checkOut: plus(32) }, today, "en").checkOut).toBe("Stays can be up to 30 nights");
    expect(validateInquiry({ ...ok, checkIn: plus(1), checkOut: plus(31) }, today, "en").checkOut).toBeUndefined();
  });
});

describe("gallery layout", () => {
  it("has one row span per photo, so the grid ends level", () => {
    expect(SPANS).toHaveLength(GALLERY.length);
  });
});
