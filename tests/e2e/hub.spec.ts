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
  const wall = page.locator(".hero-wall");
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(wall).toHaveAttribute("data-paused", "true");
  const states = () =>
    page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => (a.effect as KeyframeEffect).target?.closest(".hero-wall"))
        .map((a) => a.playState),
    );
  expect(await states()).toEqual(["paused", "paused", "paused"]);
  await page.getByRole("button", { name: "Play motion" }).click();
  await expect(wall).not.toHaveAttribute("data-paused");
  expect(await states()).toEqual(["running", "running", "running"]);
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

test("hero wall has no empty bands at any point of the loop", async ({ page }) => {
  await page.goto("/en");
  await page.waitForLoadState("networkidle");
  for (const time of [0, 10000, 20000, 30000, 39000]) {
    const misses = await page.evaluate((t) => {
      const wall = document.querySelector(".hero-wall") as HTMLElement;
      const anims = document
        .getAnimations()
        .filter((a) => (a.effect as KeyframeEffect).target?.closest(".hero-wall"));
      for (const a of anims) {
        a.pause();
        a.currentTime = t;
      }
      const r = wall.getBoundingClientRect();
      const top = Math.max(r.top, 0);
      const bottom = Math.min(r.bottom, window.innerHeight);
      const missed: string[] = [];
      for (const fx of [0.08, 0.5, 0.92]) {
        for (let i = 0; i <= 8; i++) {
          const x = r.left + r.width * fx;
          const y = top + 2 + ((bottom - top - 4) * i) / 8;
          // Probe a few px apart so a point inside the margin between two screenshots still counts.
          const hit = [0, 20, -20, 40, -40].some((dy) =>
            document.elementsFromPoint(x, y + dy).some((el) => el.tagName === "IMG" && wall.contains(el)),
          );
          if (!hit) missed.push(`${Math.round(x)},${Math.round(y)}`);
        }
      }
      return missed;
    }, time);
    expect(misses, `uncovered points at t=${time}ms`).toEqual([]);
  }
});
