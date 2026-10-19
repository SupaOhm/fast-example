# Fastwork Showcase Site — Design

Date: 2026-10-19
Owner: SupaOhm (@devohm on Fastwork)

## Goal

Give Fastwork customers concrete proof of what each of SupaOhm's six service packages delivers. Today both listings have blank cover images and zero reviews. The showcase is a hub site linking to one live, clickable demo per package. It is itself built with the stack the listings promise (Next.js, TypeScript, Tailwind).

Success criteria:
- A customer can go from the hub to any package's demo and back in one click, on mobile and desktop.
- Every package card shows the same price and scope as the Fastwork listing, and links to that listing.
- All routes build statically, load with no console errors, and render correctly at 375px and 1440px widths.
- Demo screenshots are good enough to use as Fastwork cover images.

## Audience and positioning

Thai SMEs buying on Fastwork. Research (Oct 2026) found:
- Company/SME websites are the top-selling web category. E-commerce, sale pages and booking sites (hotel, tour, real estate) follow.
- For custom systems, the recurring demand is a back office plus dashboard connected to LINE OA, along with inventory/POS and booking/membership through LINE.
- Competitors sell WordPress sites from ฿1,500. Demos must show what templates can't: speed, custom design and LINE-style integration.

Fastwork forbids moving customers off-platform. The site therefore shows no email, phone or LINE ID for SupaOhm, and every contact CTA links to the Fastwork profile or listing.

## Packages and demos

Prices and scope mirror the live Fastwork listings.

### Service 1: Responsive website / landing page with Next.js

| Tier | Price | Scope | Demo | Route |
|---|---|---|---|---|
| Basic | ฿4,900 | 1 responsive landing page, 1 revision | Product sale page for a fictional Thai skincare brand: hero, benefits, ingredients, reviews, pricing bundles, FAQ, sticky "Order via LINE" CTA (mock link) | `/demos/sale-page` |
| Standard | ฿7,900 | Up to 3 pages, contact form, basic SEO, 2 revisions | SME company website for a fictional engineering/trading firm: Home, Services, Contact. Contact form with client-side validation and a fake-submit success state. Per-page metadata. | `/demos/company`, `/services`, `/contact` |
| Premium | ฿14,900 | Up to 5 pages, reusable components, additional interactions, 3 revisions | Boutique resort site (TH/EN switch inside the demo): Home, Rooms (filter by type/guests), Gallery (lightbox), About, Booking inquiry (date range + guests, fake submit). Scroll-reveal animations. | `/demos/resort`, `/rooms`, `/gallery`, `/about`, `/booking` |

### Service 2: Custom web application, dashboard or backend API

| Tier | Price | Scope | Demo | Route |
|---|---|---|---|---|
| Basic | ฿5,900 | One backend module, up to 4 REST endpoints for one resource | Orders API docs page: 4 endpoints (`GET /orders`, `GET /orders/:id`, `POST /orders`, `PATCH /orders/:id/status`) with a "Try it" panel. Requests run against an in-browser mock store and show the JSON response, status code and a mocked LINE notification preview for create and status-change calls. | `/demos/orders-api` |
| Standard | ฿14,900 | Up to 3 dashboard screens, basic login, 2 data modules, tables, simple charts | Shop back office: Login (prefilled demo account), Overview (KPI tiles, sales chart, top products), Orders (table with search/filter/status), Stock (table, low-stock highlight, edit quantity). | `/demos/shop-admin/login`, `/demos/shop-admin`, `/orders`, `/stock` |
| Premium | ฿29,900 | Scoped MVP: up to 5 screens, authentication, up to 3 core data modules, responsive | Clinic/salon booking system. Customer side: LINE-style mobile booking flow (pick service → staff → time slot → confirm). Staff side: Login, Today's queue (status updates), Customers (CRUD), Services (CRUD), Reports (charts). | `/demos/clinic-booking`, `/book`, `/admin/login`, `/admin`, `/admin/customers`, `/admin/services`, `/admin/reports` |

