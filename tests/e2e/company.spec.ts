import { expect, test } from "@playwright/test";

test.describe("in Thai", () => {
  test.use({ locale: "th-TH" });

  test("navigation reaches all three pages with their own titles", async ({ page }) => {
    await page.goto("/demos/company");
    await expect(page).toHaveTitle(/Siam Precision/);
    await page.getByRole("navigation").getByRole("link", { name: "บริการ" }).click();
    await expect(page).toHaveURL(/\/demos\/company\/services$/);
    await expect(page).toHaveTitle(/Services · บริการ/);
    await page.getByRole("navigation").getByRole("link", { name: "ติดต่อเรา" }).click();
    await expect(page).toHaveTitle(/Contact · ติดต่อเรา/);
  });

  test("contact form shows errors, then succeeds", async ({ page }) => {
    await page.goto("/demos/company/contact");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("error-name")).toHaveText("กรุณากรอกชื่อ");
    await expect(page.getByTestId("error-email")).toBeVisible();

    await page.getByLabel("ชื่อผู้ติดต่อ").fill("สมชาย ใจดี");
    await page.getByLabel("อีเมล").fill("somchai@example.com");
    await page.getByLabel("บริการที่สนใจ").selectOption("cnc");
    await page.getByLabel("รายละเอียดงาน").fill("ต้องการใบเสนอราคางานกลึง 200 ชิ้น");
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("contact-success")).toBeVisible();
  });
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the contact form speaks English, and switching language re-words its errors", async ({ page }) => {
    await page.goto("/demos/company/contact");
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel("Contact name")).toBeVisible();
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("error-name")).toHaveText("Please enter your name");
    await page.getByTestId("lang-switch").click();
    await expect(page.getByTestId("error-name")).toHaveText("กรุณากรอกชื่อ");
  });
});
