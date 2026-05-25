import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// ─── Stripe Checkout — PaymentIntent creation ────────────────────────────────
//
// Requires: STRIPE_SECRET_KEY (test key only — never deploy with live keys
// without Gary's explicit approval per CLAUDE.md)
//
// POST /api/stripe/checkout
//   Body: { order_id }
//   Creates a PaymentIntent for the order total.
//   Returns: { client_secret, amount, currency }
//
// The buyer uses client_secret on the front-end to confirm payment with
// Stripe.js / Elements. On webhook capture → order transitions to settled.

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: 'Stripe not configured. Contact support.' },
      { status: 503 }
    );
  }

  // Enforce test-key guard — never charge live without Gary approval
  if (!stripeKey.startsWith('sk_test_')) {
    console.error('[stripe/checkout] LIVE KEY DETECTED — aborting. Must use test keys until Gary authorises live deployment.');
    return NextResponse.json(
      { error: 'Payment processor in maintenance mode. Contact support.' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id } = await req.json();
    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Fetch order — must belong to caller and be in pending_payment status
    const { data: order, error: orderErr } = await supabase
      .from('cb_orders')
      .select('id, buyer_id, total_amount, status, stripe_payment_intent_id, project_name, quantity, credit_type')
      .eq('id', order_id)
      .eq('buyer_id', user.id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found or not yours' }, { status: 404 });
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.json(
        {
          error: `Order is in status '${order.status}' — payment can only be initiated for orders in 'pending_payment' status.`,
          current_status: order.status,
        },
        { status: 409 }
      );
    }

    // Re-use existing PaymentIntent if already created (idempotency)
    if (order.stripe_payment_intent_id) {
      const existingPi = await fetchStripePaymentIntent(stripeKey, order.stripe_payment_intent_id);
      if (existingPi && existingPi.status === 'requires_payment_method') {
        return NextResponse.json({
          client_secret: existingPi.client_secret,
          amount: existingPi.amount,
          currency: existingPi.currency,
          payment_intent_id: existingPi.id,
          reused: true,
        });
      }
    }

    // Amount in cents
    const amountCents = Math.round(order.total_amount * 100);

    // Create PaymentIntent via Stripe REST API (no SDK — avoids adding dependency)
    const piResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amountCents.toString(),
        currency: 'usd',
        'metadata[order_id]': order_id,
        'metadata[buyer_id]': user.id,
        'metadata[project]': order.project_name,
        'metadata[quantity]': order.quantity.toString(),
        'metadata[credit_type]': order.credit_type,
        description: `CarbonBridge: ${order.quantity} tCO₂e — ${order.project_name}`,
        // capture_method defaults to 'automatic' — captured on confirmation
      }).toString(),
    });

    if (!piResponse.ok) {
      const piError = await piResponse.json();
      console.error('[stripe/checkout] PaymentIntent creation failed', piError);
      return NextResponse.json(
        { error: 'Payment processor error. Please try again.' },
        { status: 502 }
      );
    }

    const pi = await piResponse.json();

    // Store PaymentIntent ID on order, transition to payment_processing
    await supabase
      .from('cb_orders')
      .update({
        stripe_payment_intent_id: pi.id,
        status: 'payment_processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    await supabase.from('activity_log').insert({
      actor_id: user.id,
      action: 'payment_intent_created',
      entity_type: 'order',
      entity_id: order_id,
      details: { payment_intent_id: pi.id, amount: amountCents, currency: 'usd' },
    });

    return NextResponse.json({
      client_secret: pi.client_secret,
      amount: pi.amount,
      currency: pi.currency,
      payment_intent_id: pi.id,
    });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function fetchStripePaymentIntent(secretKey: string, piId: string) {
  try {
    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${piId}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
