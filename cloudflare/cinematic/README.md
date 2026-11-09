# AutoPro — cinematic photographic review (v3)

## Live isolated staging website

**URL:** https://autopro-cinematic-preview.mouadbusni.workers.dev/

This is a new, separate Cloudflare Worker. It does not replace `autopro-precision-preview`, the earlier `autopro-preview`, the original AutoPro Next.js `main` branch, or any BDA website deployment.

### Design system

- Dark graphite / mineral-black foundations, muted metallic sage-silver highlights and warm off-white typography.
- Large editorial display headlines, an immersive photographed sports-car hero, fine monospaced detail labels, restrained hover motion.
- Fully photographic components section, system/category gallery, product listing, product details, and shopping shortlist.
- Same typography and components across desktop and mobile with deliberate small-screen layouts.
- No fake 3D. The prior Three.js prototype was intentionally **not included** in this photo-led review.

### Media provenance

Five optimized WebP image files are checked into `cloudflare/cinematic/assets/`. They are originally sourced from free-to-use Unsplash photographs and compressed for the preview. See the [Unsplash License](https://unsplash.com/license). They are served directly by the Cloudflare Worker with no runtime dependence on Unsplash, Canva, GitHub, or third-party image hotspots.

| Local image | Original source |
|---|---|
| `hero.webp` | https://images.unsplash.com/photo-1503376780353-7e6692767b70 |
| `brakes.webp` | https://images.unsplash.com/photo-1746968989993-6b3fc7b534d9 |
| `wheels.webp` | https://images.unsplash.com/photo-1735012314901-10b3638774a0 |
| `lighting.webp` | https://images.unsplash.com/photo-1720434632396-d0f53b752fc5 |
| `drive.webp` | https://images.unsplash.com/photo-1655150080914-a97576d57c9a |

The imagery is **editorial reference photography only**, not real AutoPro stock or licensed endorsements by the car brands photographed. Third-party names and logos appearing in editorial photos remain their owners' trademarks. Use actual product photography with confirmed rights for a future commercial release.

A separately generated automotive background concept was considered but **not used in the deployment** after its source-size transfer could not be verified. The temporary image import workflow containing the short-lived download link was removed after licensed local assets were saved.

### Architecture and isolation

- Source code `cloudflare/preview-site/index.html` and `cloudflare/preview-site/app.js`
- CSS `cloudflare/cinematic/site.css`
- Local WebP images in `cloudflare/cinematic/assets`
- Source Worker `cloudflare/cinematic/worker.mjs`
- Existing read-only D1 Worker module `cloudflare/catalog-worker/index.mjs`
- D1 database `autopro-staging` (EU jurisdiction, remains **empty of verified AutoPro inventory**)
- Client-side, browser-local demo selection cart; saved in localStorage only
- No checkout, payment, account, admin dashboard, orders, or public write endpoints

The deployment bundler replaces `__AUTOPRO_HTML__`, `__AUTOPRO_CSS__`, `__AUTOPRO_JS__`, and the five `__MEDIA_*__` placeholders with tracked source and checked-in WebP bytes. The Worker serves all `/media/*.webp` assets from the same origin. The CSP disallows external image dependencies, framing, payment APIs and external scripts.

### Functional quality gate

The browser suite `cloudflare/cinematic/tests/site.spec.ts` uses Playwright against the deployed Cloudflare URL, running Chromium desktop/mobile. It checks:

1. Photography-led hero and site identity
2. **Every** lazy image successfully loading with acceptable source dimensions
3. All five WebP URLs returning correct content and nonempty data
4. Homepage quick search and catalogue filter
5. Categories, product details and truthful preview badge
6. Add, quantity, persistence, removal and disabled checkout
7. Actual read-only D1 health/empty catalog
8. Admin/auth/checkout routes and write API blocked
9. Responsive navigation and no horizontal overflow across major pages
10. Real full-page screenshots after forcing all lazy images to load

CI uploads desktop/mobile visual artifacts without modifying the branch.

### Before any public production launch

- Obtain verified AutoPro inventory and rights-cleared photographs of the actual products.
- Build an authenticated admin backend with roles and audit logs.
- Build server-authoritative stock, price, tax, shipping and order processing.
- Audit privacy, accessibility, legal terms, data retention and payment setup.
- Get explicit approval before a merge into main or updating BDA's portfolio screenshot.

This remains a visual/functional review branch, not a live e-commerce store.
