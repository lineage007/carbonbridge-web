-- CarbonBridge Marketplace MVP Migration
-- Branch: carbon-bridge-marketplace-mvp-2026-05-25
-- DO NOT apply to production without Gary's explicit approval.
-- Apply to dev environment first and verify against dev credentials.

-- ═══════════════════════════════════════════════════
-- cb_orders — Core order lifecycle table
-- Replaces/supplements the existing orders table with
-- the new status flow: pending_kyc → pending_payment →
-- payment_processing → settled → retired
-- ═══════════════════════════════════════════════════

create table if not exists public.cb_orders (
  id uuid primary key default gen_random_uuid(),

  -- Parties
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  listing_id uuid not null references public.listings(id),

  -- Credit snapshot at time of order
  project_name text not null,
  credit_type text not null,
  registry text not null,
  vintage_year integer,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price > 0),

  -- Financials
  credit_total numeric(12,2) not null,
  platform_fee_pct numeric(5,2) not null default 3.00,
  platform_fee_amount numeric(10,2) not null default 0,
  total_amount numeric(12,2) not null,

  -- Payment
  payment_method text not null check (payment_method in ('card', 'bank_transfer')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'processing', 'captured', 'refunded', 'failed')),
  stripe_payment_intent_id text,
  bank_transfer_ref text,

  -- KYC pre-screening fields (collected at order creation)
  kyc_business_name text not null,
  kyc_business_country text not null,
  kyc_intended_use text,  -- 'nrcc_compliance' | 'corsia_compliance' | 'voluntary_offset' | 'investment' | 'other'

  -- Credit reservation
  credits_reserved boolean not null default false,
  reservation_expires_at timestamptz,
  credits_released boolean not null default false,

  -- Order status
  status text not null default 'pending_kyc' check (status in (
    'pending_kyc',         -- awaiting admin KYC review
    'pending_payment',     -- KYC approved, awaiting payment
    'payment_processing',  -- Stripe PaymentIntent created
    'settled',             -- payment captured, awaiting registry transfer
    'retired',             -- registry retirement instruction emitted
    'cancelled',           -- failed, refunded, or expired
    'disputed'             -- under dispute resolution
  )),

  -- Admin tracking
  admin_notes text,
  processed_by uuid references public.profiles(id),

  -- Meta
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cb_orders enable row level security;

create policy "Buyers can view own orders" on public.cb_orders
  for select using (buyer_id = auth.uid());
create policy "Sellers can view orders for their listings" on public.cb_orders
  for select using (seller_id = auth.uid());
create policy "Admins can view all cb_orders" on public.cb_orders
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );
create policy "Authenticated users can create orders" on public.cb_orders
  for insert with check (buyer_id = auth.uid());

create index idx_cb_orders_buyer on public.cb_orders(buyer_id);
create index idx_cb_orders_seller on public.cb_orders(seller_id);
create index idx_cb_orders_status on public.cb_orders(status);
create index idx_cb_orders_listing on public.cb_orders(listing_id);
create index idx_cb_orders_created on public.cb_orders(created_at desc);

-- ═══════════════════════════════════════════════════
-- kyc_queue — Admin queue for KYC review
-- ═══════════════════════════════════════════════════

create table if not exists public.kyc_queue (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.cb_orders(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id),

  -- Business info collected at order creation
  business_name text not null,
  business_country text not null,
  intended_use text,

  -- Review status
  status text not null default 'pending' check (status in (
    'pending',        -- not yet reviewed
    'approved',       -- KYC passed, order can proceed to payment
    'rejected',       -- KYC failed, order cancelled
    'more_info'       -- admin requested additional documentation
  )),

  -- Admin review
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  reviewer_notes text,
  rejection_reason text,

  -- Meta
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kyc_queue enable row level security;

create policy "Admins manage KYC queue" on public.kyc_queue
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );
create policy "Buyers can view their KYC status" on public.kyc_queue
  for select using (buyer_id = auth.uid());

create index idx_kyc_queue_status on public.kyc_queue(status) where status = 'pending';
create index idx_kyc_queue_order on public.kyc_queue(order_id);

