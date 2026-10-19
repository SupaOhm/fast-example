import { addDays, toISODate } from "@/lib/dates";
import { isThaiPhone, normalizePhone } from "@/lib/validation";

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
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

export const OPEN = "10:00";
export const CLOSE = "19:00";
export const SLOT_STEP_MIN = 30;

export const SERVICES: Service[] = [
  { id: "s-consult", name: "ปรึกษาแพทย์", durationMin: 30, price: 0 },
  { id: "s-facial", name: "ทรีตเมนต์หน้าใส", durationMin: 60, price: 1500 },
  { id: "s-hydra", name: "ไฮดราเฟเชียล", durationMin: 60, price: 2500 },
  { id: "s-acne", name: "รักษาสิว", durationMin: 45, price: 1200 },
  { id: "s-laser", name: "เลเซอร์ปรับสีผิว", durationMin: 30, price: 1800 },
  { id: "s-mask", name: "มาสก์ฟื้นฟูผิว", durationMin: 30, price: 600 },
];

export const STAFF: Staff[] = [
  { id: "st-1", name: "พญ. ลลิตา", role: "แพทย์ผิวหนัง", serviceIds: ["s-consult", "s-laser", "s-acne"] },
  { id: "st-2", name: "คุณมิว", role: "นักบำบัดผิว", serviceIds: ["s-facial", "s-hydra", "s-mask", "s-acne"] },
  { id: "st-3", name: "คุณบีม", role: "นักบำบัดผิว", serviceIds: ["s-facial", "s-hydra", "s-mask"] },
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

export function buildClinicSeed(today: Date): ClinicData {
  const customers: Customer[] = CUSTOMER_NAMES.map((name, i) => ({
    id: `c-${i + 1}`,
    name,
    phone: `08000000${String(i + 1).padStart(2, "0")}`,
  }));
  const bookings: Booking[] = [];
  let n = 1;
  for (let offset = -7; offset <= 6; offset++) {
    const date = toISODate(addDays(today, offset));
    STAFF.forEach((staff, si) => {
      const times = (offset + si) % 2 === 0 ? PATTERN[staff.id] : PATTERN[staff.id].slice(0, 2);
      times.forEach((time, k) => {
        const serviceId = staff.serviceIds[(k + offset + 7) % staff.serviceIds.length];
        const customerId = customers[(k * 3 + si + offset + 20) % customers.length].id;
        const status: BookingStatus = offset < 0 ? (n % 5 === 0 ? "no-show" : "done") : "booked";
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

export function bookAppointment(
  data: ClinicData,
  input: { name: string; phone: string; serviceId: string; staffId: string; date: string; time: string },
  now: Date = new Date(),
): { data: ClinicData; booking: Booking } {
  if (!input.name.trim()) throw new Error("กรุณากรอกชื่อ");
  if (!isThaiPhone(input.phone)) throw new Error("เบอร์โทรไม่ถูกต้อง");
  const free = availableSlots(data, { date: input.date, staffId: input.staffId, serviceId: input.serviceId, now });
  if (!free.includes(input.time)) throw new Error("เวลานี้ไม่ว่างแล้ว กรุณาเลือกเวลาใหม่");

  const phone = normalizePhone(input.phone);
  let customers = data.customers;
  let customer = customers.find((c) => c.phone === phone);
  if (!customer) {
    customer = { id: newId("c"), name: input.name.trim(), phone };
    customers = [...customers, customer];
  }
  const booking: Booking = {
    id: newId("b"),
    customerId: customer.id,
    serviceId: input.serviceId,
    staffId: input.staffId,
    date: input.date,
    time: input.time,
    status: "booked",
  };
  return { data: { ...data, customers, bookings: [...data.bookings, booking] }, booking };
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
  if (data.bookings.some((b) => b.customerId === id)) throw new Error("ลบไม่ได้ ลูกค้ารายนี้มีประวัติการจอง");
  return { ...data, customers: data.customers.filter((c) => c.id !== id) };
}

export function upsertService(data: ClinicData, s: Service): ClinicData {
  return { ...data, services: upsert(data.services, s) };
}

export function deleteService(data: ClinicData, id: string): ClinicData {
  if (data.bookings.some((b) => b.serviceId === id)) throw new Error("ลบไม่ได้ บริการนี้มีการจองอยู่");
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

export function bookingsByService(data: ClinicData): { serviceId: string; name: string; count: number }[] {
  return data.services.map((s) => ({
    serviceId: s.id,
    name: s.name,
    count: data.bookings.filter((b) => b.serviceId === s.id).length,
  }));
}
