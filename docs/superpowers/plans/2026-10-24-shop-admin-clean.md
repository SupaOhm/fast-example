# ร้านดี Shop Admin: Back to a Clean Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Return the shop admin (`/demos/shop-admin`) to the clean, minimal look it had before step 6, and keep everything step 6 added:
- no login wall, with the demo-session banner;
- the today-first overview: to-do tiles, packing queue, compact charts;
- Thai/English;
- drawn product icons.

**Why:** On 2026-10-24 Ohm said the original version "was better since it's more minimal clean for dashboard". He chose a clean table for orders. The step 6 kraft, wood, mustard, tape, stamps and torn-receipt styling goes. See `docs/BACKLOG.md` §4 and the memory note on dashboard style.

**Architecture:** A visual-only change. `lib/demos/shop-admin/*`, `copy.ts` (except keys that only served the old look), the stores, the routes and the behaviour stay as they are.

**Tech stack:** Next.js 16.4 static export, React 19, TypeScript strict, Tailwind 4, recharts, Noto Sans Thai, Vitest, Playwright.

**Reference for the look:** the pre-step-6 files on `main` at commit `75b7054`. Read them with `git show 75b7054:app/demos/shop-admin/<path>`, especially `layout.tsx`, `_components/admin-shell.tsx`, `overview.tsx`, `orders-table.tsx`, `stock-table.tsx`, `login-form.tsx`, `brand-mark.tsx` and `format.ts`. Match their density, borders, radii, shadows and type sizes. Don't copy their Thai-only literals; all copy comes from `copy.ts`.

## Global Constraints

- **Static export:** keep `output: "export"`. Add no new dependencies.
- **Font:** Noto Sans Thai, weights 400, 500 and 600, subsets thai and latin, as in the original. Drop Bai Jamjuree and JetBrains Mono. Numbers use `tabular-nums`. No serif fonts, and no weight below 400.
- **Palette** (the original tokens, on the layout wrapper):

  | Token | Value |
  |---|---|
  | `--bg` | `#f4f6f4` |
  | `--panel` | `#ffffff` |
  | `--line` | `#e3e8e4` |
  | `--brand` | `#1f7a5a` |
  | `--brand-ink` | `#166048` |
  | `--brand-soft` | `#e3f2eb` |
  | `--warn` | `#c2410c` |
  | `--warn-ink` | `#9a3412` |
  | `--warn-soft` | `#fdeee6` |
  | `--ink` | `#17201b` |
  | `--muted` | `#56655c` |

  Remove the kraft tokens (`--paper`, `--wood`, `--mustard`, `--mustard-ink`, `--ok`) and update every use.
- **Status pills** are small rounded pills with a border, like the original's. The pairs are AA-checked:

  | Status | Classes |
  |---|---|
  | `paid` (to pack) | `bg-[#fdf3dc] text-[#8a3c0b] border-[#f3dfae]` |
  | `packed` | `bg-[#e8effd] text-[#1d4ed8] border-[#c9d8fb]` |
  | `shipped` | `bg-(--brand-soft) text-(--brand-ink) border-[#c5e3d4]` |
  | `cancelled` | `bg-[#eef1ef] text-(--muted) border-(--line)` |

- **No themed decoration:**
  - no paper or fibre textures, tape strips, rubber stamps, rotated elements, torn or zigzag edges, or wood surfaces;
  - flat white panels with a 1px `--line` border, `rounded-xl`, and at most a very soft shadow.
- **Text sizes:**
  - Body text, list and table rows, and buttons: at least 16px. Where the original used 15px or `text-sm` for row text, raise it to 16px.
  - Labels, captions, table headers and badges: at least 14px.
  - Chart ticks: at least 12px.
- **Keep:**
  - every test id except `receipt`, which becomes `order-row`;
  - every accessible name, the copy keys and the behaviour;
  - the demo-session banner, which can be a slim neutral or brand-soft bar;
  - the language switch and the product icons. Recolour the icons only if they rely on removed tokens; they should sit well on white.
- **Accessibility:** AA contrast, visible focus (`focus-visible` ring in `--brand`), `prefers-reduced-motion` respected, and no horizontal overflow at 375px or 1440px.
- **Commits:** end every message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, and add no other attribution line.
- **Branch:** `feat/shop-admin-clean` (created from `main`). Never push or merge without Ohm's OK.

---

### Task 1: Clean layout, shell, login and overview

**Files:**
- `app/demos/shop-admin/layout.tsx`
- `_components/shop-css.ts` (keep only the focus and reduced-motion rules; drop the stamp and receipt CSS)
- `_components/admin-shell.tsx`, `login-form.tsx`, `brand-mark.tsx`
- `_components/overview.tsx`, `sales-panels.tsx`
- `_components/stamp.tsx`: replace it with a `StatusPill` component, renaming the file to `status-pill.tsx` and updating its imports
- `_components/product-icon.tsx`: colours only, if needed
- `copy.ts`: remove keys used only by the old look, if any
- `tests/e2e/shop-admin.spec.ts`: only where a test asserts a removed visual, for example a stamp animation name

**Requirements:**
1. **Layout:**
   - Noto Sans Thai and the palette above, on `LangScope`.
   - Keep the metadata.
   - Keep `DemoPill packageId="app-standard"`.
