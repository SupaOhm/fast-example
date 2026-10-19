import { expect, test } from "@playwright/test";
import { packages } from "../../lib/packages";

test("every package card links to its demo and Fastwork listing", async ({ page }) => {
  await page.goto("/th");
  for (const pkg of packages) {
    const card = page.getByTestId(`package-${pkg.id}`);
    await expect(card).toContainText(`฿${pkg.priceTHB.toLocaleString("en-US")}`);
    await expect(card.getByRole("link", { name: "ดูตัวอย่าง" })).toHaveAttribute("href", pkg.demoPath);
    await expect(card.getByRole("link", { name: /สั่งซื้อบน Fastwork/ })).toHaveAttribute("href", pkg.fastworkUrl);
  }
});

test("locale switch goes to English and back", async ({ page }) => {
  await page.goto("/th");
  await page.getByRole("link", { name: "Switch to English" }).click();
  await expect(page).toHaveURL(/\/en/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Websites and web apps");
  await page.getByRole("link", { name: "เปลี่ยนเป็นภาษาไทย" }).click();
  await expect(page).toHaveURL(/\/th/);
});

test("no off-platform contact details on the hub", async ({ page }) => {
  await page.goto("/th");
  const html = await page.content();
  expect(html).not.toMatch(/mailto:|tel:|line\.me/);
});

test("package cards show real demo thumbnails", async ({ page }) => {
  await page.goto("/th");
  for (const pkg of packages) {
    const img = page.getByTestId(`package-${pkg.id}`).locator("img");
    await expect(img).toHaveAttribute("src", new RegExp(`/thumbs/${pkg.id}\\.jpg`));
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }
});
