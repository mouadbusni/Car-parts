# AutoPro — initial source audit and review fixes

This review branch makes small, functional fixes without changing the AutoPro brand, BDA website, live deployment or Supabase schema.

## Addressed in this review

- The homepage Search control now routes to `/products?search=<encoded name>`, and the catalog reads that value before loading results.
- Search terminology now reflects what the code actually supports: **product-name search**, not vehicle fitment or VIN matching.
- The header scroll listener is registered once with cleanup rather than on every render.
- The mobile navigation toggle opens and closes a real menu.
- Header links for nonexistent `/brands` and `/support` routes were removed.
- Unsupported hero metrics (150K+ products, 100% quality, 24/7 support) were replaced with feature descriptions.
- The catalog shows a retryable error when its product request fails.

## Confirmed limitations — further development is required

- Product-name search is implemented using the existing Supabase `products.name` query. This branch does **not** create VIN or vehicle compatibility matching.
- Cart page contains a hard-coded empty cart; the header cart count does not reflect an end-to-end cart.
- Supabase backend credentials/data, production deployment and record-level authorization have **not** been live-verified in this source audit.
- `QA_REPORT.md` documents hundreds of accessibility findings; the historical test status should not be interpreted as an accessibility pass.
- AutoPro has no live URL configured in the BDA portfolio; its BDA cover remains an editorial concept, not a live screenshot.

## Verification

Run `node --test tests/autopro-audit.test.mjs` for source regression checks and `npm run typecheck` for TypeScript. A real browser/database smoke test is still required before any deployment.
