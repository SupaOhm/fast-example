# Demo Rework + English/Thai Demos — Design

Date: 2026-10-22
Owner: SupaOhm (@devohm on Fastwork)
Covers BACKLOG items **#1 (English + Thai demos)** and **#4 (demo polish)**. Items #2 (inquiry form), #3 (footer) and the small leftovers are out of scope.

## Why

- **Fastwork is now worldwide.** Foreign buyers land on the demos, and five of the six are Thai only. Resort is the only bilingual one.
- **The demos "still look ahh".** In the walkthrough (screenshots at 1440px and 375px), Ohm agreed with every problem noted:
  - **Template layouts:** split hero → icon row → 3 cards → FAQ.
  - **Text:** thin, small, grey Thai body text.
  - **Unfinished-looking placeholders:** a blank-label bottle, grey "logo" boxes, letter avatars, `080-000-0001` numbers.
  - **Repetition:** the demos repeat each other's motifs.
  - **Weak first screens.**
- **Some demos have concept problems, not just styling.**
  - The Orders API demo speaks to developers, but the buyers are shop owners, and its panels start empty.
  - The shop admin opens on a login wall.
  - The clinic's demo flow is confusing: the visitor switches roles without being told, hits a login wall halfway through, never sees the payoff, can't find the admin, and has six steps to get through.

Mockups approved in the visual companion (local only, in `.superpowers/brainstorm/19193-1792598876/content/`):

| Mockup | Decision |
|---|---|
| `demo-review.html` | All notes agreed |
| `sale-directions.html` → `sale-c-price.html` | Direction C, with A's price in gold (variant 2) |
| `company-directions.html` | None. Keep the current company demo |
| `resort-moments.html`, `resort-rooms.html` | All four moments; rooms as rail B |
| `api-directions.html` | A, with B's lanes below |
| `shop-directions.html` | A's look with B's layout |
| `clinic-flow.html`, `clinic-flow-fixes.html` | All five flow problems; fix A in a modern device frame |

The mockups set **direction only**. The final visual design of each page is done with `/frontend-design` during the build.

## Global rules

**Unchanged from earlier specs:**
- **Copy tone:** professional; Thai uses only "เรา".
- **No off-platform contact for SupaOhm.** The fictional businesses' own sample contact details are fine.
- **Fonts:** no serif fonts.
- **Static export:** keep `output: "export"`; nothing may need a server.
- **No new dependencies.**
- **Accessibility:** AA contrast, visible focus, `prefers-reduced-motion` respected, and no horizontal page overflow at 375px or 1440px.

**New for this work:**
- **Body text:** at least 16px, at weight 400 or heavier. No light weights for body copy.
- **Images:** Unsplash only, added to `lib/images.ts` and checked with `curl -sI` to return 200.
- **Drawn brand pieces:** logos, product labels, packaging and product icons are inline SVG. No AI-generated images, no emoji as product art.
- **Each demo has its own look.** No shared hero layout, and no motif reused across demos (for example, arch photos stay only in resort).
- **Languages and the compare page:** the compare page and package data say nothing about languages. Ohm chose "say nothing".
- **The businesses stay Thai in both languages.** Thai names, ฿ prices and Thai addresses stay as they are. English is how that Thai business would present itself to foreign customers.

## Part 1: shared English/Thai setup

### Language state

- **Store:** `lib/demos/lang.ts` exports `type Lang = "th" | "en"`, `type L = Record<Lang, string>` and the store `demoLang`, built with `createDemoStore<Lang>("lang", …)`. Its storage key is `demo:lang`.
- **Initial value**, used when `demo:lang` has never been set:
  1. `showcase:locale`, if it is set to a valid locale (the hub choice);
  2. otherwise `th` if `navigator.language` starts with `th`;
  3. otherwise `en`.

  Put this in a pure function `initialDemoLang(hubLocale, navigatorLanguage)` so it can be unit-tested.
- **After that it is independent.** Switching inside a demo writes `demo:lang` only. It never changes `showcase:locale`.
- **Server and first paint:** the server snapshot is `th`. A visitor whose choice is English sees a brief flash of Thai before hydration. This is accepted. Avoiding it would need `/en/demos/...` URLs, which were ruled out.
- **Resort:** `lib/demos/resort/lang-store.ts` (`resort:lang`) is removed. Resort reads `demoLang`. An old `resort:lang` value is not migrated.

### Components

