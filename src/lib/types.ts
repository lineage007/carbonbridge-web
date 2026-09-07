// ═══════════════════════════════════════════════════
// View-model types (UI layer)
//
// NOTE: these predate the SQL schema and do NOT mirror it column-for-column
// (e.g. Order.total vs orders.total_amount, UserRole 'buyer'|'seller' vs
// profiles.role 'user'|'admin'|'super_admin'). They are consumed by the
// dashboard/marketplace components. Reconciling them with the database is
// tracked as Phase 2 of the audit — see
// docs/PHASE1-CONTRACT-ALIGNMENT-2026-09-08.md.
//
// For anything that reads or writes Supabase, use the database row contracts
// at the bottom of this file instead.
// ═══════════════════════════════════════════════════

export type UserRole = 'buyer' | 'seller' | 'admin';
export type OrderStatus = 'new' | 'payment_received' | 'transfer_in_progress' | 'completed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer';
export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'rejected';
export type SellerStatus = 'pending' | 'approved' | 'suspended';
export type InsuranceProduct = 'non_delivery' | 'invalidation' | 'political_risk' | 'corsia_guarantee';
export type CreditType = 'ARR' | 'REDD+' | 'Blue Carbon' | 'Biochar' | 'Cookstove' | 'DACCS' | 'Soil Carbon' | 'ERW' | 'IFM' | 'Landfill Gas';
export type QualityRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C';
export type ClaimStatus = 'submitted' | 'admin_reviewed' | 'routed_to_insurer' | 'resolved_paid' | 'resolved_denied';
export type ForwardStatus = 'awaiting' | 'in_progress' | 'delivered' | 'defaulted';
export type RFQStatus = 'open' | 'responses_received' | 'accepted' | 'expired' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  company_name: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  phone?: string;
  trade_licence?: string;
  trn?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  industry?: string;
  compliance_needs?: string[];
  seller_status?: SellerStatus;
  stripe_account_id?: string;
  stripe_onboarding_complete?: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  project_name: string;
  registry: string;
  registry_id?: string;
  methodology: string;
  credit_type: CreditType;
  vintage: number;
  country: string;
  region?: string;
  available_tonnes: number;
  price_per_tonne: number;
  quality_rating: QualityRating;
  co_benefits: string[];
  description: string;
  is_forward: boolean;
  forward_delivery_date?: string;
  forward_min_volume?: number;
  status: ListingStatus;
  corsia_eligible: boolean;
  cbam_eligible: boolean;
  nrcc_eligible: boolean;
  cost_basis?: number; // For CarbonBridge Direct
  created_at: string;
}

export interface Order {
  id: string;
  order_ref: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  insurance_products: InsuranceProduct[];
  insurance_premium: number;
  platform_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: 'pending' | 'received' | 'refunded';
  credit_transfer_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  verra_transfer_ref?: string;
  status: OrderStatus;
  stripe_payment_intent_id?: string;
  bank_transfer_ref?: string;
  purchase_agreement_expires?: string;
  admin_notes?: string;
  created_at: string;
}

export interface InsuranceClaim {
  id: string;
  order_id: string;
  buyer_id: string;
  claim_ref: string;
  product: InsuranceProduct;
  description: string;
  supporting_docs?: string[];
  status: ClaimStatus;
  insurer_response?: string;
  resolution_amount?: number;
  admin_notes?: string;
  created_at: string;
}

export interface ForwardContract {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  volume: number;
  agreed_price: number;
  delivery_date: string;
  insurance_selected: boolean;
  status: ForwardStatus;
  contract_ref?: string;
  created_at: string;
}

export interface RFQ {
  id: string;
  buyer_id: string;
  credit_types: CreditType[];
  quantity: number;
  target_price_min?: number;
  target_price_max?: number;
  delivery_timeline: string;
  compliance_requirement?: string;
  min_quality?: QualityRating;
  geography_preference?: string;
  insurance_required?: string;
  notes?: string;
  status: RFQStatus;
  created_at: string;
}

