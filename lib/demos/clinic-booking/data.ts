import { addDays, toISODate } from "@/lib/dates";
import type { L } from "@/lib/demos/lang";

export interface Service {
  id: string;
  name: L;
  durationMin: number;
  price: number;
}

export interface Staff {
  id: string;
  name: L;
  role: L;
  serviceIds: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  note?: string;
}

export type BookingStatus = "booked" | "checked-in" | "done" | "no-show";
export const BOOKING_STATUSES: BookingStatus[] = ["booked", "checked-in", "done", "no-show"];

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  status: BookingStatus;
}

export interface ClinicData {
  services: Service[];
  customers: Customer[];
  bookings: Booking[];
}

export type ClinicErrorCode =
  | "name-required"
  | "slot-taken"
  | "customer-has-bookings"
  | "service-has-bookings";

/** Data errors carry a code, so each screen can word them in the visitor's language. */
export class ClinicError extends Error {
  constructor(readonly code: ClinicErrorCode) {
    super(code);
    this.name = "ClinicError";
  }
}

export const OPEN = "10:00";
export const CLOSE = "19:00";
export const SLOT_STEP_MIN = 30;

export const SERVICES: Service[] = [
  { id: "s-consult", name: { th: "ปรึกษาแพทย์", en: "Doctor consultation" }, durationMin: 30, price: 0 },
  { id: "s-facial", name: { th: "ทรีตเมนต์หน้าใส", en: "Brightening facial" }, durationMin: 60, price: 1500 },
  { id: "s-hydra", name: { th: "ไฮดราเฟเชียล", en: "Deep hydrating facial" }, durationMin: 60, price: 2500 },
  { id: "s-acne", name: { th: "รักษาสิว", en: "Acne treatment" }, durationMin: 45, price: 1200 },
  { id: "s-laser", name: { th: "เลเซอร์ปรับสีผิว", en: "Laser toning" }, durationMin: 30, price: 1800 },
  { id: "s-mask", name: { th: "มาสก์ฟื้นฟูผิว", en: "Skin recovery mask" }, durationMin: 30, price: 600 },
];

const THERAPIST = { th: "นักบำบัดผิว", en: "Skin therapist" };

export const STAFF: Staff[] = [
  { id: "st-1", name: { th: "พญ. ลลิตา", en: "Dr. Lalita" }, role: { th: "แพทย์ผิวหนัง", en: "Dermatologist" }, serviceIds: ["s-consult", "s-laser", "s-acne"] },
  { id: "st-2", name: { th: "คุณมิว", en: "Khun Mew" }, role: THERAPIST, serviceIds: ["s-facial", "s-hydra", "s-mask", "s-acne"] },
  { id: "st-3", name: { th: "คุณบีม", en: "Khun Beam" }, role: THERAPIST, serviceIds: ["s-facial", "s-hydra", "s-mask"] },
];

const CUSTOMER_NAMES = ["คุณแพร", "คุณบีบี", "คุณออม", "คุณจูน", "คุณน้ำ", "คุณพลอย", "คุณเฟิร์น", "คุณมุก", "คุณกาย", "คุณโอ๊ต"];

