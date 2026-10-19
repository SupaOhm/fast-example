import { SERVICES } from "@/lib/demos/company/content";
import { isEmail, isThaiPhone } from "@/lib/validation";

export interface ContactInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  if (!input.name.trim()) errors.name = "กรุณากรอกชื่อ";
  if (!isEmail(input.email)) errors.email = "อีเมลไม่ถูกต้อง";
  if (input.phone.trim() && !isThaiPhone(input.phone)) errors.phone = "เบอร์โทรไม่ถูกต้อง";
  if (!SERVICES.some((s) => s.id === input.service)) errors.service = "กรุณาเลือกบริการ";
  if (input.message.trim().length < 10) errors.message = "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร";
  return errors;
}
