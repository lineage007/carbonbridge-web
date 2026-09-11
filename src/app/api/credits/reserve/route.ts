import { createClient, createServiceClient } from '@/lib/supabase-server';
import { ReserveRequestSchema, RESERVATION_WINDOW_HOURS, reservationExpiry } from '@/lib/reservation';
import { reserveCreditsError } from '@/lib/rpc-errors';
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
//
// Atomicity: both handlers delegate their read-then-write sequence to a
// SECURITY DEFINER function from 006_phase1_atomic_operations.sql, called
// through the service-role client AFTER this route's own authorisation checks.
// The availability check, the counter update and the order insert now share one
// transaction, which the previous optimistic lock could narrow but not close.
// Business failures come back as P0001 exceptions whose messages
// src/lib/rpc-errors.ts maps to the same 404/409 responses as before.

/** Row shape returned by public.reserve_credits (RETURNS TABLE). */
interface ReservedOrderRow {
  id: string;
  order_ref: string | null;
  total_amount: number;
  reservation_expires_at: string;
  project_name: string | null;
}

/** Row shape returned by public.release_expired_reservations (RETURNS TABLE). */
interface ReleasedReservationRow {
  order_id: string;
  listing_id: string;
  quantity: number;
}

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

    // Create order with a 24-hour payment deadline. Locking the listing,
    // moving the counters and inserting the order all happen inside
    // reserve_credits, so there is no window for a concurrent reservation to
    // pass the same availability check, and no rollback path to get wrong: a
    // failed insert rolls the counter update back with it.
    const expiresAt = reservationExpiry();
    const admin = createServiceClient();

    const { data: reserved, error: rpcErr } = await admin.rpc('reserve_credits', {
      p_listing_id: listing_id,
      p_quantity: quantity,
      p_buyer_id: user.id,
      p_payment_method: payment_method,
      p_expires_at: expiresAt.toISOString(),
    });

    if (rpcErr) {
      const mapped = reserveCreditsError(rpcErr.message, { requested: quantity });
      if (mapped) return NextResponse.json(mapped.body, { status: mapped.status });
      return NextResponse.json({ error: 'Reservation failed — credits may have been taken' }, { status: 409 });
    }

    const order = (reserved as ReservedOrderRow[] | null)?.[0];
    if (!order) {
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
    }

    // Log activity
    await admin.from('activity_log').insert({
      actor_id: user.id,
      action: 'credit_reserved',
      entity_type: 'order',
      entity_id: order.id,
      details: { listing_id, quantity, project: order.project_name, expires: expiresAt.toISOString() },
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

    // Find and release expired reservations. The sweep runs entirely inside
    // release_expired_reservations: each order is locked with SKIP LOCKED,
    // marked released and credited back to its listing in one transaction, so
    // two concurrent sweeps split the backlog instead of both crediting the
    // same order. The activity_log rows are written here, from the ids the
    // function reports back.
    const admin = createServiceClient();

    const { data: releasedRows, error: rpcErr } = await admin.rpc('release_expired_reservations');

    if (rpcErr) {
      return NextResponse.json({ error: 'Release failed' }, { status: 500 });
    }

    const rows = (releasedRows as ReleasedReservationRow[] | null) ?? [];

    if (rows.length === 0) {
      return NextResponse.json({ released: 0 });
    }

    for (const row of rows) {
      await admin.from('activity_log').insert({
        action: 'reservation_expired',
        entity_type: 'order',
        entity_id: row.order_id,
        details: { listing_id: row.listing_id, quantity: row.quantity },
      });
    }

    const released = rows.length;
    return NextResponse.json({ released, message: `${released} expired reservations released` });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
