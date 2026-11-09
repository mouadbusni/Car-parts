-- AutoPro checkout safety gate
-- The historical client policy allowed users to submit order totals of their choice.
-- No customer-side checkout is enabled. Only privileged, trusted server code may
-- create or modify orders after separately revalidating inventory and prices.
--
-- Prepared for review; verify the current production schema before application.

BEGIN;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Remove historical permissive INSERT policy. Future client policies, if any,
-- still cannot override the explicit write privilege revocation below.
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

-- Never permit browser roles to insert spoofed totals, alter payment_status,
-- change prices, or remove order history. RLS alone is not sufficient if another
-- permissive policy is later added.
REVOKE ALL PRIVILEGES ON TABLE public.orders FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.order_items FROM PUBLIC, anon, authenticated;

-- Preserve read-only order history for authenticated customers.
-- Policies also restrict SELECT to the current account's orders.
GRANT SELECT ON TABLE public.orders, public.order_items TO authenticated;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = public.order_items.order_id
        AND public.orders.user_id = (SELECT auth.uid())
    )
  );

-- Future server APIs require a server-only secret key; never expose service_role
-- to a public client. Payment, inventory and price validation remain unimplemented.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders, public.order_items TO service_role;

COMMIT;
