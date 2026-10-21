import { expect, test } from "@playwright/test";

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// These tests start from Thai; with no hub choice, a Thai browser opens the demo in Thai.
test.use({ locale: "th-TH" });

test("language toggle switches copy and persists", async ({ page }) => {
  await page.goto("/demos/resort");
  await page.waitForLoadState("networkidle");
  await page.getByTestId("lang-switch").click();
  await expect(page.getByRole("navigation").first()).toContainText("Rooms");
  await page.reload();
  await expect(page.getByRole("navigation").first()).toContainText("Rooms");
});

test("room filter narrows results", async ({ page }) => {
  await page.goto("/demos/resort/rooms");
  const all = await page.getByTestId("room-card").count();
  await page.getByTestId("filter-type-villa").click();
  const villas = await page.getByTestId("room-card").count();
  expect(villas).toBeLessThan(all);
  await page.getByTestId("filter-guests").selectOption("10");
  await expect(page.getByTestId("rooms-empty")).toBeVisible();
});

test("gallery lightbox opens, navigates and closes", async ({ page }) => {
  await page.goto("/demos/resort/gallery");
  await page.getByTestId("gallery-item").first().click();
  const box = page.getByTestId("lightbox");
  await expect(box).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(box).toContainText("2 / 9");
  await page.keyboard.press("Escape");
  await expect(box).toBeHidden();
});

test("booking inquiry validates dates and succeeds", async ({ page }) => {
  await page.goto("/demos/resort/booking");
  await page.getByTestId("input-checkIn").fill(iso(10));
  await page.getByTestId("input-checkOut").fill(iso(8));
  await page.getByTestId("inquiry-submit").click();
  await expect(page.getByTestId("error-checkOut")).toBeVisible();

  await page.getByTestId("input-checkOut").fill(iso(12));
  await page.getByTestId("input-name").fill("Alex");
  await page.getByTestId("input-email").fill("alex@example.com");
  await page.getByTestId("inquiry-submit").click();
  await expect(page.getByTestId("inquiry-success")).toContainText("2");
});
