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

## Update prices or scope

Edit `lib/packages.ts`. The hub cards and demo pills read from it.

## Refresh hub thumbnails / Fastwork cover images

```bash
pnpm build && (pnpm start --port 3100 > /dev/null 2>&1 &) && sleep 6
node scripts/capture-thumbs.mjs http://localhost:3100
lsof -ti tcp:3100 | xargs kill
```
Screenshots land in `public/thumbs/` and can be uploaded as Fastwork listing covers.
