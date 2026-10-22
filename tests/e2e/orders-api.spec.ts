import { expect, test } from "@playwright/test";

test.use({ locale: "th-TH" });

test("the shop's LINE fills with orders on its own", async ({ page }) => {
  await page.goto("/demos/orders-api");
  const phone = page.getByTestId("story-phone");
  await expect(phone).toContainText("ORD-1001");
  await expect(page.getByTestId("story-log")).toContainText("POST");
  // The first three events are on screen at load; ORD-1003 only arrives with the first tick.
  await expect(phone).not.toContainText("ORD-1003");
  await expect(phone).toContainText("ORD-1003", { timeout: 6000 });
});

test("the console shows an example response before the first send", async ({ page }) => {
  await page.goto("/demos/orders-api");
  await page.getByTestId("endpoint-POST-/orders").click();
  await expect(page.getByTestId("example-response")).toBeVisible();
  await expect(page.getByTestId("api-status")).toHaveCount(0);
  await expect(page.getByTestId("line-preview")).toContainText("ORD-1008");
});

test("POST /orders returns 201 and shows a LINE notification", async ({ page }) => {
  await page.goto("/demos/orders-api");
  await page.getByTestId("endpoint-POST-/orders").click();
  await page.getByTestId("api-send").click();
  await expect(page.getByTestId("api-status")).toHaveText(/201/);
  await expect(page.getByTestId("example-response")).toHaveCount(0);
  await expect(page.getByTestId("line-preview")).toContainText("ORD-1009");
  await expect(page.getByTestId("line-preview")).toContainText("ออเดอร์ใหม่");
});

test("invalid JSON shows a client-side error, not a crash", async ({ page }) => {
  await page.goto("/demos/orders-api");
  await page.getByTestId("endpoint-POST-/orders").click();
  await page.getByTestId("api-body").fill("{ nope");
  await page.getByTestId("api-send").click();
  await expect(page.getByTestId("api-status")).toHaveText(/400/);
});

test("reset restores seed data", async ({ page }) => {
  await page.goto("/demos/orders-api");
  await page.getByTestId("endpoint-POST-/orders").click();
  await page.getByTestId("api-send").click();
  await page.getByTestId("reset-demo").click();
  await expect(page.getByTestId("line-preview")).not.toContainText("ORD-1009");
  await expect(page.getByTestId("api-status")).toHaveCount(0);
  await expect(page.getByTestId("example-response")).toBeVisible();
  await page.getByTestId("endpoint-GET-/orders").click();
  await page.getByTestId("api-path").fill("/orders");
  await page.getByTestId("api-send").click();
  await expect(page.getByTestId("api-response")).toContainText('"count": 8');
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the LINE messages read in English", async ({ page }) => {
    await page.goto("/demos/orders-api");
    await expect(page.getByTestId("story-phone")).toContainText("New order");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("An order comes in, and LINE pings right away");
  });

  test("the console sends a request and words the LINE alert in English", async ({ page }) => {
    await page.goto("/demos/orders-api");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("endpoint-POST-/orders").click();
    await page.getByTestId("api-send").click();
    await expect(page.getByTestId("api-status")).toHaveText(/201/);
    await expect(page.getByTestId("line-preview")).toContainText("New order");
    await expect(page.getByTestId("line-preview")).toContainText("ORD-1009");
  });
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the story shows a still, filled state", async ({ page }) => {
    await page.goto("/demos/orders-api");
    const phone = page.getByTestId("story-phone");
    await expect(phone).toContainText("ORD-1001");
    const before = await phone.textContent();
    await page.waitForTimeout(2500);
    expect(await phone.textContent()).toBe(before);
  });
});
