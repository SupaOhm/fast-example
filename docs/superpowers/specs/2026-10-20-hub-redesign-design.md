# Hub Redesign ("Moving Wall") — Design

Date: 2026-10-20
Owner: SupaOhm (@devohm on Fastwork)
Supersedes: the Hub section of `2026-10-19-showcase-design.md`. Demos are unchanged.

## Why

The current hub reads as AI-generated and doesn't sell:
- It uses the default template look: beige paper, a big generic headline, pill buttons, an eyebrow line and a muted subtitle.
- The actual work sits below the fold.
- The package cards list scope but never say what a buyer can *do* in each demo.

The goal: in the first second, a Fastwork buyer sees that there is a lot of real, working work, and wants to click it.

Direction chosen in brainstorming: **V2 "Moving wall"**, a dark studio hero whose right side is a tilted, streaming wall of the six demo screenshots.

**Tone:** professional and client-focused. Copy talks about what the buyer gets, never boasts, and makes no claims about other sellers. No "go break it", "no Dribbble shots" or similar.

## Success criteria

- The first viewport at 1440×900 and at 375×812 shows the headline, a primary CTA and demo screenshots.
- Every project row links to its live demo and its Fastwork listing, with the price from `lib/packages.ts`.
- English is the default language: `/` redirects to `/en`, and Thai is the toggle.
- The existing quality bar holds:
  - static build
  - no console errors
  - no horizontal overflow at 375px and 1440px
  - AA contrast for text
  - no off-platform contact details

## Visual system (hub only)

Tokens in `app/globals.css` `@theme` replace the paper/ink set:

| Token | Value | Use |
|---|---|---|
| `--color-forest` | `#0e1a14` | page background |
| `--color-forest-2` | `#16261d` | raised surfaces (rows, timeline) |
| `--color-cream` | `#efeadb` | main text |
| `--color-cream-muted` | `#b4b3a6` | secondary text |
| `--color-lime` | `#d7ff5c` | accent, primary buttons, CTA band |
| `--color-rule` | `#efeadb1f` | hairlines and borders |

- **Type:** keep the loaded fonts and add two handwritten accent fonts via `next/font/google`, used *only* for the hero's accent word: **Kalam 700** (Latin) and **Itim 400** (Thai, because Kalam has no Thai glyphs). No serifs anywhere. Bricolage Grotesque handles Latin display at weight 800 with tight tracking (`-0.04em`): leading 1.1 for the hero H1 (room for the underline) and 1.0 for section headings. Anuphan handles Thai and body text.
  - Thai headings use leading ≥ 1.2 with no negative tracking. Apply this via `:lang(th)` or the locale-aware classes.
- **Buttons:** 6px radius, not pills.
  - Primary: lime fill with forest text.
  - Secondary: 1px cream/25% border.
- **No eyebrow line**, no centred nav-link cluster, and no beige.
- The 404 page (`app/global-not-found.tsx`) uses the same tokens.

## Page structure (`/en`, `/th`)

Section order and anchor ids:

### Header

- Sticky header with a translucent forest background and backdrop blur.
- Left: "SupaOhm" wordmark.
- Right: Work · Process · About links, the locale toggle (`ไทย` / `EN`), and a lime **Hire on Fastwork** button that opens `FASTWORK_PROFILE_URL`.
- At 375px, keep the wordmark, toggle and Hire button, and hide the section links.

