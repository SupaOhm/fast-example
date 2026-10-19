import { describe, expect, it } from "vitest";
import { validateContact, type ContactInput } from "@/lib/demos/company/validate-contact";

const valid: ContactInput = {
  name: "สมชาย ใจดี",
  company: "บริษัท ตัวอย่าง จำกัด",
  email: "somchai@example.com",
  phone: "",
  service: "cnc",
  message: "ต้องการใบเสนอราคางานกลึง 200 ชิ้น",
};

describe("validateContact", () => {
  it("accepts a valid enquiry with optional fields empty", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("requires name, valid email, service and a 10+ char message", () => {
    expect(validateContact({ ...valid, name: " ", email: "x", service: "", message: "สั้น" })).toEqual({
      name: "กรุณากรอกชื่อ",
      email: "อีเมลไม่ถูกต้อง",
      service: "กรุณาเลือกบริการ",
      message: "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร",
    });
  });

  it("validates phone only when provided", () => {
    expect(validateContact({ ...valid, phone: "080-000-0001" })).toEqual({});
    expect(validateContact({ ...valid, phone: "12345" })).toEqual({ phone: "เบอร์โทรไม่ถูกต้อง" });
  });

  it("rejects unknown services", () => {
    expect(validateContact({ ...valid, service: "nope" })).toEqual({ service: "กรุณาเลือกบริการ" });
  });
});
