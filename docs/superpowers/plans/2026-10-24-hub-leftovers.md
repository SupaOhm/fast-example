# Hub Small Leftovers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the "Small leftovers from PR #4 and #5" list in `docs/BACKLOG.md`, the small hub fixes.

**Why:** These are the last open polish items on the hub (devbyohm.com `/en`, `/th`, `/en/compare`) before the footer (#3). Ohm said on 2026-10-24 to work through the backlog without waiting between branches.

**Architecture:**
- Small, independent fixes in `app/globals.css`, `components/hub/*`, `lib/i18n/{en,th}.json` and `tests/e2e/{hub,compare}.spec.ts`.
- No new components, routes or dependencies.

**Tech stack:** Next.js 16.4 static export, React 19, TS strict, Tailwind 4, Vitest, Playwright (`desktop` 1440, `mobile` 375).

## Global Constraints

- Static export (`output: "export"`). No new dependencies.
- No off-platform contact info (email, LINE, phone) for SupaOhm anywhere. `tests/e2e/hub.spec.ts` checks this; keep it passing.
- Copy tone is professional, never boastful. The English hub speaks as "I". In Thai, the seller refers to themselves only as "เรา" (or not at all). No serif fonts.
- Text sizes:
  - body text: at least 16px;
  - labels and nav: at least 14px;
  - decorative mock content inside illustrations: at least 10px.
- AA contrast, visible focus, `prefers-reduced-motion` respected, no horizontal page scroll at 360, 375, 768, 1024 or 1440.
- Measure, don't guess: each layout fix is checked with a Playwright script in `.superpowers/sdd/` (so `@playwright/test` resolves). Screenshots go in `.superpowers/sdd/`, which is gitignored; never force-add from it.
- Use a production build for screenshots (`pnpm build && pnpm start --port 3000`), because the dev server's Google font fetch can fail.
- Commits end with exactly `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, with no other attribution line.
- Branch: `feat/hub-leftovers`, cut from `main`.

---

### Task 1: Hub layout and copy fixes

**Files:**
- Modify: `app/globals.css` (plan-fan rules at about lines 125–150)
- Modify: `components/hub/site-header.tsx`, `components/hub/process-section.tsx`, `components/hub/lineup.tsx` and/or `components/hub/plan-stack.tsx` (only as the fan-room fix needs)
- Modify: `lib/i18n/en.json`, `lib/i18n/th.json` (`hero.body`)
- Test: `tests/e2e/hub.spec.ts`

**Requirements:**
1. **Plan-fan hover only on real hover devices.**
   - On phones, a tap triggers `:hover`, and the fan grows over the text.
   - Wrap the `.group:is(:hover, :focus-within) .plan-stack` rules (both of them) in `@media (hover: hover) and (pointer: fine)`, inside the existing `prefers-reduced-motion: no-preference` block.
   - Keyboard focus on a pointer-fine device still spreads the fan.
2. **Compare link on phones.**
   - Below `md`, the header nav is hidden, so `/compare` has no link on phones.
   - Show the Compare link on its own below `md`; the other three links are in-page anchors on the hub. Keep the full nav from `md` as it is.
   - It must fit beside the brand, the language switch and the Hire button at 360px with no wrap and no overflow; the link text must be at least 14px. If it can't fit at 360px, shorten the visible brand to "SO" below 400px rather than dropping the link. Measure.
   - Add an e2e test (mobile project) asserting a visible link to `/{locale}/compare` in the header on `/en` and `/th`.
3. **Hero copy without "scope".** Package data no longer has a scope section, so the hero shouldn't promise one.
   - `en.json` `hero.body`: "Each package I offer on Fastwork has a working example you can open and use, so you can see what you'll get before you order."
   - `th.json` `hero.body`: "ทุกแพ็กเกจบน Fastwork มีเว็บตัวอย่างที่เปิดใช้งานได้จริง เห็นหน้าตาและการใช้งานชัดเจนก่อนสั่งซื้อ"
   - Leave the other "scope" uses (process step and CTA: "confirm scope and price") as they are; they describe the brief, not the package data.
4. **Process artefact text on phones.**
   - The code mock in `process-section.tsx` (step 2) uses `text-[9px]` below `sm`. Raise it to at least 10px.
   - It is `whitespace-pre`, so check at 360 and 375 that no line is clipped or overflows its card. If 10px overflows, shorten the longest mock code lines (they're illustrative) rather than shrinking the text.
   - Make sure the decorative mock is `aria-hidden` if it isn't already.
5. **Plan-fan room.**
   - Measure the plan cards in the lineup (`components/hub/lineup.tsx`, `plan-stack.tsx`) at 768, 900, 1024, 1180, 1280 and 1440 wide.
   - At each width, for the five-page fan in its rest state and its hover state, record whether any frame:
     - overlaps the card's text;
     - is clipped by the card;
     - spills outside the card.
   - Fix whatever fails, for example with a smaller `--dx`, `--rot` or `scale` in a width range, or a taller fan area. Keep the 1440 look unchanged if it already passes.
   - Save the before and after measurements in the task report.
6. **Screenshots:**
   - The hub (`/en` and `/th`) at 375, with a tap on a plan card first. The fan must not grow.
   - The header at 360, in both languages.
   - The lineup at 1024 and 1440.
   - Save them as `.superpowers/sdd/hubfix-*.jpg` and look at each one.

- [ ] Implement 1–5.
- [ ] Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/hub.spec.ts tests/e2e/compare.spec.ts tests/e2e/smoke.spec.ts`. All must pass.
- [ ] Commit:

```
fix(hub): plan fans only grow on real hover, Compare link on phones, hero copy without "scope", readable process mock, fans fit their cards

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

---

### Task 2: Compare test, double image loads, backlog

**Files:**
- Test: `tests/e2e/compare.spec.ts`
- Modify (if needed): `components/hub/service-tiles.tsx`, `components/hub/*` (wherever the double load comes from)
- Modify: `docs/BACKLOG.md`

**Requirements:**
1. **`?service=bogus` test.** In `compare.spec.ts`, open `/en/compare?service=bogus`. It should:
   - show the websites tab selected (`aria-selected="true"` on the web tile);
   - render the websites panel;
   - log no page errors.

   Also check `/en/compare?service=app` selects the app tile, if no test covers it yet.
2. **Service-tile fans load their images twice.**
   - Find out whether that's true. Load `/en` in Playwright with `page.on("request")`, at 1440 and at 375, and count requests per thumbnail URL under `/thumbs/`.
   - Images are `unoptimized`, so the same URL should come from the cache.
   - If a thumbnail is fetched twice, find out why (for example, different URLs for the same image, a duplicate render, or the hero wall's doubled track) and fix the cause so each URL is requested once.
   - If not, record "not reproducible" with the counts in the report and change nothing.
   - Images that are hidden at a width (`hidden sm:block`) should not be fetched at that width if a lazy load can prevent it. `next/image` is lazy by default, so check.
3. **Backlog housekeeping** in `docs/BACKLOG.md`:
   - Tick every "Small leftovers" item this plan closes, adding "Done 2026-10-24".
   - Add a line under #1 and #4: "Done: steps 1–7 (PRs #6–#12), plus the shop admin clean-up (#13) and the clinic demo clock (#14)."
   - Tick their open-question and walkthrough boxes.
- [ ] Implement 1–3.
- [ ] Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`. Everything must pass.
- [ ] Commit:

```
test(hub): compare falls back to websites for an unknown service; image loads checked; backlog updated

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
