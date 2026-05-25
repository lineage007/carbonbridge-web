import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// ─── Orders API ───────────────────────────────────────────────────────────────
// POST /api/orders — create an order from a listing (reserve credits, initiate KYC gate)
// GET  /api/orders — fetch caller's orders (buyer or seller perspective)
//
// Order status flow:
//   pending_kyc  → buyer submitted, awaiting admin KYC review
//   pending_payment → KYC approved, awaiting Stripe / bank transfer
//   payment_processing → Stripe PaymentIntent created, awaiting capture
//   settled     → payment captured, credits to be transferred
//   retired     → registry retirement instruction emitted
//   cancelled   → failed / refunded

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { listing_id, quantity, business_name, business_country, intended_use, payment_method } = body;

    // Validate required fields
    if (!listing_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'listing_id and positive quantity are required' },
        { status: 400 }
      );
    }
    if (!business_name || !business_country) {
      return NextResponse.json(
        { error: 'business_name and business_country are required for KYC pre-screening' },
        { status: 400 }
      );
    }
    if (!payment_method || !['card', 'bank_transfer'].includes(payment_method)) {
      return NextResponse.json(
        { error: "payment_method must be 'card' or 'bank_transfer'" },
        { status: 400 }
      );
    }

    // Fetch listing — must be active
    const { data: listing, error: listErr } = await supabase
      .from('listings')
      .select('id, seller_id, available_tonnes, reserved_tonnes, price_per_tonne, project_name, credit_type, registry, vintage_year, methodology, quality_rating, status')
      .eq('id', listing_id)
      .eq('status', 'active')
      .single();

    if (listErr || !listing) {
      return NextResponse.json(
        { error: 'Listing not found or not active' },
        { status: 404 }
      );
    }

    if (listing.available_tonnes < quantity) {
      return NextResponse.json(
        {
          error: 'Insufficient available volume',
          available: listing.available_tonnes,
          requested: quantity,
        },
        { status: 409 }
      );
    }

    // Prevent self-dealing
    if (listing.seller_id === user.id) {
      return NextResponse.json(
        { error: 'Sellers cannot purchase their own listings' },
        { status: 422 }
      );
    }

    // Calculate financials
    const unit_price = listing.price_per_tonne;
    const credit_total = unit_price * quantity;
    const platform_fee_pct = 3.00; // 3% CarbonBridge commission
    const platform_fee_amount = credit_total * (platform_fee_pct / 100);
    const total_amount = credit_total + platform_fee_amount;

    // Atomic reserve: update available_tonnes with optimistic lock
    const { error: reserveErr } = await supabase
      .from('listings')
      .update({
        available_tonnes: listing.available_tonnes - quantity,
        reserved_tonnes: (listing.reserved_tonnes || 0) + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing_id)
      .eq('available_tonnes', listing.available_tonnes); // optimistic lock

    if (reserveErr) {
      return NextResponse.json(
        { error: 'Reservation conflict — credits may have been taken simultaneously. Please retry.' },
        { status: 409 }
      );
    }

    // Payment deadline: 24h for card, 5 business days for bank transfer
    const reservationExpiry = new Date();
    if (payment_method === 'bank_transfer') {
      reservationExpiry.setDate(reservationExpiry.getDate() + 5);
    } else {
      reservationExpiry.setHours(reservationExpiry.getHours() + 24);
    }

    // Create order in pending_kyc state
    const { data: order, error: orderErr } = await supabase
      .from('cb_orders')
      .insert({
        buyer_id: user.id,
        seller_id: listing.seller_id,
        listing_id,
        project_name: listing.project_name,
        credit_type: listing.credit_type,
        registry: listing.registry,
        vintage_year: listing.vintage_year,
        quantity,
        unit_price,
        credit_total,
        platform_fee_pct,
        platform_fee_amount,
        total_amount,
        payment_method,
        status: 'pending_kyc',
        credits_reserved: true,
        reservation_expires_at: reservationExpiry.toISOString(),
        // KYC pre-screening fields
        kyc_business_name: business_name,
        kyc_business_country: business_country,
        kyc_intended_use: intended_use || null,
      })
      .select('id, status, total_amount, reservation_expires_at')
      .single();

    if (orderErr) {
      // Roll back reservation
      await supabase
        .from('listings')
        .update({
          available_tonnes: listing.available_tonnes,
          reserved_tonnes: listing.reserved_tonnes,
        })
        .eq('id', listing_id);
      return NextResponse.json({ error: 'Order creation failed', detail: orderErr.message }, { status: 500 });
    }

    // Create KYC queue entry for admin review
    await supabase.from('kyc_queue').insert({
      order_id: order.id,
      buyer_id: user.id,
      business_name,
      business_country,
      intended_use: intended_use || null,
      status: 'pending',
    });

    // Notify admin
    await supabase.from('admin_alerts').insert({
      priority: 'amber',
      alert_type: 'kyc_review_required',
      title: `KYC required: ${quantity} tCO₂e order pending`,
      entity_type: 'order',
      entity_id: order.id,
      action_url: `/admin/orders`,
    });

    // Activity log
    await supabase.from('activity_log').insert({
      actor_id: user.id,
      action: 'order_created',
      entity_type: 'order',
      entity_id: order.id,
      details: {
        listing_id,
        project: listing.project_name,
        quantity,
        total_amount,
        payment_method,
        kyc_status: 'pending',
      },
    });

    return NextResponse.json(
      {
        order_id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        reservation_expires_at: order.reservation_expires_at,
        next_step: 'KYC review in progress — you will receive an email when approved to proceed to payment.',
        breakdown: {
          credit_total,
          platform_fee_pct,
          platform_fee_amount,
          total_amount,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[orders POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const perspective = searchParams.get('as') || 'buyer'; // 'buyer' | 'seller'
    const status = searchParams.get('status');

    let query = supabase
      .from('cb_orders')
      .select('*, listing:listings(project_name, credit_type, registry, methodology, quality_rating, country, vintage_year)')
      .order('created_at', { ascending: false });

    if (perspective === 'seller') {
      query = query.eq('seller_id', user.id);
    } else {
      query = query.eq('buyer_id', user.id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (err) {
    console.error('[orders GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
