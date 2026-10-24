import { expect, test } from "@playwright/test";
import { FASTWORK_PROFILE_URL, packages } from "../../lib/packages";

for (const [locale, demosLabel, siteLabel] of [
  ["en", "Live demos", "Quick links"],
  ["th", "เดโมที่ลองใช้ได้", "ลิงก์ด่วน"],
] as const) {
  test(`footer (${locale}) links all six demos by name and the site sections`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const footer = page.getByRole("contentinfo");
    const demos = footer.getByRole("navigation", { name: demosLabel });
    await expect(demos.getByRole("link")).toHaveCount(packages.length);
    for (const pkg of packages) {
      const link = demos.locator(`a[href="${pkg.demoPath}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).not.toHaveAttribute("target");
      await expect(link).toContainText(pkg.demoName[locale]);
      await expect(link).toContainText(pkg.tier[0].toUpperCase() + pkg.tier.slice(1));
    }
    const site = footer.getByRole("navigation", { name: siteLabel });
    const compare = site.locator(`a[href="/${locale}/compare"]`);
    await expect(compare).toBeVisible();
    await expect(compare).not.toHaveAttribute("aria-current");
    for (const hash of ["work", "process", "about"]) await expect(site.locator(`a[href="/${locale}#${hash}"]`)).toHaveCount(1);
  });
}

test("footer on the compare page marks Compare as current and switches language to the other compare page", async ({ page }) => {
  await page.goto("/en/compare");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("navigation", { name: "Quick links" }).locator('a[href="/en/compare"]')).toHaveAttribute(
    "aria-current",
    "page",
  );
  const toThai = footer.getByRole("link", { name: "เปลี่ยนเป็นภาษาไทย" });
  await expect(toThai).toHaveAttribute("href", "/th/compare");
  await page.goto("/en/compare?service=app");
  await toThai.click();
  await expect(page).toHaveURL(/\/th\/compare\?service=app$/);
});

test("footer profile link opens the Fastwork profile in a new tab", async ({ page }) => {
  for (const [locale, name] of [["en", /My Fastwork profile/], ["th", /โปรไฟล์ Fastwork ของเรา/]] as const) {
    await page.goto(`/${locale}`);
    const profile = page.getByRole("contentinfo").getByRole("link", { name });
    await expect(profile).toHaveAttribute("href", FASTWORK_PROFILE_URL);
    await expect(profile).toHaveAttribute("target", "_blank");
    await expect(profile).toHaveAttribute("rel", /noopener/);
  }
});

test("no off-platform contact details in the footer", async ({ page }) => {
  for (const path of ["/en", "/th", "/en/compare", "/th/compare"]) {
    await page.goto(path);
    const html = await page.getByRole("contentinfo").evaluate((el) => el.outerHTML);
    expect(html).not.toMatch(/mailto:|tel:|line\.me/);
  }
});

test("footer fits 360px with no sideways scroll and 44px tap targets", async ({ page }) => {
  test.skip(test.info().project.name !== "mobile", "phone layout");
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ["/en", "/th", "/en/compare", "/th/compare"]) {
    await page.goto(path);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    const heights = await page
      .getByRole("contentinfo")
      .locator("a")
      .evaluateAll((links) => links.map((a) => [a.textContent?.trim(), a.getBoundingClientRect().height] as const));
    expect(heights.length).toBeGreaterThan(10);
    for (const [text, h] of heights) expect(h, `${path}: ${text}`).toBeGreaterThanOrEqual(44);
  }
});
