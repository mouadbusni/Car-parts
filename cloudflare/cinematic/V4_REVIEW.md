# AutoPro — Visual Refinement V4 (review only)

## Scope and safety

This branch stacks **on** `design/autopro-cinematic-photo-v3` and updates only the visual preview.
It does not update `main`, merge existing draft PRs, deploy any Cloudflare Worker,
change D1 data, enable checkout, or touch BDA / AURA / OFFRUE.

**Source changes:**
- `cloudflare/preview-site/index.html` — distinctive two-tone AP monogram, consistent wordmark in header/footer, clearer navigation and status notice.
- `cloudflare/preview-site/app.js` — component-accurate demo visuals instead of incorrectly assigning sports-car/headlight/wheel photographs as product photos; consistent icons and navigation behavior.
- `cloudflare/cinematic/site.css` — cohesive midnight blue, slate and steel/silver design; alignment, spacing, cards, mobile breakpoints, accessible focus/motion.
- `cloudflare/cinematic/tests/site.spec.ts` — visual/functional regression expectations.
- `cloudflare/cinematic/tests/local-server.mjs` — localhost QA server with EMPTY simulated D1 catalog and local checked-in editorial WebPs.
- `.github/workflows/autopro-v4-visual-qa.yml` — desktop and mobile browser tests plus screenshot artifacts.

## Product media integrity

The previous v3 preview assigned the same five editorial photographs to six unrelated products. Examples included a **wheel photo for a coilover**, **headlight photo for an intake filter/intercooler**, and **a car hero photo for an exhaust tip**.

Those were misleading. V4 uses a corresponding technical drawing for each *demo* component (rotor, coilover, filter, caliper, intercooler, and exhaust). Every such visual is explicitly marked as illustrative. Categories show relevant component studies rather than the unrelated editorial photographs.

Verified real products may display their own images only when supplied by managed same-origin media paths. If not available, the UI says that a verified photo is pending. The site DOES NOT fabricate products, stock, fitment, or actual prices.

The five original licensed editorial WebPs remain available for the photographic hero and storytelling panels. New product photos should only be added with confirmed rights and exact product identity.

## Design principles

1. One AutoPro identity: AP mark, wordmark, restrained midnight navy and steel-blue accent; no imitation of OFFRUE.
2. One clear header with four navigation items, a catalogue CTA, and a recognisable saved-selection icon. Mobile menu responds to Escape, outside clicks and viewport changes.
3. Aligned editorial and commercial typography with consistent 8px-scale spacing, 44px-class targets and responsive art sizing.
4. Realistic honesty: the demo catalogue is **not a store**. No real products in staging D1; no orders, payments, customer accounts or admin access.
5. Source-based media: local files for editorial artwork. Product photos require verified source and match.

## QA

Automatic workflow: `AutoPro v4 — isolated visual regression QA`.

It serves the actual HTML/CSS/JS and local WebPs in a local HTTP server. API responses emulate the **already empty** D1 catalogue; these are tests, not evidence that the live Cloudflare D1 service was contacted. Playwright launches desktop Chromium and Pixel 5 viewport, tests navigation, specific demo product artwork, search, filters, selection persistence, checkout blocking and layout overflow, then uploads full-page screenshots.

Manual review still required for aesthetics, graphic quality, official logo confirmation and browser/device edge cases. **Cloudflare v3 remains the live preview** until you specifically approve deploying/replacing a visual preview. Do not treat the branch as a deployed URL.

## Production blockers unchanged

Verified catalog inventory, rights-cleared real product photos, exact fitment data, trusted admin identity and server-authoritative orders/payments must be implemented and checked independently before any public launch.
