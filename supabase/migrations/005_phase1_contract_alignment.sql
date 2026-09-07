-- Migration: 005_phase1_contract_alignment.sql
-- Phase 1 of CARBONBRIDGE-AUDIT-CHECKLIST-2026-04-30 (findings CB-005, CB-006).
--
-- WHAT THIS ADDS
--   1. public.settlements            — the settlement state machine driven by
--                                      src/app/api/settlements/route.ts. The
--                                      route has always queried this table; it
--                                      never existed in 001_initial_schema.sql.
--   2. public.retirement_certificates — written by src/app/api/retire/route.ts
--                                      and by the settlement `completed`
--                                      transition. Also absent from 001.
--   3. rfqs.seller_id, insurance_claims.claimant_id — columns that
--      003_rls_uncovered_tables.sql already references in its RLS policies but
--      that 001 never created. Without them, migration 003 fails to apply.
--
-- STRICTLY ADDITIVE: only CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT
-- EXISTS / CREATE INDEX IF NOT EXISTS. Nothing is dropped or renamed. Policies
-- are created inside exception-guarded DO blocks so re-running is safe.
--
-- STUB BOUNDARY: retirement_certificates rows are records of a *requested*
-- retirement. No registry (Verra / Gold Standard / ACR) write happens; a human
-- operator executes it via the admin_alerts queue until ADGM authorisation and
-- registry partner agreements are in place. See README.md "Stub vs. Live".
--
-- APPLY INSTRUCTIONS (needs-gary):
--   1. Target the CarbonBridge Supabase project (ixoxhzlwaspjfvbgfgff).
--      NEVER run against dcemanhmabsjmkitskil (Ledgable production).
--   2. Apply BEFORE 003_rls_uncovered_tables.sql — 003's policies depend on
--      the two columns added in section 3 below. Both are unapplied drafts, so
--      running 005 first is safe; no ordering has been broken in production.
--   3. Verify:
--        select to_regclass('public.settlements');              -- not null
--        select to_regclass('public.retirement_certificates');  -- not null
--        select column_name from information_schema.columns
--          where table_name = 'rfqs' and column_name = 'seller_id';
--
-- STATUS: DRAFT — NOT APPLIED to any environment. Needs Gary sign-off.

-- ═══════════════════════════════════════════════════
-- 1. SETTLEMENTS
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,

  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'buyer_paid',
      'credits_transferred',
      'completed',
      'disputed',
      'failed'
    )),

  -- Payment leg
  payment_reference text,
  payment_amount numeric(12,2),
  payment_received_at timestamptz,

  -- Credit transfer leg
  credits_transferred_at timestamptz,
  verra_transfer_ref text,

  completed_at timestamptz,
  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settlements_order ON public.settlements(order_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON public.settlements(status);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "settlements: order parties and admins can read"
    ON public.settlements FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id
          AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  -- Writes go through the settlements API route; only admins may write directly.
  CREATE POLICY "settlements: admins can write"
    ON public.settlements FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════
-- 2. RETIREMENT CERTIFICATES
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.retirement_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- CarbonBridge-side reference: CB-RET-<base36 ts>-<credit id tail>.
  -- Distinct from serial_numbers, which holds the *registry* serials and stays
  -- empty until the registry retirement is actually executed.
  certificate_ref text UNIQUE,

  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id),

  registry text NOT NULL DEFAULT 'verra',
  tonnes_retired numeric(12,4) NOT NULL CHECK (tonnes_retired > 0),
  beneficiary_name text NOT NULL,
  retirement_reason text,

  serial_numbers text[] DEFAULT '{}',
  retirement_date timestamptz,
  pdf_url text,

  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retirement_certs_order ON public.retirement_certificates(order_id);
CREATE INDEX IF NOT EXISTS idx_retirement_certs_buyer ON public.retirement_certificates(buyer_id);
CREATE INDEX IF NOT EXISTS idx_retirement_certs_status ON public.retirement_certificates(status);

ALTER TABLE public.retirement_certificates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "retirement_certificates: buyers see own, admins see all"
    ON public.retirement_certificates FOR SELECT USING (
      buyer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "retirement_certificates: buyers can request own"
    ON public.retirement_certificates FOR INSERT WITH CHECK (buyer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  -- Only admins (and the service role, which bypasses RLS) may advance a
  -- certificate to 'completed' once the registry retirement is executed.
  CREATE POLICY "retirement_certificates: admins can update"
    ON public.retirement_certificates FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════
-- 3. COLUMNS REFERENCED BY 003_rls_uncovered_tables.sql
-- ═══════════════════════════════════════════════════

-- 003 policy "rfqs: buyers see own, sellers see received, admins see all"
-- filters on rfqs.seller_id (the seller an RFQ was directed at, NULL for open
-- market RFQs). 001 never created it.
ALTER TABLE public.rfqs
  ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES public.profiles(id);

CREATE INDEX IF NOT EXISTS idx_rfqs_seller ON public.rfqs(seller_id);

-- 003 policies on insurance_claims filter on claimant_id. 001 named the same
-- concept buyer_id; claimant_id is added alongside it (buyer_id is left
-- untouched) so 003 applies cleanly.
ALTER TABLE public.insurance_claims
  ADD COLUMN IF NOT EXISTS claimant_id uuid REFERENCES public.profiles(id);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_claimant ON public.insurance_claims(claimant_id);

-- Backfill claimant_id from the existing buyer_id column.
UPDATE public.insurance_claims
  SET claimant_id = buyer_id
  WHERE claimant_id IS NULL;
