# Hub "Lineup + Compare" — Design

Date: 2026-10-20
Owner: SupaOhm (@devohm on Fastwork)
Builds on: `2026-10-20-hub-redesign-design.md` (Moving Wall). The hero, header, CTA band, footer and visual tokens stay. This spec replaces the **work**, **process** and **about** sections and adds a **compare page**.

## Why

- **The work section was long and repetitive.** It took about 4½ screens on desktop and nearly 7 on mobile, with six identically built rows.
- **Process and About were plain text.** Next to the work section they looked unfinished.
- **The packages aren't six products.** They are **two Fastwork services × three plans** of the same build. Buyers should read "which service, which plan" at a glance, and the services should feel distinct and equal.
- **Comparing plans was missing.** The user asked for an Apple-style compare page that stays simple as more services are added.

Mockups approved in the visual companion:

| Mockup | Covers |
|---|---|
| `lineup-compare-v2.html` | Tiles, lineup and compare |
| `process-about.html` (option A) | Process and about |

## Global rules (unchanged)

- **Copy tone:** professional and client-focused; no boasting, no claims about other sellers.
- **Thai pronoun:** use only "เรา" in Thai.
- **No off-platform contact:** no email, LINE or phone for SupaOhm anywhere.
- **Fonts:** no serif fonts. Use only fonts already loaded: Bricolage Grotesque 800, Anuphan, Kalam 700 and Itim.
- **Accessibility and layout:** AA text contrast, no horizontal page overflow at 375px or 1440px, visible keyboard focus, and `prefers-reduced-motion` respected.
- **Static export:** keep `output: "export"`. Nothing may need a server.
- **No new dependencies.**

## Visual additions

- **Service accents:** one accent per service, set through a CSS variable (`--acc`) on the section.

  | Service | Accent | Token |
  |---|---|---|
  | `web` | lime `#d7ff5c` | existing |
  | `app` | blue `#9fd8ff` | new, `--color-sky` in `@theme` |

  Both pass AA as text on forest `#0e1a14`, and forest text passes on both fills.
- **Pill buttons in the lineup and compare:**
  - Shape: `border-radius: 999px`.
  - Primary: filled with the accent.
  - Secondary: accent outline.

  The rest of the site keeps its 6px buttons.
- **Banned in these sections:** 01–06 index numbers, all-caps labels, "·"-joined meta strings and "→" on buttons. The process steps are a real sequence, so they keep the numbers 1–5.

## 1. The work (`#work`) on `/en` and `/th`

### Service tiles

- **Structure:** a row of equal tiles, one per service, using the tabs pattern.
  - Tiles have `role="tab"`, `aria-selected` and `aria-controls`.
  - The left/right arrow keys move between tiles, and Home/End jump to the first/last.
  - Each lineup is a `role="tabpanel"`.
- **Grid:** `repeat(auto-fit, minmax(260px, 1fr))`. Today that's 2 tiles; up to 4 fit.
- **Tile contents:**
  - The service name in Bricolage 800, about 34px.
  - A one-line blurb.
  - "3 plans, from ฿X", where X is the cheapest plan of that service.
  - A fan of 3 screenshots from that service, peeking out of the bottom-right corner.
- **States:**
  - The selected tile is filled with the service accent and has forest text. Unselected tiles are forest-2 with a hairline border.
  - On hover the border brightens and the fan lifts 8px. There's no lift under reduced motion.
- **Defaults:** `web` is selected on load. The choice isn't persisted.

### Lineup (tab panel)

