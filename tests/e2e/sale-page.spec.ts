import { expect, test } from "@playwright/test";

// The rest of the file reads the Thai page; a Thai browser with no hub choice opens it in Thai.
test.use({ locale: "th-TH" });

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

test("the promo countdown ticks", async ({ page }) => {
  await page.goto("/demos/sale-page");
  const timer = page.getByTestId("promo-countdown");
  await expect(timer).toHaveText(/^\d{2} : \d{2} : \d{2}$/);
  const first = await timer.textContent();
  await expect(timer).not.toHaveText(first!, { timeout: 3000 });
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the page and its bundles read in English", async ({ page }) => {
    await page.goto("/demos/sale-page");
    await expect(page.getByTestId("hero-cta")).toContainText("Order on LINE");
    await expect(page.getByTestId("bundle").first()).toContainText("1 bottle");
    await expect(page.locator("html")).not.toContainText("สั่งซื้อทาง LINE");
  });
});
