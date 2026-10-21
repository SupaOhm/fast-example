# Mali Botanics Rework + English Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Mali Botanics sale page (Website Basic demo) in the approved deep-green and jasmine direction, and make it fully bilingual (Thai/English) through the shared demo language switch.

**Architecture:**
- All copy becomes `{ th, en }` (`L`) values. Business content lives in `lib/demos/sale-page/content.ts`; interface text lives in `app/demos/sale-page/_components/copy.ts`.
- The countdown is a pure function plus a small client component.
- The page is rebuilt as client components that read `useLang()` from the shared `components/demo/lang.tsx` (added in step 1).
- The visual design is done with the `frontend-design` skill, inside fixed constraints: tokens, copy, test ids, and the hero composition approved in the mockup.

**Tech stack:** Next.js 16.4 App Router (static export), React 19, TypeScript strict, Tailwind 4, `next/font/google` (Prompt), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-22-demo-rework-bilingual-design.md` → Part 2 "Mali Botanics", plus Part 3 step 2.
**Approved mockup:** `.superpowers/brainstorm/19193-1792598876/content/sale-c-price.html`, option **2** ("Gold price straight on green"). Local file; open it in a browser or read the HTML/CSS.

## Global Constraints

- **Static export:** keep `output: "export"`. No new dependencies. Read `node_modules/next/dist/docs/` before using a Next.js API not already used in this repo (AGENTS.md).
- **Fonts:** Prompt at weights **400, 600, 800** only (`next/font/google`, subsets `thai` and `latin`). No serif fonts. No `font-light` / weight 300 anywhere on the page.
- **Body text:** at least 16px at weight 400 or heavier. Small print such as notes and legal lines may be 14px but no smaller.
- **Palette tokens** (set on the layout wrapper as CSS variables):

  | Token | Value | Use |
  |---|---|---|
  | `--green-deep` | `#17331f` | Hero and dark sections |
  | `--gold` | `#f2d16b` | Accents and price on dark |
  | `--gold-ink` | `#7a5c0f` | Gold-ish text on cream |
  | `--red` | `#d7263d` | Discount sticker only |
  | `--cream` | `#f6f1e4` | Light sections |
  | `--ink` | `#17331f` | Text on cream |
  | `--muted` | `#4b5a4e` | Secondary text on cream |
  | `--mint` | `#dfe9d6` | Secondary text on dark |
  | `--line-green` | `#04913e` | LINE buttons |

  - LINE buttons use `--line-green` with white text at **19px or larger, weight 600 or heavier**. That counts as large text, and the ratio is 4.10:1.
  - Red is used only on the discount sticker, with white text (4.96:1).
- **Contrast:** AA everywhere. Checked pairs: gold on deep green 9.22, mint on deep green 10.96, ink on cream 12.17, muted on cream 6.48, gold-ink on cream 5.53. Any other pair must be checked before use.
- **Language:**
  - Every visible string comes from `content.ts` or `copy.ts` as an `L` value and renders in `useLang()`'s language.
  - Prices use `formatTHB` and are the same in both languages.
  - Thai uses only "เรา" as a pronoun. Tone is professional.
- **Images:**
  - The jasmine hero photo is `PHOTOS.saleIngredient1` (already in `lib/images.ts`, Unsplash).
  - The product is the drawn SVG bottle, with no product photo. `PHOTOS.saleHero` is removed.
  - No AI images, no emoji as art, and no arch-shaped photo frames (arches belong to the resort).
- **Test ids kept:** `hero-cta` (scrolls to `#order`), `bundle` (exactly 3), `faq-item` (`<details>`).
- **Test ids added:** `promo-countdown`. The header uses the shared `DemoLangSwitch` (`lang-switch`).
- **Accessibility:** no horizontal overflow at 375px or 1440px, visible focus on every control, and `prefers-reduced-motion` respected (no animation then).
- **Commits:** end every message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Branch:** `feat/sale-page-rework`, cut from `main`. Never push or merge to `main` without Ohm's OK; merging deploys devbyohm.com.

## File map

