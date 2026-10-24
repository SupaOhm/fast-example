# Hub Footer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hub's one-line small print with a real footer: site links, the six demos grouped by package, the language switch and the Fastwork profile link. Give it a stronger design than it has now. Keep the lime "Have a project in mind?" band above it.

**Why:** BACKLOG #3. Ohm chose all four parts on 2026-10-21. The trust signals (Fastwork rating, review count, response time, availability) need real numbers from Ohm, and nothing may be invented, so they are **out of scope** here. The footer layout must leave a natural place for them later; BACKLOG notes them as waiting on Ohm. #2 (the inquiry form) is undecided, so the CTA band stays as it is.

**Architecture:**
- `components/hub/site-footer.tsx` becomes the full footer. It is a server component and takes `locale`, `t` and `path` (like `SiteHeader`).
- The demo list comes from `packages` and `services` in `lib/packages.ts`, so names and paths never drift.
- Copy goes in `lib/i18n/{en,th}.json` under `footer`.
- Both callers (`app/[locale]/page.tsx` and `app/[locale]/compare/page.tsx`) pass `locale` and `path`.

**Tech stack:** Next.js 16.4 static export, React 19, TS strict, Tailwind 4, Playwright.

## Global Constraints

- Static export (`output: "export"`). No new dependencies.
- **No off-platform contact info** (email, LINE, phone, social handles) for SupaOhm anywhere. The only way to reach Ohm is Fastwork. `tests/e2e/hub.spec.ts` checks this; keep it passing.
- **No invented facts.** No ratings, review counts, order counts, response times, client logos or testimonials.
- **Copy:**
  - Professional, never boastful.
  - The English hub speaks as "I". In Thai the seller refers to themselves only as "เรา", or not at all.
  - Use the existing hub type: `font-display` for headings and the body font for text. No serif.
- **Visual language:** the hub's own tokens (`bg-forest`, `bg-forest-2`, `text-cream`, `text-cream-muted`, `border-rule`, `lime`, `sky`, `display-heading`).
  - Make it feel designed and confident: a clear grid, a strong brand moment and good rhythm. Use `/frontend-design` for the visual pass.
  - It must still read as part of the same site, so add no new palette.
- **Text sizes:**
  - Links and body text: at least 16px.
  - Column headings and small print: at least 14px.
  - Tap targets: at least 44px tall on phones.
- **Accessibility:**
  - AA contrast and visible focus (`focus-visible` outline in lime).
  - Lists as `<ul>`; groups in `<nav aria-label>`; external links say "(opens in a new tab)" to screen readers, as `t.nav.newTab` does.
  - `prefers-reduced-motion` respected.
- **Layout:** no horizontal page scroll at 360, 375, 768, 1024 or 1440.
- **Process:**
  - Use a production build for screenshots (`pnpm build && pnpm start --port 3000`).
  - Put helper scripts in `.superpowers/sdd/`. It is gitignored; never force-add from it.
  - If a build changes `public/thumbs/`, run `git checkout -- public/thumbs`.