### 1. Hero
- **Copy (left, desktop):**
  - H1 (EN): "See exactly what you're paying for." The headline is in Bricolage Grotesque 800, cream.
    - The accent word **"exactly"** is set in **Kalam 700, lime `#d7ff5c`, about 1.05em**, with a **hand-drawn lime underline** beneath it. Both come from a `Scribble` component in `components/hub/scribble.tsx`, which wraps the word and draws the underline.
    - **Width:** the SVG spans exactly the word's width (`left:0; width:100%` of an inline-block wrapper).
    - **Position:** it sits just below the baseline (`top: calc(100% - .1em)`), behind the glyphs (`z-index:-1` inside an `isolation:isolate` wrapper), so descenders like the "y" overlap it cleanly. Headline leading is 1.1 to leave room.
    - **Stroke:** a single slightly rising curve, round caps, about 0.07em thick, `aria-hidden`.
    - **Animation:** it draws itself in once on load (`stroke-dashoffset`, about 0.7s, starting at 0.3s). Under `prefers-reduced-motion: reduce` it is static and fully drawn.
    - **Line breaks:** at 1440px it breaks after "what". At 375px it wraps naturally, and "exactly" is never split (`white-space:nowrap` on the wrapper).
  - H1 (TH): "เห็นชัดๆ ว่าจ่ายแล้วได้อะไร", with the same treatment on "ชัดๆ": Itim, lime, underlined. The rest of the line is in Anuphan 700. The Thai underline sits at `top: calc(100% - .16em)`, and Thai leading stays ≥ 1.2. Check the vertical alignment of the Itim word against Anuphan in the visual pass.
  - Body (EN): "Each package I offer on Fastwork has a working example you can open and use, so the scope and quality are clear before you order."
  - Body (TH): "ทุกแพ็กเกจบน Fastwork มีเว็บตัวอย่างที่เปิดใช้งานได้จริง เห็นขอบเขตและคุณภาพงานชัดเจนก่อนสั่งซื้อ"
  - Buttons: **Browse the work ↓** (`#work`) and **Packages from ฿4,900** (`#work`). The price comes from `Math.min` over `packages` via `formatTHB`.
- **The wall (right, desktop):**
  - Three columns of the six `/thumbs/<id>.jpg` screenshots, rotated −8°.
  - Columns 1 and 3 scroll up and column 2 scrolls down, in a seamless CSS loop of about 40s.
  - A left-to-right forest gradient fades the wall under the copy.
  - The images are decorative (`alt=""`, `aria-hidden`), and the wall is not focusable.
- **Motion rules:**
  - Under `prefers-reduced-motion: reduce` the wall is static.
  - A small "Pause motion" / "Play motion" toggle button (WCAG 2.2.2) sits at the bottom-right of the wall. Its state is session-only.
- **Mobile (375px):**
  - Copy first, then the wall below it at about 260px tall, cropped by the section edge.
  - No horizontal overflow (the wall is clipped by `overflow-hidden` on the hero).
- **Thai copy:** written fresh in the same professional tone, not translated literally. Use the neutral pronoun "เรา" for SupaOhm.

### 2. The work (`#work`)
- **Heading:** "The work" plus a one-line intro saying each project is one Fastwork package.
- **Groups:** "Websites" (web-basic, web-standard, web-premium) and "Systems" (app-basic, app-standard, app-premium). Each group has a small label and a one-line description.
- **Project rows:** one per package, `data-testid="package-<id>"`. Each row has:
  - **Index number:** a large "01"–"06".
  - **Screenshot:** a `next/image` of `/thumbs/<id>.jpg` linking to the demo. On desktop it is large, about 55% of the row width, and rows alternate left and right. On mobile it sits on top.
  - **Name:** the demo name from `pkg.demoName[locale]`.
  - **"Try this" prompts:** 2–3 per package, held in the i18n dictionaries under `work.try.<packageId>` (hub copy, so it lives in `lib/i18n`).
  - **Price line:** the tier label, `formatTHB(pkg.priceTHB)`, and the scope from `pkg.scope[locale]` as small chips.
  - **Buttons:** **Try it live** (lime, `next/link`, `prefetch={false}`, href `pkg.demoPath`) and **Order on Fastwork** (outline, opens `pkg.fastworkUrl` in a new tab).

  "Try this" prompts (EN; TH equivalents written to match):

  | Package | Prompts |
  |---|---|
  | web-basic | Scroll the full sale page on your phone · Pick a bundle and hit the LINE order button |
  | web-standard | Switch between Home, Services and Contact · Send the contact form empty and see the validation |
  | web-premium | Flip the site between Thai and English · Filter rooms by guests · Open the photo gallery |
  | app-basic | Send a POST /orders and get a 201 back · Change an order's status and see the LINE notification preview |
  | app-standard | Log in with the prefilled demo account · Search orders · Edit a stock count and watch the low-stock flag |
  | app-premium | Book a slot in the LINE-style flow · Open the staff side and find your booking in today's queue |

