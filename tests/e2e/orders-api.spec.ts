import { expect, test } from "@playwright/test";

test("POST /orders returns 201 and shows a LINE notification", async ({ page }) => {
  await page.goto("/demos/orders-api");
  await page.getByTestId("endpoint-POST-/orders").click();
  await page.getByTestId("api-send").click();
  await expect(page.getByTestId("api-status")).toHaveText(/201/);
  await expect(page.getByTestId("line-preview")).toContainText("ORD-1009");
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
  await expect(page.getByTestId("line-preview")).toHaveCount(0);
  await expect(page.getByTestId("api-status")).toHaveCount(0);
  await page.getByTestId("endpoint-GET-/orders").click();
  await page.getByTestId("api-path").fill("/orders");
  await page.getByTestId("api-send").click();
  await expect(page.getByTestId("api-response")).toContainText('"count": 8');
});