- **Where they live:** `components/demo/lang.tsx` takes over resort's `useLang`, `T`, `LangScope` and `TImage` from `app/demos/resort/_components/t.tsx`. That file is deleted, and resort imports the shared versions.
- **`LangScope`:** wraps each demo layout and sets `lang` on the wrapper.
- **`<DemoLangSwitch className labels>`:** a button that toggles `demoLang`. It shows the *other* language ("EN" when Thai is showing, "TH" when English is showing) and has an `aria-label` in the current language. Each demo places it in its own header and styles it through `className`. Resort's `LangToggle` becomes a styled use of it.
- **Demo bar:** `components/demo/demo-pill.tsx` reads `demoLang` instead of `showcase:locale`.
- **Formatting:** `lib/demos/format.ts` holds `formatDate(date, lang, style)` and `formatTHB(n)` (the same in both languages).
  - Thai dates use the Buddhist year (`21 ต.ค. 2569`); English dates use the Gregorian year (`21 Oct 2026`).
  - `app/demos/shop-admin/_components/format.ts` and `app/demos/clinic-booking/_components/admin-format.ts` call it.
- **Copy:**
  - Business content in `lib/demos/<id>/content.ts` (or `data.ts`) becomes `L` values.
  - Interface text goes in each demo's `_components/copy.ts`, following resort's pattern.
  - Validation messages take a `lang` argument, as `validateInquiry` already does.
- **Page metadata** stays static. Titles use the business's Latin name so they read in both languages.

## Part 2: per-demo changes

### Mali Botanics: sale page (Website Basic)

- **Look:** deep green `#17331f`, gold `#f2d16b`, red `#d7263d` only on the discount sticker, Prompt at weights 400/600/800.
- **Hero:**
  - A full-bleed jasmine photo bleeding off the right, with a green gradient over the left half.
  - Headline "ผิวใสแบบ **มะลิ** ใน 14 วัน", with มะลิ in gold.
  - Price: giant gold **390.-** with **฿590** struck through.
  - A rotated red **−34% วันนี้เท่านั้น** sticker.
  - A big LINE button with a solid offset shadow.
  - A gold countdown bar at the top.
- **Product:** a drawn SVG amber dropper bottle with a printed Mali label (leaf mark, "MALI", "น้ำนมข้าวมะลิ", "JASMINE RICE SERUM", "30 ml"). It replaces the blank-label stock photo, and the photo `saleHero` is dropped.
- **Countdown:** counts down to the end of the current day in the visitor's local time, then restarts. It is cosmetic.
- **Below the hero:** a Day 1 / 7 / 14 timeline band. Then the existing benefits, ingredients, reviews, bundles and FAQ, restyled to match. No arch photos.

### Siam Precision: company site (Website Standard)

- **Design:** kept as it is.
- **Client logos:** the grey boxes become five drawn SVG wordmarks, one per client in `clients`, each in its own style.
- **Photos:** replace the robot arm (`companyHero`) with a CNC machining close-up. Check the four service photos and swap any that don't fit a small CNC job shop.
- **Footer:** tighten it to remove the dead space below the columns on desktop.
- **Language:** add the EN/TH switch and translate.

### Saeng Chan Resort (Website Premium)

- **Design:** keep today's look. Raise body text to at least 16px.
- **Moonrise hero:** as the visitor scrolls through the hero, the bay darkens to dusk, a moon rises above the cliffs, and the headline changes from "พักผ่อนริมทะเลอันดามัน ใต้แสงจันทร์" to "คืนนี้พระจันทร์ขึ้นเหนืออ่าว 19:30 น.".
  - It uses scroll-driven CSS or `IntersectionObserver` and `requestAnimationFrame`, with no library.
  - With `prefers-reduced-motion`, it shows the static first state.
- **Availability strip:** goes directly under the hero.
  - Shows the next 14 nights with a room-type selector. Each night shows its price; Friday and Saturday cost 1.25× the base price, rounded to ฿100.
  - Fully booked nights are crossed out. Which nights are full is derived from the date, so the strip is the same for everyone on the same day.
  - Click a check-in night and then a check-out night to see the night count and total. A range that crosses a full night restarts the selection.
  - "จองช่วงนี้" opens the booking page with the room and dates filled in.
- **Editorial middle:** replaces the three thin icons with three big Mitr figures, each with a photo and caption: **3 นาที** to the beach, **24 ห้อง**, **19:30** moonrise.
- **Room rail:** all five rooms on every screen size.
  - Tall full-photo cards, with the first one wider as the featured room.
  - A gold "เริ่ม ฿X / คืน" tag, and name, guests, size and the first feature over the photo.
  - Hover zooms the photo and shows "ดูห้องและเช็กวันว่าง →".
  - Drag, swipe or use the arrow buttons; a counter (01 / 05) and a progress line track the position.
  - Scroll snapping is on. Arrow buttons and keyboard work. No library.

### Orders API (Web app Basic)

- **Look:** light theme, Anuphan for text, JetBrains Mono for code.
- **Top section (shop owner first):**
  - Kicker "ร้านดี · ระบบรับออเดอร์" and headline "ออเดอร์เข้าปุ๊บ เด้งใน LINE ปั๊บ".
  - A short benefit line and three ticked benefits.
  - The shop's LINE chat in a phone frame, filling with order messages (new, paid, shipped).
  - A dark "for your developer" call log showing the request behind each message (`POST /orders 201`, `PATCH /orders/:id/status 200`).
  - **Autoplay:** runs on a timer through the existing in-browser API (`lib/demos/orders-api/api.ts`), on its own in-memory sample orders. It never writes to the console's stored orders, so the "8 orders" sample data and reset behave as they do today. It pauses when off-screen. With reduced motion it shows a static filled state.
