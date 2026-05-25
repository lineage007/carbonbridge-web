import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// ─── Stripe Connect — Seller Onboarding ──────────────────────────────────────
//
// POST /api/stripe/connect
//   Creates (or retrieves) a Stripe Connect Express account for the seller,
//   returns an onboarding link.
//   Sellers must complete onboarding to receive payouts.
//
// GET /api/stripe/connect
//   Returns current Stripe Connect status for the authenticated seller.
//
// Commission: 3% to CarbonBridge (configurable per seller via commission_rate field)
//
// IMPORTANT: Uses test keys only. Live payout setup requires Gary's approval.

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  if (!stripeKey.startsWith('sk_test_')) {
    return NextResponse.json(
      { error: 'Live Stripe keys require explicit authorisation before enabling seller payouts.' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check seller is approved
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, company_name, seller_approved, seller_stripe_account_id, seller_stripe_onboarded, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Sellers must either have seller_approved = true or be admin
    if (!profile.seller_approved && profile.role === 'user') {
      return NextResponse.json(
        {
          error: 'Seller account not yet approved. Submit verification documents and await admin review.',
          seller_approved: false,
        },
        { status: 403 }
      );
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://carbonbridge-web.vercel.app'}/dashboard/seller?stripe=success`;
    const refreshUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://carbonbridge-web.vercel.app'}/dashboard/seller?stripe=refresh`;

    // Re-use existing account if already created
    let stripeAccountId = profile.seller_stripe_account_id;

    if (!stripeAccountId) {
      // Create new Express account
      const createRes = await fetch('https://api.stripe.com/v1/accounts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'express',
          email: profile.email,
          'metadata[user_id]': user.id,
          'metadata[company_name]': profile.company_name,
          'capabilities[transfers][requested]': 'true',
        }).toString(),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        console.error('[stripe/connect] Account creation failed', err);
        return NextResponse.json({ error: 'Failed to create payment account' }, { status: 502 });
      }

      const account = await createRes.json();
      stripeAccountId = account.id;

      // Save account ID to profile
      await supabase
        .from('profiles')
        .update({
          seller_stripe_account_id: stripeAccountId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    // Create account link for onboarding
    const linkRes = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        account: stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      }).toString(),
    });

    if (!linkRes.ok) {
      const err = await linkRes.json();
      console.error('[stripe/connect] Account link failed', err);
      return NextResponse.json({ error: 'Failed to generate onboarding link' }, { status: 502 });
    }

    const link = await linkRes.json();

    await supabase.from('activity_log').insert({
      actor_id: user.id,
      action: 'stripe_connect_onboarding_initiated',
      entity_type: 'profile',
      entity_id: user.id,
      details: { stripe_account_id: stripeAccountId },
    });

    return NextResponse.json({
      onboarding_url: link.url,
      stripe_account_id: stripeAccountId,
      expires_at: link.expires_at,
      already_onboarded: profile.seller_stripe_onboarded,
    });
  } catch (err) {
    console.error('[stripe/connect]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('seller_approved, seller_stripe_account_id, seller_stripe_onboarded')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let stripeDetails = null;

    if (stripeKey && profile.seller_stripe_account_id) {
      const accountRes = await fetch(
        `https://api.stripe.com/v1/accounts/${profile.seller_stripe_account_id}`,
        { headers: { Authorization: `Bearer ${stripeKey}` } }
      );
      if (accountRes.ok) {
        const account = await accountRes.json();
        stripeDetails = {
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          requirements: account.requirements?.currently_due || [],
        };

        // Sync onboarding status if changed
        if (account.details_submitted && account.charges_enabled && !profile.seller_stripe_onboarded) {
          await supabase
            .from('profiles')
            .update({ seller_stripe_onboarded: true, updated_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      }
    }

    return NextResponse.json({
      seller_approved: profile.seller_approved,
      stripe_account_id: profile.seller_stripe_account_id,
      stripe_onboarded: profile.seller_stripe_onboarded,
      stripe_details: stripeDetails,
      commission_rate_pct: 3.0, // CarbonBridge takes 3% — configurable per seller in future sprint
    });
  } catch (err) {
    console.error('[stripe/connect GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
