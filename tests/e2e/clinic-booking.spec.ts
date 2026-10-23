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

test("a page left open moves statuses on with the clock", async ({ page }) => {
  await page.goto(BOOK);
  await show(page, "คลินิก");
  const block = page.locator('[data-testid="schedule-block"][data-staff="st-3"][data-time="11:00"]');
  await expect(block).toHaveAttribute("data-status", "booked");
  const later = new Date();
  later.setHours(17, 45, 0, 0);
  await page.clock.setFixedTime(later);
  // Any re-render reads the clock again; switching the language is the quickest one.
  await page.getByTestId("lang-switch").click();
  await expect(block).toHaveAttribute("data-status", "done");
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

test("only a booking made during this visit is marked new, so a reload shows none", async ({ page }) => {
  await bookFacial(page);
  await show(page, "คลินิก");
  await expect(page.locator('[data-testid="schedule-block"][data-new="true"]')).toHaveCount(1);
  await page.reload();
  await show(page, "คลินิก");
  await expect(page.getByTestId("schedule-block").first()).toBeAttached();
  await expect(page.locator('[data-testid="schedule-block"][data-new="true"]')).toHaveCount(0);
});

test("the toast's close button hides it and keeps focus in the page", async ({ page }) => {
  await bookFacial(page);
  const toast = page.getByTestId("booking-toast");
  await expect(toast).toContainText(/คุณ|พญ\./);
  await page.getByTestId("booking-toast-close").click();
  await expect(toast).toBeEmpty();
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
});

test("the page never scrolls sideways", async ({ page }) => {
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.goto(BOOK);
  await expect(page.getByTestId("service-s-facial")).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.getByTestId("service-s-facial").click();
  await page.getByTestId("slot").first().click();
  await page.getByTestId("book-confirm").click();
  await show(page, "คลินิก");
  await expect(page.locator('[data-testid="schedule-block"][data-new="true"]')).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
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

test("on phones, See it closes the toast and moves focus to the clinic tab", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile", "the See it button exists on phones only");
  await bookFacial(page);
  await page.getByRole("button", { name: "ดูในตาราง" }).click();
  await expect(page.getByTestId("booking-toast")).toBeEmpty();
  await expect(page.getByRole("tab", { name: /^คลินิก/ })).toBeFocused();
});

test("on desktop there are no tabs, so no clinic tab badge", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "both sides show at once on desktop only");
  await bookFacial(page);
  await expect(page.getByTestId("booking-confirmed")).toBeVisible();
  await expect(page.getByTestId("clinic-tab-badge")).toHaveCount(0);
  await expect(page.getByRole("tabpanel")).toHaveCount(0);
});

test("on desktop the toast is a banner inside the schedule, covering neither side", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "phones keep the fixed bottom toast");
  await bookFacial(page);
  await expect(page.getByTestId("booking-toast")).toHaveCount(1);
  const banner = page.getByTestId("clinic-schedule").getByTestId("booking-toast");
  await expect(banner).toContainText("คิวใหม่");
  expect(await banner.evaluate((el) => getComputedStyle(el).position)).toBe("static");
  const toast = (await banner.boundingBox())!;
  const card = (await page.getByTestId("booking-confirmed").boundingBox())!;
  expect(toast.x).toBeGreaterThanOrEqual(card.x + card.width);
});

test("on desktop the banner stays until it is closed, and restart clears it", async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "the phone bar hides itself after 6 s");
  await bookFacial(page);
  const banner = page.getByTestId("clinic-schedule").getByTestId("booking-toast");
  await expect(banner).toContainText("คิวใหม่");
  await page.waitForTimeout(7000);
  await expect(banner).toContainText("คิวใหม่");
  await page.getByTestId("booking-toast-close").click();
  await expect(banner).toBeEmpty();
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);

  await page.getByRole("button", { name: "เริ่มใหม่" }).click();
  await page.getByTestId("service-s-mask").click();
  await page.getByTestId("slot").first().click();
  await page.getByTestId("book-confirm").click();
  await expect(banner).toContainText("คิวใหม่");
  await page.getByRole("button", { name: "เริ่มใหม่" }).click();
  await expect(banner).toBeEmpty();
});

test("on phones the toast is a single fixed bar", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile", "the fixed bar is the phone variant");
  await bookFacial(page);
  await expect(page.getByTestId("booking-toast")).toHaveCount(1);
  expect(await page.getByTestId("booking-toast").evaluate((el) => getComputedStyle(el).position)).toBe("fixed");
});

test("the admin opens without a login and highlights the booking just made", async ({ page }) => {
  const { time } = await bookFacial(page);
  await page.goto("/demos/clinic-booking/admin");
  await expect(page).toHaveURL(/\/demos\/clinic-booking\/admin$/);
  await expect(page.getByTestId("demo-session")).toContainText("กำลังดูในฐานะเจ้าหน้าที่คลินิก (เดโม)");
  const row = page.locator('[data-testid="queue-row"][data-highlight="true"]');
  await expect(row).toBeVisible();
  await expect(row).toContainText("คุณลูกค้าเดโม");
  await expect(row).toContainText(time);
  await row.getByTestId("queue-status").selectOption("checked-in");
  await expect(row).toHaveAttribute("data-status", "checked-in");
});

test("the queue shows today in progress", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin");
  await expect(page.locator('[data-testid="queue-row"][data-status="done"]').first()).toBeVisible();
  await expect(page.locator('[data-testid="queue-row"][data-status="booked"]').first()).toBeVisible();
});

test("a status set by hand stays put after a reload, in the queue and the booking page's schedule", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin");
  const done = page.locator('[data-testid="queue-row"][data-status="done"]').first();
  const id = (await done.getAttribute("data-booking-id"))!;
  const row = page.locator(`[data-testid="queue-row"][data-booking-id="${id}"]`);
  await row.getByTestId("queue-status").selectOption("booked");
  await expect(row).toHaveAttribute("data-status", "booked");
  await expect(row.getByTestId("queue-status")).toHaveValue("booked");
  await page.reload();
  await expect(row).toHaveAttribute("data-status", "booked");
  await expect(row.getByTestId("queue-status")).toHaveValue("booked");
  await page.goto(BOOK);
  await show(page, "คลินิก");
  await expect(page.locator(`[data-testid="schedule-block"][data-booking-id="${id}"]`)).toHaveAttribute("data-status", "booked");
});

test("logging out shows the login, and logging in returns to the queue", async ({ page }) => {
  await page.goto("/demos/clinic-booking/admin");
  await page.getByTestId("demo-session").getByRole("button", { name: "ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/demos/clinic-booking/admin/customers");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/demos\/clinic-booking\/admin$/);
  await expect(page.getByTestId("demo-session")).toBeVisible();
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

  test("the schedule's lanes are headed by English names", async ({ page }) => {
    await page.goto(BOOK);
    const tab = page.getByRole("tab", { name: /^Clinic/ });
    if (await tab.isVisible()) await tab.click();
    const heads = page.getByTestId("schedule-lane-head");
    await expect(heads).toHaveCount(3);
    for (const head of await heads.all()) await expect(head).toContainText(/^(Khun|Dr\.) /);
  });

  test("the admin reads in English", async ({ page }) => {
    await page.goto("/demos/clinic-booking/admin");
    await expect(page.getByTestId("demo-session")).toContainText("Viewing as clinic staff (demo)");
    await expect(page.getByRole("navigation", { name: "Main menu" })).toContainText("Customers");
    await expect(page.getByTestId("queue-row").first()).toContainText(/Khun|Dr\./);
  });
});