| File | Change | Responsibility |
|---|---|---|
| `lib/demos/sale-page/content.ts` | Rewrite | Bilingual business content; bundles get `qty`; `fill()` helper |
| `app/demos/sale-page/_components/copy.ts` | Create | Bilingual interface text |
| `lib/demos/sale-page/countdown.ts` | Create | `msUntilEndOfDay`, `formatCountdown` |
| `app/demos/sale-page/layout.tsx` | Modify | Prompt 400/600/800, new tokens, `LangScope`, Latin metadata title |
| `app/demos/sale-page/page.tsx` | Rewrite | Composes the new sections |
| `app/demos/sale-page/_components/*` | Rewrite/replace | Header, countdown bar, hero, bottle, sticker, timeline, benefits, ingredients, reviews, order, FAQ, footer |
| `lib/images.ts`, `tests/unit/images.test.ts` | Modify | Drop `saleHero` (27 → 26 slots) |
| `tests/unit/sale-page-copy.test.ts` | Create | Copy completeness, `fill()` |
| `tests/unit/sale-countdown.test.ts` | Create | Countdown functions |
| `tests/e2e/sale-page.spec.ts` | Modify | Countdown, English switch |
| `tests/e2e/demo-lang.spec.ts` | Modify | Generalise `DEMOS`; add the sale page |
| `scripts/capture-thumbs.mjs` | Modify | Shoot demos in Thai (`demo:lang = "th"`) |
| `public/thumbs/web-basic.jpg`, `public/thumbs/pages/web-basic-1.jpg` | Regenerate | New look on the hub |

---

### Task 1: Bilingual content and copy

**Files:**
- Rewrite: `lib/demos/sale-page/content.ts`
- Create: `app/demos/sale-page/_components/copy.ts`
- Modify: `app/demos/sale-page/page.tsx`, `app/demos/sale-page/_components/hero.tsx`, `app/demos/sale-page/_components/order-section.tsx`, `app/demos/sale-page/layout.tsx` (temporary `.th` reads only; see Step 4)
- Test: `tests/unit/sale-page-copy.test.ts`

**Interfaces:**
- Consumes: `type L` from `@/lib/demos/lang`; `missingTranslations` from `tests/unit/helpers/missing-translations.ts`.
- Produces, from `@/lib/demos/sale-page/content`:
  - `brand`, `product`, `benefits`, `ingredients`, `reviews`, `bundles`, `days`, `faqs` (shapes below)
  - `fill(template: string, vars: Record<string, string>): string`, which replaces `{name}` placeholders
- Produces, from `app/demos/sale-page/_components/copy.ts`: `ui` (keys below), all `L`.

- [ ] **Step 1: Write the failing test.** Create `tests/unit/sale-page-copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ui } from "@/app/demos/sale-page/_components/copy";
import * as content from "@/lib/demos/sale-page/content";
import { missingTranslations } from "./helpers/missing-translations";

describe("sale page copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations({ ui, content })).toEqual([]);
  });

  it("keeps the price placeholders in both languages", () => {
    for (const t of [ui.promoBar, ui.orderSub, ui.perBottle]) {
      expect(t.th).toContain("{price}");
      expect(t.en).toContain("{price}");
    }
  });

  it("has bundles of 1, 2 and 3 bottles with one highlighted", () => {
    expect(content.bundles.map((b) => b.qty)).toEqual([1, 2, 3]);
    expect(content.bundles.filter((b) => b.highlight)).toHaveLength(1);
  });
});

describe("fill", () => {
  it("replaces every named placeholder and leaves unknown ones alone", () => {
    expect(content.fill("Usually {price} a bottle, {price} each", { price: "฿590" })).toBe(
      "Usually ฿590 a bottle, ฿590 each",
    );
    expect(content.fill("{other} stays", { price: "x" })).toBe("{other} stays");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails.**

Run: `pnpm test tests/unit/sale-page-copy.test.ts`
Expected: FAIL, because `app/demos/sale-page/_components/copy.ts` doesn't exist yet.

- [ ] **Step 3: Write the content and copy.** Replace `lib/demos/sale-page/content.ts` with:

```ts
import type { L } from "@/lib/demos/lang";
import { PHOTOS } from "@/lib/images";

