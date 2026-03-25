import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// Settlement Workflow (V4.1 Part 7)
// State machine: pending → buyer_paid → credits_transferred → completed

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

  const { order_id, action, payment_reference, verra_transfer_ref, notes } = await req.json();

  if (!order_id || !action) {
    return NextResponse.json({ error: 'order_id and action required' }, { status: 400 });
  }

  // Get current settlement state
  let { data: settlement } = await supabase
    .from('settlements')
    .select('*')
    .eq('order_id', order_id)
    .single();

  // If no settlement exists, create one
  if (!settlement) {
    const { data: newSettlement, error } = await supabase
      .from('settlements')
      .insert({ order_id, status: 'pending' })
      .select()
      .single();
    if (error) return NextResponse.json({ error: 'Failed to create settlement' }, { status: 500 });
    settlement = newSettlement;
  }

  // State machine transitions
  const transitions: Record<string, { from: string[]; to: string; required?: string[] }> = {
    'confirm_payment': { from: ['pending'], to: 'buyer_paid', required: ['payment_reference'] },
    'initiate_transfer': { from: ['buyer_paid'], to: 'credits_transferred' },
    'confirm_delivery': { from: ['credits_transferred'], to: 'completed', required: ['verra_transfer_ref'] },
    'flag_dispute': { from: ['pending', 'buyer_paid', 'credits_transferred'], to: 'disputed' },
    'resolve_dispute': { from: ['disputed'], to: 'buyer_paid' },
    'mark_failed': { from: ['pending', 'buyer_paid', 'disputed'], to: 'failed' },
  };

  const transition = transitions[action];
  if (!transition) {
    return NextResponse.json({ error: `Unknown action: ${action}`, valid_actions: Object.keys(transitions) }, { status: 400 });
  }

  if (!transition.from.includes(settlement.status)) {
    return NextResponse.json({
      error: `Cannot ${action} from status '${settlement.status}'`,
      current_status: settlement.status,
      valid_from: transition.from,
    }, { status: 409 });
  }

  // Build update
  const update: Record<string, unknown> = {
    status: transition.to,
    updated_at: new Date().toISOString(),
  };
  if (notes) update.notes = notes;
  if (action === 'confirm_payment') {
    update.payment_received_at = new Date().toISOString();
    update.payment_amount = 0; // Will be set from order total
    update.payment_reference = payment_reference;
  }
  if (action === 'confirm_delivery') {
    update.credits_transferred_at = new Date().toISOString();
    update.verra_transfer_ref = verra_transfer_ref;
    update.completed_at = new Date().toISOString();
  }

  const { error: updateErr } = await supabase
    .from('settlements')
    .update(update)
    .eq('id', settlement.id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Update order status to match
  const orderStatusMap: Record<string, string> = {
    'buyer_paid': 'payment_received',
    'credits_transferred': 'transfer_in_progress',
    'completed': 'completed',
    'failed': 'cancelled',
    'disputed': 'disputed',
  };
  if (orderStatusMap[transition.to]) {
    await supabase.from('orders').update({ status: orderStatusMap[transition.to] }).eq('id', order_id);
  }

  // If completed, generate retirement certificate trigger
  if (transition.to === 'completed') {
    const { data: order } = await supabase.from('orders').select('buyer_id, listing_id, quantity').eq('id', order_id).single();
    const { data: listing } = await supabase.from('listings').select('registry, project_name').eq('id', order?.listing_id).single();
    
    if (order && listing) {
      const { data: buyer } = await supabase.from('profiles').select('company_name').eq('id', order.buyer_id).single();
      await supabase.from('retirement_certificates').insert({
        order_id,
        buyer_id: order.buyer_id,
        registry: listing.registry,
        tonnes_retired: order.quantity,
        beneficiary_name: buyer?.company_name || 'Unknown',
        retirement_reason: 'Voluntary offset',
        status: 'pending',
      });
    }

    // Create admin alert
    await supabase.from('admin_alerts').insert({
      type: 'settlement_completed',
      severity: 'info',
      title: `Settlement completed for order ${order_id}`,
      message: `${verra_transfer_ref || 'No ref'} — retirement certificate pending generation`,
      action_url: `/admin/orders`,
    });
  }

  // Log activity
  await supabase.from('activity_log').insert({
    user_id: user.id,
    action: `settlement_${action}`,
    entity_type: 'settlement',
    entity_id: settlement.id,
    metadata: { order_id, from: settlement.status, to: transition.to, payment_reference, verra_transfer_ref },
  });

  return NextResponse.json({
    settlement_id: settlement.id,
    previous_status: settlement.status,
    new_status: transition.to,
    message: `Settlement ${action} successful`,
  });
}
