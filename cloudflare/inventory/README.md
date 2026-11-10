# AutoPro V5 — verified product media preparation (review only)

## What this phase does

This is an **isolated, review-only** step. No real products, pricing, photos, inventory,
admin rights, orders or payments have been imported or activated. No R2 bucket,
binding, D1 write migration or Cloudflare deployment was created.

The actual D1 catalogue currently has **zero verified imported items**. The six
illustrated demo components must never be represented as stock.

### Gallery behavior

The D1 `image_url` and JSON `gallery` fields can provide up to six unique photos:
one primary plus at most five additional images. The frontend permits product
images **only** from the local path namespace `/media/products/...` and strips
offsite links, generic editorial images and malformed paths.

On a detail page, verified products with multiple URLs receive keyboard-usable
thumbnail selectors. If an image is unavailable, the user sees an explicit
"IMAGE PENDING" placeholder instead of a broken image. Illustrative demo products
retain accurately labeled technical drawings. This code does NOT claim to verify
photos match an item by inspecting pixels.

### Future Cloudflare R2 integration

The optional `env.PRODUCT_MEDIA` R2 binding can read media objects from keys like
`media/products/brakes/rotor-abc-front.webp`. Product images are limited to
a strict path/extension allowlist and 6 MiB files. Public uploads and writes
are **not** supported. When the binding is absent, requests return 404.

**Do not attach an R2 bucket or upload media without explicit approval and
cost / access review.** Create no new resource just to exercise the preview.

### Required product data and photos

Request from the business owner:

1. Official AutoPro logo and brand usage approval.
2. Authentic product inventory: SKU, name, category, actual price/currency,
   real stock, fitment/compatibility and specifications.
3. Up to six photographs **of each exact product** (front, side, detail, packaging),
   preferably accurately color-balanced WebP, not photos of a vaguely related car.
4. Proof of usage rights, source, owner permission, and confirmation photos
   represent the correct SKU. Importing other sellers' imagery without rights
   is not acceptable.
5. Human review of all fitment and compatibility claims.

The preflight validator checks JSON shape, category and product keys, file
presence/signatures, duplicates, and that rights evidence was supplied.
It cannot establish actual rights, authenticity or model compatibility:
**manual confirmation is mandatory**.

### Manifest example — NOT REAL INVENTORY

Do not copy this test-only example into a live database:

```json
{
  "schemaVersion": 1,
  "categories": [
    {"id": "brakes", "slug": "brakes", "name": "Braking systems"}
  ],
  "products": [
    {
      "id": "sample-rotor",
      "slug": "sample-rotor",
      "sku": "EXAMPLE-ONLY-001",
      "name": "Test-only sample rotor",
      "category_id": "brakes",
      "price": 0,
      "stock_quantity": 0,
      "description": "Replace entirely with verified product information.",
      "image_url": "/media/products/brakes/sample-rotor-front.webp",
      "gallery": [],
      "specifications": {},
      "compatibility": [],
      "photoEvidence": [
        {
          "path": "/media/products/brakes/sample-rotor-front.webp",
          "rightsHolder": "REPLACE WITH ACTUAL RIGHTS HOLDER",
          "permissionReference": "REPLACE WITH WRITTEN PERMISSION REFERENCE",
          "exactItemConfirmed": true
        }
      ]
    }
  ]
}
```

**Important:** Evidence field placeholders are not proof. The validator only
checks their presence and basic structure; project owners must verify claims.

For this manifest, place the file at `<media-directory>/brakes/sample-rotor-front.webp`.
Run the local preflight:

```bash
node cloudflare/inventory/validate-manifest.mjs path/to/manifest.json path/to/media-directory
```

This command **reads but never writes** data, does not create SQL, and cannot
publish or provision Cloudflare resources. A passing preflight is not import approval.

### Quality assurance

Workflow `AutoPro V5 — catalog media readiness QA` runs:
- Isolated unit tests on actual Cloudflare Worker routing logic and missing R2 bindings
- Manifest validation tests against local-only fixture images
- Full desktop/mobile Playwright testing, including browser-mocked real-product
  galleries, blocked external media and broken-photo placeholders
- Nonempty full-page desktop and mobile screenshot captures

The local QA server returns an empty catalog by default. Browser tests explicitly
mock synthetic items **within the test page only**; these are never sent to D1
or shown as real available stock.

### Release gate

1. Obtain genuine catalog/photos and business owner approval.
2. Verify all legal / rights evidence and fitment information.
3. Provision approved image storage, bind isolated preview, stage and visually verify.
4. Review an isolated **live** V5 Cloudflare preview and real endpoints.
5. Seek separate approval before production merge, data writes or checkout.

**No merge or deployment on this branch without explicit authorization.**