/** Replaces `{name}` placeholders, so Thai and English can put a value in different places. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

export const brand = {
  name: "Mali Botanics",
  tagline: { th: "สกินแคร์จากมะลิและข้าวไทย", en: "Skincare from Thai jasmine and rice" } satisfies L,
};

export const product = {
  name: { th: "เซรั่มน้ำนมข้าวมะลิ", en: "Jasmine Rice Milk Serum" } satisfies L,
  size: "30 ml",
  // The headline has one word set in gold, so it comes in three parts.
  headline: {
    before: { th: "ผิวใสแบบ", en: "Skin as clear as" } satisfies L,
    accent: { th: "มะลิ", en: "jasmine" } satisfies L,
    after: { th: "ใน 14 วัน", en: "in 14 days" } satisfies L,
  },
  sub: {
    th: "เซรั่มน้ำนมข้าวหอมมะลิ เนื้อบางเบา ซึมไว ไม่เหนียวเหนอะหนะ เหมาะกับอากาศร้อนชื้น",
    en: "A light jasmine rice milk serum that sinks in fast and never feels sticky, made for hot, humid days.",
  } satisfies L,
  fullPrice: 590,
  promoPrice: 390,
  photo: PHOTOS.saleIngredient1,
  photoAlt: { th: "ดอกมะลิบานเต็มกิ่ง", en: "Jasmine flowers in full bloom" } satisfies L,
};

export const days = [
  { day: 1, text: { th: "ซึมไว ไม่เหนียว", en: "Sinks in, never sticky" } satisfies L },
  { day: 7, text: { th: "ผิวนุ่ม ชุ่มชื้นขึ้น", en: "Softer, more hydrated skin" } satisfies L },
  { day: 14, text: { th: "ผิวดูกระจ่างใส", en: "Visibly brighter skin" } satisfies L },
];

export const benefits = [
  {
    title: { th: "กระจ่างใสขึ้น", en: "Brighter skin" } satisfies L,
    body: { th: "น้ำนมข้าวช่วยให้ผิวดูสว่างและสม่ำเสมอ", en: "Rice milk helps skin look brighter and more even." } satisfies L,
  },
  {
    title: { th: "ชุ่มชื้นทั้งวัน", en: "Hydrated all day" } satisfies L,
    body: { th: "ล็อกความชุ่มชื้นได้นาน แม้อยู่ในห้องแอร์", en: "Locks in moisture, even in air-conditioned rooms." } satisfies L,
  },
  {
    title: { th: "อ่อนโยน", en: "Gentle" } satisfies L,
    body: { th: "ไม่มีน้ำหอมสังเคราะห์และแอลกอฮอล์", en: "No synthetic fragrance and no alcohol." } satisfies L,
  },
  {
    title: { th: "เนื้อบางเบา", en: "Light texture" } satisfies L,
    body: { th: "ซึมไว แต่งหน้าทับได้ทันที", en: "Sinks in fast, so makeup can go on right away." } satisfies L,
  },
];

export const ingredients = [
  {
    name: { th: "น้ำนมข้าวหอมมะลิ", en: "Jasmine rice milk" } satisfies L,
    body: { th: "อุดมด้วยวิตามินอีและกรดอะมิโน", en: "Rich in vitamin E and amino acids." } satisfies L,
    image: PHOTOS.saleIngredient2,
  },
  {
    name: { th: "สารสกัดดอกมะลิ", en: "Jasmine flower extract" } satisfies L,
    body: {
      th: "ช่วยปลอบประโลมผิวและให้กลิ่นหอมอ่อน ๆ ตามธรรมชาติ",
      en: "Soothes skin and leaves a soft, natural scent.",
    } satisfies L,
    image: PHOTOS.saleIngredient1,
  },
  {
    name: { th: "ว่านหางจระเข้", en: "Aloe vera" } satisfies L,
    body: { th: "เติมความชุ่มชื้นและลดการระคายเคือง", en: "Adds moisture and calms irritation." } satisfies L,
    image: PHOTOS.saleIngredient3,
  },
];

export const reviews = [
  {
    name: { th: "คุณแพร (ตัวอย่าง)", en: "Prae (sample)" } satisfies L,
    text: {
      th: "ใช้ไปสองอาทิตย์ หน้าดูสว่างขึ้นจริง เนื้อไม่เหนียวเลย",
      en: "Two weeks in and my face really looks brighter. Not sticky at all.",
    } satisfies L,
    stars: 5,
  },
  {
    name: { th: "คุณบีม (ตัวอย่าง)", en: "Beam (sample)" } satisfies L,
    text: {
      th: "ผิวแพ้ง่ายแต่ใช้ได้ ไม่แสบ ไม่มีสิวขึ้น",
      en: "My skin is sensitive, but this works. No stinging, no breakouts.",
    } satisfies L,
    stars: 5,
  },
  {
    name: { th: "คุณออม (ตัวอย่าง)", en: "Aom (sample)" } satisfies L,
    text: { th: "กลิ่นมะลิหอมอ่อน ๆ ชอบมาก ซื้อซ้ำแล้ว", en: "I love the soft jasmine scent. Already bought it again." } satisfies L,
    stars: 4,
  },
];

export const bundles = [
  { id: "one", qty: 1, label: { th: "1 ขวด", en: "1 bottle" } satisfies L, price: 390, note: { th: "ทดลองใช้", en: "To try" } satisfies L, highlight: false },
  { id: "two", qty: 2, label: { th: "2 ขวด", en: "2 bottles" } satisfies L, price: 690, note: { th: "ประหยัด ฿90", en: "Save ฿90" } satisfies L, highlight: true },
  {
    id: "three",
    qty: 3,
    label: { th: "3 ขวด", en: "3 bottles" } satisfies L,
    price: 990,
    note: { th: "ส่งฟรี + ประหยัด ฿180", en: "Free shipping + save ฿180" } satisfies L,
    highlight: false,
  },
];

export const faqs = [
  {
    q: { th: "เหมาะกับผิวแบบไหน", en: "Which skin types is it for?" } satisfies L,
    a: {
      th: "ทุกสภาพผิว รวมถึงผิวแพ้ง่าย แนะนำให้ทดสอบที่ท้องแขนก่อนใช้ครั้งแรก",
      en: "All skin types, including sensitive skin. Try it on your inner arm before the first use.",
    } satisfies L,
  },
  {
    q: { th: "ใช้กี่ครั้งต่อวัน", en: "How often do I use it?" } satisfies L,
    a: { th: "เช้าและก่อนนอน ครั้งละ 2–3 หยด หลังล้างหน้า", en: "Morning and night, 2–3 drops after cleansing." } satisfies L,
  },
  {
    q: { th: "ขวดหนึ่งใช้ได้นานเท่าไร", en: "How long does a bottle last?" } satisfies L,
    a: { th: "ประมาณ 4–6 สัปดาห์", en: "About 4–6 weeks." } satisfies L,
  },
  {
    q: { th: "จัดส่งกี่วัน", en: "How long does delivery take?" } satisfies L,
    a: { th: "1–3 วันทำการทั่วประเทศ", en: "1–3 working days anywhere in Thailand." } satisfies L,
  },
  {
    q: { th: "มีเลขจดแจ้ง อย. หรือไม่", en: "Is it registered with the Thai FDA?" } satisfies L,
    a: {
      th: "นี่คือเว็บตัวอย่าง สินค้าจริงจะแสดงเลขจดแจ้งตรงนี้",
      en: "This is a demo site. A real product would show its Thai FDA notification number here.",
    } satisfies L,
  },
];
```

Create `app/demos/sale-page/_components/copy.ts`:

```ts
import type { L } from "@/lib/demos/lang";

/** Interface copy. Business content lives in lib/demos/sale-page/content.ts. `{price}` is filled with fill(). */
export const ui = {
  promoBar: { th: "ราคาโปรเปิดตัว {price} · หมดเขตใน", en: "Launch price {price} · ends in" },
  order: { th: "สั่งซื้อ", en: "Order" },
  orderOnLine: { th: "สั่งซื้อทาง LINE", en: "Order on LINE" },
  freeShipping: { th: "ส่งฟรีเมื่อซื้อ 3 ขวด", en: "Free shipping on 3 bottles" },
  todayOnly: { th: "วันนี้เท่านั้น", en: "Today only" },
  size: { th: "ขนาด", en: "Size" },
  bottleLabel: { th: "ขวดเซรั่มน้ำนมข้าวมะลิ ฉลาก Mali", en: "A bottle of Mali jasmine rice milk serum" },
  daysHeading: { th: "ผิวเปลี่ยนไปอย่างไรใน 14 วัน", en: "What 14 days look like" },
  dayLabel: { th: "วันที่", en: "Day" },
  benefitsHeading: { th: "สิ่งที่ผิวจะได้รับ ตั้งแต่ขวดแรก", en: "What your skin gets from the first bottle" },
  ingredientsHeading: { th: "สารสกัดจากพืชไทย ที่ผิวคุ้นเคย", en: "Thai botanicals your skin already knows" },
  ingredientsSub: { th: "คัดเฉพาะส่วนผสมหลักสามชนิด ที่อ่อนโยนพอสำหรับใช้ทุกวัน", en: "Three key ingredients, gentle enough for every day." },
  reviewsHeading: { th: "เสียงจากคนที่ใช้จริง", en: "From people who use it" },
  reviewsNote: { th: "รีวิวตัวอย่างสำหรับเว็บสาธิต", en: "Sample reviews for a demo site" },
  ratingSuffix: { th: "จากรีวิวตัวอย่าง", en: "from sample reviews" },
  starsLabel: { th: "{count} จาก 5 ดาว", en: "{count} out of 5 stars" },
  orderHeading: { th: "เลือกชุดที่เหมาะกับคุณ", en: "Choose your set" },
  orderSub: {
    th: "ราคาโปรโมชัน จากปกติขวดละ {price} ยิ่งซื้อหลายขวด ยิ่งคุ้ม",
    en: "Launch price. Usually {price} a bottle, and the more you buy, the more you save.",
  },
  perBottle: { th: "ตกขวดละ {price}", en: "{price} per bottle" },
  bestSeller: { th: "ขายดี", en: "Best seller" },
  delivery: { th: "จัดส่ง 1–3 วันทำการ", en: "Delivered in 1–3 working days" },
  bundleCta: { th: "สั่งซื้อทาง LINE (ตัวอย่าง)", en: "Order on LINE (demo)" },
  faqHeading: { th: "คำถามที่พบบ่อย", en: "Questions" },
  faqSub: { th: "ข้อมูลการใช้และการจัดส่ง ก่อนตัดสินใจสั่งซื้อ", en: "How to use it and how delivery works, before you order." },
  legal: { th: "© Mali Botanics (ธุรกิจสมมติ)", en: "© Mali Botanics (fictional business)" },
} satisfies Record<string, L>;
```

- [ ] **Step 4: Keep the current page compiling (temporary).** Task 3 rebuilds the page. Until then, make the existing server components read the Thai side, so the build and e2e stay green:
  - Everywhere `page.tsx`, `_components/hero.tsx`, `_components/order-section.tsx` and `layout.tsx` render a field that is now `L`, read `.th`. For example: `b.title.th`, `ing.name.th`, `r.text.th`, `f.q.th`, `brand.tagline.th`, `product.name.th`, `product.sub.th`, `b.note.th`, `b.label.th`.
  - Hero `h1`: `<Phrases text={`${product.headline.before.th}${product.headline.accent.th} ${product.headline.after.th}`} />`.
  - Hero image: change `product.image` to `product.photo`.
  - `order-section.tsx`: replace `Number.parseInt(b.label, 10)` with `b.qty`.
  - `layout.tsx` metadata `description`: `product.sub.th`.
  - Change nothing else. These lines are replaced in Task 3.

- [ ] **Step 5: Run the checks.**

Run: `pnpm test tests/unit/sale-page-copy.test.ts && pnpm typecheck && pnpm lint && pnpm test`
Expected: all pass (the new file has 4 tests).

Run: `pnpm test:e2e tests/e2e/sale-page.spec.ts`
Expected: PASS (3 tests × 2 projects). The page still renders in Thai.

- [ ] **Step 6: Commit.**

```bash
git add lib/demos/sale-page/content.ts app/demos/sale-page tests/unit/sale-page-copy.test.ts
git commit -F - <<'EOF'
feat(sale-page): Thai and English copy for Mali Botanics

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Countdown to the end of the day

