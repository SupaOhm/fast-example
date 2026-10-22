// Usage: pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
//        node scripts/capture-thumbs.mjs http://localhost:3100
//        lsof -ti tcp:3100 | xargs kill
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3100";

// Hero wall and Fastwork covers: one 1440×900 shot per package.
const thumbs = {
  "web-basic": "/demos/sale-page",
  "web-standard": "/demos/company",
  "web-premium": "/demos/resort",
  "app-basic": "/demos/orders-api",
  "app-standard": "/demos/shop-admin",
  "app-premium": "/demos/clinic-booking/book",
};

// Hub lineup fans: every page a plan includes, at 640×400. Keep in step with `pages` in lib/packages.ts.
const pages = {
  "web-basic": ["/demos/sale-page"],
  "web-standard": ["/demos/company", "/demos/company/services", "/demos/company/contact"],
  "web-premium": ["/demos/resort", "/demos/resort/rooms", "/demos/resort/gallery", "/demos/resort/about", "/demos/resort/booking"],
  "app-basic": ["/demos/orders-api"],
  "app-standard": ["/demos/shop-admin", "/demos/shop-admin/orders", "/demos/shop-admin/stock"],
  "app-premium": [
    "/demos/clinic-booking/book",
    "/demos/clinic-booking/admin",
    "/demos/clinic-booking/admin/customers",
    "/demos/clinic-booking/admin/services",
    "/demos/clinic-booking/admin/reports",
  ],
};

await mkdir("public/thumbs/pages", { recursive: true });
const browser = await chromium.launch();

async function openPage(viewport, deviceScaleFactor) {
  const context = await browser.newContext({ viewport, deviceScaleFactor });
  await context.addInitScript(() => {
    // The hub's screenshots show the demos in Thai, their main language.
    localStorage.setItem("demo:lang", JSON.stringify("th"));
    localStorage.setItem("demo:shop-admin:session", "true");
    localStorage.setItem("demo:clinic:session", "true");
  });
  const page = await context.newPage();
  // Pin the browser clock to today at 10:30 local, so time-of-day UI (the clinic
  // chat's timestamps, open slots) looks like business hours whenever we capture.
  const fixed = new Date();
  fixed.setHours(10, 30, 0, 0);
  await page.clock.setFixedTime(fixed);
  return page;
}

async function shoot(page, path, file) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: '[data-testid="demo-pill"]{display:none!important}' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: file, type: "jpeg", quality: 82 });
  console.log(`captured ${file}`);
}

const large = await openPage({ width: 1440, height: 900 }, 1);
for (const [id, path] of Object.entries(thumbs)) await shoot(large, path, `public/thumbs/${id}.jpg`);

const small = await openPage({ width: 1280, height: 800 }, 0.5);
for (const [id, list] of Object.entries(pages)) {
  for (const [i, path] of list.entries()) await shoot(small, path, `public/thumbs/pages/${id}-${i + 1}.jpg`);
}
await browser.close();
