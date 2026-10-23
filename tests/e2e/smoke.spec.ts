import { expect, test } from "@playwright/test";
import { routes } from "./routes";

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

for (const path of ["/en", "/th"]) {
  for (const [width, height] of [[768, 1024], [1024, 768]]) {
    test(`hub does not scroll sideways at ${width}x${height} ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(path, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test("root asks for a language and goes to the one picked", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Choose your language");
  await page.getByRole("link", { name: /ภาษาไทย/ }).click();
  await expect(page).toHaveURL(/\/th$/);
});

test("returning visitors skip the language chooser", async ({ page }) => {
  await page.goto("/th");
  await page.waitForFunction(() => localStorage.getItem("showcase:locale") === "th");
  await page.goto("/");
  await expect(page).toHaveURL(/\/th$/);
});

test("unknown locale returns 404", async ({ page }) => {
  const res = await page.goto("/fr");
  expect(res?.status()).toBe(404);
});
