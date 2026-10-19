import { describe, expect, it } from "vitest";
import { isEmail, isThaiPhone, normalizePhone } from "@/lib/validation";

describe("validation", () => {
  it("accepts plausible emails only", () => {
    expect(isEmail("a@b.co")).toBe(true);
    expect(isEmail("a@b")).toBe(false);
    expect(isEmail("a b@c.com")).toBe(false);
  });

  it("normalizes phone separators", () => {
    expect(normalizePhone("080-000 0001")).toBe("0800000001");
  });

  it("accepts Thai 9–10 digit numbers starting with 0", () => {
    expect(isThaiPhone("080-000-0001")).toBe(true);
    expect(isThaiPhone("021234567")).toBe(true);
    expect(isThaiPhone("1800000001")).toBe(false);
    expect(isThaiPhone("08000")).toBe(false);
  });
});
