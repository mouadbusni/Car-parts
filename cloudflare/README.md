# AutoPro Cloudflare fallback — staging only

## Status

The connected Supabase Free organization quoted $0/month but required an explicit cost confirmation before project creation. Per the owner's instruction to use Cloudflare if Supabase could not be provisioned, the **AutoPro Cloudflare staging backend was created** instead. No Supabase project was provisioned and no non-free option was selected.

| Resource | Value |
|---|---|
| Cloudflare D1 database | `autopro-staging` |
| Database ID | `008882da-a3ed-4feb-8ba2-45db553a0f35` |
| Data location | EU jurisdiction |
| Worker script | `autopro-catalog-staging` |
| Staging API | https://autopro-catalog-staging.mouadbusni.workers.dev |
| Schema | `cloudflare/d1/migrations/0001_catalog.sql` |
| Worker source | `cloudflare/catalog-worker/index.mjs` |

### Verified on 2026-11-09

- Applied schema to the **new, isolated Cloudflare D1 staging database**.
- `PRAGMA quick_check` returned `ok`; category/product tables present.
- Live staging Worker `GET /api/health` returned `{ "ok": true, "service": "autopro-catalog", "environment": "staging" }`.
- D1 catalog query with bound parameters executed successfully.
- No real product data was imported: **0 categories and 0 products**.
- GitHub Actions validates the read-only Worker routing, request bounds and CORS; Python SQLite tests verify schema and constraints.

### Public API (read-only)

- `GET /api/health` — isolated backend health.
- `GET /api/categories` — categories, sorted.
- `GET /api/categories/:slug` — a category or 404.
- `GET /api/products?search=...&category=...&featured=true&sort=featured&limit=24&offset=0` — product listing and pagination.
- `GET /api/products/:slug` — one product or 404.
- `HEAD` for read endpoints; `OPTIONS` only for explicitly allowed origins.
- `POST`, `PATCH`, `PUT`, `DELETE` intentionally return **405** for the public catalog.

The Worker uses parameterized SQL and allowlisted sort expressions. Search and pagination are bounded. CORS currently accepts `http://localhost:3000` for developer testing only; configure an explicit staging website origin before connecting browser clients.

### Not implemented or advertised as working

1. **Admin login**: Existing AutoPro admin code relies on Supabase. Cloudflare does not provide Supabase Auth automatically; replace this with an approved and verified identity/access system before publishing an admin dashboard.
2. **Inventory editor**: No public write route, and no trusted admin write API.
3. **Actual order processing, checkout and payment**: deliberately disabled. No order tables have been created in D1. The original Supabase SQL order migration from the earlier draft PR is **not** applicable to D1.
4. **Real product imports**: no original AutoPro Supabase project or verified inventory was connected, so the staging database is intentionally empty.
5. **AutoPro public Next.js storefront**: not deployed to Cloudflare or switched to D1 yet. The existing BDA portfolio is unchanged.

### Cloudflare Free plan considerations

Consult the live Cloudflare pricing and limits documentation before expanding: https://developers.cloudflare.com/d1/platform/pricing/ and https://developers.cloudflare.com/d1/platform/limits/. The Free plan has per-day row read/write limits and database/storage caps. On exceeding free row limits, queries will fail until the daily reset (Cloudflare has enforced these limits since September 2026).

### Next safe steps

- Create an explicit catalog API adapter in the AutoPro Next.js public pages and test the staging API end to end.
- Import **verified** AutoPro product rows and assets from a source provided by the owner. Do not fabricate inventory.
- Choose and implement administrator authentication and scoped write permissions using Cloudflare Workers and a trustworthy identity provider. No default credentials.
- Create a separate full-stack Cloudflare staging deployment (Workers + assets), exercise desktop/mobile user flows.
- Keep AutoPro `main`, published BDA portfolio, and OFFRUE/AURA deployments untouched until the release is approved.