- **Heading:** the service lede, e.g. "Websites and landing pages", in Bricolage 30px, followed by one muted sentence.
- **Grid:** three plan columns using `grid-template-rows: subgrid`, so every row lines up across the plans.
- **Each plan column contains, in order:**
  1. **Stage:** a fan of N real page screenshots from that plan's demo. N = the plan's page or screen count (1, 3 or 5). The frames rotate ±7° per step and are spaced 34px apart.
  2. **Name:** the plan name (Basic, Standard or Premium), Bricolage 32px.
  3. **Tagline:** one line, muted.
  4. **Price:** `formatTHB`, Bricolage 24px.
  5. **Buttons:**
     - **Try the demo**: `next/link` to `demoPath`, with `prefetch={false}`.
     - **Order ↗**: opens `fastworkUrl` in a new tab, with the sr-only new-tab text.
  6. **Demo line:** "Demo: {demoName}", small and muted.
  7. **Specs:** the service's 4 `lineupRows`, which are keys into the compare rows.
     - A count row shows a big accent number with its unit underneath.
     - A yes/no row shows a check or dash icon with its label.
     - A text row shows a check with the text.
- **After the panel:** a **Compare plans** button linking to `/{locale}/compare?service={id}`.
- **Mobile (<768px):**
  - The tiles show 2 per row with the blurb hidden.
  - The plan columns become a horizontal scroll-snap row, one plan per 85% of the viewport width, inside the section.
  - The page itself never scrolls sideways.

### Removed from the hub

- `project-row.tsx`.
- The "Try this" prompts (`work.try`, `work.tryHeading`).
- The scope chips on the hub.
- The 01–06 numbering.

## 2. Compare page: `/{locale}/compare`

- **Route:** `app/[locale]/compare/page.tsx`. It's prerendered for `en` and `th`, with its own metadata and alternates.
- **Header:** the H1 "Compare plans" and the same tiles in a smaller "compact" form (name, from-price and fan, no blurb).
- **Selected service:**
  - The initial service is read on the client from `?service=` (`web` or `app`). It falls back to `web`.
  - Changing the tile updates the URL with `history.replaceState`.
- **Table (per service):**
  - **Header row:** each plan's name, price and **Try the demo**. It sticks below the site header (`top: 4rem`) while you scroll.
  - **Rows:** the service's `rows`, grouped by section heading: Size, Features, Delivery.
  - **Cells:**
    - Count: a big number with its unit.
    - Yes/no: a ✓ in the accent or a muted dash, with the row label underneath.
    - Text: a ✓ with the plan's own text.
- **Mobile:** the three columns stay side by side, narrower, with a smaller type scale. No horizontal page overflow.
- **Navigation:**
  - A "Compare" link is added to the site header, between Work and Process.
  - The hero's second CTA ("Packages from ฿4,900") now links to `/{locale}/compare` instead of `#work`.

### Feature matrix (confirmed by the user, 2026-10-20)

**Websites (`web`)**

| Group | Row (key) | Basic | Standard | Premium |
|---|---|---|---|---|
| Size | Pages (`pages`, count) | 1 landing page | 3 pages | 5 pages |
| Features | Mobile, tablet and desktop (`resp`) | ✓ | ✓ | ✓ |
| | Contact form (`form`) | – | ✓ | ✓ |
| | Basic on-page SEO (`seo`) | ✓ | ✓ | ✓ |
| | Reusable components (`comps`) | – | – | ✓ |
| | Extra interactions (`inter`) | – | – | ✓ |
| Delivery | Revisions (`rev`, count) | 1 | 2 | 3 |
| | Full source code (`src`) | ✓ | ✓ | ✓ |
| | Help going live (`live`) | ✓ | ✓ | ✓ |

`lineupRows` for websites: `pages`, `form`, `comps`, `rev`.

**Web apps (`app`)**

| Group | Row (key) | Basic | Standard | Premium |
|---|---|---|---|---|
| Size | Screens (`screens`, count) | 1 backend module | 3 dashboard screens | 5 screens |
| | Data modules (`mods`, count) | 1 | 2 | 3 |
| Features | Login (`login`, text) | – | Basic login | Accounts and sign-in |
| | Tables and charts (`charts`) | – | ✓ | ✓ |
| | API (`api`, text) | Up to 4 REST endpoints | Connected to your database | Backend APIs |
| | Validation and database (`db`) | ✓ | ✓ | ✓ |
| | Works on phones (`resp`) | – | – | ✓ |
| Delivery | Revisions (`rev`, count) | 1 | 2 | 3 |
| | Full source code (`src`) | ✓ | ✓ | ✓ |
| | Help going live (`live`) | – | – | ✓ |