-- ═══════════════════════════════════════════════════
-- retirement_instructions — Admin-actionable registry retirement
-- Emitted when order reaches 'settled' status.
-- Admin must log into Verra/GS/ACR registry and execute transfer,
-- then update this record with serial numbers.
-- ═══════════════════════════════════════════════════

create table if not exists public.retirement_instructions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.cb_orders(id) on delete cascade,
  listing_id uuid not null references public.listings(id),

  quantity_tonnes integer not null check (quantity_tonnes > 0),

  -- Instruction payload (JSON blob with context for admin)
  payload jsonb default '{}',

  -- Execution tracking
  status text not null default 'pending_admin_action' check (status in (
    'pending_admin_action',  -- payment captured, admin must act
    'in_progress',           -- admin has initiated on registry
    'completed',             -- registry transfer confirmed
    'failed'                 -- registry transfer failed
  )),

  -- Registry confirmation
  registry_serial_numbers text[],
  registry_transaction_ref text,
  registry_confirmed_at timestamptz,

  -- Admin
  executed_by uuid references public.profiles(id),
  notes text,

  -- Meta
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.retirement_instructions enable row level security;

create policy "Admins manage retirement instructions" on public.retirement_instructions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'super_admin'))
  );

create index idx_retirement_status on public.retirement_instructions(status) where status = 'pending_admin_action';
create index idx_retirement_order on public.retirement_instructions(order_id);

-- ═══════════════════════════════════════════════════
-- Trigger: auto-update updated_at on cb_orders
-- ═══════════════════════════════════════════════════

create or replace function update_cb_orders_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cb_orders_updated_at
  before update on public.cb_orders
  for each row execute function update_cb_orders_updated_at();

create trigger kyc_queue_updated_at
  before update on public.kyc_queue
  for each row execute function update_cb_orders_updated_at();

create trigger retirement_instructions_updated_at
  before update on public.retirement_instructions
  for each row execute function update_cb_orders_updated_at();

-- ═══════════════════════════════════════════════════
-- Admin function: approve KYC and transition order to pending_payment
-- ═══════════════════════════════════════════════════

create or replace function admin_approve_kyc(p_kyc_id uuid, p_reviewer_id uuid, p_notes text default null)
returns jsonb as $$
declare
  v_kyc record;
  v_order_id uuid;
begin
  select * into v_kyc from public.kyc_queue where id = p_kyc_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'KYC entry not found');
  end if;

  if v_kyc.status != 'pending' then
    return jsonb_build_object('success', false, 'error', 'KYC entry is not in pending status');
  end if;

  v_order_id := v_kyc.order_id;

  -- Update KYC entry
  update public.kyc_queue
  set status = 'approved',
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      reviewer_notes = p_notes,
      updated_at = now()
  where id = p_kyc_id;

  -- Transition order to pending_payment
  update public.cb_orders
  set status = 'pending_payment',
      updated_at = now()
  where id = v_order_id and status = 'pending_kyc';

  return jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'new_status', 'pending_payment'
  );
end;
$$ language plpgsql security definer;

-- ═══════════════════════════════════════════════════
-- Admin function: reject KYC and release reservation
-- ═══════════════════════════════════════════════════

create or replace function admin_reject_kyc(
  p_kyc_id uuid,
  p_reviewer_id uuid,
  p_reason text
)
returns jsonb as $$
declare
  v_kyc record;
  v_order record;
begin
  select * into v_kyc from public.kyc_queue where id = p_kyc_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'KYC entry not found');
  end if;

  select * into v_order from public.cb_orders where id = v_kyc.order_id;

  -- Update KYC
  update public.kyc_queue
  set status = 'rejected',
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      rejection_reason = p_reason,
      updated_at = now()
  where id = p_kyc_id;

  -- Cancel order
  update public.cb_orders
  set status = 'cancelled',
      credits_released = true,
      updated_at = now()
  where id = v_order.id;

  -- Release reservation on listing
  update public.listings
  set available_tonnes = available_tonnes + v_order.quantity,
      reserved_tonnes = greatest(0, reserved_tonnes - v_order.quantity),
      updated_at = now()
  where id = v_order.listing_id;

  return jsonb_build_object(
    'success', true,
    'order_id', v_order.id,
    'released_tonnes', v_order.quantity
  );
end;
$$ language plpgsql security definer;