- **How it works:** three lanes (the shop's site → Orders API → the shop's LINE), with each event travelling across them.
- **Then:** the existing try-it console and reference, restyled for the light theme. Nothing starts empty: the response panel shows an example response until the first send.

### ร้านดี: shop admin (Web app Standard)

- **Look:** kraft `#f1e6d2`, dark wood `#2b2217`, mustard `#e2b04a`, Bai Jamjuree.
- **No login wall:**
  - Visiting `/demos/shop-admin` with no session starts a demo session.
  - A banner reads "กำลังดูในฐานะเจ้าของร้าน (เดโม)" and links to log out.
  - Logging out goes to the existing login screen. Logging in from there works as it does today.
- **Overview page: today first.**
  - Greeting.
  - Three to-do tiles: **ต้องแพ็ก N ออเดอร์** → orders filtered to packing; **ใกล้หมด N สินค้า** → stock; **ขายแล้ววันนี้ ฿X** on a dark "till" card → scrolls to the charts below.
  - A packing queue with one-tap "แพ็กแล้ว ✓", which updates the order's status in the store.
- **Charts stay on the overview.** The plan includes exactly **3 dashboard screens** (overview, orders, stock), so no screen is added. Below the packing queue go a compact daily-sales chart, the best sellers and sales by channel, smaller than today.
- **Orders:** shown as receipt-style cards or rows with zigzag edges, monospace totals and stamped statuses.
- **Products:** drawn SVG product icons replace placeholders.

### Lumi Clinic (Web app Premium)

- **Look:** rose `#fbeef0` and wine `#6b1f3a` with `#c2185b` accents, Kanit, stronger contrast than today.
- **Public site:** tall staff portraits (Unsplash) replace the letter circles. A live "คิวว่างถัดไปวันนี้ HH:MM · <staff>" chip sits in the hero.
- **Booking page (`/demos/clinic-booking/book`) shows both sides:**
  - **Left, labelled "มุมลูกค้า · LINE":** the customer's LINE chat in a polished, modern, original phone frame. Do not copy any manufacturer's device or trademarks.
  - **Right, labelled "มุมคลินิก · ตารางวันนี้":** today's staff schedule with a "now" line.
- **3-tap booking:**
  1. Pick a treatment.
  2. Pick a free time; each option shows the staff member.
  3. Confirm. The name is pre-filled as the demo visitor.
- **The payoff:** on confirm, the new booking drops into the schedule, highlighted, and a toast says it arrived in that staff member's schedule. "เริ่มใหม่" resets the chat.
- **Phones:** the two sides become tabs (ลูกค้า | คลินิก). The clinic tab shows a badge when the booking lands.
- **Admin access:**
  - The schedule header links to the full admin.
  - The admin opens with a demo session (no login wall), and logging out shows the existing login.
  - The booking just made is highlighted in the admin's today view.
- **The day looks in progress:** bookings before the current time are shown as arrived or done, and later ones as booked. The schedule has a "now" line.

## Part 3: order, testing, shipping

**Order:** one plan, branch and PR per step.

1. Shared EN/TH setup, plus moving resort to it.
2. Mali Botanics.
3. Siam Precision.
4. Saeng Chan.
5. Orders API.
6. ร้านดี.
7. Lumi Clinic.

After each demo step, re-run `scripts/capture-thumbs.mjs` and commit the new thumbnails.

**Tests:**
- **Unit (Vitest):**
  - `initialDemoLang` cases.
  - `formatDate` in both languages.
  - **Copy completeness:** every `L` value in each converted demo has non-empty `th` and `en`.
  - Resort availability pricing and range rules.
  - Clinic "day in progress" status by time.
  - Existing unit tests keep passing.
- **E2E (Playwright):**
  - **New `tests/e2e/demo-lang.spec.ts`:**
    - with `showcase:locale=en`, each demo opens in English;
    - the switch changes copy and the setting holds across that demo's pages;
    - the demo bar follows the language.
  - **Clinic:** a booking made in the phone appears in the schedule; `/admin` opens without logging in; logging out shows the login.
  - **Shop admin:** opens on the overview without logging in; logging out shows the login.
  - **Resort:** choosing an availability range fills in the booking page.
  - Each demo's existing spec is updated for its new layout.
- **Checks on every PR:** `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm test:e2e` pass. A visual check at 1440px and 375px, in both languages.

**Shipping:** merging to `main` deploys devbyohm.com, so every merge waits for Ohm's explicit OK.
