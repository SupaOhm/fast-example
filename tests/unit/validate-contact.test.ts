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
    expect(validateContact(valid, "th")).toEqual({});
  });

  it("requires name, valid email, service and a 10+ char message", () => {
    expect(validateContact({ ...valid, name: " ", email: "x", service: "", message: "สั้น" }, "th")).toEqual({
      name: "กรุณากรอกชื่อ",
      email: "อีเมลไม่ถูกต้อง",
      service: "กรุณาเลือกบริการ",
      message: "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร",
    });
  });

  it("validates phone only when provided", () => {
    expect(validateContact({ ...valid, phone: "080-000-0001" }, "th")).toEqual({});
    expect(validateContact({ ...valid, phone: "12345" }, "th")).toEqual({ phone: "เบอร์โทรไม่ถูกต้อง" });
  });

  it("rejects unknown services", () => {
    expect(validateContact({ ...valid, service: "nope" }, "th")).toEqual({ service: "กรุณาเลือกบริการ" });
  });

  it("writes messages in English when asked", () => {
    expect(validateContact({ ...valid, name: " ", email: "x", service: "", message: "short" }, "en")).toEqual({
      name: "Please enter your name",
      email: "Please enter a valid email address",
      service: "Please choose a service",
      message: "Please describe the job in at least 10 characters",
    });
    expect(validateContact({ ...valid, phone: "12345" }, "en")).toEqual({ phone: "Please enter a valid phone number" });
  });
});
