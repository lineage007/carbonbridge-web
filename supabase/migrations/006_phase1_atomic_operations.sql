-- Migration: 006_phase1_atomic_operations.sql
--
-- Moves the three read-then-write sequences the Phase 1 API routes used to run
-- over several PostgREST round trips into single database transactions.
--
-- The pattern each of these replaces was: SELECT the current state, decide in
-- Node, then UPDATE/INSERT. Two requests interleaving between the SELECT and
-- the write could both pass the same check. Optimistic locks narrowed the
-- window but could not close it, because the order insert and the counter
-- update were still separate statements with no shared transaction.
--
-- Every function here is SECURITY DEFINER so it can write tables whose RLS
-- policies restrict direct writes to admins, and every one is REVOKEd from
-- public/anon/authenticated and granted only to service_role. The API routes
-- call them through createServiceClient() and only after their own
-- authorisation checks have run. search_path is pinned on each function so a
-- caller-controlled search_path cannot shadow the tables they reference.
--
-- Exception contract: each failure raises ERRCODE P0001 with a STABLE message
-- of the form `CODE` or `CODE:<detail>`. src/lib/rpc-errors.ts parses those
-- messages back into the HTTP responses the routes returned before, so the
-- message text is part of the API contract and must not be reworded without
-- updating that module and its tests.
--
-- APPLY INSTRUCTIONS (needs-gary):
--   1. Apply 005_phase1_contract_alignment.sql first — this file references
--      public.retirement_certificates, which 005 creates.
--   2. Set SUPABASE_SERVICE_ROLE_KEY in the deployment environment before
--      deploying the routes; without it createServiceClient() throws.
--
-- STATUS: DRAFT — not executed anywhere yet. These functions were written
-- offline and have not been run against a database.

-- ═══════════════════════════════════════════════════
-- 1. reserve_credits
-- ═══════════════════════════════════════════════════
--
-- Mirrors src/lib/reservation.ts: buildReservationOrder() for the column list
-- and applyReservationToListing() for the counter arithmetic. The TypeScript
-- helpers are still exported and unit-tested; if you change the columns or the
-- arithmetic here, change them there too.
--
-- Raises:
--   LISTING_NOT_FOUND          — no active listing with that id
--   INSUFFICIENT_CREDITS:<n>   — n = available_tonnes at the time of the lock

