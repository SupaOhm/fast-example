import { expect, test, type Page } from "@playwright/test";

// Demos with the EN/TH switch. Each later step of the demo rework adds its demo here.
// `where` is the landmark whose text proves the language; `next` is another page of the same demo.
const DEMOS = [
  { name: "resort", home: "/demos/resort", next: "/demos/resort/rooms", where: "navigation", en: "Rooms", th: "ห้องพัก" },
  { name: "sale page", home: "/demos/sale-page", next: "/demos/sale-page", where: "main", en: "Order on LINE", th: "สั่งซื้อทาง LINE" },
  { name: "company", home: "/demos/company", next: "/demos/company/services", where: "navigation", en: "Services", th: "บริการ" },
  { name: "orders api", home: "/demos/orders-api", next: "/demos/orders-api", where: "main", en: "An order comes in", th: "ออเดอร์เข้าปุ๊บ" },
  { name: "shop admin", home: "/demos/shop-admin", next: "/demos/shop-admin/orders", where: "navigation", en: "Orders", th: "คำสั่งซื้อ" },
  { name: "clinic", home: "/demos/clinic-booking", next: "/demos/clinic-booking/book", where: "main", en: "Book", th: "จองคิว" },
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

test("the demo bar shows the package and its price in full on phones too", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("showcase:locale", "en"));
  await page.goto("/demos/clinic-booking");
  const order = bar(page).getByRole("link", { name: /^Order/ });
  const title = bar(page).locator("p").first();
  const price = bar(page).getByText("฿29,900").filter({ visible: true });
  await expect(title).toContainText("Web app · Premium");
  await expect(price).toHaveCount(1);
  if (test.info().project.name === "mobile") {
    await expect(order).toHaveAccessibleName("Order");
    expect(await title.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    // The price leads the second line, so truncation only ever cuts the small print after it.
    const [box, line] = [await price.boundingBox(), await bar(page).locator("p").nth(1).boundingBox()];
    expect(box!.x + box!.width).toBeLessThanOrEqual(line!.x + line!.width);
  } else {
    await expect(order).toHaveAccessibleName("Order this package");
  }
});
