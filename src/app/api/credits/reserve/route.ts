import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// Credit Locking / Reservation System (V4.1 Part 6)
// POST: Reserve credits for 24 hours pending payment
// DELETE: Release expired reservations

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { listing_id, quantity } = await req.json();
    if (!listing_id || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'listing_id and positive quantity required' }, { status: 400 });
    }

    // Check availability
    const { data: listing, error: listErr } = await supabase
      .from('listings')
      .select('id, available_tonnes, reserved_tonnes, price_per_tonne, project_name')
      .eq('id', listing_id)
      .eq('status', 'active')
      .single();

    if (listErr || !listing) {
      return NextResponse.json({ error: 'Listing not found or not active' }, { status: 404 });
    }

    if (listing.available_tonnes < quantity) {
      return NextResponse.json({
        error: 'Insufficient available credits',
        available: listing.available_tonnes,
        requested: quantity,
      }, { status: 409 });
    }

    // Reserve credits (atomic update)
    const { error: updateErr } = await supabase
      .from('listings')
      .update({
        available_tonnes: listing.available_tonnes - quantity,
        reserved_tonnes: (listing.reserved_tonnes || 0) + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing_id)
      .eq('available_tonnes', listing.available_tonnes); // Optimistic lock

    if (updateErr) {
      return NextResponse.json({ error: 'Reservation failed — credits may have been taken' }, { status: 409 });
    }

    // Create order with 24-hour payment deadline
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 24);

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        listing_id,
        quantity,
        unit_price: listing.price_per_tonne,
        total_amount: listing.price_per_tonne * quantity,
        status: 'pending_payment',
        payment_deadline: deadline.toISOString(),
        reservation_expires_at: deadline.toISOString(),
      })
      .select('id, total_amount, payment_deadline')
      .single();

    if (orderErr) {
      // Rollback reservation
      await supabase.from('listings').update({
        available_tonnes: listing.available_tonnes,
        reserved_tonnes: listing.reserved_tonnes,
      }).eq('id', listing_id);
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'credit_reserved',
      entity_type: 'order',
      entity_id: order.id,
      metadata: { listing_id, quantity, project: listing.project_name, expires: deadline.toISOString() },
    });

    return NextResponse.json({
      order_id: order.id,
      credits_reserved: quantity,
      total_amount: order.total_amount,
      payment_deadline: order.payment_deadline,
      message: `${quantity} tCO₂e reserved for 24 hours. Payment required by ${deadline.toISOString()}.`,
    }, { status: 201 });

  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Release expired reservations (called by cron or admin)
export async function DELETE() {
  try {
    const supabase = await createClient();
    
    // Find expired reservations
    const { data: expired } = await supabase
      .from('orders')
      .select('id, listing_id, quantity')
      .eq('status', 'pending_payment')
      .lt('reservation_expires_at', new Date().toISOString());

    if (!expired || expired.length === 0) {
      return NextResponse.json({ released: 0 });
    }

    let released = 0;
    for (const order of expired) {
      // Release credits back to listing
      const { data: listing } = await supabase
        .from('listings')
        .select('available_tonnes, reserved_tonnes')
        .eq('id', order.listing_id)
        .single();

      if (listing) {
        await supabase.from('listings').update({
          available_tonnes: listing.available_tonnes + order.quantity,
          reserved_tonnes: Math.max(0, (listing.reserved_tonnes || 0) - order.quantity),
        }).eq('id', order.listing_id);
      }

      // Mark order as expired
      await supabase.from('orders').update({ status: 'expired' }).eq('id', order.id);

      // Log
      await supabase.from('activity_log').insert({
        action: 'reservation_expired',
        entity_type: 'order',
        entity_id: order.id,
        metadata: { listing_id: order.listing_id, quantity: order.quantity },
      });

      released++;
    }

    return NextResponse.json({ released, message: `${released} expired reservations released` });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