**Files:**
- Create: `lib/demos/sale-page/countdown.ts`
- Test: `tests/unit/sale-countdown.test.ts`

**Interfaces:**
- Produces, from `@/lib/demos/sale-page/countdown`:
  - `msUntilEndOfDay(now: Date): number`. This is the milliseconds until the next local midnight. It is always in `(0, 86_400_000]`; exactly at midnight it is a full day.
  - `formatCountdown(ms: number): string`, which returns `"HH : MM : SS"` with zero-padded fields, floors to whole seconds, and is clamped at `"00 : 00 : 00"` for values of 0 or less.

- [ ] **Step 1: Write the failing tests.** Create `tests/unit/sale-countdown.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatCountdown, msUntilEndOfDay } from "@/lib/demos/sale-page/countdown";

describe("msUntilEndOfDay", () => {
  it("counts to the next local midnight", () => {
    expect(msUntilEndOfDay(new Date(2026, 9, 22, 20, 47, 15))).toBe((3 * 3600 + 12 * 60 + 45) * 1000);
  });

  it("is a full day exactly at midnight", () => {
    expect(msUntilEndOfDay(new Date(2026, 9, 22, 0, 0, 0))).toBe(86_400_000);
  });

  it("is one millisecond just before midnight", () => {
    expect(msUntilEndOfDay(new Date(2026, 9, 22, 23, 59, 59, 999))).toBe(1);
  });
});

describe("formatCountdown", () => {
  it("pads hours, minutes and seconds", () => {
    expect(formatCountdown((3 * 3600 + 12 * 60 + 45) * 1000)).toBe("03 : 12 : 45");
  });

  it("floors to whole seconds", () => {
    expect(formatCountdown(1999)).toBe("00 : 00 : 01");
  });

  it("never goes negative", () => {
    expect(formatCountdown(0)).toBe("00 : 00 : 00");
    expect(formatCountdown(-5000)).toBe("00 : 00 : 00");
  });

  it("shows a full day as 24 hours", () => {
    expect(formatCountdown(86_400_000)).toBe("24 : 00 : 00");
  });
});
```

