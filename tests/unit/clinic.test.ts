import { describe, expect, it } from "vitest";
import {
  availableSlots,
  bookAppointment,
  bookingsByService,
  buildClinicSeed,
  CLOSE,
  deleteCustomer,
  deleteService,
  fromMinutes,
  OPEN,
  revenueByDay,
  setBookingStatus,
  STAFF,
  toMinutes,
  upsertCustomer,
} from "@/lib/demos/clinic-booking/data";

const today = new Date(2026, 9, 19, 9, 0);
const tomorrow = "2026-10-20";

describe("time helpers", () => {
  it("round-trips HH:mm", () => {
    expect(toMinutes("13:30")).toBe(810);
    expect(fromMinutes(810)).toBe("13:30");
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

  it("marks past bookings done or no-show and future ones booked", () => {
    for (const b of data.bookings) {
      if (b.date < "2026-10-19") expect(["done", "no-show"]).toContain(b.status);
      if (b.date > "2026-10-19") expect(b.status).toBe("booked");
    }
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

describe("bookAppointment", () => {
  const data = buildClinicSeed(today);
  const staffId = "st-2";
  const serviceId = "s-facial";

  it("books a free slot and creates the customer", () => {
    const time = availableSlots(data, { date: tomorrow, staffId, serviceId })[0];
    const { data: next, booking } = bookAppointment(
      data,
      { name: "ทดสอบ ระบบ", phone: "080-000-0099", serviceId, staffId, date: tomorrow, time },
      today,
    );
    expect(booking).toMatchObject({ date: tomorrow, time, status: "booked" });
    expect(next.customers.find((c) => c.id === booking.customerId)).toMatchObject({ name: "ทดสอบ ระบบ", phone: "0800000099" });
    expect(availableSlots(next, { date: tomorrow, staffId, serviceId })).not.toContain(time);
  });

  it("reuses an existing customer by phone", () => {
    const existing = data.customers[0];
    const time = availableSlots(data, { date: tomorrow, staffId, serviceId })[0];
    const { data: next, booking } = bookAppointment(
      data,
      { name: existing.name, phone: existing.phone, serviceId, staffId, date: tomorrow, time },
      today,
    );
    expect(booking.customerId).toBe(existing.id);
    expect(next.customers).toHaveLength(data.customers.length);
  });

  it("rejects taken slots and bad phones", () => {
    const b = data.bookings.find((x) => x.date === tomorrow)!;
    expect(() =>
      bookAppointment(data, { name: "ก", phone: "0800000098", serviceId: b.serviceId, staffId: b.staffId, date: tomorrow, time: b.time }, today),
    ).toThrow("เวลานี้ไม่ว่างแล้ว");
    expect(() =>
      bookAppointment(data, { name: "ก", phone: "123", serviceId, staffId, date: tomorrow, time: "10:00" }, today),
    ).toThrow("เบอร์โทรไม่ถูกต้อง");
  });
});

describe("admin mutations and reports", () => {
  const data = buildClinicSeed(today);

  it("sets booking status", () => {
    const id = data.bookings[0].id;
    expect(setBookingStatus(data, id, "checked-in").bookings.find((b) => b.id === id)?.status).toBe("checked-in");
  });

  it("blocks deleting referenced customers and services", () => {
    const b = data.bookings[0];
    expect(() => deleteCustomer(data, b.customerId)).toThrow();
    expect(() => deleteService(data, b.serviceId)).toThrow();
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

  it("bookingsByService counts every booking once", () => {
    expect(bookingsByService(data).reduce((s, x) => s + x.count, 0)).toBe(data.bookings.length);
  });
});
