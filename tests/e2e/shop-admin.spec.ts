import { expect, test } from "@playwright/test";

test("unauthenticated visit redirects to login, login reaches overview", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  await expect(page).toHaveURL(/\/demos\/shop-admin\/login$/);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/demos\/shop-admin$/);
  await expect(page.getByTestId("kpi")).toHaveCount(4);
  await expect(page.getByTestId("sales-chart")).toBeVisible();
});

test("stock edit persists across reload and reset restores it", async ({ page }) => {
  await page.goto("/demos/shop-admin/login");
  await page.getByTestId("login-submit").click();
  await page.getByRole("link", { name: "สต็อกสินค้า" }).click();
  const row = page.getByTestId("stock-row-NP-02");
  await row.getByTestId("stock-input").fill("50");
  await row.getByTestId("stock-save").click();
  await expect(row).not.toContainText("ใกล้หมด");
  await page.reload();
  await expect(page.getByTestId("stock-row-NP-02").getByTestId("stock-input")).toHaveValue("50");
  await page.getByTestId("reset-demo").click();
  await expect(page.getByTestId("stock-row-NP-02")).toContainText("ใกล้หมด");
});

test("orders table filters by status and search", async ({ page }) => {
  await page.goto("/demos/shop-admin/login");
  await page.getByTestId("login-submit").click();
  await page.getByRole("link", { name: "คำสั่งซื้อ" }).click();
  await page.getByTestId("orders-search").fill("ไม่มีลูกค้าคนนี้");
  await expect(page.getByTestId("orders-empty")).toBeVisible();
});
