import { expect, test, type Page } from "@playwright/test";

// Demos with the EN/TH switch. Each later step of the demo rework adds its demo here.
// `where` is the landmark whose text proves the language; `next` is another page of the same demo.
const DEMOS = [
  { name: "resort", home: "/demos/resort", next: "/demos/resort/rooms", where: "navigation", en: "Rooms", th: "ห้องพัก" },
  { name: "sale page", home: "/demos/sale-page", next: "/demos/sale-page", where: "main", en: "Order on LINE", th: "สั่งซื้อทาง LINE" },
  { name: "company", home: "/demos/company", next: "/demos/company/services", where: "navigation", en: "Services", th: "บริการ" },
  { name: "orders api", home: "/demos/orders-api", next: "/demos/orders-api", where: "main", en: "An order comes in", th: "ออเดอร์เข้าปุ๊บ" },
  { name: "shop admin", home: "/demos/shop-admin", next: "/demos/shop-admin/orders", where: "navigation", en: "Orders", th: "คำสั่งซื้อ" },
] as const;

// The demo bar's small print, which is always visible.
const BAR = { en: "Demo · fictional business", th: "เว็บตัวอย่าง · ธุรกิจสมมติ" };

const probe = (page: Page, d: (typeof DEMOS)[number]) => page.getByRole(d.where).first();
const bar = (page: Page) => page.getByTestId("demo-pill");

for (const d of DEMOS) {
  test.describe(`${d.name} with a Thai browser`, () => {
    test.use({ locale: "th-TH" });

    test("opens in the hub language when the hub has a choice", async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("showcase:locale", "en"));
      await page.goto(d.home);
      await expect(probe(page, d)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);
    });

    test("opens in Thai when the hub has no choice", async ({ page }) => {
      await page.goto(d.home);
      await page.waitForLoadState("networkidle");
      await expect(probe(page, d)).toContainText(d.th);
      await expect(bar(page)).toContainText(BAR.th);
    });

    test("the switch changes the copy and the bar, holds across pages, and leaves the hub alone", async ({ page }) => {
      await page.goto(d.home);
      await page.waitForLoadState("networkidle");
      await page.getByTestId("lang-switch").click();
      await expect(probe(page, d)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);

      await page.goto(d.next);
      await expect(probe(page, d)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);
      expect(await page.evaluate(() => localStorage.getItem("showcase:locale"))).toBeNull();
    });

    test("Back returns to the hub language, not the demo's", async ({ page }) => {
      // Seed the hub choice once, so a later write by the hub would show up.
      await page.addInitScript(() => {
        if (!sessionStorage.getItem("seeded")) {
          localStorage.setItem("showcase:locale", "th");
          sessionStorage.setItem("seeded", "1");
        }
      });
      await page.goto(d.home);
      await page.waitForLoadState("networkidle");
      await page.getByTestId("lang-switch").click();
      await expect(bar(page)).toContainText(BAR.en);
      await bar(page).getByRole("link", { name: "Back to showcase" }).click();
      await expect(page).toHaveURL(/\/th#work$/);
      expect(await page.evaluate(() => localStorage.getItem("showcase:locale"))).toBe("th");
    });
  });

  test.describe(`${d.name} with an English browser`, () => {
    test.use({ locale: "en-US" });

    test("opens in English when the hub has no choice", async ({ page }) => {
      await page.goto(d.home);
      await expect(probe(page, d)).toContainText(d.en);
      await expect(bar(page)).toContainText(BAR.en);
    });
  });
}