Each demo has its own fictional brand, fonts and colour palette so it reads as a separate client project. All business names, people and reviews are invented and labelled as demo content in the demo pill.

## Hub

Routes: `/th` (default) and `/en`. `/` redirects to `/th`.

Sections:
1. Hero: name, one-line value proposition, "See demos" and "View on Fastwork" CTAs.
2. Services: two blocks (Website, Web App). Each has three package cards with tier, price, scope bullets, **View demo** and **Order on Fastwork** buttons, and a demo thumbnail.
3. How I work: brief → design → build → revise → deliver.
4. Tech stack.
5. About: short bio, plus a link to supakornohm.vercel.app.
6. Footer CTA: Fastwork profile link.

A TH/EN toggle sits in the header and keeps the user on the same section.

## Architecture

Stack: Next.js (App Router, static rendering), TypeScript (strict), Tailwind CSS, Recharts, lucide-react. Deployed to Vercel. No backend, database or environment variables.

```
app/
  page.tsx                      # redirect → /th
  [locale]/layout.tsx, page.tsx # hub
  demos/<slug>/...              # one folder per demo, own layout.tsx
components/
  hub/                          # hub-only components
  demo-pill.tsx                 # floating pill on every demo
lib/
  packages.ts                   # single source of truth for the 6 packages
  i18n/{th,en}.json, index.ts   # dictionary + getDictionary(locale)
  mock/<demo>.ts                # seeded data per demo
  demo-store.ts                 # localStorage-backed store with reset, used by app demos
tests/
  smoke.spec.ts                 # Playwright
```

### Units

- **`lib/packages.ts`** exports `packages: Package[]`. `Package` has `id`, `service` (`"web" | "app"`), `tier`, `priceTHB`, scope bullets keyed by locale, `demoPath`, and `fastworkUrl`. The hub cards and the demo pill read only from here.
- **`lib/i18n`** contains the hub copy only. `getDictionary(locale)` returns typed strings. Demos hard-code their own copy.
- **`components/demo-pill.tsx`** takes `packageId` and renders a fixed bottom pill with "← Showcase", the package name and price, an "Order this package" link to Fastwork, and a "Demo content" note. It is collapsible so it never blocks demo UI on mobile.
- **`lib/demo-store.ts`** provides `createDemoStore<T>(key, seed)` with `get`, `set` and `reset`. It is backed by localStorage, with every access wrapped in try/catch and falling back to the in-memory seed. It is used by orders-api, shop-admin and clinic-booking.
- **Demo auth** is a fake session flag in the demo store. Login forms are prefilled with a demo account and any input is accepted. Admin routes redirect to their login page when the flag is unset. There are no real credentials anywhere.

### Data flow

Static pages render from `packages.ts` and the dictionaries at build time. App demos hydrate from seed data, then read and write the demo store on the client. "Reset demo" restores the seed.

### Error handling

- Unknown locale → `notFound()`.
- Storage unavailable or corrupt JSON → fall back to the seed silently.
- Forms validate on the client and show inline errors. Every "submit" is simulated with a short delay and then a success state. Nothing leaves the browser.
- Each app demo has an empty state for every table.

## Testing

- `tsc --noEmit` and `next build` must pass.
- A Playwright smoke test visits every route at 375px and 1440px widths. It asserts HTTP 200, no console errors and no horizontal overflow.
- Playwright flow tests:
  - The hub card links to its demo.
  - The shop-admin login reaches the overview page.
  - A clinic booking appears in the admin queue.
  - The orders-api POST shows a 201 response.
  - Reset restores the seed data.
- A manual visual pass of every demo in Chrome.

## Out of scope

- Real backend, database, auth or payments.
- A CMS.
- Any contact channel other than Fastwork.
- A quotation-system demo (possible later addition).
- Automated cover-image generation. Screenshots are taken manually after the build.
