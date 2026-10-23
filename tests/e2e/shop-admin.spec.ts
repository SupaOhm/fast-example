import { expect, test, type Page } from "@playwright/test";

test.use({ locale: "th-TH" });

const nav = (page: Page) => page.getByRole("navigation", { name: "เมนูหลัก" });
const countIn = async (page: Page, testId: string) =>
  Number((await page.getByTestId(testId).innerText()).match(/\d+/)![0]);

test("opens on the overview without logging in", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  await expect(page).toHaveURL(/\/demos\/shop-admin$/);
  await expect(page.getByTestId("demo-session")).toContainText("กำลังดูในฐานะเจ้าของร้าน (เดโม)");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("สวัสดี คุณนิ่ม");
  await expect(page.getByTestId("todo-pack")).toContainText(/ต้องแพ็ก \d+ ออเดอร์/);
  await expect(page.getByTestId("todo-low")).toContainText(/ใกล้หมด \d+ สินค้า/);
  await expect(page.getByTestId("todo-sold")).toContainText("฿");
  await expect(page.getByTestId("pack-row").first()).toBeVisible();
  await expect(page.getByTestId("sales-chart")).toBeVisible();
});

test("one tap packs an order: the row stamps, the tile counts down, the order is packed", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  const before = await countIn(page, "todo-pack");
  const row = page.getByTestId("pack-row").first();
  const id = (await row.getAttribute("data-order-id"))!;
  await row.getByRole("button", { name: `แพ็กออเดอร์ ${id} แล้ว` }).click();
  await expect(page.locator(`[data-testid="pack-row"][data-order-id="${id}"]`)).toContainText("แพ็กแล้ว");
  await expect(page.getByTestId("todo-pack")).toContainText(`ต้องแพ็ก ${before - 1} ออเดอร์`);

  await nav(page).getByRole("link", { name: /^คำสั่งซื้อ/ }).click();
  await page.getByTestId("orders-search").fill(id);
  await expect(page.getByRole("combobox", { name: `สถานะคำสั่งซื้อ ${id}` })).toHaveValue("packed");
});

test("undo puts a packed order back in the queue", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  const before = await countIn(page, "todo-pack");
  const row = page.getByTestId("pack-row").first();
  const id = (await row.getAttribute("data-order-id"))!;
  await row.getByRole("button", { name: `แพ็กออเดอร์ ${id} แล้ว` }).click();
  await page.getByRole("button", { name: `เลิกทำออเดอร์ ${id}` }).click();
  await expect(page.getByRole("button", { name: `แพ็กออเดอร์ ${id} แล้ว` })).toBeVisible();
  await expect(page.getByTestId("todo-pack")).toContainText(`ต้องแพ็ก ${before} ออเดอร์`);
});

test("the sold-today till scrolls to the sales charts", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  await page.getByTestId("todo-sold").click();
  await expect(page.getByTestId("sales-chart")).toBeInViewport();
});

test("logging out shows the login, and logging in returns to the overview", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  await page.getByTestId("demo-session").getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/demos\/shop-admin\/login$/);
  await page.goto("/demos/shop-admin/orders");
  await expect(page).toHaveURL(/\/demos\/shop-admin\/login$/);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/demos\/shop-admin$/);
  await expect(page.getByTestId("demo-session")).toBeVisible();
});

test("a signed-in visit to the login page goes to the overview", async ({ page }) => {
  await page.goto("/demos/shop-admin/login");
  await expect(page).toHaveURL(/\/demos\/shop-admin$/);
});

test("stock edit persists across reload and reset restores it", async ({ page }) => {
  await page.goto("/demos/shop-admin");
  await nav(page).getByRole("link", { name: /^สต็อกสินค้า/ }).click();
  const row = page.getByTestId("stock-row-NP-02");
  await row.getByTestId("stock-input").fill("50");
  await row.getByTestId("stock-save").click();
  await expect(row).not.toContainText("ใกล้หมด");
  await page.reload();
  await expect(page.getByTestId("stock-row-NP-02").getByTestId("stock-input")).toHaveValue("50");
  await page.getByTestId("reset-demo").click();
  await expect(page.getByTestId("stock-row-NP-02")).toContainText("ใกล้หมด");
});