export interface APIClient {
  id: string;
  user_id: string;
  api_key_live: string;
  api_key_sandbox: string;
  company_name: string;
  credit_type_preference?: CreditType;
  min_quality?: QualityRating;
  preferred_region?: string;
  webhook_url?: string;
  monthly_minimum: number;
  margin_rate: number;
  per_call_fee: number;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface APITransaction {
  id: string;
  client_id: string;
  co2_tonnes: number;
  credit_type_allocated?: CreditType;
  estimated_cost: number;
  billing_period: string;
  status: 'logged' | 'invoiced' | 'paid' | 'retired';
  created_at: string;
}

// ═══════════════════════════════════════════════════
// Database row contracts
//
// These mirror supabase/migrations/*.sql exactly. Every field name below is a
// real column; every union member is inside the corresponding CHECK
// constraint. Migration references are given per type.
// ═══════════════════════════════════════════════════

/** orders.status — 001 + 002_fix_order_status_pending_payment.sql */
export type OrderStatusValue =
  | 'new'
  | 'pending_payment'
  | 'payment_received'
  | 'transfer_in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'expired'
  | 'disputed';

/** orders.payment_status — 001 */
export type PaymentStatusValue = 'pending' | 'captured' | 'received' | 'refunded' | 'failed';

/** orders.payment_method — 001 */
export type PaymentMethodValue = 'card' | 'bank_transfer';

/** orders.transfer_status — 001 */
export type TransferStatusValue = 'not_started' | 'in_progress' | 'completed' | 'failed';

/** orders.retirement_status — 001 */
export type OrderRetirementStatusValue = 'not_requested' | 'pending' | 'completed';

/** listings.status — 001 */
export type ListingStatusValue =
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'sold_out'
  | 'rejected'
  | 'expired';

/** listings.listing_type — 001. CB Direct is the separate `is_cb_direct` boolean. */
export type ListingTypeValue = 'spot' | 'forward';

/** profiles.role — 001 */
export type ProfileRoleValue = 'user' | 'admin' | 'super_admin';

/** admin_alerts.priority — 001 */
export type AdminAlertPriority = 'red' | 'amber' | 'blue';

/** public.profiles — 001 (+ 004 hashed key columns) */
export interface ProfileRow {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
  country: string;
  company_type: string;
  role: ProfileRoleValue;
  seller_approved: boolean;
  seller_stripe_account_id: string | null;
  seller_stripe_onboarded: boolean;
  api_enabled: boolean;
  api_key_live: string | null;
  api_key_sandbox: string | null;
  api_key_live_hash?: string | null;
  api_key_sandbox_hash?: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/** public.listings — 001 */
export interface ListingRow {
  id: string;
  seller_id: string;
  project_name: string;
  project_id_verra: string | null;
  registry: string;
  methodology: string | null;
  credit_type: string;
  country: string;
  region: string | null;
  price_per_tonne: number;
  currency: string;
  total_tonnes: number;
  available_tonnes: number;
  reserved_tonnes: number;
  vintage_year: number | null;
  quality_rating: string | null;
  corsia_eligible: boolean;
  cbam_eligible: boolean;
  nrcc_eligible: boolean;
  icvcm_ccp_aligned: boolean;
  listing_type: ListingTypeValue;
  status: ListingStatusValue;
  is_cb_direct: boolean;
  created_at: string;
  updated_at: string;
}

/** orders.insurance_products jsonb element — 001 documents `[{type, premium, provider}]` */
export interface OrderInsuranceProduct {
  type: string;
  premium: number;
  provider?: string;
  premium_rate?: number;
  policy_reference?: string;
}

/** public.orders — 001 + 002 */
export interface OrderRow {
  id: string;
  order_ref: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  project_name: string;
  credit_type: string;
  registry: string;
  vintage_year: number | null;
  quantity: number;
  unit_price: number;
  credit_total: number;
  insurance_selected: boolean;
  insurance_products: OrderInsuranceProduct[] | null;
  insurance_premium_total: number | null;
  insurance_policy_ref: string | null;
  platform_fee_pct: number;
  platform_fee_amount: number;
  total_amount: number;
  payment_method: PaymentMethodValue;
  payment_status: PaymentStatusValue;
  bank_transfer_ref: string | null;
  bank_transfer_due_date: string | null;
  transfer_status: TransferStatusValue;
  verra_transfer_ref: string | null;
  credits_reserved: boolean;
  /** The reservation / payment deadline. There is no `payment_deadline` column. */
  reservation_expires_at: string | null;
  credits_released: boolean;
  buyer_wants_retirement: boolean;
  retirement_status: OrderRetirementStatusValue | null;
  retirement_certificate_url: string | null;
  verra_serial_numbers: string | null;
  /** Generated by the set_agreement_ref trigger. Not `agreement_reference`. */
  agreement_ref: string | null;
  agreement_pdf_url: string | null;
  agreement_accepted_at: string | null;
  status: OrderStatusValue;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert payload written by POST /api/credits/reserve. */
export type OrderReservationInsert = Pick<
  OrderRow,
  | 'buyer_id'
  | 'seller_id'
  | 'listing_id'
  | 'project_name'
  | 'credit_type'
  | 'registry'
  | 'vintage_year'
  | 'quantity'
  | 'unit_price'
  | 'credit_total'
  | 'total_amount'
  | 'payment_method'
  | 'payment_status'
  | 'status'
  | 'credits_reserved'
  | 'credits_released'
  | 'reservation_expires_at'
>;

/** public.activity_log — 001 */
export interface ActivityLogInsert {
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, unknown>;
}

/** public.admin_alerts — 001 */
export interface AdminAlertInsert {
  priority: AdminAlertPriority;
  alert_type: string;
  title: string;
  entity_type?: string | null;
  entity_id?: string | null;
  action_url?: string | null;
}

/** public.api_offset_logs — 001. Note: no endpoint/method/status_code columns. */
export interface ApiOffsetLogInsert {
  client_id: string;
  co2_tonnes: number;
  credit_type_allocated?: string | null;
  estimated_cost?: number | null;
  billing_period: string;
  status: 'logged' | 'invoiced' | 'retired' | 'suspended';
  external_ref?: string | null;
  metadata?: Record<string, unknown>;
}

/** public.settlements — 005_phase1_contract_alignment.sql */
export interface SettlementRow {
  id: string;
  order_id: string;
  status: 'pending' | 'buyer_paid' | 'credits_transferred' | 'completed' | 'disputed' | 'failed';
  /** Status held immediately before a `disputed` transition; null otherwise. */
  previous_status: 'pending' | 'buyer_paid' | 'credits_transferred' | null;
  payment_reference: string | null;
  payment_amount: number | null;
  payment_received_at: string | null;
  credits_transferred_at: string | null;
  verra_transfer_ref: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** public.retirement_certificates — 005_phase1_contract_alignment.sql */
export interface RetirementCertificateRow {
  id: string;
  certificate_ref: string | null;
  order_id: string;
  buyer_id: string;
  registry: string;
  tonnes_retired: number;
  beneficiary_name: string;
  retirement_reason: string | null;
  serial_numbers: string[] | null;
  retirement_date: string | null;
  pdf_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}
