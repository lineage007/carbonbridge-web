-- CarbonBridge V4.1 Complete Schema
-- Unified profiles, transaction lifecycle, credit locking, agreements

-- ═══════════════════════════════════════════════════
-- USERS & AUTH (extends Supabase auth.users)
-- ═══════════════════════════════════════════════════

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  company_name text not null,
  contact_name text not null,
  country text not null default 'AE',
  company_type text not null default 'corporate', -- corporate|airline|government|financial|developer|broker|other
  plans_to text[] default '{}', -- buy|sell|both
  compliance_needs text[] default '{}', -- nrcc|cbam|corsia|voluntary|sbti
  estimated_volume text, -- under_1k|1k_10k|10k_100k|100k_plus
  registry_accounts text[] default '{}', -- verra|gold_standard|acr
  
  -- Seller verification
  seller_approved boolean not null default false,
  seller_approved_at timestamptz,
  seller_approved_by uuid references public.profiles(id),
  seller_stripe_account_id text, -- Stripe Connect account
  seller_stripe_onboarded boolean not null default false,
  
  -- Roles
  role text not null default 'user' check (role in ('user', 'admin', 'super_admin')),
  
  -- API access
  api_enabled boolean not null default false,
  api_key_live text,
  api_key_sandbox text,
  api_monthly_minimum numeric(10,2) default 500.00,
  api_margin_pct numeric(5,2) default 20.00,
  api_per_call_fee numeric(5,2) default 0.10,
  
  -- Meta
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ═══════════════════════════════════════════════════
-- CREDIT LISTINGS
-- ═══════════════════════════════════════════════════

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  
  -- Project details
  project_name text not null,
  project_id_verra text, -- VCS-1234
  registry text not null default 'verra', -- verra|gold_standard|acr
  methodology text,
  credit_type text not null, -- arr|redd_plus|blue_carbon|biochar|cookstove|soil_carbon|dac|landfill_gas|mineralization|erw|ifm|renewable_energy
  country text not null,
  region text,
  
  -- Pricing & inventory
  price_per_tonne numeric(10,2) not null,
  currency text not null default 'USD',
  total_tonnes integer not null,
  available_tonnes integer not null,
  reserved_tonnes integer not null default 0,
  vintage_year integer,
  
  -- Quality
  quality_rating text, -- aaa|aa|a|bbb|bb|b|c
  permanence_years integer,
  additionality_score numeric(3,1),
  co_benefits text[] default '{}',
  
  -- Compliance eligibility
  corsia_eligible boolean not null default false,
  cbam_eligible boolean not null default false,
  nrcc_eligible boolean not null default false,
  icvcm_ccp_aligned boolean not null default false,
  
  -- Listing type
  listing_type text not null default 'spot' check (listing_type in ('spot', 'forward')),
  -- Forward-specific
  expected_delivery_date date,
  delivery_window_months integer,
  min_purchase_volume integer,
  price_type text default 'fixed', -- fixed|collar|market_linked
  
  -- Status
  status text not null default 'pending_review' check (status in ('pending_review', 'active', 'paused', 'sold_out', 'rejected', 'expired')),
  rejection_reason text,
  
  -- CB Direct
  is_cb_direct boolean not null default false,
  cost_basis_per_tonne numeric(10,2), -- what CB paid (super-admin only)
  
  -- Verra verification
  verra_verified boolean not null default false,
  verra_data jsonb,
  
  -- Documentation
  documentation_urls text[] default '{}',
  
  -- Meta
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

alter table public.listings enable row level security;

create policy "Anyone can view active listings" on public.listings
  for select using (status = 'active' or seller_id = auth.uid());
create policy "Sellers can manage own listings" on public.listings
  for all using (seller_id = auth.uid());

