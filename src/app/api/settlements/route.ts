import { createClient, createServiceClient } from '@/lib/supabase-server';
import {
  ADMIN_OR_SELLER_ACTIONS,
  SETTLEMENT_ACTIONS,
  SETTLEMENT_TRANSITIONS,
  buildSettlementUpdate,
  canTransition,
  isSettlementAction,
  missingRequiredFields,
  orderStatusForTransition,
  resolveTargetStatus,
} from '@/lib/settlement';
import { NextRequest, NextResponse } from 'next/server';

// Settlement Workflow (V4.1 Part 7)
// State machine: pending → buyer_paid → credits_transferred → completed
//
// The transitions themselves live in src/lib/settlement.ts (review finding 5);
// this route does auth, I/O and side effects only. Writes to `settlements`,
// `orders` and `retirement_certificates` use the service-role client because
// 005_phase1_contract_alignment.sql restricts direct writes on those tables to
// admins — the route's own authorisation checks below are the gate.

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const orderId = searchParams.get('order_id');

  let query = supabase.from('settlements').select('*, orders(*, listings(project_name, credit_type), profiles!orders_buyer_id_fkey(company_name))');
  
  if (!isAdmin) {
    // Regular users only see their own settlements
    query = query.eq('orders.buyer_id', user.id);
  }
  if (status) query = query.eq('status', status);
  if (orderId) query = query.eq('order_id', orderId);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ settlements: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { order_id, action, payment_reference, verra_transfer_ref, notes, target_status } =
    await req.json();

  if (!order_id || !action) {
    return NextResponse.json({ error: 'order_id and action required' }, { status: 400 });
  }

  // Fetch the order to verify ownership before any state transition
  const { data: order } = await supabase
    .from('orders')
    .select('id, buyer_id, seller_id, total_amount')
    .eq('id', order_id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Determine the caller's role — fetch profile for admin check
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  const isAdmin =
    callerProfile?.role === 'admin' || callerProfile?.role === 'super_admin';

  // Actions restricted to admin or seller only
  const adminOrSellerActions: string[] = ADMIN_OR_SELLER_ACTIONS;
  // Actions restricted to buyer, seller, or admin (i.e. no random user)
  const isParty =
    user.id === order.buyer_id || user.id === order.seller_id || isAdmin;

  if (!isParty) {
    return NextResponse.json({ error: 'Forbidden — not a party to this order' }, { status: 403 });
  }

  if (adminOrSellerActions.includes(action)) {
    const isAdminOrSeller = isAdmin || user.id === order.seller_id;
    if (!isAdminOrSeller) {
      return NextResponse.json(
        { error: `Forbidden — action '${action}' requires admin or seller role` },
        { status: 403 },
      );
    }
  }

  if (!isSettlementAction(action)) {
    return NextResponse.json(
      { error: `Unknown action: ${action}`, valid_actions: SETTLEMENT_ACTIONS },
      { status: 400 },
    );
  }

  const missing = missingRequiredFields(action, { payment_reference, verra_transfer_ref });
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required field(s) for '${action}': ${missing.join(', ')}` },
      { status: 400 },
    );
  }

  // RLS write gate — see the module header.
  const admin = createServiceClient();

  // Get current settlement state
  let { data: settlement } = await supabase
    .from('settlements')
    .select('*')
    .eq('order_id', order_id)
    .single();

  // If no settlement exists, create one
  if (!settlement) {
    const { data: newSettlement, error } = await admin
      .from('settlements')
      .insert({ order_id, status: 'pending' })
      .select()
      .single();
    if (error) return NextResponse.json({ error: 'Failed to create settlement' }, { status: 500 });
    settlement = newSettlement;
  }

  const transition = SETTLEMENT_TRANSITIONS[action];

  if (!canTransition(settlement.status, action)) {
    return NextResponse.json({
      error: `Cannot ${action} from status '${settlement.status}'`,
      current_status: settlement.status,
      valid_from: transition.from,
    }, { status: 409 });
  }

  // A dispute resolves back into whatever status preceded it — resolving a
  // dispute raised from `pending` must not assert a payment (finding 3).
  const targetStatus = resolveTargetStatus(action, {
    previousStatus: settlement.previous_status,
    targetStatus: target_status,
  });

  const update = buildSettlementUpdate(action, {
    now: new Date(),
    fromStatus: settlement.status,
    previousStatus: settlement.previous_status,
    targetStatus: target_status,
    paymentReference: payment_reference,
    paymentAmount: order.total_amount ?? null,
    verraTransferRef: verra_transfer_ref,
    notes,
  });

  const { error: updateErr } = await admin
    .from('settlements')
    .update(update)
    .eq('id', settlement.id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Update order status to match
  const nextOrderStatus = orderStatusForTransition(action, targetStatus);
  if (nextOrderStatus) {
    await admin.from('orders').update({ status: nextOrderStatus }).eq('id', order_id);
  }

  // If completed, generate retirement certificate trigger
  if (targetStatus === 'completed') {
    const { data: order } = await supabase.from('orders').select('buyer_id, listing_id, quantity').eq('id', order_id).single();
    const { data: listing } = await supabase.from('listings').select('registry, project_name').eq('id', order?.listing_id).single();
    
    if (order && listing) {
      const { data: buyer } = await supabase.from('profiles').select('company_name').eq('id', order.buyer_id).single();
      await admin.from('retirement_certificates').insert({
        order_id,
        buyer_id: order.buyer_id,
        registry: listing.registry,
        tonnes_retired: order.quantity,
        beneficiary_name: buyer?.company_name || 'Unknown',
        retirement_reason: 'Voluntary offset',
        status: 'pending',
      });
    }

    // Create admin alert (schema: priority in ('red','amber','blue'), alert_type text)
    await supabase.from('admin_alerts').insert({
      priority: 'blue',
      alert_type: 'settlement_completed',
      title: `Settlement completed for order ${order_id}`,
      entity_type: 'order',
      entity_id: order_id,
      action_url: `/admin/orders`,
    });
  }

  // Log activity
  await supabase.from('activity_log').insert({
    actor_id: user.id,
    action: `settlement_${action}`,
    entity_type: 'settlement',
    entity_id: settlement.id,
    details: { order_id, from: settlement.status, to: targetStatus, payment_reference, verra_transfer_ref },
  });

  return NextResponse.json({
    settlement_id: settlement.id,
    previous_status: settlement.status,
    new_status: targetStatus,
    message: `Settlement ${action} successful`,
  });
}
