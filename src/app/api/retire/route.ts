import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// Retirement API (V4.1 Parts 8 & 9)
// POST: Retire credits and generate certificate
// GET: Retrieve retirement certificates

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Support both session auth and API key auth
    const apiKey = req.headers.get('x-api-key');
    let userId: string;

    if (apiKey) {
      // API key authentication
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .or(`api_key_live.eq.${apiKey},api_key_sandbox.eq.${apiKey}`)
        .single();
      if (!profile) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      userId = profile.id;

      // Log API usage
      await supabase.from('api_offset_logs').insert({
        api_client_id: userId,
        endpoint: '/api/retire',
        method: 'POST',
        status_code: 200,
      });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized — provide session or x-api-key header' }, { status: 401 });
      userId = user.id;
    }

    const { order_id, beneficiary_name, retirement_reason, quantity } = await req.json();

    if (!order_id) {
      return NextResponse.json({ error: 'order_id required' }, { status: 400 });
    }

    // Verify order belongs to user and is completed
    const { data: order } = await supabase
      .from('orders')
      .select('*, listings(project_name, registry, credit_type, methodology)')
      .eq('id', order_id)
      .eq('buyer_id', userId)
      .eq('status', 'completed')
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found, not completed, or not yours' }, { status: 404 });
    }

    const retireQty = quantity || order.quantity;

    // Check if already retired
    const { data: existing } = await supabase
      .from('retirement_certificates')
      .select('id, tonnes_retired')
      .eq('order_id', order_id)
      .eq('status', 'completed');

    const alreadyRetired = existing?.reduce((s, c) => s + (c.tonnes_retired || 0), 0) || 0;
    if (alreadyRetired >= order.quantity) {
      return NextResponse.json({ error: 'All credits from this order already retired', already_retired: alreadyRetired }, { status: 409 });
    }

    const remaining = order.quantity - alreadyRetired;
    if (retireQty > remaining) {
      return NextResponse.json({ error: `Only ${remaining} tCO₂e remaining to retire`, remaining }, { status: 409 });
    }

    // Generate certificate reference
    const certRef = `CB-RET-${Date.now().toString(36).toUpperCase()}`;

    // Create retirement certificate
    const { data: cert, error: certErr } = await supabase
      .from('retirement_certificates')
      .insert({
        order_id,
        buyer_id: userId,
        registry: order.listings?.registry || 'verra',
        tonnes_retired: retireQty,
        beneficiary_name: beneficiary_name || 'On behalf of certificate holder',
        retirement_reason: retirement_reason || 'Voluntary carbon offset',
        status: 'processing',
        serial_numbers: [certRef],
      })
      .select()
      .single();

    if (certErr) return NextResponse.json({ error: 'Certificate creation failed' }, { status: 500 });

    // Create admin alert for manual Verra retirement
    await supabase.from('admin_alerts').insert({
      type: 'retirement_requested',
      severity: 'action',
      title: `Retirement requested: ${retireQty} tCO₂e`,
      message: `Order ${order_id} — ${order.listings?.project_name} (${order.listings?.registry}). Beneficiary: ${beneficiary_name || 'Not specified'}. Initiate retirement on ${order.listings?.registry} registry.`,
      action_url: `/admin/orders`,
      metadata: { order_id, cert_id: cert.id, quantity: retireQty },
    });

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'retirement_requested',
      entity_type: 'retirement_certificate',
      entity_id: cert.id,
      metadata: { order_id, quantity: retireQty, beneficiary: beneficiary_name, project: order.listings?.project_name },
    });

    return NextResponse.json({
      certificate_id: cert.id,
      reference: certRef,
      order_id,
      project: order.listings?.project_name,
      registry: order.listings?.registry,
      credit_type: order.listings?.credit_type,
      tonnes_retired: retireQty,
      beneficiary: beneficiary_name || 'On behalf of certificate holder',
      status: 'processing',
      message: 'Retirement request submitted. Certificate will be generated once the registry retirement is confirmed (typically 1-3 business days).',
      certificate_url: `/api/certificates/${cert.id}`,
    }, { status: 201 });

  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const apiKey = req.headers.get('x-api-key');
    let userId: string;

    if (apiKey) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .or(`api_key_live.eq.${apiKey},api_key_sandbox.eq.${apiKey}`)
        .single();
      if (!profile) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      userId = profile.id;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      userId = user.id;
    }

    const { data: certs } = await supabase
      .from('retirement_certificates')
      .select('*, orders(listing_id, quantity, total_amount, listings(project_name, credit_type, registry))')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      certificates: (certs || []).map(c => ({
        id: c.id,
        reference: c.serial_numbers?.[0] || c.id,
        order_id: c.order_id,
        project: c.orders?.listings?.project_name,
        credit_type: c.orders?.listings?.credit_type,
        registry: c.registry,
        tonnes_retired: c.tonnes_retired,
        beneficiary: c.beneficiary_name,
        retirement_date: c.retirement_date,
        status: c.status,
        certificate_url: c.status === 'completed' ? `/api/certificates/${c.id}` : null,
        pdf_url: c.pdf_url,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
