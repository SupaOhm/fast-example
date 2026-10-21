# Backlog

Open work for the showcase site (devbyohm.com). Each item gets its own brainstorm → spec → plan before code.
Noted 2026-10-21.

## 1. English + Thai demos

> **Decided 2026-10-22.** Covered with #4 in `docs/superpowers/specs/2026-10-22-demo-rework-bilingual-design.md`. The questions below are answered there.

**Why:** Fastwork is now worldwide, so foreign buyers will land on the demos. The hub already has `/en` and `/th`; the six demos are still one language each.

**Open questions**
- [ ] URL shape: `/en/demos/<id>` + `/th/demos/<id>`, or keep `/demos/<id>` with an in-demo toggle?
- [ ] Should a demo open in the visitor's chosen hub language (the `showcase:locale` choice)?
- [ ] Copy: translate each demo's fake business as is, or localise it (names, prices, addresses)?
- [ ] Thai fonts per demo: keep the current ones (Mitr for resort, Noto Sans Thai for shop-admin) and pick ones for the rest.
- [ ] Order: start with the web demos (more text) or the app demos (more UI)?

## 2. "Send an inquiry" form (contact outside Fastwork)

**Why:** some buyers, especially foreign ones, don't want to go through Fastwork. The idea is a form under "Have a project in mind?" next to the Fastwork button.

**Blocking: Fastwork policy.** Fastwork doesn't allow sellers to pull buyers off the platform, and the Fastwork listings link to this site. The standing rule so far has been *no off-platform contact details anywhere* (`tests/e2e/hub.spec.ts` checks for this).

**Open questions**
- [ ] Policy: check Fastwork's seller terms. Then choose one: form for everyone; form only on `/en`; a separate `/contact` page that the hub doesn't link to prominently; or no form.
- [ ] Destination: email through a Cloudflare Worker plus an email API; a hosted form service (Web3Forms, Formspree); or Cloudflare D1 plus a private inbox page.
- [ ] Spam protection: Cloudflare Turnstile, a honeypot, rate limiting?
- [ ] Fields: name, how to reply, project type (website or web app, which plan), budget, message, language?
- [ ] The site is a static export (`output: "export"`), so the form needs a Worker route or a third-party endpoint. Decide this alongside "Destination" above.
- [ ] If this is built, update the "no off-platform contact" test so it still allows the form.

## 3. Better footer

**Now:** a lime "Have a project in mind?" band with one Fastwork button, then a single line of small print (`components/hub/site-footer.tsx`).

**Wanted** (all four, chosen 2026-10-21)
- [ ] Site links: Work, Compare, Process, About, plus the six demos grouped by package
- [ ] Trust signals: Fastwork rating and review count, typical response time, availability. **Need from Ohm:** the real numbers. Nothing invented.
- [ ] The EN | ไทย switch and the Fastwork profile link repeated at the bottom
- [ ] Visual polish: give it a stronger design than the plain line it is now

**Depends on #2:** the CTA band changes if the inquiry form ships.

## 4. Demo polish

> **Decided 2026-10-22.** The walkthrough is done; directions for all six demos are in `docs/superpowers/specs/2026-10-22-demo-rework-bilingual-design.md`.

Ohm said that all six "still look ahh":

| Demo | Package | What's wrong |
|---|---|---|
| sale-page | Website Basic | ? |
| company | Website Standard | ? |
| resort | Website Premium | ? |
| orders-api | Web app Basic | ? |
| shop-admin | Web app Standard | ? |
| clinic-booking | Web app Premium | ? |

- [ ] Walk through each demo with Ohm (screenshots at 1440 and 375) and fill in "What's wrong".
- [ ] Use `/frontend-design` for the redesigns. Ohm rejected bland or templated looks before.
- [ ] Re-run `scripts/capture-thumbs.mjs` afterwards. The hub fans and the hero wall use those screenshots.
- [ ] Do this before #1 or together with it, so the demos are only translated once.

## Suggested order

1. **#4 demo polish + #1 bilingual demos.** Redesign and translate each demo in one go.
2. **#3 footer.** Can ship without #2; leave space for the form.
3. **#2 inquiry form.** Only after the Fastwork policy is checked.

## Small leftovers from PR #4 and #5

- [ ] The Compare nav link is hidden below `md`.
- [ ] No test for `?service=bogus` on the compare page.
- [ ] The plan fans have little room on some widths.
- [ ] Mobile process artefact text is 9px.
- [ ] Service-tile fans load their images twice.
- [ ] The hero body copy still says "scope", which was removed from the package data.
- [ ] On phones, turn off the plan-fan hover/focus enlargement. A tap triggers the hover and the fan grows over the text. In `app/globals.css:143-148`, put the `.group:is(:hover, :focus-within) .plan-stack` rules behind `@media (hover: hover) and (pointer: fine)` (or `md+`).
