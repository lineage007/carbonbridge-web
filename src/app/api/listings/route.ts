import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// ─── Listings API ─────────────────────────────────────────────────────────────
//
// GET  /api/listings                — public marketplace listings (active only)
// GET  /api/listings?seller=me      — authenticated seller's own listings
// POST /api/listings                — authenticated seller creates a listing (pending_review)
// PATCH /api/listings?id=<uuid>     — seller updates draft / pending listing

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const sellerOwn = searchParams.get('seller') === 'me';

    if (sellerOwn) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { data, error } = await supabase
        .from('listings')
        .select('*, seller:profiles!seller_id(company_name, seller_stripe_onboarded)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ listings: data || [] });
    }

    // Public marketplace: active listings only, with seller name
    const creditType = searchParams.get('type');
    const registry = searchParams.get('registry');
    const maxPrice = searchParams.get('max_price');
    const minVolume = searchParams.get('min_volume');
    const corsiaOnly = searchParams.get('corsia') === '1';
    const nrccOnly = searchParams.get('nrcc') === '1';

    let query = supabase
      .from('listings')
      .select('id, project_name, seller_id, registry, methodology, credit_type, country, region, available_tonnes, price_per_tonne, quality_rating, co_benefits, corsia_eligible, nrcc_eligible, cbam_eligible, icvcm_ccp_aligned, vintage_year, status, is_cb_direct, seller:profiles!seller_id(company_name)')
      .eq('status', 'active')
      .gt('available_tonnes', 0)
      .order('price_per_tonne', { ascending: false });

    if (creditType) query = query.eq('credit_type', creditType);
    if (registry) query = query.eq('registry', registry);
    if (maxPrice) query = query.lte('price_per_tonne', parseFloat(maxPrice));
    if (minVolume) query = query.gte('available_tonnes', parseInt(minVolume));
    if (corsiaOnly) query = query.eq('corsia_eligible', true);
    if (nrccOnly) query = query.eq('nrcc_eligible', true);

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ listings: data || [] });
  } catch (err) {
    console.error('[listings GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Must be approved seller
    const { data: profile } = await supabase
      .from('profiles')
      .select('seller_approved, seller_stripe_onboarded, role')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';

    if (!isAdmin && !profile.seller_approved) {
      return NextResponse.json(
        { error: 'Seller account not approved. Submit verification documents first.' },
        { status: 403 }
      );
    }

    if (!isAdmin && !profile.seller_stripe_onboarded) {
      return NextResponse.json(
        { error: 'Stripe Connect onboarding not complete. Complete payout setup before listing.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Required fields
    const required = ['project_name', 'registry', 'credit_type', 'country', 'price_per_tonne', 'total_tonnes', 'available_tonnes', 'methodology'];
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json({ error: `Field '${field}' is required` }, { status: 400 });
      }
    }

    if (body.available_tonnes > body.total_tonnes) {
      return NextResponse.json(
        { error: 'available_tonnes cannot exceed total_tonnes' },
        { status: 400 }
      );
    }

    // Admins can publish directly; sellers submit for review
    const status = isAdmin ? 'active' : 'pending_review';

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        project_name: body.project_name,
        project_id_verra: body.project_id_verra || null,
        registry: body.registry,
        methodology: body.methodology,
        credit_type: body.credit_type,
        country: body.country,
        region: body.region || null,
        price_per_tonne: body.price_per_tonne,
        total_tonnes: body.total_tonnes,
        available_tonnes: body.available_tonnes,
        vintage_year: body.vintage_year || null,
        quality_rating: body.quality_rating || null,
        co_benefits: body.co_benefits || [],
        corsia_eligible: body.corsia_eligible || false,
        nrcc_eligible: body.nrcc_eligible || false,
        cbam_eligible: body.cbam_eligible || false,
        icvcm_ccp_aligned: body.icvcm_ccp_aligned || false,
        is_cb_direct: false,
        description: body.description || null,
        documentation_urls: body.documentation_urls || [],
        status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create admin alert for pending review
    if (status === 'pending_review') {
      await supabase.from('admin_alerts').insert({
        priority: 'blue',
        alert_type: 'listing_pending_review',
        title: `New listing submitted: ${body.project_name}`,
        entity_type: 'listing',
        entity_id: listing.id,
        action_url: '/admin/listings',
      });
    }

    await supabase.from('activity_log').insert({
      actor_id: user.id,
      action: 'listing_created',
      entity_type: 'listing',
      entity_id: listing.id,
      details: { project_name: body.project_name, registry: body.registry, status },
    });

    return NextResponse.json({ listing, status }, { status: 201 });
  } catch (err) {
    console.error('[listings POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('id');
    if (!listingId) return NextResponse.json({ error: 'id param required' }, { status: 400 });

    // Verify ownership or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

    const { data: existing } = await supabase
      .from('listings')
      .select('id, seller_id, status')
      .eq('id', listingId)
      .single();

    if (!existing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (!isAdmin && existing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Not authorised to modify this listing' }, { status: 403 });
    }

    // Sellers can only update pending_review or draft listings
    if (!isAdmin && !['pending_review', 'draft'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Can only edit listings in draft or pending_review status' },
        { status: 409 }
      );
    }

    const body = await req.json();

    // Admin-only fields
    const adminFields = ['status', 'rejection_reason', 'reviewed_by', 'reviewed_at', 'verra_verified'];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const [key, value] of Object.entries(body)) {
      if (!adminFields.includes(key) || isAdmin) {
        updates[key] = value;
      }
    }

    if (isAdmin && body.status === 'active') {
      updates.reviewed_at = new Date().toISOString();
      updates.reviewed_by = user.id;
    }

    const { data: updated, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from('activity_log').insert({
      actor_id: user.id,
      action: 'listing_updated',
      entity_type: 'listing',
      entity_id: listingId,
      details: { updated_fields: Object.keys(updates), new_status: updates.status },
    });

    return NextResponse.json({ listing: updated });
  } catch (err) {
    console.error('[listings PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
