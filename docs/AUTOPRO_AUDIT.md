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


## Security review — added to the same draft PR

- Removed the hard-coded administrator login shortcut, client-editable email cookie fallback and unchecked admin route cookie.
- Created a server session endpoint that accepts only a token verified by Supabase Auth and a trusted `app_metadata.role=admin` claim.
- Admin and dashboard middleware now verify the admin's token on protected requests. The session cookie is `HttpOnly`, short-lived and `Secure` in production.
- Removed default admin passwords from the seed script and setup guide; a unique strong owner-supplied password is required to create an admin with trusted app metadata.
- **Operational action:** If the previous administrator credentials were used on any Supabase account, rotate them and revoke sessions.
- **Outstanding authorization risk:** the historical `orders` INSERT policy lets authenticated clients provide their own totals. Keep checkout disabled and revoke direct client order inserts via a reviewed migration before launching any real order flow.
- **Rollout requirement:** Admin sign-in with a real AutoPro Supabase project has not been verified. Set up that project and explicitly verify administrator role metadata and non-admin denial before publishing these changes.

GitHub Actions verified the review branch through source, TypeScript and browser checks: **11 source tests passed, 11 Playwright tests passed, 1 mobile-only test skipped on desktop**. Browser tests use mocked Supabase product reads; they do not demonstrate live Supabase connectivity.


## Order and payment write lockdown — next checkpoint

A second, Supabase-CLI-generated migration is prepared at
`supabase/migrations/20261109164551_lock_down_order_writes.sql`.

- Explicitly revokes order and order-item write permissions from `PUBLIC`, `anon` and `authenticated`.
- Removes the unsafe legacy policy permitting client-controlled order totals.
- Preserves authenticated, RLS-scoped read access to each customer's existing order history.
- Retains write privileges for trusted `service_role` server code **only**; there is no order creation endpoint or enabled checkout.
- Does **not** modify product, cart, shipping, payment or admin permissions.

**Verification:** GitHub Actions runs `tests/autopro-order-rls.sh` against an **isolated PostgreSQL 17 service**. It creates simulated Supabase auth roles and the existing schema, adds broad legacy grants, applies the proposed migration, and asserts that customer inserts with fabricated totals/prices fail while owner-scoped read access survives. This is a real SQL execution test against a simulated database, **not** a live AutoPro backend test.

**Migration rollout blockers:** The Supabase connection currently lists no AutoPro project. Do not apply the SQL to the AURA, Bewize, Frame & Fade, or invoicing projects. Before applying to any newly linked AutoPro project: inspect its existing schema/policies/grants, back up existing data, run on a separate staging database, confirm server-secret handling, and verify admin login and end-user isolation. AutoPro checkout stays disabled.

A separate AutoPro project might incur cost. Request a Supabase project cost quote and owner approval before provisioning new infrastructure.
