import { expect, test, type Page } from "@playwright/test";

// Demos with the EN/TH switch. Each later step of the demo rework adds its demo here.
const DEMOS = [{ name: "resort", home: "/demos/resort", next: "/demos/resort/rooms", en: "Rooms", th: "ห้องพัก" }];

// The demo bar's small print, which is always visible.
const BAR = { en: "Demo · fictional business", th: "เว็บตัวอย่าง · ธุรกิจสมมติ" };

const nav = (page: Page) => page.getByRole("navigation").first();
const bar = (page: Page) => page.getByTestId("demo-pill");

for (const d of DEMOS) {
  test.describe(`${d.name} with a Thai browser`, () => {
    test.use({ locale: "th-TH" });

    test("opens in the hub language when the hub has a choice", async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("showcase:locale", "en"));
      await page.goto(d.home);
      await expect(nav(page)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);
    });

    test("opens in Thai when the hub has no choice", async ({ page }) => {
      await page.goto(d.home);
      await page.waitForLoadState("networkidle");
      await expect(nav(page)).toContainText(d.th);
      await expect(bar(page)).toContainText(BAR.th);
    });

    test("the switch changes the copy and the bar, holds across pages, and leaves the hub alone", async ({ page }) => {
      await page.goto(d.home);
      await page.waitForLoadState("networkidle");
      await page.getByTestId("lang-switch").click();
      await expect(nav(page)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);

      await page.goto(d.next);
      await expect(nav(page)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);
      expect(await page.evaluate(() => localStorage.getItem("showcase:locale"))).toBeNull();
    });
  });

  test.describe(`${d.name} with an English browser`, () => {
    test.use({ locale: "en-US" });

    test("opens in English when the hub has no choice", async ({ page }) => {
      await page.goto(d.home);
      await expect(nav(page)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);
    });
  });
}
