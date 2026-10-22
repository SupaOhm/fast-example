import { SERVICES } from "@/lib/demos/company/content";
import type { Lang } from "@/lib/demos/lang";
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

const MESSAGES = {
  name: { th: "กรุณากรอกชื่อ", en: "Please enter your name" },
  email: { th: "อีเมลไม่ถูกต้อง", en: "Please enter a valid email address" },
  phone: { th: "เบอร์โทรไม่ถูกต้อง", en: "Please enter a valid phone number" },
  service: { th: "กรุณาเลือกบริการ", en: "Please choose a service" },
  message: { th: "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร", en: "Please describe the job in at least 10 characters" },
} satisfies Record<string, Record<Lang, string>>;

export function validateContact(input: ContactInput, lang: Lang): ContactErrors {
  const errors: ContactErrors = {};
  if (!input.name.trim()) errors.name = MESSAGES.name[lang];
  if (!isEmail(input.email)) errors.email = MESSAGES.email[lang];
  if (input.phone.trim() && !isThaiPhone(input.phone)) errors.phone = MESSAGES.phone[lang];
  if (!SERVICES.some((s) => s.id === input.service)) errors.service = MESSAGES.service[lang];
  if (input.message.trim().length < 10) errors.message = MESSAGES.message[lang];
  return errors;
}