2. **Shell:**
   - It looks like the original: a white sidebar with a right border from `lg`, and a white sticky top bar with a bottom tab row on phones.
   - The brand mark is the original green "ดี" square, now an inline element, `aria-hidden`.
   - Nav items:
     - the active one is `--brand-soft` with `--brand-ink`;
     - each badge is a small dark pill (orders) or a `--warn` pill (stock).
   - The owner block, the reset button and the language switch sit at the sidebar bottom on desktop and in the top bar on phones.
   - Demo-session banner: a slim full-width bar above everything, in `--brand-soft` with `--brand-ink` text or neutral `--bg`, with the log-out button on the right. Keep its test id and copy.
3. **Login:** the original card look (white card, soft shadow, green primary button), bilingual, with its language switch.
4. **Overview:** the order and content stay: greeting, three to-do tiles, packing queue, sales.
   - **Tiles:** flat white cards, each one link with a clear number.
     - Stock uses `--warn-ink` for the number when above 0.
     - The sold-today tile may use `--brand` as a solid fill with white text (white on `#1f7a5a` is 5.4:1), or stay white. Pick the cleaner one.
   - **Packing queue:**
     - It is a white panel with divided rows.
     - The "แพ็กแล้ว ✓" button is a solid `--brand` button with white text, at least 16px.
     - After packing, the row shows the `packed` `StatusPill` and the undo button.
     - No stamp animation; a simple fade-in is fine under `motion-safe`.
   - **Sales:** the chart in `--brand` (an area or bars, with a soft fill), and best sellers and channels with thin `--brand` bars, as in the original. The chart text stays at 12px minimum for ticks.
5. **Removed:** every kraft, wood, mustard, tape, stamp and paper-texture class and element.

- [ ] Restyle as above.
- [ ] Visual check:
  - Pin the clock at 10:30.
  - Take shots of the overview and login at 1440×900 and 375×812, in Thai and English.
  - Save them as `.superpowers/sdd/shopc-{overview,login}-{desk,phone}-{th,en}.jpg`.
  - Compare against the original look: `git show 75b7054:public/thumbs/app-standard.jpg > /tmp/...`, or the old `.superpowers/brainstorm/19193-1792598876/content/shop-admin-desk.jpg`.
- [ ] Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/shop-admin.spec.ts tests/e2e/smoke.spec.ts tests/e2e/demo-lang.spec.ts`. All must pass. The orders tests may still pass against the old receipts until Task 2.
- [ ] Commit:

```
style(shop-admin): back to the clean dashboard look — white panels, green brand, status pills — keeping today-first, packing and both languages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

---

### Task 2: Clean orders table and stock page

**Files:** `_components/orders-table.tsx`, `_components/stock-table.tsx`, `tests/e2e/shop-admin.spec.ts`

**Requirements:**
1. **Orders:** a clean table in the original style.
   - **Desktop (`sm+`):** the header row on `#f9faf9` with 14px labels. The columns are:
     - number;
     - date;
     - customer;
     - channel (icon + label);
     - items (a small row of `ProductIcon`s, up to 3, then `+n`, with the item count);
     - total (right-aligned, `tabular-nums`, struck through when cancelled);
     - status (the status `<select>` styled as a pill).
   - **Phones:** each order is a compact block (customer + number, total, then date, channel, items and the status select).
   - Use one element per order with `data-testid="order-row"`, laid out responsively with CSS (as `stock-table.tsx` does with `grid` / `sm:table-row`). Don't render a hidden duplicate, so test ids and selects are unique.
   - **Keep:**
     - search, the status filter (labelled `สถานะ` / `Status`) and the `?status=` initial filter;
     - the restamped-rows-stay-under-a-filter behaviour, renamed in code to "changed this visit";
     - pagination at 15 per page;
     - the empty state;
     - all accessible names.
   - Row text is 16px.
2. **Stock:** the original clean table look, plus the product icon (about 32–40px), names in the current language, the low badge in `--warn-soft` / `--warn-ink`, and the stock bar from `lg`. Keep the editing behaviour, test ids and copy.
3. **Tests:** in `tests/e2e/shop-admin.spec.ts`:
   - replace the `receipt` test id with `order-row`;
   - rename "orders are receipts…" to "orders list items, a total and a status";
   - make it assert each first row shows `RD-`, `฿`, a product icon and the status select;
   - leave the rest unchanged unless it asserts removed visuals.

- [ ] Restyle as above.
- [ ] Visual check: take shots of orders and stock at 1440 and 375 in both languages, saved as `.superpowers/sdd/shopc-{orders,stock}-{desk,phone}-{th,en}.jpg`.
- [ ] Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/shop-admin.spec.ts tests/e2e/smoke.spec.ts tests/e2e/demo-lang.spec.ts`, then `--repeat-each=3` on `shop-admin.spec.ts`.
- [ ] Commit:

```
style(shop-admin): clean orders table and stock page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

---

### Task 3: Thumbnails, backlog, full verification

- [ ] Regenerate the shop thumbnails:

```bash
lsof -ti tcp:3100 | xargs kill 2>/dev/null
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
git add public/thumbs/app-standard.jpg public/thumbs/pages/app-standard-*.jpg
git checkout -- public/thumbs
```

- [ ] In `docs/BACKLOG.md`, tick the "Revisit the shop admin colours" item, adding: `Done 2026-10-24: back to the original clean look, keeping step 6's features.`
- [ ] Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`. Everything must pass.
- [ ] Commit:

```
test(shop-admin): hub thumbnails for the clean look; backlog item done

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
