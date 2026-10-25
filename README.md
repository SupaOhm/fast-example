# SupaOhm — Fastwork showcase

Live demos for each package on https://fastwork.com/user/devohm.

| Package | Demo |
|---|---|
| Website · Basic ฿4,900 | `/demos/sale-page` |
| Website · Standard ฿7,900 | `/demos/company` |
| Website · Premium ฿14,900 | `/demos/resort` |
| Web app · Basic ฿5,900 | `/demos/orders-api` |
| Web app · Standard ฿14,900 | `/demos/shop-admin` |
| Web app · Premium ฿29,900 | `/demos/clinic-booking` |

All data is mocked in the browser. App demos save edits to localStorage, and each has a "reset" button.

## Develop

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm test           # unit tests (Vitest)
pnpm test:e2e       # builds, then runs Playwright at 375px and 1440px
```

## Update prices or features

Edit `lib/packages.ts`. The hub lineup, the compare page (`/en/compare`) and the demo pills all read from it, including each plan's feature values. A new service is a new entry in `services` plus its packages.

## Refresh hub thumbnails / Fastwork cover images

```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
```
Screenshots land in `public/thumbs/` (Fastwork covers) and `public/thumbs/pages/` (one per page of each plan, used by the hub hero wall and lineup). Re-run after changing a demo's look.

The shared-link pictures (`public/share/{en,th}.jpg`, 1200×630) come from `node scripts/capture-share.mjs http://localhost:3100`, run the same way after the thumbnails. Re-run after changing the hero line or the demo screenshots; it loads Google Fonts, so it needs the network.

## Deploy

The site is a static export (`out/`) served by Cloudflare Workers static assets; config is in `wrangler.jsonc`. `/` is a language chooser (`app/(choose)`); visitors who already picked a language go straight to `/en` or `/th`. Cloudflare's build runs `pnpm run build`, then `npx wrangler deploy`. To preview the production server locally, run `pnpm build && pnpm start`.