- [ ] **Step 2: Run them and confirm they fail.**

Run: `pnpm test tests/unit/sale-countdown.test.ts`
Expected: FAIL. The module isn't found.

- [ ] **Step 3: Implement.** Create `lib/demos/sale-page/countdown.ts`:

```ts
/** Milliseconds until the next local midnight. The promo "ends" every night and starts again. */
export function msUntilEndOfDay(now: Date): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime() - now.getTime();
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "HH : MM : SS", floored to whole seconds and never negative. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(total / 3600))} : ${pad(Math.floor((total % 3600) / 60))} : ${pad(total % 60)}`;
}
```

- [ ] **Step 4: Run them and confirm they pass.**

Run: `pnpm test tests/unit/sale-countdown.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit.**

```bash
git add lib/demos/sale-page/countdown.ts tests/unit/sale-countdown.test.ts
git commit -F - <<'EOF'
feat(sale-page): countdown to the end of the day

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Rebuild the page (design task; use the `frontend-design` skill)

This task is visual design. **Invoke the `frontend-design` skill first**, then build the page. The structure, copy, tokens and behaviour below are fixed. Composition, spacing, type scale, details and motion are yours to design, within the Global Constraints. Ohm rejected bland or templated work before. The page must look like a confident, real Thai brand's sale page, not a theme.

**Files:**
- Modify: `app/demos/sale-page/layout.tsx`, `app/demos/sale-page/page.tsx`
- Replace: `app/demos/sale-page/_components/hero.tsx`, `order-section.tsx`, `marks.tsx`. Remove `PromoSeal` and anything left unused. Keep `Phrases` if it helps Thai line breaks.
- Create: new components under `app/demos/sale-page/_components/` as you see fit. Suggested: `site-header.tsx`, `countdown-bar.tsx`, `mali-bottle.tsx`, `day-timeline.tsx`, `sections.tsx`.
- Modify: `lib/images.ts` (delete the `saleHero` line) and `tests/unit/images.test.ts` (`toBe(27)` → `toBe(26)`).

**Interfaces:**
- Consumes:
  - `useLang`, `LangScope`, `DemoLangSwitch` from `@/components/demo/lang`
  - `type Lang` from `@/lib/demos/lang`
  - `formatTHB` from `@/lib/packages`
  - `unsplash` from `@/lib/images`
  - `useHydrated` from `@/lib/use-demo-store`
  - everything from `@/lib/demos/sale-page/content` (Task 1)
  - `ui` from `./_components/copy` (Task 1)
  - `msUntilEndOfDay` and `formatCountdown` from `@/lib/demos/sale-page/countdown` (Task 2)
  - `DemoPill` from `@/components/demo/demo-pill`, with `packageId="web-basic"`
- Produces: the page. Test ids: `promo-countdown`, `hero-cta`, `bundle` ×3, `faq-item`, and `lang-switch` via `DemoLangSwitch`.

**Fixed requirements:**

1. **Layout (`layout.tsx`):**
   - Prompt with `weight: ["400", "600", "800"]` and `subsets: ["thai", "latin"]`.
   - Wrap everything in `<LangScope style={palette} className=…>`, where `palette` holds the Global Constraints tokens.
   - `metadata.title`: `"Mali Botanics — Jasmine Rice Milk Serum"`. `metadata.description`: `"Mali Botanics jasmine rice milk serum. A fictional business for a demo site."`
   - Keep `<DemoPill packageId="web-basic" />`.
2. **Countdown bar (top of page, client component):**
   - Text is `fill(ui.promoBar[lang], { price: formatTHB(product.promoPrice) })`, followed by the time in a pill with `data-testid="promo-countdown"`.
   - The time comes from `formatCountdown(msUntilEndOfDay(new Date()))`, updated every second with `setInterval`, cleared on unmount.
   - Before hydration (`useHydrated()` is false) it shows `-- : -- : --`, so the server and client markup match.
   - Use `tabular-nums` so the digits don't jitter.
   - The bar is gold `--gold` with `--green-deep` text, as in the mockup.
3. **Header:**
   - Brand: the jasmine mark (keep `JasmineMark` or redraw it) plus "Mali Botanics".
   - `DemoLangSwitch`, styled to fit, with a visible focus ring.
   - An `ui.order` link to `#order`.
   - It may be sticky. It must not cover the countdown bar's text on mobile.