test("empty stock input shows inline error and keeps stored stock", async ({ page }) => {
  await page.goto("/demos/shop-admin/stock");
  const row = page.getByTestId("stock-row-NP-02");
  const input = row.getByTestId("stock-input");
  const before = await input.inputValue();
  await input.fill("");
  await row.getByTestId("stock-save").click();
  await expect(row.getByRole("alert")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("stock-row-NP-02").getByTestId("stock-input")).toHaveValue(before);
  await expect(page.getByTestId("stock-row-NP-02").getByRole("alert")).toHaveCount(0);
});

const rowStatusSelects = (page: Page) => page.getByRole("combobox", { name: /^สถานะคำสั่งซื้อ / });
const orderIds = (page: Page) =>
  rowStatusSelects(page).evaluateAll((els) => els.map((e) => (e.getAttribute("aria-label") ?? "").replace("สถานะคำสั่งซื้อ ", "")));

test("orders search with no match shows the empty state", async ({ page }) => {
  await page.goto("/demos/shop-admin/orders");
  await page.getByTestId("orders-search").fill("ไม่มีลูกค้าคนนี้");
  await expect(page.getByTestId("orders-empty")).toBeVisible();
});

test("orders status filter shows only cancelled orders", async ({ page }) => {
  await page.goto("/demos/shop-admin/orders");
  await expect(rowStatusSelects(page)).toHaveCount(15);
  await page.getByRole("combobox", { name: "สถานะ", exact: true }).selectOption("cancelled");
  const selects = rowStatusSelects(page);
  await expect(selects.first()).toBeVisible();
  const count = await selects.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(15);
  for (let i = 0; i < count; i++) {
    await expect(selects.nth(i)).toHaveValue("cancelled");
    await expect(selects.nth(i).locator("option:checked")).toHaveText("ยกเลิก");
  }
});

test("changing an order status persists across reload", async ({ page }) => {
  await page.goto("/demos/shop-admin/orders");
  const first = rowStatusSelects(page).first();
  await expect(first).toBeVisible();
  const label = await first.getAttribute("aria-label");
  const current = await first.inputValue();
  const next = current === "cancelled" ? "paid" : "cancelled";
  await first.selectOption(next);
  await expect(first).toHaveValue(next);
  await page.reload();
  await expect(page.getByRole("combobox", { name: label ?? "" })).toHaveValue(next);
});

test("orders paginate 15 per page", async ({ page }) => {
  await page.goto("/demos/shop-admin/orders");
  await expect(rowStatusSelects(page)).toHaveCount(15);
  const firstPage = await orderIds(page);
  expect(new Set(firstPage).size).toBe(15);
  await page.getByRole("button", { name: "หน้าถัดไป" }).click();
  await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();
  const count = await rowStatusSelects(page).count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(15);
  const secondPage = await orderIds(page);
  expect(secondPage.filter((id) => firstPage.includes(id))).toEqual([]);
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the overview, banner and packing read in English", async ({ page }) => {
    await page.goto("/demos/shop-admin");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hello, Khun Nim");
    await expect(page.getByTestId("demo-session")).toContainText("Viewing as the shop owner (demo)");
    await expect(page.getByTestId("todo-pack")).toContainText(/\d+ orders to pack/);
    const row = page.getByTestId("pack-row").first();
    await expect(row).toContainText("Khun ");
    const id = (await row.getAttribute("data-order-id"))!;
    await row.getByRole("button", { name: `Mark ${id} as packed` }).click();
    await expect(page.locator(`[data-testid="pack-row"][data-order-id="${id}"]`)).toContainText("Packed");
  });

  test("the login reads in English", async ({ page }) => {
    await page.goto("/demos/shop-admin");
    await page.getByTestId("demo-session").getByRole("button", { name: "Log out" }).click();
    await expect(page.getByTestId("login-submit")).toHaveText("Log in");
  });
});
