import { expect, test } from "@playwright/test";

test("navigation reaches all three pages with their own titles", async ({ page }) => {
  await page.goto("/demos/company");
  await expect(page).toHaveTitle(/สยามพรีซิชั่น/);
  await page.getByRole("navigation").getByRole("link", { name: "บริการ" }).click();
  await expect(page).toHaveURL(/\/demos\/company\/services$/);
  await expect(page).toHaveTitle(/บริการ/);
  await page.getByRole("navigation").getByRole("link", { name: "ติดต่อเรา" }).click();
  await expect(page).toHaveTitle(/ติดต่อ/);
});

test("contact form shows errors, then succeeds", async ({ page }) => {
  await page.goto("/demos/company/contact");
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("error-name")).toBeVisible();
  await expect(page.getByTestId("error-email")).toBeVisible();

  await page.getByLabel("ชื่อผู้ติดต่อ").fill("สมชาย ใจดี");
  await page.getByLabel("อีเมล").fill("somchai@example.com");
  await page.getByLabel("บริการที่สนใจ").selectOption("cnc");
  await page.getByLabel("รายละเอียดงาน").fill("ต้องการใบเสนอราคางานกลึง 200 ชิ้น");
  await page.getByTestId("contact-submit").click();
  await expect(page.getByTestId("contact-success")).toBeVisible();
});
