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
- **Implemented on this branch:** browser-local cart shared by product detail, catalog, featured cards and header, with quantity controls, subtotal, stock-at-add limits, removal and persistence across reloads. This is **not** a real order system.
- Supabase backend credentials/data, production deployment and record-level authorization have **not** been live-verified in this source audit.
- `QA_REPORT.md` documents hundreds of accessibility findings; the historical test status should not be interpreted as an accessibility pass.
- AutoPro has no live URL configured in the BDA portfolio; its BDA cover remains an editorial concept, not a live screenshot.

## Verification

GitHub Actions on the review branch passed `node --test tests/autopro-audit.test.mjs tests/autopro-cart-source.test.mjs`, `npm run typecheck`, and Playwright cart flows for desktop Chromium and Mobile Chrome (**5 passed, 1 skipped**). Playwright routes the product read API to mocked responses; it **does not prove live Supabase database connectivity**.

Still required before production: live Supabase-connected browse/add tests, real stock and price revalidation, authorized order creation, checkout/payment flow, and accessibility remediation. The disabled checkout button prevents implying these systems work.
