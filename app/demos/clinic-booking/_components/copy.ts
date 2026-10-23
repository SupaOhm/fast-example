import type { L } from "@/lib/demos/lang";
import type { BookingStatus, ClinicErrorCode } from "@/lib/demos/clinic-booking/data";

export const ui = {
  brand: { th: "ลูมิ คลินิก", en: "Lumi Clinic" },
  minutes: { th: "{n} นาที", en: "{n} min" },
  free: { th: "ฟรี", en: "Free" },
  clockTime: { th: "{time} น.", en: "{time}" },
  resetData: { th: "รีเซ็ตข้อมูล", en: "Reset data" },
} satisfies Record<string, L>;

export const statusLabel: Record<BookingStatus, L> = {
  booked: { th: "จองแล้ว", en: "Booked" },
  "checked-in": { th: "มาถึงแล้ว", en: "Arrived" },
  done: { th: "เสร็จสิ้น", en: "Done" },
  "no-show": { th: "ไม่มา", en: "No-show" },
};

export const errorText: Record<ClinicErrorCode, L> = {
  "name-required": { th: "กรุณากรอกชื่อ", en: "Please enter a name." },
  "phone-invalid": { th: "เบอร์โทรไม่ถูกต้อง", en: "That phone number doesn't look right." },
  "slot-taken": { th: "เวลานี้ไม่ว่างแล้ว กรุณาเลือกเวลาใหม่", en: "That time was just taken. Please pick another." },
  "customer-has-bookings": { th: "ลบไม่ได้ ลูกค้ารายนี้มีประวัติการจอง", en: "Can't delete: this customer has bookings." },
  "service-has-bookings": { th: "ลบไม่ได้ บริการนี้มีการจองอยู่", en: "Can't delete: this treatment has bookings." },
};
