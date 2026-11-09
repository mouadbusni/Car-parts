# AutoPro Precision — 3D engineering website redesign

## Live isolated review

**Website:** https://autopro-precision-preview.mouadbusni.workers.dev/

This is a **separate Cloudflare Worker deployment**, not a replacement of the first `autopro-preview` Worker or the original AutoPro `main` repository. It shares the isolated staging D1 read-only catalogue, which contains no verified real inventory.

### Design direction

AutoPro Precision is distinct from OFFRUE and the original orange variant:

- Midnight navy `#060c17`, engineered steel blue, cobalt accents, brushed silver, restrained icy-blue highlights.
- Editorial Space Grotesk display typography + IBM Plex Mono technical annotations + DM Sans supporting text.
- A full 3D hero, high-contrast information hierarchy, measured whitespace, technical annotation overlays and understated motion.
- Original 3D assembly is part of the interactive website, not a pre-rendered picture.

### Actual WebGL 3D

The source `cloudflare/precision-3d/brake-scene.js` builds an original **procedural Three.js** ventilated brake assembly using geometric primitives and PBR materials:

- Two drilled rotor surfaces with actual perforations, radial vanes, rotor hub, five lug bolts and cast metal hub components.
- Sculpted, extruded brake caliper geometry, metallic components, caliper pistons, hydraulic fitting.
- Physically based `MeshPhysicalMaterial` metallic surface shading, real environment maps generated using Three.js RoomEnvironment, directional and point lights, ACES tone mapping.
- A real perspective camera with drag-to-rotate, keyboard arrows, and an exploded assembly control.
- Uses `ResizeObserver` to resize the canvas; handles offscreen/hidden-tab throttling and reduced-motion preference, and disposes WebGL resources on navigation.
- Gracefully falls back to a text status where WebGL cannot initialize.
- Builds a pinned Three.js `0.180.0` bundle using esbuild `0.25.12`. The produced `scene.bundle.js` runs as a same-origin script without a CDN dependency.

**Prototype disclaimer:** The geometry is an artistic technical 3D prototype; it is not a verified CAD drawing of a commercially available brake assembly or evidence of product fitment.

### Functional components retained

- Public catalog, category browsing, search and sorting, component details
- Clearly marked **demo products** displayed only in the browser, never imported as real inventory
- Browser-persisted editable preview cart
- Public D1 read-only API on the same origin (`/api/health`, `/api/products`, `/api/categories`)
- Admin/login/checkout and all public catalogue writes intentionally blocked

### Build and deployment

Original Cloudflare Worker shell: `cloudflare/precision-3d/worker.mjs`.
Static shell and interactions: `cloudflare/preview-site/index.html`, `cloudflare/preview-site/app.js`.
Redesigned styles: `cloudflare/precision-3d/precision.css`.
Compiled self-hosted Three.js runtime: `cloudflare/precision-3d/scene.bundle.js`.
Existing read-only API: `cloudflare/catalog-worker/index.mjs`.

Deployment expands `__AUTOPRO_HTML__`, `__AUTOPRO_CSS__`, `__AUTOPRO_JS__`, and `__AUTOPRO_SCENE__` with the corresponding tracked code, and sends the resulting ES module alongside the D1 API module to the isolated Worker `autopro-precision-preview`. The existing `autopro-preview` Worker is not touched.

### Testing

`.github/workflows/autopro-3d-build.yml` bundles the engine with pinned packages and checks the bundle syntax and size.

`.github/workflows/autopro-precision-qa.yml` runs Playwright desktop Chrome and mobile emulation against the actual Cloudflare preview, including:

- 3D canvas and model state, graceful fallback where WebGL is unavailable, explode/reassemble interaction
- Brand design, functional catalogue filtering, category navigation and cart persistence
- Real D1 health and deliberately empty inventory
- Forbidden admin, checkout and write routes
- Viewport-overflow checks and screenshot captures for visual review

Do not merge this design preview into `main` or update BDA until the design and real backend plan have been approved. Shipping, order submission, payments and administrator operations remain unavailable.