- **Commits** end with exactly `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, with no other attribution line.
- **Branch:** `feat/hub-footer`, cut from `main`.

---

### Task 1: The footer

**Files:**
- Modify: `components/hub/site-footer.tsx`, `app/[locale]/page.tsx`, `app/[locale]/compare/page.tsx`, `lib/i18n/en.json`, `lib/i18n/th.json`, `docs/BACKLOG.md`
- Reuse: `components/hub/locale-switch.tsx` (`LocaleSwitch`), `FASTWORK_PROFILE_URL`, `packages`, `services`
- Test: `tests/e2e/hub.spec.ts` (or a new `tests/e2e/footer.spec.ts`)

**Interfaces:**
- `SiteFooter({ locale, t, path = "" }: { locale: Locale; t: Dictionary; path?: string })`

**Requirements:**
1. **CTA band:** keep it as it is (`t.cta.*`, lime, the Fastwork button).
2. **Footer body** (forest), under the band:
   - **Brand block:**
     - "SupaOhm" set large in `font-display`, as the footer's brand moment.
     - One line under it: `footer.tagline`.
     - The Fastwork profile link (`FASTWORK_PROFILE_URL`, new tab): `footer.profile`.
     - The language switch, `LocaleSwitch` with the page's `path`, labelled for screen readers like the header's.
   - **Site links:** a `<nav aria-label={footer.siteLabel}>` with Work, Compare, Process and About. Use the same hrefs as the header: `/${locale}#work`, `/${locale}/compare`, `/${locale}#process`, `/${locale}#about`, with labels from `t.nav`.
   - **Demos:** a `<nav aria-label={footer.demosLabel}>` with two groups, one per service. The group headings are the service names (`services[].name[locale]`).
     - Each group lists its three packages in tier order.
     - Each item reads as the tier and the demo, for example "Basic · Mali Botanics — skincare sale page", built from the package `tier` (capitalised) and `demoName[locale]`.
     - Each item links to `demoPath` in the same tab.
     - The demo links are generated from `packages`, not hard-coded.
   - **Bottom row:** the existing `footer.note` and `© {year} SupaOhm`.
     - Use a thin `border-rule` divider.
     - Small print at 14px, `text-cream-muted`.
3. **Layout:**
   - **Phones:** stacked. Brand block first, then the site links, then the demos.
   - **From `md` or `lg`:** a grid. Brand block on the left and wider; the site links and the two demo groups as columns.
   - Leave the brand block room for one more line later, where the trust signals will go. Don't put anything there now.
4. **Copy** (exact) under `footer` in both dictionaries. Keep `footer.note` as it is.

   | Key | en | th |
   |---|---|---|
   | `tagline` | "Websites and web apps built with Next.js. Every order goes through Fastwork." | "รับทำเว็บไซต์และเว็บแอปด้วย Next.js สั่งงานผ่าน Fastwork ทุกออเดอร์" |
   | `profile` | "My Fastwork profile" | "โปรไฟล์ Fastwork ของเรา" |
   | `siteLabel` | "Quick links" | "ลิงก์ด่วน" |
   | `demosLabel` | "Live demos" | "เดโมที่ลองใช้ได้" |

   The visible column headings use the same strings as the nav labels.
5. **Callers:** `app/[locale]/page.tsx` passes `locale`, `t` and `path=""`. `app/[locale]/compare/page.tsx` passes `path="/compare"`.
6. **Tests** (both projects unless noted):
   - The footer has links to all six `demoPath`s, and each link text contains the package's demo name in the page language.
   - The footer site nav links to `/${locale}/compare`.
   - The footer language switch on `/en/compare` links to `/th/compare`.
   - The profile link goes to `FASTWORK_PROFILE_URL` with `target="_blank"` and `rel` containing `noopener`.
   - The footer contains no `mailto:`, `tel:` or `line.me` links. The existing no-off-platform test may already cover the whole page; if so, keep it.
   - Mobile only: at 360px, no horizontal scroll, and every footer link is at least 44px tall.
7. **BACKLOG** (`docs/BACKLOG.md` #3):
   - Tick the site links, the switch and profile, and the visual polish, each with "Done 2026-10-24".
   - Leave trust signals unticked with "Waiting on Ohm's real numbers; the brand block has room for them."
8. **Screenshots:**
   - The footer at 1440, 1024 and 375, in English and Thai.
   - Save them as `.superpowers/sdd/footer-{1440,1024,375}-{en,th}.jpg`.
   - Look at each one: rhythm, alignment, nothing cramped or orphaned, and Thai line breaks that read well.

- [ ] Invoke `/frontend-design` for the visual pass, then implement 1–7.
- [ ] Take the screenshots (8) and fix anything that looks off.
- [ ] Run `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e`. Everything must pass.
- [ ] Commit:

```
feat(hub): a real footer with site links, the six demos by package, the language switch and the Fastwork profile

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
