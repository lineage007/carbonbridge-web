import { createClient } from '@/lib/supabase-server';
import {
  ReserveRequestSchema,
  RESERVABLE_LISTING_COLUMNS,
  RESERVATION_WINDOW_HOURS,
  applyReservationToListing,
  buildReservationOrder,
  releaseReservationFromListing,
  reservationExpiry,
  type ReservableListing,
} from '@/lib/reservation';
import { NextRequest, NextResponse } from 'next/server';

// Credit Locking / Reservation System (V4.1 Part 6)
// POST: Reserve credits for 24 hours pending payment
// DELETE: Release expired reservations
//
// Schema contract: every column written here exists in
// supabase/migrations/001_initial_schema.sql, with status 'pending_payment'
// coming from 002_fix_order_status_pending_payment.sql. The reservation
// deadline lives in orders.reservation_expires_at — there is no
// `payment_deadline` column, so the response field of that name is derived
// from it for API compatibility.

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = ReserveRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'listing_id (uuid) and positive integer quantity required', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { listing_id, quantity, payment_method } = parsed.data;

    // Check availability. The seller/credit columns are needed because orders
    // declares seller_id, project_name, credit_type and registry NOT NULL.
    const { data: listing, error: listErr } = await supabase
      .from('listings')
      .select(RESERVABLE_LISTING_COLUMNS)
      .eq('id', listing_id)
      .eq('status', 'active')
      .single<ReservableListing>();

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
        ...applyReservationToListing(listing, quantity),
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing_id)
      .eq('available_tonnes', listing.available_tonnes); // Optimistic lock

    if (updateErr) {
      return NextResponse.json({ error: 'Reservation failed — credits may have been taken' }, { status: 409 });
    }

    // Create order with a 24-hour payment deadline
    const expiresAt = reservationExpiry();

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert(buildReservationOrder({
        buyerId: user.id,
        listing,
        quantity,
        paymentMethod: payment_method,
        expiresAt,
      }))
      .select('id, order_ref, total_amount, reservation_expires_at')
      .single();

    if (orderErr || !order) {
      // Rollback reservation
      await supabase.from('listings').update({
        available_tonnes: listing.available_tonnes,
        reserved_tonnes: listing.reserved_tonnes ?? 0,
      }).eq('id', listing_id);
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      actor_id: user.id,
      action: 'credit_reserved',
      entity_type: 'order',
      entity_id: order.id,
      details: { listing_id, quantity, project: listing.project_name, expires: expiresAt.toISOString() },
    });

    return NextResponse.json({
      order_id: order.id,
      order_ref: order.order_ref,
      credits_reserved: quantity,
      total_amount: order.total_amount,
      reservation_expires_at: order.reservation_expires_at,
      // Retained for API compatibility; sourced from reservation_expires_at.
      payment_deadline: order.reservation_expires_at,
      message: `${quantity} tCO₂e reserved for ${RESERVATION_WINDOW_HOURS} hours. Payment required by ${expiresAt.toISOString()}.`,
    }, { status: 201 });

  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Release expired reservations (called by cron or admin)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Require either a valid admin/super_admin session or a shared cron secret header
    const cronSecret = req.headers.get('x-cron-secret');
    const validCronSecret =
      cronSecret &&
      process.env.CRON_SECRET &&
      cronSecret === process.env.CRON_SECRET;

    if (!validCronSecret) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      const isAdmin =
        profile?.role === 'admin' || profile?.role === 'super_admin';
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
      }
    }

    // Find expired reservations that have not already been released
    const { data: expired } = await supabase
      .from('orders')
      .select('id, listing_id, quantity')
      .eq('status', 'pending_payment')
      .eq('credits_released', false)
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
        await supabase
          .from('listings')
          .update(releaseReservationFromListing(listing, order.quantity))
          .eq('id', order.listing_id);
      }

      // Mark order as expired and flag the credits as returned to the pool, so
      // a second sweep cannot double-credit the listing.
      await supabase.from('orders').update({
        status: 'expired',
        credits_reserved: false,
        credits_released: true,
        updated_at: new Date().toISOString(),
      }).eq('id', order.id);

      // Log
      await supabase.from('activity_log').insert({
        action: 'reservation_expired',
        entity_type: 'order',
        entity_id: order.id,
        details: { listing_id: order.listing_id, quantity: order.quantity },
      });

      released++;
    }

    return NextResponse.json({ released, message: `${released} expired reservations released` });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
