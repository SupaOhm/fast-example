import { describe, expect, it } from "vitest";
import {
  availableSlots,
  bookAsGuest,
  bookingDay,
  bookingsByService,
  buildClinicSeed,
  ClinicError,
  CLOSE,
  deleteCustomer,
  deleteService,
  freeTimes,
  fromMinutes,
  GUEST_ID,
  isLineBooking,
  nextOpening,
  OPEN,
  progressStatus,
  revenueByDay,
  SERVICES,
  setBookingStatus,
  STAFF,
  toMinutes,
  upsertCustomer,
} from "@/lib/demos/clinic-booking/data";

const today = new Date(2026, 9, 19, 9, 0);
const tomorrow = "2026-10-20";
const codeOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (err) {
    return err instanceof ClinicError ? err.code : "not a ClinicError";
  }
  return "did not throw";
};

describe("time helpers", () => {
  it("round-trips HH:mm", () => {
    expect(toMinutes("13:30")).toBe(810);
    expect(fromMinutes(810)).toBe("13:30");
  });
});

describe("bilingual business data", () => {
  it("names every service and staff member in Thai and English", () => {
    for (const s of SERVICES) expect(s.name.th && s.name.en).toBeTruthy();
    for (const s of STAFF) expect(s.name.th && s.name.en && s.role.th && s.role.en).toBeTruthy();
  });
});

describe("buildClinicSeed", () => {
  const data = buildClinicSeed(today);

  it("has no overlapping bookings per staff and day, all within hours and skills", () => {
    for (const b of data.bookings) {
      const staff = STAFF.find((s) => s.id === b.staffId)!;
      const service = data.services.find((s) => s.id === b.serviceId)!;
      expect(staff.serviceIds).toContain(b.serviceId);
      expect(toMinutes(b.time)).toBeGreaterThanOrEqual(toMinutes(OPEN));
      expect(toMinutes(b.time) + service.durationMin).toBeLessThanOrEqual(toMinutes(CLOSE));
      const others = data.bookings.filter((o) => o !== b && o.staffId === b.staffId && o.date === b.date);
      for (const o of others) {
        const os = data.services.find((s) => s.id === o.serviceId)!;
        const overlap = toMinutes(b.time) < toMinutes(o.time) + os.durationMin && toMinutes(o.time) < toMinutes(b.time) + service.durationMin;
        expect(overlap).toBe(false);
      }
    }
  });

  it("marks past days done or no-show, future days booked, and today all booked before opening", () => {
    for (const b of data.bookings) {
      if (b.date < "2026-10-19") expect(["done", "no-show"]).toContain(b.status);
      if (b.date >= "2026-10-19") expect(b.status).toBe("booked");
    }
  });

  it("shows today in progress: finished bookings done, the current one arrived, later ones booked", () => {
    const at = new Date(2026, 9, 19, 14, 10);
    const now = 14 * 60 + 10;
    const todays = buildClinicSeed(at).bookings.filter((b) => b.date === "2026-10-19");
    for (const b of todays) {
      const start = toMinutes(b.time);
      const end = start + SERVICES.find((s) => s.id === b.serviceId)!.durationMin;
      expect(b.status).toBe(progressStatus(start, end, now));
    }
    const statuses = new Set(todays.map((b) => b.status));
    expect(statuses).toContain("done");
    expect(statuses).toContain("checked-in");
    expect(statuses).toContain("booked");
  });

  it("seeds no LINE bookings", () => {
    expect(data.bookings.some(isLineBooking)).toBe(false);
  });
});

describe("progressStatus", () => {
  it("is booked before the start, arrived during, done from the end", () => {
    expect(progressStatus(600, 660, 599)).toBe("booked");
    expect(progressStatus(600, 660, 600)).toBe("checked-in");
    expect(progressStatus(600, 660, 659)).toBe("checked-in");
    expect(progressStatus(600, 660, 660)).toBe("done");
  });
});

describe("availableSlots", () => {
  const data = buildClinicSeed(today);

  it("returns no slots when the staff doesn't offer the service", () => {
    const staff = STAFF.find((s) => !s.serviceIds.includes("s-laser"))!;
    expect(availableSlots(data, { date: tomorrow, staffId: staff.id, serviceId: "s-laser" })).toEqual([]);
  });

  it("excludes slots that overlap existing bookings and those ending after close", () => {
    const b = data.bookings.find((x) => x.date === tomorrow)!;
    const slots = availableSlots(data, { date: tomorrow, staffId: b.staffId, serviceId: b.serviceId });
    expect(slots).not.toContain(b.time);
    const duration = data.services.find((s) => s.id === b.serviceId)!.durationMin;
    for (const t of slots) expect(toMinutes(t) + duration).toBeLessThanOrEqual(toMinutes(CLOSE));
    expect(slots.length).toBeGreaterThan(0);
  });

  it("excludes past times today", () => {
    const now = new Date(2026, 9, 19, 14, 10);
    const slots = availableSlots(data, { date: "2026-10-19", staffId: "st-2", serviceId: "s-mask", now });
    for (const t of slots) expect(toMinutes(t)).toBeGreaterThan(14 * 60 + 10);
  });
});

