import { expect, test } from "@playwright/test";
import { getService, packagesByService } from "../../lib/packages";

test("compare page defaults to websites and shows every website row for every plan", async ({ page }) => {
  await page.goto("/en/compare");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare plans");
  await expect(page.getByRole("tab", { name: /Websites/ })).toHaveAttribute("aria-selected", "true");
  for (const row of getService("web").rows) {
    for (const pkg of packagesByService("web")) {
      await expect(page.getByTestId(`cell-${row.key}-${pkg.id}`)).toBeVisible();
    }
  }
  await expect(page.getByTestId("cell-form-web-basic")).toContainText("Basic: Not included: Contact form");
  await expect(page.getByTestId("cell-form-web-standard")).toContainText("Included: Contact form");
  await expect(page.getByTestId("cell-pages-web-premium")).toContainText("5");
});

test("?service=app opens the web app plans", async ({ page }) => {
  await page.goto("/en/compare?service=app");
  await expect(page.getByRole("tab", { name: /Web apps/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("cell-login-app-standard")).toContainText("Basic login");
  await expect(page.getByTestId("cell-api-app-basic")).toContainText("Up to 4 REST endpoints");
  await expect(page.getByTestId("cell-form-web-basic")).toHaveCount(0);
});

test("?service=bogus falls back to websites without errors", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (e) => errors.push(e));
  await page.goto("/en/compare?service=bogus");
  await expect(page.getByRole("tab", { name: /Websites/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: /Web apps/ })).toHaveAttribute("aria-selected", "false");
  await expect(page.getByTestId("cell-form-web-basic")).toBeVisible();
  await expect(page.getByTestId("cell-login-app-standard")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("switching service updates the URL", async ({ page }) => {
  await page.goto("/en/compare");
  await page.getByRole("tab", { name: /Web apps/ }).click();
  await expect(page).toHaveURL(/\/en\/compare\?service=app$/);
  await expect(page.getByTestId("cell-screens-app-premium")).toBeVisible();
});

test("plan header stays visible while scrolling the table", async ({ page }) => {
  await page.goto("/en/compare");
  await page.getByTestId("cell-rev-web-basic").evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  const box = await page.getByTestId("compare-head").boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(60);
  expect(box!.y).toBeLessThanOrEqual(70);
});

test("header and hero link to the compare page", async ({ page }) => {
  await page.goto("/en");
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Compare", exact: true, includeHidden: true }),
  ).toHaveAttribute("href", "/en/compare");
  await expect(page.getByRole("link", { name: "Packages from ฿4,900" })).toHaveAttribute("href", "/en/compare");
});

test("language switch stays on the compare page and keeps the service", async ({ page }) => {
  await page.goto("/en/compare?service=app");
  await page.getByRole("banner").getByRole("link", { name: "เปลี่ยนเป็นภาษาไทย" }).click();
  await expect(page).toHaveURL(/\/th\/compare\?service=app$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("เปรียบเทียบแพ็กเกจ");
  await expect(page.getByTestId("cell-login-app-premium")).toContainText("ระบบบัญชีและการเข้าสู่ระบบ");
});

test("no off-platform contact details on the compare page", async ({ page }) => {
  for (const path of ["/en/compare", "/th/compare"]) {
    await page.goto(path);
    expect(await page.content()).not.toMatch(/mailto:|tel:|line\.me/);
  }
});

test("the back link returns to the hub's work section on the service picked here", async ({ page }) => {
  await page.goto("/en/compare");
  const back = page.getByRole("link", { name: "Back to the work" });
  await expect(back).toHaveAttribute("href", "/en#work");
  expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.getByRole("tab", { name: /Web apps/ }).click();
  await expect(page).toHaveURL(/\?service=app/);
  await back.click();
  await expect(page).toHaveURL(/\/en\?service=app#work$/);
  await expect(page.locator("#tab-work-app")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#panel-work-app")).toBeVisible();
});

test("without a picked service the back link opens the hub on websites, and it reads in Thai", async ({ page }) => {
  await page.goto("/th/compare");
  await page.getByRole("link", { name: "กลับไปหน้าผลงาน" }).click();
  await expect(page).toHaveURL(/\/th#work$/);
  await expect(page.locator("#tab-work-web")).toHaveAttribute("aria-selected", "true");
});