4. **Hero.** Match the approved mockup (option 2):
   - Deep green.
   - The jasmine photo (`product.photo`, `next/image`, with `preload`) bleeding off the right side, with a green gradient over its left part.
   - Kicker: `MALI BOTANICS · {brand.tagline}`.
   - `<h1>`: `before` + gold `accent` + `after`. Thai keeps "ใน 14 วัน" together via `Phrases` or `whitespace-nowrap`.
   - `product.sub`.
   - Price: giant gold `390.-`, rendered as `{product.promoPrice}` with a smaller `.-`. Next to it, `formatTHB(product.fullPrice)` struck through in a muted mint.
   - The LINE button (`data-testid="hero-cta"`, `href="#order"`, `ui.orderOnLine`, LINE chat icon) uses `--line-green` with a solid darker offset shadow, as in the mockup.
   - `ui.freeShipping` next to the button.
   - The red, rotated `−34%` sticker with `ui.todayOnly`. Compute the percent as `Math.round((1 - promo/full) * 100)`.
   - The drawn bottle (see 5) overlapping the photo's lower edge.
   - **At 375px:** the stack order is countdown, header, kicker, h1, sub, price, button, then photo+bottle+sticker. Nothing overflows sideways.
5. **`MaliBottle` (inline SVG):**
   - An amber dropper bottle with a printed cream label: a leaf mark, `MALI`, `น้ำนมข้าวมะลิ`, `JASMINE RICE SERUM`, `30 ml`. The label is the same in both languages, because it's packaging.
   - Accessible as `role="img"` with `aria-label={ui.bottleLabel[lang]}`.
   - Its text inherits the page font.
   - The mockup's `<symbol id="bottle">` is a starting point. Refine it so it looks like a product, not a clip-art icon.
   - Reuse it, scaled down, in the bundle cards: one bottle per `qty`, replacing `BottleGlyph`.
