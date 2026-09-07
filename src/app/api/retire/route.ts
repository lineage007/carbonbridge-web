/**
 * Credit Retirement API Route
 *
 * POST /api/retire — validate input, generate a deterministic retirement
 *   certificate ID, queue for registry write.
 * GET  /api/retire — list retirement certificates for the authenticated user.
 *
 * STUB STATUS: Registry writes (Verra, Gold Standard, ACR) are NOT executed
 * here. After creating the certificate record the route inserts an admin_alert
 * so a human operator can initiate the retirement on the relevant registry
 * portal. Integration point for registry automation is marked below.
 *
 * When ADGM authorisation is granted and registry partner agreements are
 * in place, replace the TODO block below with:
 *   - Verra: POST to Verra API /registry/retirement with serial numbers
 *   - Gold Standard: POST to GS Impact Registry API
 *   - ACR: POST to APX/Xpansiv API
 */

import { createClient } from '@/lib/supabase-server';
import { buildApiOffsetLog, buildCertificateRef, isWellFormedApiKey } from '@/lib/api-usage';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Input schema ─────────────────────────────────────────────────────────────

const RetireRequestSchema = z.object({
  order_id: z.string().min(1),
  credit_id: z.string().min(1),
  retirement_reason: z.string().min(1).max(500).default('Voluntary carbon offset'),
  buyer_wallet: z.string().min(1).optional(),
  beneficiary_name: z.string().max(200).optional(),
  quantity: z.number().positive().optional(),
});

