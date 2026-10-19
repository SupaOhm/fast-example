import { expect, test } from "@playwright/test";

test("hero CTA scrolls to the order bundles", async ({ page }) => {
  await page.goto("/demos/sale-page");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByTestId("hero-cta").click();
  await expect(page.locator("#order")).toBeInViewport();
  await expect(page.getByTestId("bundle")).toHaveCount(3);
});

test("FAQ items expand", async ({ page }) => {
  await page.goto("/demos/sale-page");
  const first = page.getByTestId("faq-item").first();
  await first.locator("summary").click();
  await expect(first).toHaveAttribute("open", "");
});

test("demo pill links back to the hub", async ({ page }) => {
  await page.goto("/demos/sale-page");
  await expect(page.getByTestId("demo-pill")).toContainText("฿4,900");
});