-- ═══════════════════════════════════════════════════
-- ORDERS & TRANSACTIONS
-- ═══════════════════════════════════════════════════

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique, -- CB-2026-XXXXX
  
  -- Parties
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  listing_id uuid not null references public.listings(id),
  
  -- Credit details (snapshot at time of purchase)
  project_name text not null,
  credit_type text not null,
  registry text not null,
  vintage_year integer,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  credit_total numeric(12,2) not null,
  
  -- Insurance
  insurance_selected boolean not null default false,
  insurance_products jsonb default '[]', -- [{type, premium, provider}]
  insurance_premium_total numeric(10,2) default 0,
  insurance_policy_ref text,
  
  -- Platform fees
  platform_fee_pct numeric(5,2) not null default 7.50,
  platform_fee_amount numeric(10,2) not null default 0,
  insurance_commission_pct numeric(5,2) default 35.00,
  insurance_commission_amount numeric(10,2) default 0,
  
  -- Totals
  total_amount numeric(12,2) not null, -- credit + insurance
  
  -- Payment
  payment_method text not null check (payment_method in ('card', 'bank_transfer')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'captured', 'received', 'refunded', 'failed')),
  stripe_payment_intent_id text,
  stripe_transfer_id text,
  bank_transfer_ref text,
  bank_transfer_due_date timestamptz, -- 5 business days from agreement
  
  -- Credit transfer
  transfer_status text not null default 'not_started' check (transfer_status in ('not_started', 'in_progress', 'completed', 'failed')),
  verra_transfer_ref text,
  transfer_initiated_at timestamptz,
  transfer_completed_at timestamptz,
  
  -- Reservation
  credits_reserved boolean not null default false,
  reservation_expires_at timestamptz,
  credits_released boolean not null default false,
  
  -- Retirement
  buyer_wants_retirement boolean not null default false,
  retirement_status text default 'not_requested' check (retirement_status in ('not_requested', 'pending', 'completed')),
  retirement_certificate_url text,
  verra_serial_numbers text,
  
  -- Agreement
  agreement_ref text, -- PA-2026-XXXXX
  agreement_pdf_url text,
  agreement_accepted_at timestamptz,
  
  -- Overall status
  status text not null default 'new' check (status in ('new', 'payment_received', 'transfer_in_progress', 'completed', 'cancelled', 'refunded', 'expired')),
  
  -- Admin
  admin_notes text,
  processed_by uuid references public.profiles(id),
  
  -- Meta
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders" on public.orders
  for select using (buyer_id = auth.uid() or seller_id = auth.uid());

-- ═══════════════════════════════════════════════════
-- FORWARD CONTRACTS
-- ═══════════════════════════════════════════════════