type RetireRequest = z.infer<typeof RetireRequestSchema>;

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Support both session auth and API key auth
    const apiKey = req.headers.get('x-api-key');
    const viaApiKey = apiKey !== null;
    let userId: string;

    if (apiKey) {
      if (!isWellFormedApiKey(apiKey)) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .or(`api_key_live.eq.${apiKey},api_key_sandbox.eq.${apiKey}`)
        .single();
      if (!profile) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      userId = profile.id;
      // NOTE: the api_offset_logs row is written after validation, once
      // co2_tonnes is known — the column is NOT NULL (CB-005).
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized — provide session or x-api-key header' },
          { status: 401 },
        );
      }
      userId = user.id;
    }

    // Validate body
    const body = await req.json() as unknown;
    const parsed = RetireRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      order_id,
      credit_id,
      retirement_reason,
      buyer_wallet,
      beneficiary_name,
      quantity,
    }: RetireRequest = parsed.data;

    // Verify order belongs to user and is completed
    const { data: order } = await supabase
      .from('orders')
      .select('*, listings(project_name, registry, credit_type, methodology)')
      .eq('id', order_id)
      .eq('buyer_id', userId)
      .eq('status', 'completed')
      .single();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found, not completed, or not yours' },
        { status: 404 },
      );
    }

    const retireQty = quantity ?? order.quantity;

    // Check already-retired volume
    const { data: existing } = await supabase
      .from('retirement_certificates')
      .select('id, tonnes_retired')
      .eq('order_id', order_id)
      .eq('status', 'completed');

    const alreadyRetired =
      existing?.reduce((s: number, c: { tonnes_retired?: number }) => s + (c.tonnes_retired ?? 0), 0) ?? 0;

    if (alreadyRetired >= order.quantity) {
      return NextResponse.json(
        { error: 'All credits from this order already retired', already_retired: alreadyRetired },
        { status: 409 },
      );
    }

    const remaining = order.quantity - alreadyRetired;
    if (retireQty > remaining) {
      return NextResponse.json(
        { error: `Only ${remaining} tCO₂e remaining to retire`, remaining },
        { status: 409 },
      );
    }

    // Generate deterministic certificate reference
    // Format: CB-RET-{timestamp36}-{creditIdFragment}
    const certRef = buildCertificateRef(credit_id);

    // Create retirement certificate record. serial_numbers stays empty until
    // the registry retirement is executed and real serials come back — the
    // CarbonBridge-side reference lives in certificate_ref.
    const { data: cert, error: certErr } = await supabase
      .from('retirement_certificates')
      .insert({
        certificate_ref: certRef,
        order_id,
        buyer_id: userId,
        registry: order.listings?.registry ?? 'verra',
        tonnes_retired: retireQty,
        beneficiary_name: beneficiary_name ?? 'On behalf of certificate holder',
        retirement_reason,
        status: 'processing',
        serial_numbers: [],
      })
      .select()
      .single();

    if (certErr || !cert) {
      return NextResponse.json({ error: 'Certificate creation failed' }, { status: 500 });
    }

    // Meter the call against the client's API plan. api_offset_logs requires
    // co2_tonnes and billing_period; endpoint/method/status_code are not
    // columns and go into the metadata jsonb.
    if (viaApiKey) {
      await supabase.from('api_offset_logs').insert(
        buildApiOffsetLog({
          clientId: userId,
          co2Tonnes: retireQty,
          endpoint: '/api/retire',
          method: 'POST',
          statusCode: 201,
          creditTypeAllocated: order.listings?.credit_type ?? null,
          externalRef: certRef,
        }),
      );
    }

    // TODO (live integration): execute registry retirement here.
    // Verra VCS: POST https://registry.verra.org/app/api/retirement
    // Gold Standard: POST https://registry.goldstandard.org/api/v2/retirements
    // ACR: POST https://apx.com/api/retirements (Xpansiv)
    // Until ADGM authorisation + registry partner agreements are in place,
    // the admin_alert below routes to a human operator for manual execution.

    // Schema: admin_alerts uses priority in ('red','amber','blue') and alert_type text
    await supabase.from('admin_alerts').insert({
      priority: 'amber',
      alert_type: 'retirement_requested',
      title: `Retirement requested: ${retireQty} tCO₂e — Order ${order_id}`,
      entity_type: 'retirement_certificate',
      entity_id: cert.id,
      action_url: `/admin/orders`,
    });

    await supabase.from('activity_log').insert({
      actor_id: userId,
      action: 'retirement_requested',
      entity_type: 'retirement_certificate',
      entity_id: cert.id,
      details: {
        order_id,
        credit_id,
        quantity: retireQty,
        beneficiary: beneficiary_name,
        project: order.listings?.project_name,
        buyer_wallet,
      },
    });

    return NextResponse.json(
      {
        certificate_id: cert.id,
        reference: certRef,
        order_id,
        credit_id,
        project: order.listings?.project_name,
        registry: order.listings?.registry,
        credit_type: order.listings?.credit_type,
        tonnes_retired: retireQty,
        beneficiary: beneficiary_name ?? 'On behalf of certificate holder',
        retirement_reason,
        buyer_wallet: buyer_wallet ?? null,
        status: 'processing',
        mode: 'stub' as const,
        message:
          'Retirement request submitted. Certificate will be generated once the registry retirement is confirmed (typically 1–3 business days). Registry write is currently manual — automated registry integration pending ADGM authorisation.',
        certificate_url: `/api/certificates/${cert.id}`,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const apiKey = req.headers.get('x-api-key');
    let userId: string;

    if (apiKey) {
      if (!isWellFormedApiKey(apiKey)) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .or(`api_key_live.eq.${apiKey},api_key_sandbox.eq.${apiKey}`)
        .single();
      if (!profile) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      userId = profile.id;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    const { data: certs } = await supabase
      .from('retirement_certificates')
      .select(
        '*, orders(listing_id, quantity, total_amount, listings(project_name, credit_type, registry))',
      )
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      certificates: (certs ?? []).map(
        (c: {
          id: string;
          serial_numbers?: string[];
          order_id: string;
          orders?: {
            listings?: {
              project_name?: string;
              credit_type?: string;
              registry?: string;
            };
          };
          registry: string;
          tonnes_retired: number;
          beneficiary_name: string;
          retirement_date?: string;
          status: string;
          pdf_url?: string;
        }) => ({
          id: c.id,
          reference: c.serial_numbers?.[0] ?? c.id,
          order_id: c.order_id,
          project: c.orders?.listings?.project_name,
          credit_type: c.orders?.listings?.credit_type,
          registry: c.registry,
          tonnes_retired: c.tonnes_retired,
          beneficiary: c.beneficiary_name,
          retirement_date: c.retirement_date,
          status: c.status,
          mode: 'stub' as const,
          certificate_url: c.status === 'completed' ? `/api/certificates/${c.id}` : null,
          pdf_url: c.pdf_url,
        }),
      ),
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