6. **Day timeline**, straight after the hero:
   - Cream background, three steps from `days`.
   - Each step shows `ui.dayLabel` and the number large, plus the text.
   - The visual progression (for example dots getting lighter) is up to you.
   - Heading `ui.daysHeading`. It may be visually hidden, but it must be in the DOM as an `h2`.
7. **Benefits, ingredients and reviews:** use their copy keys. Restyle them to match the hero's language: confident, heavier type, and deep green and cream blocks.
   - **Ingredients:** use the three photos (`next/image`), with alt text = the ingredient name in the current language. No arch frames.
   - **Reviews:** stars with `aria-label={fill(ui.starsLabel[lang], { count: String(n) })}`, and `ui.reviewsNote` shown.
   - The average rating appears next to the hero button or in reviews, with `ui.ratingSuffix`.
8. **Order:**
   - `id="order"`, `scroll-mt` so the sticky header doesn't cover the heading.
   - `ui.orderHeading`, and `fill(ui.orderSub[lang], { price: formatTHB(product.fullPrice) })`.
   - Three `<li data-testid="bundle">` with label, note, mini bottles, price, and `fill(ui.perBottle[lang], { price: formatTHB(Math.round(price / qty)) })` when `qty > 1`.
   - `ui.delivery`.
   - A LINE button `ui.bundleCta` (`href="#order"`, since this is a demo).
   - The highlighted bundle shows `ui.bestSeller`.
9. **FAQ:** `<details data-testid="faq-item">` per entry, with a `<summary>` holding the question. `ui.faqHeading` and `ui.faqSub`. The open/closed indicator respects reduced motion.
10. **Footer:** brand, tagline and `ui.legal`. Leave bottom padding so the fixed demo bar doesn't cover it.
11. **No Thai hard-coded in components.** All strings come from `content.ts` or `copy.ts`. The only exceptions are the bottle's label text and the `.-` price suffix.

- [ ] **Step 1: Load the design skill.** Invoke `frontend-design`. Read the approved mockup `.superpowers/brainstorm/19193-1792598876/content/sale-c-price.html` (option 2) and the spec's Mali Botanics section.
- [ ] **Step 2: Build it.** Write `layout.tsx`, the components and `page.tsx` to the requirements above. Delete `saleHero` from `lib/images.ts` and change the image-count test to 26.
- [ ] **Step 3: Check it visually.**
  - Start `pnpm dev --port 3000` in the background.
  - Take screenshots at **1440×900** and **375×812**, full page, in **both languages**, with a script in `.superpowers/sdd/`. Set `localStorage["demo:lang"]` to `"th"` and `"en"` via `addInitScript`, and hide `[data-testid=demo-pill]`.
  - Look at every screenshot. Fix anything clipped, overlapping, misaligned or overflowing, any Thai word broken mid-phrase, and any text under 16px that isn't small print.
  - Stop the dev server when done.
  - Save the final screenshots as `.superpowers/sdd/sale-{desk,phone}-{th,en}.jpg` and list them in the report.