CREATE OR REPLACE FUNCTION public.reserve_credits(
  p_listing_id uuid,
  p_quantity integer,
  p_buyer_id uuid,
  p_payment_method text,
  p_expires_at timestamptz
)
RETURNS TABLE (
  id uuid,
  order_ref text,
  total_amount numeric,
  reservation_expires_at timestamptz,
  project_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $reserve_credits$
DECLARE
  v_listing public.listings%ROWTYPE;
  v_credit_total numeric(12,2);
BEGIN
  -- FOR UPDATE holds the listing row until this transaction commits, so a
  -- concurrent reservation blocks here instead of reading the same
  -- available_tonnes and passing the same check.
  SELECT * INTO v_listing
  FROM public.listings l
  WHERE l.id = p_listing_id AND l.status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'LISTING_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;

  IF v_listing.available_tonnes < p_quantity THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS:%', v_listing.available_tonnes
      USING ERRCODE = 'P0001';
  END IF;

  v_credit_total := round(v_listing.price_per_tonne * p_quantity, 2);

  UPDATE public.listings l
  SET available_tonnes = l.available_tonnes - p_quantity,
      reserved_tonnes = COALESCE(l.reserved_tonnes, 0) + p_quantity,
      updated_at = now()
  WHERE l.id = p_listing_id;

  -- Exactly the columns buildReservationOrder() produces. order_ref and
  -- agreement_ref are filled by the BEFORE INSERT triggers from 001.
  RETURN QUERY
  INSERT INTO public.orders (
    buyer_id,
    seller_id,
    listing_id,
    project_name,
    credit_type,
    registry,
    vintage_year,
    quantity,
    unit_price,
    credit_total,
    total_amount,
    payment_method,
    payment_status,
    status,
    credits_reserved,
    credits_released,
    reservation_expires_at
  )
  VALUES (
    p_buyer_id,
    v_listing.seller_id,
    v_listing.id,
    v_listing.project_name,
    v_listing.credit_type,
    v_listing.registry,
    v_listing.vintage_year,
    p_quantity,
    v_listing.price_per_tonne,
    v_credit_total,
    -- No insurance is selected at reservation time, so total == credit total.
    v_credit_total,
    p_payment_method,
    'pending',
    'pending_payment',
    true,
    false,
    p_expires_at
  )
  RETURNING
    orders.id,
    orders.order_ref,
    orders.total_amount,
    orders.reservation_expires_at,
    orders.project_name;
END;
$reserve_credits$;

REVOKE ALL ON FUNCTION public.reserve_credits(uuid, integer, uuid, text, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_credits(uuid, integer, uuid, text, timestamptz)
  TO service_role;

-- ═══════════════════════════════════════════════════
-- 2. release_expired_reservations
-- ═══════════════════════════════════════════════════
--
-- Mirrors releaseReservationFromListing() in src/lib/reservation.ts: both
-- counters move by the same LEAST(), so releasing 20 tonnes against a listing
-- that only has 5 reserved adds 5 back rather than inventing 15.
--
-- SKIP LOCKED means two concurrent sweeps split the backlog instead of
-- blocking on each other, and credits_released = true makes a second sweep
-- over the same order a no-op. Raises nothing: an empty result set is the
-- normal "nothing had expired" answer.

CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS TABLE (
  order_id uuid,
  listing_id uuid,
  quantity integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $release_expired$
DECLARE
  rec RECORD;
  v_reserved integer;
  v_releasable integer;
BEGIN
  FOR rec IN
    SELECT o.id, o.listing_id, o.quantity
    FROM public.orders o
    WHERE o.status = 'pending_payment'
      AND o.credits_released = false
      AND o.reservation_expires_at IS NOT NULL
      AND o.reservation_expires_at < now()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.orders o
    SET status = 'expired',
        credits_reserved = false,
        credits_released = true,
        updated_at = now()
    WHERE o.id = rec.id;

    SELECT COALESCE(l.reserved_tonnes, 0) INTO v_reserved
    FROM public.listings l
    WHERE l.id = rec.listing_id
    FOR UPDATE;

    IF FOUND THEN
      v_releasable := LEAST(rec.quantity, v_reserved);

      UPDATE public.listings l
      SET available_tonnes = l.available_tonnes + v_releasable,
          reserved_tonnes = v_reserved - v_releasable,
          updated_at = now()
      WHERE l.id = rec.listing_id;
    END IF;

    order_id := rec.id;
    listing_id := rec.listing_id;
    quantity := rec.quantity;
    RETURN NEXT;
  END LOOP;
END;
$release_expired$;

REVOKE ALL ON FUNCTION public.release_expired_reservations()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_expired_reservations()
  TO service_role;

-- ═══════════════════════════════════════════════════
-- 3. create_retirement_certificate
-- ═══════════════════════════════════════════════════
--
-- The route used to count only `completed` certificates while inserting a
-- `processing` one, so two requests submitted before the registry write could
-- each consume the same remaining tonnage. The sum here spans pending,
-- processing and completed, and the order row is locked for the duration, so
-- the second request sees the first one's row.
--
-- Raises:
--   ORDER_NOT_FOUND        — no completed order with that id owned by the buyer
--   ALREADY_RETIRED:<n>    — n = tonnes already accounted for
--   EXCEEDS_REMAINING:<n>  — n = tonnes still retirable

CREATE OR REPLACE FUNCTION public.create_retirement_certificate(
  p_order_id uuid,
  p_buyer_id uuid,
  p_quantity numeric,
  p_registry text,
  p_beneficiary_name text,
  p_retirement_reason text,
  p_certificate_ref text
)
RETURNS public.retirement_certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $create_retirement_certificate$
DECLARE
  v_order public.orders%ROWTYPE;
  v_retired numeric;
  v_remaining numeric;
  v_cert public.retirement_certificates%ROWTYPE;
BEGIN
  SELECT * INTO v_order
  FROM public.orders o
  WHERE o.id = p_order_id
    AND o.buyer_id = p_buyer_id
    AND o.status = 'completed'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;

  -- pending and processing count too: they are allocations against this order
  -- that have not yet reached the registry.
  SELECT COALESCE(SUM(c.tonnes_retired), 0) INTO v_retired
  FROM public.retirement_certificates c
  WHERE c.order_id = p_order_id
    AND c.status IN ('pending', 'processing', 'completed');

  IF v_retired >= v_order.quantity THEN
    RAISE EXCEPTION 'ALREADY_RETIRED:%', v_retired USING ERRCODE = 'P0001';
  END IF;

  v_remaining := v_order.quantity - v_retired;

  IF p_quantity > v_remaining THEN
    RAISE EXCEPTION 'EXCEEDS_REMAINING:%', v_remaining USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.retirement_certificates (
    certificate_ref,
    order_id,
    buyer_id,
    registry,
    tonnes_retired,
    beneficiary_name,
    retirement_reason,
    status,
    serial_numbers
  )
  VALUES (
    p_certificate_ref,
    p_order_id,
    p_buyer_id,
    COALESCE(p_registry, 'verra'),
    p_quantity,
    COALESCE(p_beneficiary_name, 'On behalf of certificate holder'),
    p_retirement_reason,
    -- Always 'processing': the registry write is still manual, so nothing here
    -- may assert 'completed'. See the stub boundary note in 005.
    'processing',
    '{}'
  )
  RETURNING * INTO v_cert;

  RETURN v_cert;
END;
$create_retirement_certificate$;

REVOKE ALL ON FUNCTION public.create_retirement_certificate(uuid, uuid, numeric, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_retirement_certificate(uuid, uuid, numeric, text, text, text, text)
  TO service_role;