describe("booking day and free times", () => {
  const data = buildClinicSeed(today);

  it("books today while there is an hour left, otherwise tomorrow", () => {
    expect(bookingDay(new Date(2026, 9, 19, 10, 30))).toEqual({ date: "2026-10-19", isToday: true });
    expect(bookingDay(new Date(2026, 9, 19, 17, 59))).toEqual({ date: "2026-10-19", isToday: true });
    expect(bookingDay(new Date(2026, 9, 19, 18, 0))).toEqual({ date: "2026-10-20", isToday: false });
    expect(bookingDay(new Date(2026, 9, 19, 23, 0))).toEqual({ date: "2026-10-20", isToday: false });
  });

  it("lists distinct free times in order, each with a staff member who does the service and is free", () => {
    const now = new Date(2026, 9, 19, 10, 30);
    const options = freeTimes(data, { serviceId: "s-facial", date: "2026-10-19", now });
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThanOrEqual(6);
    const times = options.map((o) => o.time);
    expect([...times].sort()).toEqual(times);
    expect(new Set(times).size).toBe(times.length);
    for (const o of options) {
      expect(toMinutes(o.time)).toBeGreaterThan(10 * 60 + 30);
      expect(STAFF.find((s) => s.id === o.staffId)!.serviceIds).toContain("s-facial");
      expect(availableSlots(data, { date: "2026-10-19", staffId: o.staffId, serviceId: "s-facial", now })).toContain(o.time);
    }
  });

  it("nextOpening finds the earliest free time on the booking day", () => {
    const now = new Date(2026, 9, 19, 10, 30);
    const next = nextOpening(data, now)!;
    expect(next).toMatchObject({ date: "2026-10-19", isToday: true });
    for (const s of SERVICES) {
      const first = freeTimes(data, { serviceId: s.id, date: next.date, now })[0];
      if (first) expect(next.time <= first.time).toBe(true);
    }
    expect(nextOpening(data, new Date(2026, 9, 19, 18, 30))).toMatchObject({ date: "2026-10-20", isToday: false });
  });
});

describe("bookAsGuest", () => {
  const data = buildClinicSeed(today);
  const now = new Date(2026, 9, 19, 10, 30);

  it("books a free time for the guest customer and marks it as a LINE booking", () => {
    const [option] = freeTimes(data, { serviceId: "s-facial", date: "2026-10-19", now });
    const { data: next, booking } = bookAsGuest(
      data,
      { name: "คุณลูกค้าเดโม", serviceId: "s-facial", staffId: option.staffId, date: "2026-10-19", time: option.time },
      now,
    );
    expect(booking).toMatchObject({ customerId: GUEST_ID, date: "2026-10-19", time: option.time, status: "booked" });
    expect(isLineBooking(booking)).toBe(true);
    expect(next.customers.find((c) => c.id === GUEST_ID)).toMatchObject({ name: "คุณลูกค้าเดโม", phone: "" });
    expect(freeTimes(next, { serviceId: "s-facial", date: "2026-10-19", now }).some((o) => o.time === option.time && o.staffId === option.staffId)).toBe(false);
  });

  it("keeps one guest customer and uses the latest name", () => {
    const options = freeTimes(data, { serviceId: "s-mask", date: "2026-10-19", now });
    const first = bookAsGuest(data, { name: "A", serviceId: "s-mask", staffId: options[0].staffId, date: "2026-10-19", time: options[0].time }, now);
    const second = bookAsGuest(first.data, { name: "B", serviceId: "s-mask", staffId: options[1].staffId, date: "2026-10-19", time: options[1].time }, now);
    expect(second.data.customers.filter((c) => c.id === GUEST_ID)).toEqual([{ id: GUEST_ID, name: "B", phone: "" }]);
  });

  it("rejects a blank name and a taken time with error codes", () => {
    const b = data.bookings.find((x) => x.date === tomorrow)!;
    const input = { name: "A", serviceId: b.serviceId, staffId: b.staffId, date: tomorrow, time: b.time };
    expect(codeOf(() => bookAsGuest(data, input, today))).toBe("slot-taken");
    expect(codeOf(() => bookAsGuest(data, { ...input, name: "  " }, today))).toBe("name-required");
  });
});

describe("admin mutations and reports", () => {
  const data = buildClinicSeed(today);

  it("sets booking status", () => {
    const id = data.bookings[0].id;
    expect(setBookingStatus(data, id, "checked-in").bookings.find((b) => b.id === id)?.status).toBe("checked-in");
  });

  it("blocks deleting referenced customers and services with error codes", () => {
    const b = data.bookings[0];
    expect(codeOf(() => deleteCustomer(data, b.customerId))).toBe("customer-has-bookings");
    expect(codeOf(() => deleteService(data, b.serviceId))).toBe("service-has-bookings");
  });

  it("upserts and deletes an unreferenced customer", () => {
    const added = upsertCustomer(data, { id: "c-new", name: "ลูกค้าใหม่", phone: "0800000077" });
    expect(added.customers.some((c) => c.id === "c-new")).toBe(true);
    expect(deleteCustomer(added, "c-new").customers.some((c) => c.id === "c-new")).toBe(false);
  });

  it("revenueByDay sums done bookings over the window", () => {
    const series = revenueByDay(data, today, 7);
    expect(series).toHaveLength(7);
    expect(series.at(-1)!.date).toBe("2026-10-19");
    const expected = data.bookings
      .filter((b) => b.status === "done" && b.date >= series[0].date && b.date <= "2026-10-19")
      .reduce((s, b) => s + data.services.find((x) => x.id === b.serviceId)!.price, 0);
    expect(series.reduce((s, d) => s + d.revenue, 0)).toBe(expected);
  });

  it("bookingsByService counts every booking once, named in both languages", () => {
    const rows = bookingsByService(data);
    expect(rows.reduce((s, x) => s + x.count, 0)).toBe(data.bookings.length);
    expect(rows[0].name.en.length).toBeGreaterThan(0);
  });
});
