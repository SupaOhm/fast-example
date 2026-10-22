import { expect, test } from "@playwright/test";

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// The whole file runs with a Thai browser. With no hub choice, the demo then opens in Thai, which the language test starts from.
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

test("availability strip hands a stay to the booking form", async ({ page }) => {
  await page.goto("/demos/resort");
  const strip = page.getByTestId("availability");
  await strip.scrollIntoViewIfNeeded();
  await expect(strip.getByTestId("night").first()).toHaveAttribute("data-iso", /\d{4}-\d{2}-\d{2}/);

  // Find two neighbouring open nights.
  const nights = strip.getByTestId("night");
  const count = await nights.count();
  let first = -1;
  for (let i = 0; i < count - 1; i++) {
    if ((await nights.nth(i).isEnabled()) && (await nights.nth(i + 1).isEnabled())) {
      first = i;
      break;
    }
  }
  expect(first).toBeGreaterThanOrEqual(0);
  const checkIn = await nights.nth(first).getAttribute("data-iso");
  const checkOut = await nights.nth(first + 1).getAttribute("data-iso");

  await nights.nth(first).click();
  await nights.nth(first + 1).click();
  await expect(strip.getByTestId("availability-summary")).toContainText("1");
  await strip.getByTestId("availability-book").click();

  await expect(page).toHaveURL(/\/demos\/resort\/booking\?/);
  await expect(page.getByTestId("input-checkIn")).toHaveValue(checkIn!);
  await expect(page.getByTestId("input-checkOut")).toHaveValue(checkOut!);
  await expect(page.getByTestId("input-roomId")).toHaveValue("sea-deluxe");
  await expect(page.getByTestId("inquiry-nights")).toContainText("1");
});

test("room rail steps through all five rooms", async ({ page }) => {
  await page.goto("/demos/resort");
  const rail = page.getByTestId("room-rail");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail.getByRole("link")).toHaveCount(5);
  await expect(rail.getByTestId("rail-counter")).toHaveText("01 / 05");
  await rail.getByTestId("rail-next").click();
  await expect(rail.getByTestId("rail-counter")).toHaveText("02 / 05");
  await expect(rail.getByRole("link").first()).toHaveAttribute("href", /\/demos\/resort\/booking\?room=/);
});

test("the moon rises as you scroll the hero", async ({ page }) => {
  await page.goto("/demos/resort");
  await page.waitForLoadState("networkidle");
  const line = page.getByTestId("moonrise-line");
  const opacity = () => line.evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(await opacity()).toBeLessThan(0.2);
  const hero = page.getByTestId("moonrise-hero");
  const height = await hero.evaluate((el) => el.getBoundingClientRect().height);
  await page.mouse.wheel(0, height * 0.7);
  await expect.poll(opacity).toBeGreaterThan(0.9);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the hero is one screen tall and doesn't animate", async ({ page }) => {
    await page.goto("/demos/resort");
    const hero = page.getByTestId("moonrise-hero");
    const [height, viewport] = await hero.evaluate((el) => [el.getBoundingClientRect().height, window.innerHeight]);
    expect(height).toBeLessThanOrEqual(viewport + 1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