### 3. How it works (`#process`)

- A compact numbered timeline of the existing five steps: Brief → Design → Build → Revise → Deliver.
- Desktop: one horizontal row of five, with lime step numbers and a hairline connector.
- Mobile: a vertical list.
- Copy is reused from the current dictionaries and tightened.

### 4. Who's building it (`#about`)

- Two columns: the existing bio (reused) with the portfolio link to supakornohm.vercel.app on the left, and the tech stack as a plain word list on the right.
- It replaces both the separate Stack section and the old About section.

### 5. CTA band + footer

- **Band:** full-width lime with forest text. Big "Have a project in mind?" (TH: "มีโปรเจกต์ในใจแล้ว?"), one sentence ("Send your brief on Fastwork and I'll confirm scope and price before we start."), and a forest-filled **Hire me on Fastwork** button linking to `FASTWORK_PROFILE_URL`.
- **Footer line:** the fictional-content note and © year, on forest.

## Language default

- `next.config.ts` redirects `/` to `/en`.
- `lib/i18n/config.ts` sets `defaultLocale = "en"`. The demo pill falls back to English when no locale is stored.
- The demo pill's back link points to `/${locale}#work`. The old `#services` anchor is removed.
- `global-not-found.tsx` links "Back home" to `/en`.

## Code changes

- **Rewrite in `components/hub/`:** `hero.tsx` (with a client child `hero-wall.tsx` for the pause toggle), `site-header.tsx` and `site-footer.tsx`.
- **New files:** `work-section.tsx` and `project-row.tsx`, plus `scribble.tsx` (the hand-drawn underline, server component, pure CSS animation), replacing `services-section.tsx` and `package-card.tsx`.
- **Restyle:** `process-section.tsx`.
- **Merge:** `about-section.tsx` absorbs `stack-section.tsx`, which is then deleted. Delete the other replaced files too.
- **`lib/i18n/{en,th}.json`:** a new copy structure (hero, work incl. `try`, process, about, cta, footer, nav). `Dictionary` stays inferred from `en.json`, and `tests/unit/i18n.test.ts` keeps checking that both dictionaries have identical keys.
- **No new dependencies.** The animation is pure CSS keyframes in `globals.css`, with no JS animation library.

## Testing

- **`tests/e2e/hub.spec.ts`:**
  - Use `/en` and the new copy.
  - Every `package-<id>` row shows its price, a "Try it live" link to `demoPath`, an "Order on Fastwork" link to `fastworkUrl`, and a loaded thumbnail.
  - The locale switch goes from EN to TH and back.
  - No `mailto:`, `tel:` or `line.me` links.
  - The pause toggle flips its label.
- **`tests/e2e/smoke.spec.ts`:** root redirects to `/en`. `routes.ts` lists `/en` and `/th`.
- **`tests/unit/i18n.test.ts`:** both dictionaries keep identical keys, and `work.try` has 2–3 entries for each package id.
- **Full suite:** `tsc --noEmit`, lint, unit tests and e2e tests stay green.
- **Visual check:** Playwright screenshots of `/en` and `/th` at 375px and 1440px, reviewed by eye. Demo thumbnails are unchanged and not regenerated.

## Out of scope

- Changes to any demo.
- New demos or new photography.
- A real photo of SupaOhm.
- Analytics.
- Deployment, which still needs the user's explicit go-ahead.
