import { expect, test } from "@playwright/test";
import { packages } from "../../lib/packages";

test("every project row shows price and links to its demo and Fastwork listing", async ({ page }) => {
  await page.goto("/en");
  for (const pkg of packages) {
    const row = page.getByTestId(`package-${pkg.id}`);
    await expect(row).toContainText(`฿${pkg.priceTHB.toLocaleString("en-US")}`);
    await expect(row.getByRole("link", { name: "Try it live" })).toHaveAttribute("href", pkg.demoPath);
    await expect(row.getByRole("link", { name: "Order on Fastwork" })).toHaveAttribute("href", pkg.fastworkUrl);
  }
  await expect(page.getByTestId("package-app-premium")).toContainText("Book a slot in the LINE-style flow");
});

test("locale switch goes to Thai and back", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("See exactly what you're paying for.");
  await page.getByRole("link", { name: "เปลี่ยนเป็นภาษาไทย" }).click();
  await expect(page).toHaveURL(/\/th/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("เห็นชัดๆ");
  await page.getByRole("link", { name: "Switch to English" }).click();
  await expect(page).toHaveURL(/\/en/);
});

test("no off-platform contact details on the hub", async ({ page }) => {
  for (const path of ["/en", "/th"]) {
    await page.goto(path);
    const html = await page.content();
    expect(html).not.toMatch(/mailto:|tel:|line\.me/);
  }
});

test("hero wall motion can be paused and resumed", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Pause motion" }).click();
  await page.getByRole("button", { name: "Play motion" }).click();
  await expect(page.getByRole("button", { name: "Pause motion" })).toBeVisible();
});

test("header hire button goes to the Fastwork profile", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("banner").getByRole("link", { name: "Hire on Fastwork" })).toHaveAttribute(
    "href",
    "https://fastwork.com/user/devohm",
  );
});

test("project rows show real demo thumbnails", async ({ page }) => {
  await page.goto("/en");
  for (const pkg of packages) {
    const img = page.getByTestId(`package-${pkg.id}`).locator("img");
    await expect(img).toHaveAttribute("src", new RegExp(`/thumbs/${pkg.id}\\.jpg`));
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }
});

test("Thai project rows use Thai labels", async ({ page }) => {
  await page.goto("/th");
  const row = page.getByTestId("package-web-basic");
  await expect(row.getByRole("link", { name: "ลองใช้งานจริง" })).toHaveAttribute("href", "/demos/sale-page");
  await expect(row.getByRole("link", { name: "สั่งซื้อบน Fastwork" })).toBeVisible();
});
