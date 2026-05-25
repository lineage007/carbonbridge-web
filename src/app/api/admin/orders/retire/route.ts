import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// Admin: mark an order as retired after registry transfer is confirmed
// POST { order_id, registry_transaction_ref }

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { order_id, registry_transaction_ref } = await req.json();

    if (!order_id || !registry_transaction_ref) {
      return NextResponse.json({ error: 'order_id and registry_transaction_ref required' }, { status: 400 });
    }

    // Verify order is in settled status
    const { data: order } = await supabase
      .from('cb_orders')
      .select('id, status, listing_id, quantity')
      .eq('id', order_id)
      .single();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status !== 'settled') {
      return NextResponse.json({ error: `Order must be in 'settled' status, currently '${order.status}'` }, { status: 409 });
    }

    // Update order to retired
    await supabase
      .from('cb_orders')
      .update({ status: 'retired', updated_at: new Date().toISOString() })
      .eq('id', order_id);

    // Update retirement instruction
    await supabase
      .from('retirement_instructions')
      .update({
        status: 'completed',
        registry_transaction_ref,
        registry_confirmed_at: new Date().toISOString(),
        executed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', order_id);

    // Release reserved_tonnes from listing (transfer complete)
    const { data: listing } = await supabase
      .from('listings')
      .select('reserved_tonnes')
      .eq('id', order.listing_id)
      .single();

    if (listing) {
      await supabase
        .from('listings')
        .update({
          reserved_tonnes: Math.max(0, (listing.reserved_tonnes || 0) - order.quantity),
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.listing_id);
    }

    await supabase.from('activity_log').insert({
      actor_id: user.id,
      action: 'order_retired',
      entity_type: 'order',
      entity_id: order_id,
      details: { registry_transaction_ref, quantity: order.quantity },
    });

    return NextResponse.json({
      success: true,
      order_id,
      new_status: 'retired',
      registry_transaction_ref,
    });
  } catch (err) {
    console.error('[admin/orders/retire POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
