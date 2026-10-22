# Siam Precision Fixes + English Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Siam Precision company demo (Website Standard: home, services, contact) fully bilingual through the shared demo switch, and fix the four things that looked unfinished: the grey "logo" boxes, the robot-arm hero photo, the lathe photo on the design service, and the empty footer. Keep today's design otherwise.

**Architecture:**
- **Copy:** every string becomes an `L` (`{ th, en }`) value.
  - `lib/demos/company/content.ts` holds the business content.
  - `app/demos/company/_components/copy.ts` holds the interface text.
- **Server pages stay server components** because they export `metadata`. They render copy through the shared client `<T>` and `<TImage>` from `components/demo/lang.tsx`, the same pattern the resort uses.
- **Client components** (the nav, the contact form) read `useLang()`.
- **`validateContact` takes a `lang` argument.**
- **`fill()` moves to the shared `lib/demos/format.ts`.** The sale page keeps re-exporting it.

**Tech stack:** Next.js 16.4 App Router (static export), React 19, TypeScript strict, Tailwind 4, IBM Plex Sans Thai (already loaded), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-22-demo-rework-bilingual-design.md`: Part 2 "Siam Precision" and Part 3 step 3. **Approved:** keep the current design (Ohm, brainstorm 2026-10-22).

## Global Constraints

- **Static export:** keep `output: "export"`.
- **Dependencies:** no new ones.
- **Next.js APIs:** read `node_modules/next/dist/docs/` before using a Next.js API not already used in this repo (AGENTS.md).
- **Look:**
  - Keep today's design: navy `--navy #14213d`, orange `--orange #f28c28`, IBM Plex Sans Thai, the drawing-sheet grid, dimension line and crop marks.
  - Change only what Task 2 lists.
  - No serif fonts.
- **Text sizes:**
  - Body text is at least **16px**.
  - Small print (labels, captions, legal, notes) is at least **14px**.
  - Replace every `text-[15px]` with `text-base`, and every `text-[13px]` with `text-sm`, in `app/demos/company/**`. The SVG map label and the decorative `aria-hidden` dimension label are exempt.
- **Language:**
  - Every visible string, alt text and aria-label in `app/demos/company/**` comes from `content.ts` or `copy.ts` as an `L` value, rendered in the current demo language. Exceptions: brand wordmarks inside logo SVGs, numbers such as `±0.01 mm` and `2008`, and email and phone values.
  - The seller refers to themselves only as "เรา" (never ผม/ฉัน/ดิฉัน); addressing the customer as "คุณ" is fine.
  - The tone is professional.
- **The business stays Thai:** the Chonburi address, Thai client companies and `฿`. The English copy is how this Thai company would present itself to foreign buyers.
- **Images:**
  - Unsplash only, with IDs in `lib/images.ts`.
  - `companyHero` becomes `1666618090858-fbcee636bd3e` (a shaft being turned on a CNC lathe, by Sven Daniel).
  - `companyService2` (the design service) becomes `1769147339214-076740872485` (machined parts on engineering drawings).
  - Both IDs were checked through Unsplash's download redirect and are under the Unsplash License.
  - The photo count stays 26.
