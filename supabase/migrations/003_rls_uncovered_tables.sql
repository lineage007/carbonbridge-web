-- Migration: 003_rls_uncovered_tables.sql
-- Enables RLS and adds deny-by-default + meaningful access policies
-- for the 7 tables that were completely unprotected in 001_initial_schema.sql.
--
-- Tables covered: rfqs, rfq_responses, api_offset_logs, api_invoices,
--                 insurance_claims, activity_log, admin_alerts
--
-- APPLY INSTRUCTIONS (needs-gary):
--   1. Connect to the CarbonBridge Supabase project (ixoxhzlwaspjfvbgfgff).
--      NEVER run against dcemanhmabsjmkitskil (Ledgable production).
--   2. Run via Supabase SQL editor or: supabase db push --db-url <DEV_URL>
--   3. Verify: SELECT * FROM admin_alerts using anon key → should return 0 rows.
--
-- STATUS: DRAFT — do not apply without Gary sign-off.

-- ─────────────────────────────────────
-- rfqs
-- ─────────────────────────────────────
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rfqs: buyers see own, sellers see received, admins see all"
  ON public.rfqs FOR SELECT USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "rfqs: buyers can insert own"
  ON public.rfqs FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "rfqs: buyers can update own pending rfqs"
  ON public.rfqs FOR UPDATE USING (buyer_id = auth.uid());

-- ─────────────────────────────────────
-- rfq_responses
-- ─────────────────────────────────────
ALTER TABLE public.rfq_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rfq_responses: sellers see own, buyers see responses to their rfqs, admins see all"
  ON public.rfq_responses FOR SELECT USING (
    seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.rfqs
      WHERE rfqs.id = rfq_id AND rfqs.buyer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "rfq_responses: sellers can insert"
  ON public.rfq_responses FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "rfq_responses: sellers can update own"
  ON public.rfq_responses FOR UPDATE USING (seller_id = auth.uid());

-- ─────────────────────────────────────
-- api_offset_logs
-- ─────────────────────────────────────
ALTER TABLE public.api_offset_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_offset_logs: clients see own logs, admins see all"
  ON public.api_offset_logs FOR SELECT USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Only service role inserts (via API routes); no user-facing INSERT policy
-- Service role bypasses RLS, so no INSERT policy needed here.

-- ─────────────────────────────────────
-- api_invoices
-- ─────────────────────────────────────
ALTER TABLE public.api_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_invoices: clients see own, admins see all"
  ON public.api_invoices FOR SELECT USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─────────────────────────────────────
-- insurance_claims
-- ─────────────────────────────────────
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insurance_claims: claimant sees own, admins see all"
  ON public.insurance_claims FOR SELECT USING (
    claimant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "insurance_claims: claimants can insert"
  ON public.insurance_claims FOR INSERT WITH CHECK (claimant_id = auth.uid());

-- ─────────────────────────────────────
-- activity_log
-- ─────────────────────────────────────
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Activity log is admin-read only; writes come from service role API routes.
CREATE POLICY "activity_log: admins see all"
  ON public.activity_log FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Users can see their own activity
CREATE POLICY "activity_log: users see own actions"
  ON public.activity_log FOR SELECT USING (
    actor_id = auth.uid()
  );

-- ─────────────────────────────────────
-- admin_alerts
-- ─────────────────────────────────────
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_alerts: admins only"
  ON public.admin_alerts FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
