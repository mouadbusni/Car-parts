#!/usr/bin/env bash
# Reproducible PostgreSQL 17 simulation for the reviewed AutoPro order policy.
# Runs ONLY against a CI Postgres service, never against a real Supabase project.
set -euo pipefail
: "${PGHOST:?Local PostgreSQL test host is required}"
: "${PGDATABASE:?Local PostgreSQL test database is required}"
if [[ "${PGHOST}" != "127.0.0.1" && "${PGHOST}" != "localhost" ]]; then
  echo "Refusing order policy test against a non-local database" >&2
  exit 1
fi

psql -X -v ON_ERROR_STOP=1 <<'SQL'
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated, anon;
SQL

psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/20251116111136_create_auto_parts_schema_v2.sql

# Model the broad grants legacy Supabase projects may have before the patch.
psql -X -v ON_ERROR_STOP=1 <<'SQL'
GRANT ALL PRIVILEGES ON public.orders, public.order_items TO anon, authenticated;
INSERT INTO auth.users (id) VALUES
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');
INSERT INTO public.orders (id, user_id, order_number, subtotal, total)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','AUTO-A',100,100),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','AUTO-B',200,200);
INSERT INTO public.order_items (id, order_id, quantity, price)
VALUES
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1,100),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',1,200);
SQL

psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/20261109164551_lock_down_order_writes.sql

psql -X -v ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE
  role_name text;
  table_name text;
  permission text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
    FOREACH table_name IN ARRAY ARRAY['public.orders','public.order_items'] LOOP
      FOREACH permission IN ARRAY ARRAY['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] LOOP
        IF has_table_privilege(role_name,table_name,permission) THEN
          RAISE EXCEPTION 'Unexpected write privilege for % on %: %', role_name, table_name, permission;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;

  IF NOT has_table_privilege('authenticated','public.orders','SELECT') THEN
    RAISE EXCEPTION 'Customers lost order history visibility';
  END IF;
  IF NOT has_table_privilege('authenticated','public.order_items','SELECT') THEN
    RAISE EXCEPTION 'Customers lost order item visibility';
  END IF;
  IF NOT has_table_privilege('service_role','public.orders','INSERT') THEN
    RAISE EXCEPTION 'Trusted server role unexpectedly lost order insert privileges';
  END IF;
END
$$;
SQL

owner_orders="$(psql -X -v ON_ERROR_STOP=1 -Atq -c "SET ROLE authenticated; SET request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; SELECT count(*) FROM public.orders;")"
owner_items="$(psql -X -v ON_ERROR_STOP=1 -Atq -c "SET ROLE authenticated; SET request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; SELECT count(*) FROM public.order_items;")"
test "$owner_orders" = "1" || { echo "Expected one owner order; got $owner_orders"; exit 1; }
test "$owner_items" = "1" || { echo "Expected one owner line item; got $owner_items"; exit 1; }
second_orders="$(psql -X -v ON_ERROR_STOP=1 -Atq -c "SET ROLE authenticated; SET request.jwt.claim.sub='22222222-2222-4222-8222-222222222222'; SELECT count(*) FROM public.orders;")"
test "$second_orders" = "1" || { echo "Other customer's RLS scope incorrect: $second_orders"; exit 1; }

if psql -X -v ON_ERROR_STOP=1 -c "SET ROLE authenticated; SET request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; INSERT INTO public.orders (user_id,order_number,total) VALUES ('11111111-1111-4111-8111-111111111111','FORGED-TOTAL',0);" >/tmp/autopro_order_denial.log 2>&1; then
  echo "SECURITY FAILURE: authenticated user inserted arbitrary total"; exit 1
fi
grep -qi 'permission denied' /tmp/autopro_order_denial.log || { cat /tmp/autopro_order_denial.log; exit 1; }

if psql -X -v ON_ERROR_STOP=1 -c "SET ROLE authenticated; SET request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; INSERT INTO public.order_items (order_id,quantity,price) VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1,0);" >/tmp/autopro_item_denial.log 2>&1; then
  echo "SECURITY FAILURE: authenticated user inserted arbitrary-priced order item"; exit 1
fi
grep -qi 'permission denied' /tmp/autopro_item_denial.log || { cat /tmp/autopro_item_denial.log; exit 1; }

echo "AutoPro local PostgreSQL RLS test passed: customer SELECT is owner-scoped and all direct order writes are blocked."
