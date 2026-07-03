-- Migration: 002_fix_order_status_pending_payment.sql
-- Adds 'pending_payment' to the orders.status CHECK constraint so that
-- reservation inserts (which use status = 'pending_payment') do not fail.
--
-- APPLY INSTRUCTIONS (needs-gary):
--   1. Connect to the CarbonBridge Supabase project (ixoxhzlwaspjfvbgfgff),
--      NOT the Ledgable production project (dcemanhmabsjmkitskil).
--   2. Run this migration via the Supabase SQL editor or:
--        supabase db push --db-url <DEV_URL>
--   3. Verify: INSERT INTO orders (..., status) VALUES (..., 'pending_payment')
--      should succeed; INSERT with status 'bogus' should fail.
--
-- STATUS: DRAFT — do not apply to production without Gary sign-off.

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
    CHECK (status IN (
      'new',
      'pending_payment',
      'payment_received',
      'transfer_in_progress',
      'completed',
      'cancelled',
      'refunded',
      'expired',
      'disputed'
    ));