create table public.forward_contracts (
  id uuid primary key default gen_random_uuid(),
  contract_ref text not null unique,
  listing_id uuid not null references public.listings(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  
  credit_type text not null,
  quantity integer not null,
  agreed_price numeric(10,2) not null,
  deposit_pct numeric(5,2) not null default 15.00,
  deposit_amount numeric(10,2) not null,
  deposit_paid boolean not null default false,
  balance_amount numeric(10,2) not null,
  balance_due_date date,
  
  expected_delivery_date date not null,
  delivery_window_months integer default 3,
  actual_delivery_date date,
  
  insurance_policy_ref text,
  insurance_type text, -- non_delivery
  
  agreement_pdf_url text,
  
  status text not null default 'pending' check (status in ('pending', 'active', 'delivered', 'defaulted', 'cancelled')),
  
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forward_contracts enable row level security;

-- ═══════════════════════════════════════════════════
-- RFQ (Request for Quote)
-- ═══════════════════════════════════════════════════

create table public.rfqs (
  id uuid primary key default gen_random_uuid(),
  rfq_ref text not null unique,
  buyer_id uuid not null references public.profiles(id),
  
  credit_types text[] not null,
  quantity integer not null, -- min 10,000
  target_price_min numeric(10,2),
  target_price_max numeric(10,2),
  delivery_timeline text not null default 'flexible',
  compliance_requirement text,
  quality_minimum text default 'bbb',
  geography_preference text,
  insurance_required text default 'undecided',
  notes text,
  
  status text not null default 'open' check (status in ('open', 'responses_received', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  
  created_at timestamptz not null default now()
);

create table public.rfq_responses (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),
  
  offered_price numeric(10,2) not null,
  available_volume integer not null,
  delivery_timeline text not null,
  credit_type text not null,
  quality_rating text,
  notes text,
  
  is_cb_direct boolean not null default false,
  
  status text not null default 'submitted' check (status in ('submitted', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- API USAGE TRACKING
-- ═══════════════════════════════════════════════════

create table public.api_offset_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  
  co2_tonnes numeric(10,4) not null,
  credit_type_preference text,
  min_quality text default 'bbb',
  prefer_region text,
  
  credit_type_allocated text,
  estimated_cost numeric(10,2),
  
  billing_period text not null, -- 2026-03
  status text not null default 'logged' check (status in ('logged', 'invoiced', 'retired', 'suspended')),
  
  -- External reference
  external_ref text, -- client's own reference
  metadata jsonb default '{}',
  
  created_at timestamptz not null default now()
);

create table public.api_invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  invoice_ref text not null unique,
  
  billing_period text not null,
  total_calls integer not null,
  total_co2 numeric(12,4) not null,
  credit_cost numeric(12,2) not null,
  margin_amount numeric(10,2) not null,
  per_call_fees numeric(10,2) not null,
  total_amount numeric(12,2) not null,
  
  pdf_url text,
  
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  due_date date not null,
  paid_at timestamptz,
  
  -- Post-payment
  retirement_completed boolean not null default false,
  retirement_certificate_url text,
  verra_serial_numbers text,
  
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- INSURANCE CLAIMS
-- ═══════════════════════════════════════════════════

create table public.insurance_claims (
  id uuid primary key default gen_random_uuid(),
  claim_ref text not null unique,
  order_id uuid references public.orders(id),
  forward_contract_id uuid references public.forward_contracts(id),
  buyer_id uuid not null references public.profiles(id),
  
  insurance_type text not null, -- non_delivery|invalidation|political_risk|corsia_guarantee
  insurer text not null, -- kita|cfc
  policy_ref text not null,
  
  description text not null,
  supporting_docs text[] default '{}',
  
  status text not null default 'submitted' check (status in ('submitted', 'admin_reviewed', 'routed_to_insurer', 'insurer_responded', 'resolved_paid', 'resolved_denied')),
  
  admin_notes text,
  insurer_response text,
  payout_amount numeric(12,2),
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- ACTIVITY LOG (for admin feed)
-- ═══════════════════════════════════════════════════

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null, -- registration|listing_submitted|order_placed|payment_received|transfer_complete|retirement|claim_filed|etc
  entity_type text not null, -- user|listing|order|forward_contract|rfq|claim|api_invoice
  entity_id uuid,
  details jsonb default '{}',
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- ALERTS (for super-admin)
-- ═══════════════════════════════════════════════════

create table public.admin_alerts (
  id uuid primary key default gen_random_uuid(),
  priority text not null check (priority in ('red', 'amber', 'blue')),
  alert_type text not null,
  title text not null,
  entity_type text,
  entity_id uuid,
  action_url text,
  
  dismissed boolean not null default false,
  dismissed_by uuid references public.profiles(id),
  dismissed_at timestamptz,
  
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════

create index idx_listings_status on public.listings(status);
create index idx_listings_credit_type on public.listings(credit_type);
create index idx_listings_seller on public.listings(seller_id);
create index idx_orders_buyer on public.orders(buyer_id);
create index idx_orders_seller on public.orders(seller_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_ref on public.orders(order_ref);
create index idx_api_logs_client on public.api_offset_logs(client_id);
create index idx_api_logs_period on public.api_offset_logs(billing_period);
create index idx_activity_log_created on public.activity_log(created_at desc);
create index idx_alerts_priority on public.admin_alerts(priority) where not dismissed;

-- ═══════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════

-- Auto-generate order reference
create or replace function generate_order_ref() returns trigger as $$
begin
  new.order_ref := 'CB-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_ref_seq')::text, 5, '0');
  return new;
end;
$$ language plpgsql;

create sequence order_ref_seq start 1;
create trigger set_order_ref before insert on public.orders
  for each row execute function generate_order_ref();

-- Auto-generate agreement reference
create or replace function generate_agreement_ref() returns trigger as $$
begin
  new.agreement_ref := 'PA-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('agreement_ref_seq')::text, 5, '0');
  return new;
end;
$$ language plpgsql;

create sequence agreement_ref_seq start 1;
create trigger set_agreement_ref before insert on public.orders
  for each row execute function generate_agreement_ref();

-- Auto-create profile on user signup
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, company_name, contact_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    coalesce(new.raw_user_meta_data->>'contact_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Release expired reservations
create or replace function release_expired_reservations() returns void as $$
begin
  -- Find orders with expired reservations
  update public.orders
  set status = 'expired',
      credits_released = true,
      updated_at = now()
  where payment_method = 'bank_transfer'
    and payment_status = 'pending'
    and reservation_expires_at < now()
    and not credits_released;
  
  -- Restore listing quantities
  update public.listings l
  set available_tonnes = available_tonnes + o.quantity,
      reserved_tonnes = reserved_tonnes - o.quantity,
      updated_at = now()
  from public.orders o
  where o.listing_id = l.id
    and o.status = 'expired'
    and o.credits_released = true
    and o.updated_at > now() - interval '1 minute';
end;
$$ language plpgsql security definer;

