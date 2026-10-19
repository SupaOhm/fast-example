// Usage: pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
//        node scripts/capture-thumbs.mjs http://localhost:3100
//        lsof -ti tcp:3100 | xargs kill
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3100";
const targets = {
  "web-basic": "/demos/sale-page",
  "web-standard": "/demos/company",
  "web-premium": "/demos/resort",
  "app-basic": "/demos/orders-api",
  "app-standard": "/demos/shop-admin",
  "app-premium": "/demos/clinic-booking/book",
};

await mkdir("public/thumbs", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await context.addInitScript(() => {
  localStorage.setItem("demo:shop-admin:session", "true");
  localStorage.setItem("demo:clinic:session", "true");
});
const page = await context.newPage();
// Pin the browser clock to today at 10:30 local, so time-of-day UI (the clinic
// chat's timestamps, open slots) looks like business hours whenever we capture.
const fixed = new Date();
fixed.setHours(10, 30, 0, 0);
await page.clock.setFixedTime(fixed);
for (const [id, path] of Object.entries(targets)) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: '[data-testid="demo-pill"]{display:none!important}' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `public/thumbs/${id}.jpg`, type: "jpeg", quality: 82 });
  console.log(`captured ${id}`);
}
await browser.close();
