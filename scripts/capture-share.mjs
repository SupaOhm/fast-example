// The 1200×630 picture LINE, Facebook and chat apps show for a shared hub link, one per language.
// Usage: pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
//        node scripts/capture-share.mjs http://localhost:3100
//        lsof -ti tcp:3100 | xargs kill
// Needs the network for Google Fonts. Re-run after changing the hero line or the demo screenshots.
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3100";

const copy = {
  en: { sub: "Websites and web apps, each with a live demo you can try before you order." },
  th: { sub: "รับทำเว็บไซต์และเว็บแอป\nทุกแพ็กเกจมีเว็บตัวอย่างให้ลองก่อนสั่ง" },
};

// Back to front: the fan's top card is the resort, the richest screenshot.
const shots = ["app-standard", "app-premium", "web-premium"];

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The hero title marks its accent word as *word* (components/hub/hero.tsx renders it with <Scribble>).
function headline(title) {
  return escape(title)
    .replace(
      /\*(.+?)\*/,
      '<span class="scribble">$1<svg viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M1 6.5 C 22 3.5, 55 2.8, 99 4.8" /></svg></span>',
    )
    .replace(/\n/g, "<br>");
}

function html(locale, title) {
  const cards = shots
    .map((id, i) => `<img class="card card-${i}" src="${base}/thumbs/${id}.jpg" alt="">`)
    .join("");
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=Itim&family=Kalam:wght@700&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    position: relative;
    background: #0e1a14;
    color: #efeadb;
    font-family: "Anuphan", sans-serif;
  }
  /* Faint lime glow behind the fan, the only light in the picture. */
  body::before {
    content: "";
    position: absolute;
    right: -140px;
    top: 40px;
    width: 720px;
    height: 620px;
    background: radial-gradient(closest-side, #d7ff5c22, transparent);
  }
  .text {
    position: absolute;
    left: 72px;
    top: 64px;
    bottom: 60px;
    width: 620px;
    display: flex;
    flex-direction: column;
  }
  .brand {
    font-family: "Bricolage Grotesque", sans-serif;
    font-weight: 800;
    font-size: 30px;
    letter-spacing: -0.02em;
  }
  h1 {
    margin-top: auto;
    font-family: "Bricolage Grotesque", "Anuphan", sans-serif;
    font-weight: 800;
    font-size: 74px;
    line-height: 1.02;
    letter-spacing: -0.035em;
  }
  :lang(th) h1 { font-family: "Anuphan", sans-serif; font-weight: 700; font-size: 70px; line-height: 1.22; letter-spacing: 0; }
  .scribble {
    position: relative;
    display: inline-block;
    font-family: "Kalam", cursive;
    font-weight: 700;
    font-size: 1.05em;
    letter-spacing: -0.01em;
    color: #d7ff5c;
  }
  :lang(th) .scribble { font-family: "Itim", cursive; font-weight: 400; }
  .scribble svg {
    position: absolute;
    left: 0;
    top: calc(100% - 0.12em);
    width: 100%;
    height: 0.24em;
    overflow: visible;
  }
  :lang(th) .scribble svg { top: calc(100% - 0.2em); }
  .scribble path { fill: none; stroke: #d7ff5c; stroke-width: 4.4; stroke-linecap: round; }
  .sub {
    margin-top: 30px;
    max-width: 520px;
    font-size: 26px;
    line-height: 1.4;
    color: #b4b3a6;
  }
  .url {
    margin-top: auto;
    font-family: "Bricolage Grotesque", sans-serif;
    font-weight: 500;
    font-size: 24px;
    color: #efeadb;
  }
  .card {
    position: absolute;
    width: 560px;
    aspect-ratio: 1440 / 900;
    border-radius: 14px;
    border: 1px solid #efeadb33;
    box-shadow: 0 30px 60px -20px #000c;
    object-fit: cover;
  }
  .card-0 { left: 830px; top: 30px; transform: rotate(7deg); }
  .card-1 { left: 790px; top: 205px; transform: rotate(-4deg); }
  .card-2 { left: 720px; top: 360px; transform: rotate(3deg); }
</style>
</head>
<body>
  ${cards}
  <div class="text">
    <div class="brand">SupaOhm</div>
    <h1>${headline(title)}</h1>
    <p class="sub">${escape(copy[locale].sub).replace(/\n/g, "<br>")}</p>
    <div class="url">devbyohm.com</div>
  </div>
</body>
</html>`;
}

await mkdir("public/share", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const locale of ["en", "th"]) {
  const dict = JSON.parse(await readFile(`lib/i18n/${locale}.json`, "utf8"));
  await page.setContent(html(locale, dict.hero.title), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const file = `public/share/${locale}.jpg`;
  await page.screenshot({ path: file, type: "jpeg", quality: 88 });
  console.log(`captured ${file}`);
}
await browser.close();
