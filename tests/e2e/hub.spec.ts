import { expect, test } from "@playwright/test";
import { packagesByService } from "../../lib/packages";

const price = (n: number) => `฿${n.toLocaleString("en-US")}`;

test("service tiles switch between the website and web app lineups", async ({ page }) => {
  await page.goto("/en");
  const web = page.getByRole("tab", { name: /Websites/ });
  const app = page.getByRole("tab", { name: /Web apps/ });
  await expect(web).toHaveAttribute("aria-selected", "true");
  for (const pkg of packagesByService("web")) await expect(page.getByTestId(`plan-${pkg.id}`)).toBeVisible();
  for (const pkg of packagesByService("app")) await expect(page.getByTestId(`plan-${pkg.id}`)).toBeHidden();
  await app.click();
  await expect(app).toHaveAttribute("aria-selected", "true");
  for (const pkg of packagesByService("app")) await expect(page.getByTestId(`plan-${pkg.id}`)).toBeVisible();
  for (const pkg of packagesByService("web")) await expect(page.getByTestId(`plan-${pkg.id}`)).toBeHidden();
});

test("every plan shows its price, demo link and Fastwork link", async ({ page }) => {
  await page.goto("/en");
  for (const [service, tab] of [["web", /Websites/], ["app", /Web apps/]] as const) {
    await page.getByRole("tab", { name: tab }).click();
    for (const pkg of packagesByService(service)) {
      const plan = page.getByTestId(`plan-${pkg.id}`);
      await expect(plan).toContainText(price(pkg.priceTHB));
      await expect(plan.getByRole("link", { name: "Try the demo" })).toHaveAttribute("href", pkg.demoPath);
      await expect(plan.getByRole("link", { name: /Order on Fastwork/ })).toHaveAttribute("href", pkg.fastworkUrl);
    }
  }
});

test("each plan fans out one real screenshot per page it includes", async ({ page }) => {
  await page.goto("/en");
  for (const pkg of packagesByService("web")) {
    const imgs = page.getByTestId(`plan-${pkg.id}`).locator("img");
    await expect(imgs).toHaveCount(pkg.pages.length);
    for (const img of await imgs.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    }
  }
});

test("arrow keys move between service tiles", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("tab", { name: /Websites/ }).focus();
  await page.keyboard.press("ArrowRight");
  const app = page.getByRole("tab", { name: /Web apps/ });
  await expect(app).toHaveAttribute("aria-selected", "true");
  await expect(app).toBeFocused();
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: /Websites/ })).toBeFocused();
});

test("compare button links to the compare page for the shown service", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("tabpanel").getByRole("link", { name: "Compare plans" })).toHaveAttribute(
    "href",
    "/en/compare?service=web",
  );
  await page.getByRole("tab", { name: /Web apps/ }).click();
  await expect(page.getByRole("tabpanel").getByRole("link", { name: "Compare plans" })).toHaveAttribute(
    "href",
    "/en/compare?service=app",
  );
});

test("Thai lineup uses Thai labels", async ({ page }) => {
  await page.goto("/th");
  await expect(page.getByRole("tab", { name: /เว็บไซต์/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("plan-web-basic").getByRole("link", { name: "ลองเดโม่" })).toHaveAttribute(
    "href",
    "/demos/sale-page",
  );
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

test("process shows five steps with a picture each, and about lists the facts", async ({ page }) => {
  await page.goto("/en");
  const steps = page.locator("#process ol > li");
  await expect(steps).toHaveCount(5);
  await expect(steps.nth(3)).toContainText("bigger logo?");
  await expect(steps.nth(4)).toContainText("Handover notes");
  await expect(page.locator("#about")).toContainText("Supakorn (Ohm)");
  await expect(page.locator("#about dl")).toContainText("Mizuhada Group");
  await expect(page.locator("#about dl")).toContainText("FastAPI");
});

test("Thai process and about read in Thai", async ({ page }) => {
  await page.goto("/th");
  await expect(page.locator("#process ol > li").nth(3)).toContainText("โลโก้ใหญ่ขึ้นอีกนิด?");
  await expect(page.locator("#about dl")).toContainText("ประสบการณ์");
});
