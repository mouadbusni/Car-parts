# AutoPro V6 — legacy administrator security hardening (review branch)

## Critical finding

The original Next.js AutoPro implementation used an embedded fixed administrator
credential, an email-only browser cookie as a login signal, and a middleware
check that only tested whether a cookie *existed*. A forged cookie could bypass
the legacy page-level guard. Product authorization must not depend on that
mechanism. The original public repository also documented the default account.

If the old administrator account was **ever provisioned with the formerly
documented password**, **rotate the password and revoke active sessions
immediately in the original Supabase Auth project**. Merging code does not
revoke credentials or existing sessions. We have not checked or changed any
real Supabase account during this review.

## What V6 changes

- No built-in administrator email/password login bypass.
- Both administrator seed scripts now require owner-supplied environment
  variables (email, unique strong password and service role key).
- A trusted administrator role is stored only in Supabase Auth
  `app_metadata.role = 'admin'`, not user-editable `user_metadata`.
- On sign-in, the Next.js server independently verifies the presented
  Supabase access token and trusted role before issuing a short-lived,
  HttpOnly, secure-in-production, SameSite=strict session cookie.
- Next.js middleware re-verifies the access token on **every** protected
  `/admin` and `/dashboard` navigation. An attacker-created `sb-auth-token`
  cookie is ignored. Failed checks redirect to login.
- Only one canonical admin session route is kept:
  `/api/admin-session`. It validates same-origin requests, input and role.
- Sign-out clears the admin cookie and signs out of Supabase.
- Legacy tests that previously relied on cookie forgery and fake credentials
  have been replaced with anonymous-access denial tests. Two older visual
  browser test files received TypeScript-only corrections so they can be
  checked alongside the Next.js project.

## Not provided / not authorized

- The real AutoPro Supabase project and an authorized admin identity were
  not used here. A successful local no-credentials test **does not** establish
  that an actual administrator can sign in against production.
- No live Cloudflare Workers, R2 buckets, D1 catalog tables, or real product
  inventory were modified.
- The original Supabase schema contains client-visible order data and
  authenticated insert policies. Order totals and inventory are **not**
  server-authoritative. Checkout remains prohibited.
- The old Next.js admin's product editor may persist local fallback records
  when an insert fails. This is **not** a verified backend write and must not
  be marketed as functioning inventory management. Secure RLS/write paths
  require a later, separately reviewed phase.
- Authentication code alone is not authorization for database writes:
  Supabase RLS and server-only product modifications must be independently
  implemented and tested before permitting real inventory edits.

## Review and testing

Run:
```bash
npm ci
node --test tests/autopro-auth-source.test.mjs
npm run typecheck
npx playwright test tests/admin-auth.spec.ts tests/admin-products.spec.ts --config playwright.config.ts --project chromium --workers=1
```

Use dedicated dummy local Auth settings for anonymous-browser tests.
Never place a service role key in a client build or automated browser tests.
A successful anonymous denial test does not replace a genuine real-account
authorization test on an isolated preview.

## Strict release gate

1. Confirm and rotate any legacy administrator account/password, revoke
   old sessions, and audit Supabase Auth logs.
2. Review the V6 changes in their isolated draft PR.
3. Verify a real admin session with server-side role assignment in an
   *isolated* Auth project.
4. Audit database RLS for every admin mutation and order operation.
5. Obtain explicit owner approval before any merge to `main` or deployment.

**This review branch does not patch or deploy the original production app.**