`lineupRows` for web apps: `screens`, `login`, `charts`, `rev`.

The Thai labels and units are written to match, in the same professional tone.

## 3. How I work (`#process`)

- **Heading:** "How I work" / "ขั้นตอนการทำงาน".
- **Layout:** five steps in a row on desktop. On mobile they become a vertical list with the picture beside the text.
- **Each step:**
  - A 120px-tall "artefact" picture showing what the buyer sees at that step. It's built in HTML/CSS; the Revise step also uses one demo screenshot. All pictures are `aria-hidden`.
  - A Bricolage title with the step number in lime ("1 Brief").
  - The existing body copy.

| Step | Artefact |
|---|---|
| Brief | Two chat bubbles: the client asks for a 3-page site, and the reply confirms scope and price before ordering. Both are written as an obvious illustration, not a real conversation. |
| Design | A dashed wireframe with block placeholders. |
| Build | 5 lines of syntax-coloured JSX. |
| Revise | A small demo screenshot with a hand-drawn lime ring and the note "bigger logo?" in Kalam. The Thai note "โลโก้ใหญ่ขึ้นอีกนิด?" is in Itim. |
| Deliver | Three file rows: Source code (.zip), Live site (online), Handover notes (.pdf). |

## 4. Who's building it (`#about`)

- **Layout:** two columns, stacking on mobile.
- **Left column:**
  - The heading.
  - The existing bio, with the name in cream semibold.
  - The "View personal portfolio ↗" link.
- **Right column:** a fact list, one ruled row each.

| Fact | Content |
|---|---|
| Studying | Computer Engineering, SIIT, Thammasat University |
| Experience | AI Developer intern, Mizuhada Group; UX/UI Researcher intern, BAKA Group |
| Websites | Next.js, React, TypeScript, Tailwind CSS |
| Web apps | Python, FastAPI, Node.js, PostgreSQL, Supabase |

- **Removed:** the separate "Stack" heading and the word cloud (`STACK`, `about.stackHeading`, `about.stackBody`).

## Data model (`lib/packages.ts`)

Package and service data stays in `lib/packages.ts`, localized with `Record<Locale, …>` as today.

```ts
export type RowKind = "count" | "bool" | "text";
export interface CompareRow { key: string; kind: RowKind; group?: Record<Locale, string>; label: Record<Locale, string> }
export type RowValue =
  | { n: number; unit: Record<Locale, string> }   // kind "count"
  | boolean                                        // kind "bool"
  | Record<Locale, string> | false;                // kind "text" (false = not included)

export interface Service {
  id: ServiceId;
  name: Record<Locale, string>;      // tile title: "Websites" / "เว็บไซต์"
  blurb: Record<Locale, string>;     // tile line
  lede: Record<Locale, string>;      // lineup heading
  sub: Record<Locale, string>;       // lineup sentence
  accent: "lime" | "sky";
  fastworkUrl: string;
  fan: string[];                     // 3 image paths for the tile
  rows: CompareRow[];
  lineupRows: string[];              // keys into rows, length 4
}

// Package gains:
tagline: Record<Locale, string>;
pages: string[];                     // screenshot paths, length = page/screen count
values: Record<string, RowValue>;    // one entry per row key of its service
```

- **Kept:** `title`, `priceTHB`, `demoName`, `demoPath` and `fastworkUrl` stay; the demo pill uses `title`.
- **Removed:** `scope`, which nothing else uses after the hub change.
- **New export:** `services: Service[]`.
- **New helper:** `getService(id)`.
- **Kept helper:** `packagesByService` stays.

## Screenshots

- **Script:** extend `scripts/capture-thumbs.mjs` so it also captures each plan's pages to `public/thumbs/pages/<packageId>-<n>.jpg`. It uses the same pinned clock and demo sessions as the existing thumbnails.
- **Size:** 640×400 (a 1280×800 viewport at deviceScaleFactor 0.5), JPEG quality 82.

