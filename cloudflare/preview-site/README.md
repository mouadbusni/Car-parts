# AutoPro — Cloudflare public website preview

## Live staging URL

https://autopro-preview.mouadbusni.workers.dev/

This is a **separate Cloudflare Worker storefront preview**, not a production migration of the original Next.js site. The original AutoPro `main` branch, its Supabase-based administrator code, and the BDA portfolio are unchanged.

The preview reproduces AutoPro's established dark graphite + performance orange identity with a new responsive, accessible presentation. It includes:

- Homepage hero with original vector brake-rotor illustration and component-focused messaging
- Category cards and filtering
- Product catalogue, name search and price/rating sorting
- Dedicated component-detail pages
- Browser-local selection cart, quantity controls and persistence across reload
- Responsive mobile navigation, empty states, and readable preview status notices

## Architecture

| Piece | Staging resource |
|---|---|
| Website + catalogue API | Cloudflare Worker `autopro-preview` |
| Domain | `autopro-preview.mouadbusni.workers.dev` |
| D1 database binding | `DB` → `autopro-staging` (EU jurisdiction) |
| Original D1 read-only handler | `cloudflare/catalog-worker/index.mjs` |
| Website shell | `cloudflare/preview-site/index.html` |
| Styles | `cloudflare/preview-site/app.css` |
| Interactions + routing | `cloudflare/preview-site/app.js` |
| Worker shell | `cloudflare/preview-site/worker.mjs` |

The Worker serves the HTML/CSS/JS files and routes `/api/*` through the same read-only catalogue handler, so browser requests are same-origin. For Cloudflare deployment, bundle the HTML/CSS/JS into the three `__AUTOPRO_*` string placeholders of `worker.mjs`, and upload `worker.mjs` alongside `catalog.mjs` as Cloudflare ES modules with the D1 binding. The deployment bundle is deterministic from tracked source; no GitHub fetches occur at request time.

### Demo inventory — intentionally NOT a real database import

The existing AutoPro D1 database has **0 verified product rows and 0 category rows**. When the API is empty, the preview UI offers 6 unmistakably labeled **DEMO PRODUCT / NOT FOR SALE** examples. Example names, illustrations and prices are for UI testing only and **are not inserted into D1**. The user may hide the demo items.

The preview cart remains **local to the browser**. Checkout/payment, shipping estimates, admin dashboards, login and inventory modification are not exposed in this deployment. Customers cannot place orders.

### Security

- No public write API; `POST`/`PUT`/`PATCH`/`DELETE` to catalogue routes receive 405.
- The preview Worker does not serve `/admin`, `/dashboard`, `/login`, `/signup` or `/checkout`.
- D1 data is read through parameterized SQL with bounded parameters and allowlisted sorts.
- Static routes set a strict Content Security Policy, framing prevention, content-type protection and restrictive browser feature permissions.
- Demo amounts have no relationship to verified product stock or fulfillment.

### Verified / unverified

Automated live Playwright browser tests run against the Cloudflare staging URL on desktop Chrome and mobile Chrome. The suite covers hero rendering, demo-data disclaimers, filtering, navigation, cart persistence/removal, D1 health, blocked endpoints and viewport overflow. CI saves screenshots for human visual review when tests pass.

**Not verified:** actual AutoPro inventory or Supabase-to-D1 migration, admin writes, payments, shipment, server pricing, production checkout. The original Next.js application has not been deployed to Cloudflare; this is a dedicated review frontend while its backend is migrated.

### Staged release only

The preview uses branch `preview/autopro-cloudflare-storefront`, which is stacked on top of `backend/autopro-cloudflare-d1`. Keep both PRs in review. The live BDA portfolio, AutoPro production and unrelated projects are not changed.