// Fixed start times per staff, spaced so no two can overlap (longest service is 60 min).
const PATTERN: Record<string, string[]> = {
  "st-1": ["10:00", "11:30", "14:00", "16:30"],
  "st-2": ["10:30", "13:00", "15:00"],
  "st-3": ["11:00", "14:30", "17:00"],
};

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(n: number): string {
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Where a booking stands at `nowMin` minutes past midnight on its own day. */
export function progressStatus(startMin: number, endMin: number, nowMin: number): BookingStatus {
  if (nowMin >= endMin) return "done";
  if (nowMin >= startMin) return "checked-in";
  return "booked";
}

// The clock only moves a booking forward through these; "no-show" is a staff decision and is left alone.
const FORWARD: BookingStatus[] = ["booked", "checked-in", "done"];

/**
 * The status a booking shows, on the booking page's schedule and in the admin queue alike. On the booking's own
 * day a page left open keeps up with the clock (booked → checked-in → done), but a later status a staff member
 * already set, or a no-show, is never pulled back. Other days show the stored status as it is.
 */
export function displayStatus(booking: Booking, durationMin: number, now: Date): BookingStatus {
  const stored = FORWARD.indexOf(booking.status);
  if (stored < 0 || booking.date !== toISODate(now)) return booking.status;
  const start = toMinutes(booking.time);
  const byClock = FORWARD.indexOf(progressStatus(start, start + durationMin, now.getHours() * 60 + now.getMinutes()));
  return FORWARD[Math.max(stored, byClock)];
}

export function buildClinicSeed(today: Date): ClinicData {
  const customers: Customer[] = CUSTOMER_NAMES.map((name, i) => ({
    id: `c-${i + 1}`,
    name,
    phone: `08000000${String(i + 1).padStart(2, "0")}`,
  }));
  const bookings: Booking[] = [];
  const nowMin = today.getHours() * 60 + today.getMinutes();
  let n = 1;
  for (let offset = -7; offset <= 6; offset++) {
    const date = toISODate(addDays(today, offset));
    STAFF.forEach((staff, si) => {
      const times = (offset + si) % 2 === 0 ? PATTERN[staff.id] : PATTERN[staff.id].slice(0, 2);
      times.forEach((time, k) => {
        const serviceId = staff.serviceIds[(k + offset + 7) % staff.serviceIds.length];
        const customerId = customers[(k * 3 + si + offset + 20) % customers.length].id;
        const start = toMinutes(time);
        const duration = SERVICES.find((s) => s.id === serviceId)!.durationMin;
        const status: BookingStatus =
          offset < 0 ? (n % 5 === 0 ? "no-show" : "done") : offset === 0 ? progressStatus(start, start + duration, nowMin) : "booked";
        bookings.push({ id: `b-${n++}`, customerId, serviceId, staffId: staff.id, date, time, status });
      });
    });
  }
  return { services: structuredClone(SERVICES), customers, bookings };
}

export function availableSlots(
  data: ClinicData,
  { date, staffId, serviceId, now }: { date: string; staffId: string; serviceId: string; now?: Date },
): string[] {
  const staff = STAFF.find((s) => s.id === staffId);
  const service = data.services.find((s) => s.id === serviceId);
  if (!staff || !service || !staff.serviceIds.includes(serviceId)) return [];

  const busy = data.bookings
    .filter((b) => b.staffId === staffId && b.date === date && b.status !== "no-show")
    .map((b) => {
      const start = toMinutes(b.time);
      const duration = data.services.find((s) => s.id === b.serviceId)?.durationMin ?? SLOT_STEP_MIN;
      return [start, start + duration] as const;
    });

  const earliest = now && toISODate(now) === date ? now.getHours() * 60 + now.getMinutes() : -1;
  const slots: string[] = [];
  for (let start = toMinutes(OPEN); start + service.durationMin <= toMinutes(CLOSE); start += SLOT_STEP_MIN) {
    if (start <= earliest) continue;
    const end = start + service.durationMin;
    if (busy.some(([s, e]) => start < e && s < end)) continue;
    slots.push(fromMinutes(start));
  }
  return slots;
}

/** The day the 3-tap booking offers: today while an hour is left before closing, otherwise tomorrow. */
export function bookingDay(now: Date): { date: string; isToday: boolean } {
  const isToday = now.getHours() * 60 + now.getMinutes() < toMinutes(CLOSE) - 60;
  return { date: toISODate(isToday ? now : addDays(now, 1)), isToday };
}

/** The earliest free start times for a service on one day, each with the first staff member free then. */
export function freeTimes(
  data: ClinicData,
  { serviceId, date, now, limit = 6 }: { serviceId: string; date: string; now?: Date; limit?: number },
): { time: string; staffId: string }[] {
  const byTime = new Map<string, string>();
  for (const staff of STAFF) {
    for (const time of availableSlots(data, { date, staffId: staff.id, serviceId, now })) {
      if (!byTime.has(time)) byTime.set(time, staff.id);
    }
  }
  return [...byTime.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, limit)
    .map(([time, staffId]) => ({ time, staffId }));
}

/** The next free time for any treatment on the booking day, for the "next opening" chip. */
export function nextOpening(data: ClinicData, now: Date) {
  const { date, isToday } = bookingDay(now);
  const firsts = data.services
    .map((s) => freeTimes(data, { serviceId: s.id, date, now, limit: 1 })[0])
    .filter((o): o is { time: string; staffId: string } => Boolean(o))
    .sort((a, b) => a.time.localeCompare(b.time));
  return firsts[0] ? { date, isToday, ...firsts[0] } : null;
}

export const GUEST_ID = "c-guest";

// Bookings made on the LINE booking page get "line-" ids; seeded ones are b-1, b-2…
export const isLineBooking = (b: Booking) => b.id.startsWith("line-");

/**
 * The 3-tap booking. The visitor books as one guest customer. There is no phone number,
 * because LINE already knows who is chatting; the latest name typed wins.
 */
export function bookAsGuest(
  data: ClinicData,
  input: { name: string; serviceId: string; staffId: string; date: string; time: string },
  now: Date = new Date(),
): { data: ClinicData; booking: Booking } {
  const name = input.name.trim();
  if (!name) throw new ClinicError("name-required");
  const free = availableSlots(data, { date: input.date, staffId: input.staffId, serviceId: input.serviceId, now });
  if (!free.includes(input.time)) throw new ClinicError("slot-taken");
  const booking: Booking = {
    id: newId("line"),
    customerId: GUEST_ID,
    serviceId: input.serviceId,
    staffId: input.staffId,
    date: input.date,
    time: input.time,
    status: "booked",
  };
  return {
    data: { ...data, customers: upsert(data.customers, { id: GUEST_ID, name, phone: "" }), bookings: [...data.bookings, booking] },
    booking,
  };
}

export function setBookingStatus(data: ClinicData, id: string, status: BookingStatus): ClinicData {
  return { ...data, bookings: data.bookings.map((b) => (b.id === id ? { ...b, status } : b)) };
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
}

export function upsertCustomer(data: ClinicData, c: Customer): ClinicData {
  return { ...data, customers: upsert(data.customers, c) };
}

export function deleteCustomer(data: ClinicData, id: string): ClinicData {
  if (data.bookings.some((b) => b.customerId === id)) throw new ClinicError("customer-has-bookings");
  return { ...data, customers: data.customers.filter((c) => c.id !== id) };
}

export function upsertService(data: ClinicData, s: Service): ClinicData {
  return { ...data, services: upsert(data.services, s) };
}

export function deleteService(data: ClinicData, id: string): ClinicData {
  if (data.bookings.some((b) => b.serviceId === id)) throw new ClinicError("service-has-bookings");
  return { ...data, services: data.services.filter((s) => s.id !== id) };
}

export function revenueByDay(data: ClinicData, end: Date, days = 7): { date: string; revenue: number }[] {
  const series = Array.from({ length: days }, (_, i) => ({ date: toISODate(addDays(end, i - days + 1)), revenue: 0 }));
  const index = new Map(series.map((d, i) => [d.date, i]));
  for (const b of data.bookings) {
    if (b.status !== "done") continue;
    const i = index.get(b.date);
    const price = data.services.find((s) => s.id === b.serviceId)?.price ?? 0;
    if (i !== undefined) series[i].revenue += price;
  }
  return series;
}

export function bookingsByService(data: ClinicData): { serviceId: string; name: L; count: number }[] {
  return data.services.map((s) => ({
    serviceId: s.id,
    name: s.name,
    count: data.bookings.filter((b) => b.serviceId === s.id).length,
  }));
}
