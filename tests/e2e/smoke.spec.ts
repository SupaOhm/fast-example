import { expect, test } from "@playwright/test";
import { routes } from "./routes";

test.beforeEach(async ({ page }) => {
  // Log in to both app demos so admin routes render their real content.
  await page.addInitScript(() => {
    localStorage.setItem("demo:shop-admin:session", "true");
    localStorage.setItem("demo:clinic:session", "true");
  });
});

for (const route of routes) {
  test(`smoke ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    const res = await page.goto(route, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page.locator("main").first()).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test("root redirects to /en", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
});

test("unknown locale returns 404", async ({ page }) => {
  const res = await page.goto("/fr");
  expect(res?.status()).toBe(404);
});
