import { expect, test } from "@playwright/test";

test("customer books a slot tomorrow and sees a LINE-style confirmation", async ({ page }) => {
  await page.goto("/demos/clinic-booking");
  await page.getByTestId("book-cta").click();
  await expect(page).toHaveURL(/\/book$/);
  await page.getByTestId("service-s-facial").click();
  await page.getByTestId("staff-st-2").click();
  await page.getByTestId("date-1").click();
  await page.getByTestId("slot").first().click();
  await page.getByTestId("book-name").fill("ทดสอบ ระบบ");
  await page.getByTestId("book-phone").fill("0800000099");
  await page.getByTestId("book-confirm").click();
  await expect(page.getByTestId("booking-confirmed")).toContainText("ทดสอบ ระบบ");
});