- [ ] **Step 4: Run the checks.**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: all pass.

Run: `pnpm test:e2e tests/e2e/sale-page.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS on both projects. The existing `hero-cta`, `bundle` and `faq-item` tests still pass, and the smoke test shows no console errors and no overflow on `/demos/sale-page`.

- [ ] **Step 5: Commit.**

```bash
git add -A app/demos/sale-page lib/images.ts tests/unit/images.test.ts
git commit -F - <<'EOF'
feat(sale-page): rebuild Mali Botanics in deep green and jasmine, in Thai and English

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: End-to-end tests, Thai thumbnails, full verification

**Files:**
- Modify: `tests/e2e/sale-page.spec.ts`, `tests/e2e/demo-lang.spec.ts`, `scripts/capture-thumbs.mjs`
- Regenerate: `public/thumbs/web-basic.jpg`, `public/thumbs/pages/web-basic-1.jpg`

**Interfaces:**
- Consumes: the page from Task 3, with test ids `promo-countdown`, `hero-cta`, `bundle`, `faq-item`, `lang-switch` and `demo-pill`.

- [ ] **Step 1: Extend the sale page e2e test.** Append to `tests/e2e/sale-page.spec.ts`:

```ts
test("the promo countdown ticks", async ({ page }) => {
  await page.goto("/demos/sale-page");
  const timer = page.getByTestId("promo-countdown");
  await expect(timer).toHaveText(/^\d{2} : \d{2} : \d{2}$/);
  const first = await timer.textContent();
  await expect(timer).not.toHaveText(first!, { timeout: 3000 });
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the page and its bundles read in English", async ({ page }) => {
    await page.goto("/demos/sale-page");
    await expect(page.getByTestId("hero-cta")).toContainText("Order on LINE");
    await expect(page.getByTestId("bundle").first()).toContainText("1 bottle");
    await expect(page.locator("html")).not.toContainText("สั่งซื้อทาง LINE");
  });
});
```

Above the existing tests, add `test.use({ locale: "th-TH" });` with the comment `// The rest of the file reads the Thai page; a Thai browser with no hub choice opens it in Thai.`

The last assertion scans the whole document (`html`). The demo bar is English too in this context, so no Thai should remain except the bottle label `น้ำนมข้าวมะลิ`, which the assertion doesn't look for.

- [ ] **Step 2: Generalise `DEMOS` in `tests/e2e/demo-lang.spec.ts` and add the sale page.**
  - Each demo now names where its language check looks. The sale page has no `<nav>`, so it checks `main`.
  - Replace the `DEMOS` constant and the `nav` helper with:

```ts
// Demos with the EN/TH switch. Each later step of the demo rework adds its demo here.
// `where` is the landmark whose text proves the language; `next` is another page of the same demo.
const DEMOS = [
  { name: "resort", home: "/demos/resort", next: "/demos/resort/rooms", where: "navigation", en: "Rooms", th: "ห้องพัก" },
  { name: "sale page", home: "/demos/sale-page", next: "/demos/sale-page", where: "main", en: "Order on LINE", th: "สั่งซื้อทาง LINE" },
] as const;

const probe = (page: Page, d: (typeof DEMOS)[number]) => page.getByRole(d.where).first();
```

  - In the test bodies, replace every `nav(page)` with `probe(page, d)`.
  - Change nothing else in that file.

- [ ] **Step 3: Shoot the hub thumbnails in Thai.**
  - Since step 1, a demo opened with no choice follows the browser, and Playwright's default browser language is English.
  - In `scripts/capture-thumbs.mjs`, inside `openPage`'s `addInitScript`, add `localStorage.setItem("demo:lang", "th");`. Put a comment above it: `// The hub's screenshots show the demos in Thai, their main language.`
  - Then regenerate:

```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
```

  - Keep only the sale page's two images; the other demos haven't changed:

```bash
git add public/thumbs/web-basic.jpg public/thumbs/pages/web-basic-1.jpg
git checkout -- public/thumbs
```

  - Open `public/thumbs/web-basic.jpg` and check it shows the new green hero in Thai.

- [ ] **Step 4: Full verification.**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`
Expected: everything passes on both projects.

- [ ] **Step 5: Commit.**

```bash
git add tests/e2e/sale-page.spec.ts tests/e2e/demo-lang.spec.ts scripts/capture-thumbs.mjs public/thumbs/web-basic.jpg public/thumbs/pages/web-basic-1.jpg
git commit -F - <<'EOF'
test(sale-page): countdown and English e2e; hub thumbnails in Thai

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