| Package | Pages captured |
|---|---|
| web-basic | `/demos/sale-page` |
| web-standard | `/demos/company`, `/services`, `/contact` |
| web-premium | `/demos/resort`, `/rooms`, `/gallery`, `/about`, `/booking` |
| app-basic | `/demos/orders-api` |
| app-standard | `/demos/shop-admin`, `/orders`, `/stock` |
| app-premium | `/demos/clinic-booking/book`, `/admin`, `/admin/customers`, `/admin/services`, `/admin/reports` |

- **Existing thumbnails:** `public/thumbs/<id>.jpg` (used by the hero wall) is unchanged.
- **Image tags:** `next/image` with `unoptimized` and `sizes`. Fan images use `alt=""`, because each plan's name and demo are already in text.

## Code changes

| Change | Files |
|---|---|
| **New** | `components/hub/service-tiles.tsx` (client, tabs logically), `lineup.tsx`, `plan-stack.tsx` (the fan), `spec-cell.tsx` (count/bool/text rendering shared with compare) |
| **New** | `app/[locale]/compare/page.tsx`; `components/compare/compare-view.tsx` (client: tiles, the `?service=` sync and the table) |
| **Rewrite** | `work-section.tsx`, `process-section.tsx`, `about-section.tsx` |
| **Edit** | `site-header.tsx` (Compare link), `hero.tsx` (CTA href), `globals.css` (`--color-sky`, fan and stage styles, reduced-motion rules) |
| **Delete** | `project-row.tsx` |

**`lib/i18n/{en,th}.json`:**

- **Removed:** `work.try`, `work.tryHeading`, `work.tiers`, `work.order`, `work.tryLive` and the `work.groups` labels, wherever they are no longer used.
- **Added:**
  - `work`: tile "plans, from" text, Try the demo, Order, the demo-line prefix and Compare plans.
  - `compare`: title, meta and description.
  - `nav.compare`.
  - `process.artefacts`: the bubble texts, revision note and file labels.
  - `about.facts`.

## Testing

- **Unit tests (`tests/unit/packages.test.ts`):**
  - Every package has a value for every row key of its service, and nothing else.
  - The kind of each value matches its row.
  - Each package's `pages.length` matches its count row (`pages` or `screens`).
  - Every image path exists under `public/`.
  - `lineupRows` are valid keys.
  - Each service has exactly 3 plans, in Basic/Standard/Premium order.
- **Unit tests (`tests/unit/i18n.test.ts`):** EN/TH shape parity, as today.
- **e2e: `tests/e2e/hub.spec.ts`:**
  - The tiles render.
  - **Websites** is selected by default and shows 3 plans (`data-testid="plan-web-*"`), each with its price, a Try the demo link to `demoPath` and an Order link to `fastworkUrl`.
  - Clicking **Web apps** shows the app plans.
  - The arrow keys switch tiles.
  - Compare plans links to `/en/compare?service=…`.
  - The Thai labels render.
  - There are still no contact links.
- **e2e: new `tests/e2e/compare.spec.ts`:**
  - `/en/compare` shows the web rows.
  - `?service=app` opens Web apps.
  - Switching tiles updates the URL.
  - The plan header is sticky: it is still visible after scrolling down.
  - `/th/compare` renders the Thai labels.
- **e2e: `tests/e2e/smoke.spec.ts`:** add `/en/compare` and `/th/compare` to the routes, with no console errors and no overflow at 375px.
- **Full suite:**
  - typecheck, lint, unit and e2e (both projects) pass.
  - Playwright screenshots of `/en` and `/th` work/process/about, and of `/en/compare` and `/th/compare`, at 375px and 1440px, reviewed by eye.

## Out of scope

- Changes to the hero copy or the hero wall, the CTA band or any demo (other than the second hero CTA href above).
- New services; the data model allows them later.
- Fastwork listing edits.
- Deploying: merging to `main` deploys via Cloudflare, so it needs the user's go-ahead.
