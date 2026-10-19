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

test("a customer booking shows up in the staff queue", async ({ page }) => {
  await page.goto("/demos/clinic-booking/book");
  await page.getByTestId("service-s-facial").click();
  await page.getByTestId("staff-st-2").click();
  await page.getByTestId("date-1").click();
  await page.getByTestId("slot").first().click();
  await page.getByTestId("book-name").fill("คิวจากหน้าเว็บ");
  await page.getByTestId("book-phone").fill("0800000088");
  await page.getByTestId("book-confirm").click();
  await expect(page.getByTestId("booking-confirmed")).toBeVisible();

  await page.goto("/demos/clinic-booking/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByTestId("login-submit").click();
  await page.getByTestId("queue-date-1").click();
  const row = page.getByTestId("queue-row").filter({ hasText: "คิวจากหน้าเว็บ" });
  await expect(row).toBeVisible();
  await row.getByTestId("queue-status").selectOption("checked-in");
  await expect(row).toHaveAttribute("data-status", "checked-in");
});

test("customers CRUD blocks deleting customers with bookings", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin/login");
  await page.getByTestId("login-submit").click();
  await page.getByRole("link", { name: "ลูกค้า" }).click();
  await page.getByTestId("customer-add").click();
  await page.getByTestId("customer-name").fill("ลูกค้าใหม่ ทดสอบ");
  await page.getByTestId("customer-phone").fill("0800000077");
  await page.getByTestId("customer-save").click();
  const newRow = page.getByTestId("customer-row").filter({ hasText: "ลูกค้าใหม่ ทดสอบ" });
  await expect(newRow).toBeVisible();
  await newRow.getByTestId("customer-delete").click();
  await expect(newRow).toHaveCount(0);

  await page
    .locator('[data-testid="customer-row"]:not([data-bookings="0"])')
    .first()
    .getByTestId("customer-delete")
    .click();
  await expect(page.getByTestId("crud-error")).toContainText("ลบไม่ได้");
});

test("reports render charts", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin/login");
  await page.getByTestId("login-submit").click();
  await page.getByRole("link", { name: "รายงาน" }).click();
  await expect(page.getByTestId("revenue-chart")).toBeVisible();
  await expect(page.getByTestId("service-chart")).toBeVisible();
});
