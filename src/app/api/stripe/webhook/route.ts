import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// ─── Stripe Webhook Handler ───────────────────────────────────────────────────
//
// Processes payment_intent.succeeded and payment_intent.payment_failed events.
// Endpoint must be registered in Stripe dashboard:
//   https://dashboard.stripe.com/test/webhooks
//   URL: https://<your-domain>/api/stripe/webhook
//   Events to subscribe: payment_intent.succeeded, payment_intent.payment_failed
//
// Webhook secret: STRIPE_WEBHOOK_SECRET env var.
// This route transitions orders from payment_processing → settled on success.

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  // Verify webhook signature (HMAC-SHA256 without Stripe SDK)
  let event: StripeEvent;
  try {
    event = await verifyStripeWebhook(body, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const orderId = pi.metadata?.order_id;

      if (!orderId) {
        console.warn('[stripe/webhook] payment_intent.succeeded without order_id metadata', pi.id);
        return NextResponse.json({ received: true });
      }

      // Fetch order
      const { data: order } = await supabase
        .from('cb_orders')
        .select('id, status, quantity, seller_id, listing_id, platform_fee_amount, total_amount')
        .eq('id', orderId)
        .single();

      if (!order) {
        console.error('[stripe/webhook] Order not found for PI', pi.id, orderId);
        return NextResponse.json({ received: true }); // Return 200 so Stripe doesn't retry
      }

      if (order.status !== 'payment_processing') {
        // Already processed — idempotent
        return NextResponse.json({ received: true });
      }

      // Transition order to settled
      await supabase
        .from('cb_orders')
        .update({
          status: 'settled',
          payment_status: 'captured',
          stripe_payment_intent_id: pi.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Emit retirement instruction payload (placeholder — actual registry retirement
      // is registry-specific and handled by admin workflow)
      await supabase.from('retirement_instructions').insert({
        order_id: orderId,
        listing_id: order.listing_id,
        quantity_tonnes: order.quantity,
        status: 'pending_admin_action',
        payload: {
          order_id: orderId,
          stripe_payment_intent_id: pi.id,
          note: 'Initiate registry retirement. Admin must transfer credits in Verra/GS/ACR registry and update this record with serial numbers.',
        },
      });

      // Admin alert
      await supabase.from('admin_alerts').insert({
        priority: 'amber',
        alert_type: 'settlement_ready',
        title: `Payment captured — order ready for credit transfer`,
        entity_type: 'order',
        entity_id: orderId,
        action_url: '/admin/orders',
      });

      // Activity log
      await supabase.from('activity_log').insert({
        action: 'payment_captured',
        entity_type: 'order',
        entity_id: orderId,
        details: {
          stripe_payment_intent_id: pi.id,
          amount_received: pi.amount_received,
          currency: pi.currency,
        },
      });
    } else if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const orderId = pi.metadata?.order_id;

      if (orderId) {
        await supabase
          .from('cb_orders')
          .update({
            status: 'pending_payment', // Allow buyer to retry
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)
          .eq('status', 'payment_processing');

        await supabase.from('activity_log').insert({
          action: 'payment_failed',
          entity_type: 'order',
          entity_id: orderId,
          details: {
            stripe_payment_intent_id: pi.id,
            failure_message: pi.last_payment_error?.message || 'Unknown',
          },
        });
      }
    } else if (event.type === 'account.updated') {
      // Stripe Connect seller onboarding completion
      const account = event.data.object;
      if (account.details_submitted && account.charges_enabled) {
        await supabase
          .from('profiles')
          .update({
            seller_stripe_onboarded: true,
            updated_at: new Date().toISOString(),
          })
          .eq('seller_stripe_account_id', account.id);
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] Handler error', err);
    // Return 200 to prevent Stripe retry loop; log for investigation
  }

  return NextResponse.json({ received: true });
}

// ─── Stripe signature verification (no SDK) ───────────────────────────────────

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, any> };
  created: number;
}

async function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): Promise<StripeEvent> {
  // Parse Stripe-Signature header: t=timestamp,v1=hmac
  const parts = signature.split(',').reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const receivedSig = parts['v1'];

  if (!timestamp || !receivedSig) {
    throw new Error('Invalid Stripe-Signature header format');
  }

  // Tolerance: 5 minutes
  const tolerance = 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > tolerance) {
    throw new Error('Webhook timestamp too old (possible replay attack)');
  }

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature_bytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedPayload)
  );

  const expectedSig = Array.from(new Uint8Array(signature_bytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (expectedSig !== receivedSig) {
    throw new Error('Webhook signature mismatch');
  }

  return JSON.parse(payload) as StripeEvent;
}
