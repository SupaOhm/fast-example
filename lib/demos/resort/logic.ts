import { parseISODate } from "@/lib/dates";
import { isEmail } from "@/lib/validation";
import type { L, Lang } from "@/lib/demos/lang";

export type RoomType = "deluxe" | "suite" | "villa";

export interface Room {
  id: string;
  type: RoomType;
  name: L;
  guests: number;
  sizeSqm: number;
  pricePerNight: number;
  features: L[];
  image: string;
}

export function filterRooms(rooms: Room[], { type, guests }: { type: RoomType | "all"; guests: number }): Room[] {
  return rooms.filter((r) => (type === "all" || r.type === type) && r.guests >= guests);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = parseISODate(checkOut).getTime() - parseISODate(checkIn).getTime();
  return Math.round(ms / 86_400_000);
}

export interface InquiryInput {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId: string;
  name: string;
  email: string;
}

export type InquiryErrors = Partial<Record<keyof InquiryInput, string>>;

const messages = {
  checkInRequired: { th: "กรุณาเลือกวันเช็กอิน", en: "Choose a check-in date" },
  checkInPast: { th: "วันเช็กอินต้องไม่เป็นวันที่ผ่านมาแล้ว", en: "Check-in can't be in the past" },
  checkOutRequired: { th: "กรุณาเลือกวันเช็กเอาต์", en: "Choose a check-out date" },
  checkOutOrder: { th: "วันเช็กเอาต์ต้องหลังวันเช็กอิน", en: "Check-out must be after check-in" },
  guests: { th: "จำนวนผู้เข้าพัก 1–8 คน", en: "Guests must be 1–8" },
  name: { th: "กรุณากรอกชื่อ", en: "Enter your name" },
  email: { th: "อีเมลไม่ถูกต้อง", en: "Enter a valid email" },
} satisfies Record<string, L>;

// ISO date strings compare correctly as plain strings.
export function validateInquiry(input: InquiryInput, today: string, lang: Lang): InquiryErrors {
  const errors: InquiryErrors = {};
  if (!input.checkIn) errors.checkIn = messages.checkInRequired[lang];
  else if (input.checkIn < today) errors.checkIn = messages.checkInPast[lang];
  if (!input.checkOut) errors.checkOut = messages.checkOutRequired[lang];
  else if (input.checkIn && input.checkOut <= input.checkIn) errors.checkOut = messages.checkOutOrder[lang];
  if (!Number.isInteger(input.guests) || input.guests < 1 || input.guests > 8) errors.guests = messages.guests[lang];
  if (!input.name.trim()) errors.name = messages.name[lang];
  if (!isEmail(input.email)) errors.email = messages.email[lang];
  return errors;
}
