import { expect, test, type Page } from "@playwright/test";

const BOOK = "/demos/clinic-booking/book";
const STAFF_TH: Record<string, string> = { "st-1": "พญ. ลลิตา", "st-2": "คุณมิว", "st-3": "คุณบีม" };

test.use({ locale: "th-TH" });

test.beforeEach(async ({ page }) => {
  // Pin "now" to 10:30 today so the day is in progress and there are free times left.
  const t = new Date();
  t.setHours(10, 30, 0, 0);
  await page.clock.setFixedTime(t);
});

// On phones the two sides are tabs; on desktop both are always showing.
async function show(page: Page, side: "ลูกค้า" | "คลินิก") {
  const tab = page.getByRole("tab", { name: new RegExp(`^${side}`) });
  if (await tab.isVisible()) await tab.click();
}

async function bookFacial(page: Page) {
  await page.goto(BOOK);
  await page.getByTestId("service-s-facial").click();
  const slot = page.getByTestId("slot").first();
  const time = (await slot.getAttribute("data-time"))!;
  const staff = (await slot.getAttribute("data-staff"))!;
  await slot.click();
  await expect(page.getByTestId("book-name")).toHaveValue("คุณลูกค้าเดโม");
  await page.getByTestId("book-confirm").click();
  return { time, staff };
}

test("the clinic's day is already in progress", async ({ page }) => {
  await page.goto(BOOK);
  await show(page, "คลินิก");
  const schedule = page.getByTestId("clinic-schedule");
  await expect(schedule.getByTestId("schedule-now")).toBeVisible();
  await expect(schedule.locator('[data-testid="schedule-block"][data-status="done"]').first()).toBeAttached();
  await expect(schedule.locator('[data-testid="schedule-block"][data-status="checked-in"]').first()).toBeAttached();
  await expect(schedule.locator('[data-testid="schedule-block"][data-status="booked"]').first()).toBeAttached();
});

test("three taps book a facial, and it lands highlighted in that staff member's schedule", async ({ page }) => {
  const { time, staff } = await bookFacial(page);
  await expect(page.getByTestId("booking-confirmed")).toContainText(time);
  await expect(page.getByTestId("booking-toast")).toContainText(STAFF_TH[staff]);
  await show(page, "คลินิก");
  const block = page.locator('[data-testid="schedule-block"][data-new="true"]');
  await expect(block).toBeVisible();
  await expect(block).toHaveAttribute("data-staff", staff);
  await expect(block).toHaveAttribute("data-time", time);
  await expect(block).toHaveAttribute("data-status", "booked");
});

test("a booked time is no longer offered, and restart goes back to the first tap", async ({ page }) => {
  const { time, staff } = await bookFacial(page);
  await page.getByRole("button", { name: "เริ่มใหม่" }).first().click();
  await page.getByTestId("service-s-facial").click();
  await expect(page.locator(`[data-testid="slot"][data-time="${time}"][data-staff="${staff}"]`)).toHaveCount(0);
});

test("a blank name shows an inline error and books nothing", async ({ page }) => {
  await page.goto(BOOK);
  await page.getByTestId("service-s-mask").click();
  await page.getByTestId("slot").first().click();
  await page.getByTestId("book-name").fill("");
  await page.getByTestId("book-confirm").click();
  await expect(page.getByText("กรุณากรอกชื่อ")).toBeVisible();
  await expect(page.getByTestId("booking-confirmed")).toHaveCount(0);
});

test("on phones the clinic tab shows a badge when the booking lands", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile", "tabs exist on phones only");
  await bookFacial(page);
  await expect(page.getByTestId("clinic-tab-badge")).toBeVisible();
  await page.getByRole("tab", { name: /^คลินิก/ }).click();
  await expect(page.getByTestId("clinic-tab-badge")).toHaveCount(0);
  await expect(page.locator('[data-testid="schedule-block"][data-new="true"]')).toBeVisible();
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the chat and the schedule read in English", async ({ page }) => {
    await page.goto(BOOK);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Book in three taps");
    await expect(page.getByTestId("service-s-facial")).toContainText("Brightening facial");
    await page.getByTestId("service-s-facial").click();
    await expect(page.getByTestId("slot").first()).toContainText(/Khun|Dr\./);
    await page.getByTestId("slot").first().click();
    await expect(page.getByTestId("book-name")).toHaveValue("Demo guest");
    await page.getByTestId("book-confirm").click();
    await expect(page.getByTestId("booking-toast")).toContainText("schedule");
  });
});
