import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const t = new Date();
  t.setHours(10, 30, 0, 0);
  await page.clock.setFixedTime(t);
});

test.describe("in Thai", () => {
  test.use({ locale: "th-TH" });

  test("the hero shows the next free time and the team has portraits", async ({ page }) => {
    await page.goto("/demos/clinic-booking");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ลูมิ คลินิก");
    await expect(page.getByTestId("next-opening")).toContainText(/คิวว่างถัดไปวันนี้ \d{2}:\d{2}/);
    const cards = page.getByTestId("staff-card");
    await expect(cards).toHaveCount(3);
    await expect(cards.first().getByRole("img")).toBeVisible();
  });

  test("the book button opens the booking page and the footer opens the admin without a login", async ({ page }) => {
    await page.goto("/demos/clinic-booking");
    await page.getByTestId("book-cta").click();
    await expect(page).toHaveURL(/\/demos\/clinic-booking\/book$/);
    await page.goto("/demos/clinic-booking");
    await page.getByRole("link", { name: "ดูระบบหลังร้านคลินิก" }).click();
    await expect(page).toHaveURL(/\/demos\/clinic-booking\/admin$/);
  });
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the site reads in English with the staff named in English", async ({ page }) => {
    await page.goto("/demos/clinic-booking");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lumi Clinic");
    await expect(page.getByTestId("next-opening")).toContainText(/Next free time today \d{2}:\d{2}/);
    await expect(page.getByTestId("staff-card").first()).toContainText("Dr. Lalita");
    await expect(page.locator("main")).toContainText("Brightening facial");
  });
});

test.describe("outside opening hours", () => {
  test.use({ locale: "th-TH" });

  for (const [h, m] of [
    [18, 30],
    [8, 0],
  ] as const) {
    test(`at ${h}:${String(m).padStart(2, "0")} the hero still offers a time today`, async ({ page }) => {
      const t = new Date();
      t.setHours(h, m, 0, 0);
      await page.clock.setFixedTime(t);
      await page.goto("/demos/clinic-booking");
      await expect(page.getByTestId("next-opening")).toContainText(/คิวว่างถัดไปวันนี้ \d{2}:\d{2}/);
    });
  }
});
