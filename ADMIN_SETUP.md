# AutoPro administrator setup (review branch)

> **Security warning:** Previous versions contained a hard-coded administrator login and trusted a browser-editable cookie. Do not deploy those versions. If an administrator was provisioned with the previously documented default password, rotate that password and revoke its active sessions immediately.

## Backend prerequisite

Connect an AutoPro-specific Supabase project and configure:

- `NEXT_PUBLIC_SUPABASE_URL`: AutoPro's public Supabase project endpoint
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase publishable / public key (never service role)
- `SUPABASE_SERVICE_ROLE_KEY`: **server-only** for one-time administrator creation
- `ADMIN_EMAIL`: email address chosen by the owner
- `ADMIN_PASSWORD`: owner-generated, unique strong password (16+ characters, upper/lowercase letters, numbers, and symbols)

Do **not** commit `.env.local`, `SUPABASE_SERVICE_ROLE_KEY` or any password to GitHub.

## Provision the first administrator

1. Verify that the AutoPro project is the one you intend to configure (not another brand's Supabase project).
2. Use the Supabase dashboard to create the administrator with a unique password **and** set trusted `app_metadata.role` to `admin`, or use the repository's `npm run seed:admin` command with all environment variables set.
3. Remove the server-only service role key from any developer device or environment that doesn't require administrator provisioning.
4. Open `/login` and sign in. The Next.js server checks the Supabase Auth token and trusted role, then issues a short-lived `HttpOnly` cookie for protected routes.
5. Verify `/admin` and `/dashboard` deny access to a signed-out user and to a normal non-admin user.

## Important boundaries

- The browser cannot grant itself admin access by editing a cookie or its own user metadata.
- The admin route requires a verified Supabase Auth session and trusted `app_metadata.role=admin`.
- Expired access tokens require signing in again; automatic server-side token refresh is not configured in this initial security fix.
- Do not assume that access to the admin UI grants database writing privileges. Product mutations must be separately authorized by Supabase row-level security or server-only APIs.
- The legacy orders schema permits authenticated clients to insert orders with client-controlled totals. **Do not enable checkout** until order creation, price/stock checks and authorization are moved to a trusted server-side transaction.
- The original AutoPro Supabase project is not currently accessible through the connected account, so end-to-end admin provisioning and role enforcement cannot yet be verified against a live database.

## Local review

Run `npm run typecheck` and `node --test tests/autopro-auth-source.test.mjs`. The pull request also runs browser checks for blocked routes without relying on a real administrator account.