- **Test ids kept:** `hero-cta`, `contact-submit`, `contact-success`, `error-<field>`. The header uses the shared `DemoLangSwitch` (`data-testid="lang-switch"`). There must be exactly one switch in the DOM.
- **Page titles are static** (metadata can't follow the switch). They are bilingual, Latin first:
  - Template: `"%s | Siam Precision"`.
  - Default: `"Siam Precision Engineering · สยามพรีซิชั่น"`.
  - Services page: `"Services · บริการ"`.
  - Contact page: `"Contact · ติดต่อเรา"`.
  - The home page has no title (it uses the default).
  - Descriptions are the English intro strings below.
- **Accessibility:** no horizontal overflow at 375px or 1440px, and visible focus on every control.
- **Commits:** end every message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. No other attribution line.
- **Branch:** `feat/company-rework`, cut from `main`. Never push or merge without Ohm's OK; merging deploys devbyohm.com.

## File map

| File | Change | Responsibility |
|---|---|---|
| `lib/demos/format.ts` | Modify | Add `fill()` (moved from the sale page) |
| `lib/demos/sale-page/content.ts` | Modify | `export { fill } from "@/lib/demos/format"` instead of its own copy |
| `lib/demos/company/content.ts` | Rewrite | Bilingual business content |
| `app/demos/company/_components/copy.ts` | Create | Bilingual interface text |
| `lib/demos/company/validate-contact.ts` | Modify | `validateContact(input, lang)` |
| `app/demos/company/**` | Modify | Render copy in the current language; header switch; static bilingual titles |
| `app/demos/company/_components/client-logos.tsx` | Create | Five drawn SVG client wordmarks |
| `lib/images.ts` | Modify | Two photo IDs |
| `tests/unit/company-copy.test.ts` | Create | Copy completeness |
| `tests/unit/validate-contact.test.ts` | Modify | Thai and English messages |
| `tests/unit/demo-format.test.ts` | Modify | `fill()` tests move here |
| `tests/unit/sale-page-copy.test.ts` | Modify | Drop the `fill` block (moved) |
| `tests/e2e/company.spec.ts` | Modify | Titles, English form |
| `tests/e2e/demo-lang.spec.ts` | Modify | Add the company to `DEMOS` |
| `public/thumbs/web-standard.jpg`, `public/thumbs/pages/web-standard-{1,2,3}.jpg` | Regenerate | New photos on the hub |

---

### Task 1: Bilingual company copy, wired through every page

**Files:**
- Modify: `lib/demos/format.ts`, `lib/demos/sale-page/content.ts`, `tests/unit/demo-format.test.ts`, `tests/unit/sale-page-copy.test.ts`
- Rewrite: `lib/demos/company/content.ts`
- Create: `app/demos/company/_components/copy.ts`, `tests/unit/company-copy.test.ts`
- Modify: `lib/demos/company/validate-contact.ts`, `tests/unit/validate-contact.test.ts`
- Modify: every file under `app/demos/company/`
- Modify: `tests/e2e/company.spec.ts`

**Interfaces:**
- Consumes:
  - From `@/lib/demos/lang`: `type L`, `type Lang`, `otherLang`.
  - From `@/components/demo/lang`: `T`, `TImage`, `useLang`, `LangScope`, `DemoLangSwitch`.
  - `missingTranslations` from `tests/unit/helpers/missing-translations.ts`.
- Produces:
  - `fill(template, vars)` from `@/lib/demos/format`.
  - From `@/lib/demos/company/content`: `company`, `stats`, `SERVICES`, `ServiceId`, `processSteps`, `clients`.
  - `ui` from `app/demos/company/_components/copy.ts`.
  - `validateContact(input: ContactInput, lang: Lang): ContactErrors`.

- [ ] **Step 1: Move `fill()` to the shared formatter.**
  - Append this to `lib/demos/format.ts`:

```ts
/** Replaces `{name}` placeholders, so Thai and English can put a value in different places. */
export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (Object.hasOwn(vars, key) ? vars[key] : match));
}
```

  - In `lib/demos/sale-page/content.ts`, delete the local `fill` function and its comment. Add `export { fill } from "@/lib/demos/format";` below the imports.
  - Move the `describe("fill", …)` block from `tests/unit/sale-page-copy.test.ts` into `tests/unit/demo-format.test.ts`. Change its import to `fill` from `@/lib/demos/format`. Add this case:

```ts
  it("ignores placeholders that only exist on Object.prototype", () => {
    expect(fill("{constructor}", {})).toBe("{constructor}");
  });
```

  - Run `pnpm test tests/unit/demo-format.test.ts tests/unit/sale-page-copy.test.ts`. Expected: PASS.

- [ ] **Step 2: Write the failing copy and validation tests.**
  - Create `tests/unit/company-copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ui } from "@/app/demos/company/_components/copy";
import * as content from "@/lib/demos/company/content";
import { missingTranslations } from "./helpers/missing-translations";

describe("company copy", () => {
  it("has Thai and English for every entry", () => {
    expect(missingTranslations({ ui, content })).toEqual([]);
  });

  it("keeps the phone placeholder in both languages", () => {
    expect(ui.orCall.th).toContain("{phone}");
    expect(ui.orCall.en).toContain("{phone}");
  });

  it("has four services and five clients", () => {
    expect(content.SERVICES.map((s) => s.id)).toEqual(["cnc", "fabrication", "automation", "design"]);
    expect(content.clients).toHaveLength(5);
  });
});
```

  - In `tests/unit/validate-contact.test.ts`:
    - Change every `validateContact(x)` to `validateContact(x, "th")`. The Thai messages stay the same.
    - Add:

```ts
  it("writes messages in English when asked", () => {
    expect(validateContact({ ...valid, name: " ", email: "x", service: "", message: "short" }, "en")).toEqual({
      name: "Please enter your name",
      email: "Please enter a valid email address",
      service: "Please choose a service",
      message: "Please describe the job in at least 10 characters",
    });
    expect(validateContact({ ...valid, phone: "12345" }, "en")).toEqual({ phone: "Please enter a valid phone number" });
  });
```

  - Run `pnpm test tests/unit/company-copy.test.ts tests/unit/validate-contact.test.ts`. Expected: FAIL. `copy.ts` is missing, and the English messages don't exist yet.

- [ ] **Step 3: Write the content and copy.**
  - Replace `lib/demos/company/content.ts` with:

```ts
import type { L } from "@/lib/demos/lang";
import { PHOTOS } from "@/lib/images";

export const company = {
  name: { th: "สยามพรีซิชั่น เอ็นจิเนียริ่ง", en: "Siam Precision Engineering" } satisfies L,
  legal: {
    th: "บริษัท สยามพรีซิชั่น เอ็นจิเนียริ่ง จำกัด (ธุรกิจสมมติ)",
    en: "Siam Precision Engineering Co., Ltd. (fictional business)",
  } satisfies L,
  tagline: {
    th: "งานกลึง CNC และชิ้นส่วนอุตสาหกรรม แม่นยำระดับไมครอน",
    en: "CNC machining and industrial parts, accurate to the micron",
  } satisfies L,
  intro: {
    th: "รับผลิตชิ้นส่วนโลหะความแม่นยำสูงสำหรับโรงงานยานยนต์ อาหาร และอิเล็กทรอนิกส์ ตั้งแต่ชิ้นต้นแบบจนถึงการผลิตจำนวนมาก",
    en: "Precision metal parts for automotive, food and electronics plants, from a first prototype to full production runs.",
  } satisfies L,
  address: {
    th: "88/8 นิคมอุตสาหกรรมตัวอย่าง ต.ตัวอย่าง อ.เมือง จ.ชลบุรี 20000",
    en: "88/8 Sample Industrial Estate, Sample Subdistrict, Mueang District, Chonburi 20000",
  } satisfies L,
  phone: "038-000-000",
  email: "sales@example.com",
  hours: { th: "จันทร์–เสาร์ 08:00–17:00", en: "Mon–Sat, 08:00–17:00" } satisfies L,
  heroImage: PHOTOS.companyHero,
  heroAlt: { th: "เพลาโลหะกำลังกลึงบนเครื่องกลึง CNC", en: "A steel shaft being turned on a CNC lathe" } satisfies L,
};

export const stats = [
  { value: { th: "2008", en: "2008" } satisfies L, label: { th: "ก่อตั้ง", en: "Founded" } satisfies L },
  { value: { th: "350+", en: "350+" } satisfies L, label: { th: "โปรเจกต์ที่ส่งมอบ", en: "Projects delivered" } satisfies L },
  { value: { th: "±0.01 mm", en: "±0.01 mm" } satisfies L, label: { th: "ความคลาดเคลื่อน", en: "Tolerance" } satisfies L },
  { value: { th: "48 ชม.", en: "48 hrs" } satisfies L, label: { th: "ใบเสนอราคา", en: "Quote turnaround" } satisfies L },
];

export const SERVICES = [
  {
    id: "cnc",
    name: { th: "งานกลึงและกัด CNC", en: "CNC turning and milling" } satisfies L,
    short: { th: "ชิ้นส่วนเหล็ก สแตนเลส อลูมิเนียม ตามแบบ", en: "Steel, stainless and aluminium parts made to your drawing" } satisfies L,
    detail: {
      th: "เครื่อง CNC 5 แกน รองรับงานซับซ้อนและงานจำนวนมาก ตรวจสอบทุกชิ้นด้วยเครื่องวัด CMM",
      en: "5-axis CNC machines handle complex parts and large runs, and every part is checked on a CMM.",
    } satisfies L,
    image: PHOTOS.companyService1,
  },
  {
    id: "fabrication",
    name: { th: "งานโครงสร้างและเชื่อม", en: "Fabrication and welding" } satisfies L,
    short: { th: "โครงเครื่องจักร แท่นวาง และงานเหล็กแผ่น", en: "Machine frames, bases and sheet-metal work" } satisfies L,
    detail: {
      th: "ช่างเชื่อมมีใบรับรอง ออกแบบโครงสร้างให้แข็งแรงและติดตั้งหน้างานได้",
      en: "Certified welders, and structures designed to be strong and easy to install on site.",
    } satisfies L,
    image: PHOTOS.companyService3,
  },
  {
    id: "automation",
    name: { th: "ระบบอัตโนมัติ", en: "Automation" } satisfies L,
    short: { th: "จิ๊ก ฟิกเจอร์ และสายพานลำเลียง", en: "Jigs, fixtures and conveyors" } satisfies L,
    detail: {
      th: "ออกแบบอุปกรณ์ช่วยผลิตเพื่อลดเวลาและของเสียในไลน์การผลิต",
      en: "Production aids designed to cut cycle time and scrap on your line.",
    } satisfies L,
    image: PHOTOS.companyService4,
  },
  {
    id: "design",
    name: { th: "ออกแบบและเขียนแบบ", en: "Design and drafting" } satisfies L,
    short: { th: "แบบ 2D/3D และงานถอดแบบชิ้นส่วนเดิม", en: "2D/3D drawings and reverse engineering of existing parts" } satisfies L,
    detail: {
      th: "วิศวกรช่วยปรับแบบให้ผลิตได้ง่ายขึ้นและต้นทุนต่ำลง ก่อนเริ่มผลิตจริง",
      en: "Our engineers adjust the design so it is easier and cheaper to make, before production starts.",
    } satisfies L,
    image: PHOTOS.companyService2,
  },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export const processSteps: L[] = [
  { th: "ส่งแบบหรือตัวอย่างชิ้นงาน", en: "Send a drawing or a sample part" },
  { th: "รับใบเสนอราคาใน 48 ชม.", en: "Get a quote within 48 hours" },
  { th: "ผลิตและตรวจสอบคุณภาพ", en: "Production and quality inspection" },
  { th: "จัดส่งพร้อมรายงานการวัด", en: "Delivery with a measurement report" },
];

/** Regular clients. `logo` picks the drawn wordmark in client-logos.tsx (Task 2). */
export const clients = [
  { logo: "thai-auto", name: { th: "ไทยออโต้พาร์ท", en: "Thai Auto Parts" } satisfies L },
  { logo: "siam-food-pack", name: { th: "สยามฟู้ดแพ็ค", en: "Siam Food Pack" } satisfies L },
  { logo: "eastern-elec", name: { th: "อีสเทิร์นอิเล็กทรอนิกส์", en: "Eastern Electronics" } satisfies L },
  { logo: "bangna-logistics", name: { th: "บางนาโลจิสติกส์", en: "Bangna Logistics" } satisfies L },
  { logo: "chonburi-steel", name: { th: "ชลบุรีสตีล", en: "Chonburi Steel" } satisfies L },
] as const;
```

  - Create `app/demos/company/_components/copy.ts`:

```ts
import type { L } from "@/lib/demos/lang";

/** Interface copy. Business content lives in lib/demos/company/content.ts. `{name}` is filled with fill(). */
export const ui = {
  // header, nav, footer
  home: { th: "หน้าแรก", en: "Home" },
  services: { th: "บริการ", en: "Services" },
  contact: { th: "ติดต่อเรา", en: "Contact" },
  mainNav: { th: "เมนูหลัก", en: "Main menu" },
  requestQuote: { th: "ขอใบเสนอราคา", en: "Request a quote" },
  factory: { th: "ที่ตั้งโรงงาน", en: "Factory" },
  openHours: { th: "เวลาทำการ {hours}", en: "Open {hours}" },
  // home
  heroKicker: { th: "โรงงานผลิตชิ้นส่วนโลหะ ชลบุรี", en: "Metal parts factory, Chonburi" },
  allServices: { th: "ดูบริการทั้งหมด", en: "See all services" },
  captionTitle: { th: "ตรวจวัดทุกชิ้นก่อนส่งมอบ", en: "Every part measured before delivery" },
  captionBody: { th: "เครื่อง CNC 5 แกน พร้อมเครื่องวัด CMM ในโรงงาน", en: "5-axis CNC machines and an in-house CMM" },
  companyFacts: { th: "ข้อมูลบริษัท", en: "Company facts" },
  whatWeMake: { th: "งานที่เรารับผลิต", en: "What we make" },
  whatWeMakeSub: {
    th: "ทุกขั้นตอนทำในโรงงานของเราเอง ตั้งแต่ปรับแบบ ผลิต ไปจนถึงตรวจวัดก่อนส่งมอบ",
    en: "Every step happens in our own factory, from refining the design to production and final inspection.",
  },
  serviceDetails: { th: "ดูรายละเอียดบริการ", en: "Service details" },
  clientsHeading: { th: "โรงงานที่ใช้บริการเราเป็นประจำ", en: "Factories that work with us regularly" },
  // CTA band
  ctaHeading: { th: "มีแบบชิ้นงานอยู่แล้ว ส่งมาให้วิศวกรของเราประเมินราคา", en: "Already have a drawing? Send it to our engineers for a quote." },
  ctaBody: {
    th: "ส่งไฟล์ 2D/3D หรือรูปถ่ายชิ้นงานเดิม รับใบเสนอราคาภายใน 48 ชั่วโมง ไม่มีค่าใช้จ่าย",
    en: "Send 2D/3D files or photos of an existing part and get a free quote within 48 hours.",
  },
  orCall: { th: "หรือโทร {phone} (ตัวอย่าง)", en: "or call {phone} (sample)" },
  // services page
  servicesTitle: { th: "บริการผลิตและวิศวกรรม", en: "Manufacturing and engineering services" },
  servicesIntro: {
    th: "รับงานตั้งแต่ชิ้นต้นแบบชิ้นเดียวไปจนถึงล็อตผลิตหลายพันชิ้น วิศวกรของเราดูแลตั้งแต่ตรวจแบบจนส่งมอบพร้อมรายงานการวัด",
    en: "From a single prototype to runs of several thousand parts. Our engineers stay with the job from drawing review to delivery with a measurement report.",
  },
  quoteThis: { th: "ขอใบเสนอราคางานนี้", en: "Request a quote for this" },
  processHeading: { th: "ขั้นตอนการสั่งผลิต", en: "How ordering works" },
  processSub: {
    th: "ชัดเจนทุกขั้น รู้ราคาและกำหนดส่งก่อนเริ่มงาน",
    en: "Clear at every step: you know the price and delivery date before work starts.",
  },
  // contact page
  contactIntro: {
    th: "บอกเราว่าต้องการผลิตอะไร จำนวนเท่าไร ทีมขายจะติดต่อกลับพร้อมใบเสนอราคาภายใน 48 ชั่วโมง",
    en: "Tell us what you need made and how many. Our sales team will reply with a quote within 48 hours.",
  },
  formHeading: { th: "แบบฟอร์มขอใบเสนอราคา", en: "Quote request form" },
  requiredBefore: { th: "ช่องที่มีเครื่องหมาย", en: "Fields marked" },
  requiredAfter: { th: "จำเป็นต้องกรอก", en: "are required" },
  addressLabel: { th: "ที่อยู่โรงงาน", en: "Factory address" },
  phoneLabel: { th: "โทรศัพท์", en: "Phone" },
  emailLabel: { th: "อีเมลฝ่ายขาย", en: "Sales email" },
  hoursLabel: { th: "เวลาทำการ", en: "Opening hours" },
  sample: { th: "(ตัวอย่าง)", en: "(sample)" },
  contactNote: { th: "ข้อมูลติดต่อทั้งหมดเป็นตัวอย่างสำหรับเว็บสาธิต", en: "All contact details are samples for a demo site." },
  mapLabel: { th: "แผนที่ตั้งโรงงาน (ภาพประกอบ)", en: "Map of the factory location (illustration)" },
  mapRoad: { th: "ถนนสายหลักนิคมฯ", en: "Estate main road" },
  // contact form
  fieldName: { th: "ชื่อผู้ติดต่อ", en: "Contact name" },
  fieldCompany: { th: "บริษัท", en: "Company" },
  fieldEmail: { th: "อีเมล", en: "Email" },
  fieldPhone: { th: "เบอร์โทร", en: "Phone" },
  fieldService: { th: "บริการที่สนใจ", en: "Service" },
  fieldMessage: { th: "รายละเอียดงาน", en: "Job details" },
  optional: { th: "(ไม่บังคับ)", en: "(optional)" },
  chooseService: { th: "เลือกบริการ", en: "Choose a service" },
  messagePlaceholder: {
    th: "เช่น วัสดุ ขนาด จำนวนชิ้น และวันที่ต้องการรับงาน",
    en: "For example: material, size, quantity and when you need the parts",
  },
  send: { th: "ส่งข้อมูล", en: "Send" },
  sending: { th: "กำลังส่ง…", en: "Sending…" },
  replyTime: { th: "ตอบกลับภายใน 1 วันทำการ", en: "We reply within 1 working day" },
  successTitle: { th: "ได้รับข้อมูลแล้ว", en: "Thanks, we've got it" },
  successBody: {
    th: "ทีมขายจะติดต่อกลับภายใน 1 วันทำการ (เว็บตัวอย่าง: ไม่มีการส่งข้อมูลจริง)",
    en: "Our sales team will get back to you within 1 working day. (Demo site: nothing is actually sent.)",
  },
  sendAnother: { th: "ส่งอีกครั้ง", en: "Send another" },
} satisfies Record<string, L>;
```

  - Validation: in `lib/demos/company/validate-contact.ts`:
    - Import `type Lang` from `@/lib/demos/lang`.
    - Change the signature to `validateContact(input: ContactInput, lang: Lang): ContactErrors`.
    - Return messages from this table:

```ts
const MESSAGES = {
  name: { th: "กรุณากรอกชื่อ", en: "Please enter your name" },
  email: { th: "อีเมลไม่ถูกต้อง", en: "Please enter a valid email address" },
  phone: { th: "เบอร์โทรไม่ถูกต้อง", en: "Please enter a valid phone number" },
  service: { th: "กรุณาเลือกบริการ", en: "Please choose a service" },
  message: { th: "กรุณาระบุรายละเอียดอย่างน้อย 10 ตัวอักษร", en: "Please describe the job in at least 10 characters" },
} satisfies Record<string, Record<Lang, string>>;
```

    - Write each error as, for example, `errors.name = MESSAGES.name[lang]`. Keep the rules exactly as they are.
  - Run `pnpm test tests/unit/company-copy.test.ts tests/unit/validate-contact.test.ts`. Expected: PASS.

- [ ] **Step 4: Wire every page and component to the current language.** Follow these rules:
  - **Server components** (`(home)/page.tsx`, `services/page.tsx`, `contact/page.tsx`, `_components/cta-band.tsx`, `_components/page-header.tsx`, `_components/site-footer.tsx`, `contact/map-placeholder.tsx`) stay server components:
    - Render text as `<T value={…} />`.
    - Render images as `<TImage alt={…} … />`. Use `company.heroAlt` for the hero, and `s.name` for service images.
    - For `aria-label`, `<dl aria-label>`, the SVG `aria-label` and any other attribute that needs a string, make a small client component in the same folder that reads `useLang()`. Alternatively, move that piece into an existing client component.
    - `PageHeader` takes `L` props: `{ title: L; intro: L; crumb: L }`.
  - **For placeholders**, make a small client component, because server components can't call `useLang()`. Create `app/demos/company/_components/filled.tsx` (`"use client"`), which renders `fill(value[lang], vars)` with `useLang()`:

```tsx
"use client";

import { useLang } from "@/components/demo/lang";
import type { L } from "@/lib/demos/lang";
import { fill } from "@/lib/demos/format";

/** A copy entry with `{placeholders}`, rendered in the current demo language. Values may be bilingual too. */
export function Filled({ value, vars }: { value: L; vars: Record<string, string | L> }) {
  const lang = useLang();
  const resolved = Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, typeof v === "string" ? v : v[lang]]));
  return <>{fill(value[lang], resolved)}</>;
}
```

    - Use it for `ui.orCall` (`vars={{ phone: company.phone }}`) and for `ui.openHours` (`vars={{ hours: company.hours }}`).
    - The contact info list shows `company.email`, followed by a space and `<T value={ui.sample} />`.
  - **`site-nav.tsx`** is already a client component. Its link labels are `ui.home`, `ui.services` and `ui.contact`, and the nav's `aria-label` is `ui.mainNav[lang]`.
  - **`site-header.tsx`:**
    - The brand shows `company.name` in the current language, large, with the other language's name small underneath (`company.name[otherLang(lang)]`). That makes it a client component.
    - Replace the header body with the layout below, so that exactly one `DemoLangSwitch` sits in the brand row on phones and after the nav on desktop:

```tsx
<header className="z-40 border-b border-(--line) bg-white md:sticky md:top-0">
  <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-5 px-5 lg:px-8">
    {/* brand link, unchanged apart from the bilingual name: order-1, py-3 md:py-0 */}
    <DemoLangSwitch className="order-2 grid h-10 min-w-10 place-items-center rounded-[3px] border border-(--line) px-3 text-sm font-bold text-(--navy) transition-colors hover:border-(--navy) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--navy) md:order-3" />
    <div className="order-3 -mx-5 flex w-[calc(100%+2.5rem)] items-center border-t border-(--line) md:order-2 md:mx-0 md:ml-auto md:w-auto md:gap-5 md:border-t-0">
      {/* SiteNav + the desktop quote button, unchanged; the button text is ui.requestQuote */}
    </div>
  </div>
</header>
```

  - **`contact-form.tsx`:**
    - Every label, the optional mark, the placeholders, the select's first option, the service option names (`s.name[lang]`), the button text, the reply note and the success texts come from `ui` and `SERVICES` through `useLang()`.
    - Call `validateContact(values, lang)`.
    - When the language changes while errors are visible, re-run validation, so messages never mix languages. Wrap it in `useEffect` on `lang`, only if `Object.keys(errors).length > 0`.
    - Keep the `name@company.co.th` and `08x-xxx-xxxx` placeholders as they are; they work in both languages.
  - **`layout.tsx`:**
    - Wrap everything in `<LangScope style={palette} className=…>` instead of the plain `div`.
    - Set `metadata` to the bilingual static titles from the Global Constraints, with `description: company.intro.en`.
  - **Per-page `metadata`:**
    - Services: `{ title: "Services · บริการ", description: ui.servicesIntro.en }`.
    - Contact: `{ title: "Contact · ติดต่อเรา", description: ui.contactIntro.en }`.
    - Home: `{ description: company.intro.en }`, with no title.
  - **Text sizes:** apply the Global Constraints rule. Change `text-[15px]` to `text-base` and `text-[13px]` to `text-sm` throughout `app/demos/company/**`, with the two exempt cases.
  - **Leave visual changes for Task 2.** Logos, photos and the footer come later. In this task the client boxes just render `<T value={c.name} />` instead of the old string.
  - **Check:** search for leftover Thai literals with `grep -rnP "[\x{0E00}-\x{0E7F}]" app/demos/company --include=*.tsx`. Expected: no output, because all Thai now lives in `_components/copy.ts` and `lib/demos/company/content.ts`. Also read through each `.tsx` for leftover English UI literals; there should be none, apart from the exceptions listed in the Global Constraints.

- [ ] **Step 5: Update the company e2e test.** Replace `tests/e2e/company.spec.ts` with:

```ts
import { expect, test } from "@playwright/test";

test.describe("in Thai", () => {
  test.use({ locale: "th-TH" });

  test("navigation reaches all three pages with their own titles", async ({ page }) => {
    await page.goto("/demos/company");
    await expect(page).toHaveTitle(/Siam Precision/);
    await page.getByRole("navigation").getByRole("link", { name: "บริการ" }).click();
    await expect(page).toHaveURL(/\/demos\/company\/services$/);
    await expect(page).toHaveTitle(/Services · บริการ/);
    await page.getByRole("navigation").getByRole("link", { name: "ติดต่อเรา" }).click();
    await expect(page).toHaveTitle(/Contact · ติดต่อเรา/);
  });

  test("contact form shows errors, then succeeds", async ({ page }) => {
    await page.goto("/demos/company/contact");
    await page.waitForLoadState("networkidle");
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("error-name")).toHaveText("กรุณากรอกชื่อ");
    await expect(page.getByTestId("error-email")).toBeVisible();

    await page.getByLabel("ชื่อผู้ติดต่อ").fill("สมชาย ใจดี");
    await page.getByLabel("อีเมล").fill("somchai@example.com");
    await page.getByLabel("บริการที่สนใจ").selectOption("cnc");
    await page.getByLabel("รายละเอียดงาน").fill("ต้องการใบเสนอราคางานกลึง 200 ชิ้น");
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("contact-success")).toBeVisible();
  });
});

test.describe("in English", () => {
  test.use({ locale: "en-US" });

  test("the contact form speaks English, and switching language re-words its errors", async ({ page }) => {
    await page.goto("/demos/company/contact");
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel("Contact name")).toBeVisible();
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("error-name")).toHaveText("Please enter your name");
    await page.getByTestId("lang-switch").click();
    await expect(page.getByTestId("error-name")).toHaveText("กรุณากรอกชื่อ");
  });
});
```

- [ ] **Step 6: Run the checks.**
  - Run `pnpm typecheck && pnpm lint && pnpm test`. Expected: all pass.
  - Run `pnpm test:e2e tests/e2e/company.spec.ts tests/e2e/smoke.spec.ts`. Expected: PASS on both projects, with no console errors on any company route.

- [ ] **Step 7: Commit.**

```bash
git add -A lib/demos/format.ts lib/demos/sale-page/content.ts lib/demos/company app/demos/company tests/unit tests/e2e/company.spec.ts
git commit -F - <<'EOF'
feat(company): Siam Precision in Thai and English

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Drawn client logos, better photos, a finished footer (visual)

This is a small visual task, so **invoke the `frontend-design` skill first**. Keep the existing look. The fixes have to sit inside it as if they had always been there.

**Files:**
- Create: `app/demos/company/_components/client-logos.tsx`
- Modify: `app/demos/company/(home)/page.tsx` (clients section, hero image framing), `app/demos/company/_components/site-footer.tsx`, `lib/images.ts`

**Interfaces:**
- Consumes: `clients` (with `logo` ids) and `company` from Task 1; `T` and `useLang` from `@/components/demo/lang`.
- Produces: `ClientLogo({ id, name })`, with `id` one of the five `logo` values. It renders `role="img"` with `aria-label` set to the client name in the current language.

**Fixed requirements:**

1. **Client logos.** Replace the five grey text boxes with five drawn SVG wordmarks.
   - Each logo is a plausible, distinct mark for that company type: an auto-parts maker, a food packager, an electronics firm, a logistics firm, a steel mill.
   - Each uses its own letterform style (for example a geometric mark, a monogram or a stencil cut) and a simple symbol.
   - All are one colour (`#5d6878`, rising to `--navy` on hover is optional) and of similar visual weight and height. Wordmarks may be Latin, Thai or both, chosen per brand. These are the clients' brand marks, so they don't translate.
   - The mockup `.superpowers/brainstorm/19193-1792598876/content/company-directions.html` has rough starting symbols (`<symbol id="l1">`…`l5`). Refine them so they look like real logos, not placeholders.
   - Keep the section heading `ui.clientsHeading`.
   - Layout: 5 in a row on desktop, wrapping evenly on phones (for example 2-2-1, centred). No grey boxes behind them.
2. **Photos.**
   - In `lib/images.ts`, set `companyHero: "1666618090858-fbcee636bd3e"` and `companyService2: "1769147339214-076740872485"`.
   - Check that each loads: `curl -sI "https://images.unsplash.com/photo-<id>?w=800" | head -1` must return 200.
   - Adjust the hero image's `object-position` so the shaft and cutting tool sit well in the 4:3 frame at both 1440px and 375px.
   - The figcaption must not cover the tool tip.
3. **Footer.** Today it has a large empty navy area below the columns.
   - Keep the three columns (brand with legal, factory address and hours, services).
   - Tighten the vertical rhythm.
   - Add a bottom bar: a thin top border, the `company.legal` line at 14px (moved out of the brand column), and on the right a copy of the three nav links at 14px.
   - Leave bottom padding so the fixed demo bar (about 64px tall) never covers text: about `pb-24` on phones and `pb-20` on desktop.
   - Every string comes from `content.ts` or `copy.ts`.
4. **No other visual changes.**

- [ ] **Step 1:** Invoke `frontend-design`. Look at the current home page and footer at 1440 and 375 in both languages, using a screenshot script in `.superpowers/sdd/`. Set `localStorage["demo:lang"] = JSON.stringify("th" | "en")` via `addInitScript`, and hide `[data-testid=demo-pill]`.
- [ ] **Step 2:** Build the four requirements.
- [ ] **Step 3: Visual check.**
  - Take full-page screenshots of `/demos/company`, `/demos/company/services` and `/demos/company/contact` at 1440×900 and 375×812, in both languages.
  - Look at every one. Fix anything clipped, overlapping or overflowing.
  - Save the home-page shots as `.superpowers/sdd/company-{desk,phone}-{th,en}.jpg`.
  - Stop the dev server.
- [ ] **Step 4: Checks.**
  - Run `pnpm typecheck && pnpm lint && pnpm test`, then `pnpm test:e2e tests/e2e/company.spec.ts tests/e2e/smoke.spec.ts`. Expected: all pass.
- [ ] **Step 5: Commit.**

```bash
git add -A app/demos/company lib/images.ts
git commit -F - <<'EOF'
feat(company): drawn client logos, machining photos, finished footer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Shared language test, hub thumbnails, full verification

**Files:**
- Modify: `tests/e2e/demo-lang.spec.ts`
- Regenerate: `public/thumbs/web-standard.jpg`, `public/thumbs/pages/web-standard-1.jpg`, `public/thumbs/pages/web-standard-2.jpg`, `public/thumbs/pages/web-standard-3.jpg`

- [ ] **Step 1: Add the company to `DEMOS`** in `tests/e2e/demo-lang.spec.ts`. Append this entry:

```ts
  { name: "company", home: "/demos/company", next: "/demos/company/services", where: "navigation", en: "Services", th: "บริการ" },
```

  - Run `pnpm test:e2e tests/e2e/demo-lang.spec.ts`. Expected: PASS on both projects. That is 5 tests per demo, 3 demos, 2 projects, so 30 in total.

- [ ] **Step 2: Regenerate the hub thumbnails.**

```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
git add public/thumbs/web-standard.jpg public/thumbs/pages/web-standard-1.jpg public/thumbs/pages/web-standard-2.jpg public/thumbs/pages/web-standard-3.jpg
git checkout -- public/thumbs
```

  - Open `public/thumbs/web-standard.jpg` and check that it shows the lathe photo in Thai.

- [ ] **Step 3: Full verification.**
  - Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`. Expected: everything passes.

- [ ] **Step 4: Commit.**

```bash
git add tests/e2e/demo-lang.spec.ts public/thumbs/web-standard.jpg public/thumbs/pages/web-standard-1.jpg public/thumbs/pages/web-standard-2.jpg public/thumbs/pages/web-standard-3.jpg
git commit -F - <<'EOF'
test(company): shared language test; hub thumbnails with the new photos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
