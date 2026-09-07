import { createClient } from '@/lib/supabase-server';
import {
  buildAgreementDataFromOrder,
  generateAgreementHTML,
  type AgreementListingSource,
  type AgreementOrderSource,
  type AgreementProfileSource,
} from '@/lib/purchase-agreement';
import { NextRequest, NextResponse } from 'next/server';

// GET: Retrieve purchase agreement HTML for an order
//
// Schema contract (CB-004): the agreement reference column is `agreement_ref`,
// CB Direct is the `listings.is_cb_direct` boolean, insurance is stored on
// orders.insurance_products / insurance_premium_total (there is no
// `insurance_policies` table), and acceptance is orders.agreement_accepted_at.

type OrderWithRelations = AgreementOrderSource & {
  buyer_id: string;
  seller_id: string;
  listings: (AgreementListingSource & { seller_id: string; profiles: AgreementProfileSource | null }) | null;
  profiles: AgreementProfileSource | null;
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get order with all related data
  const { data: order } = await supabase
    .from('orders')
    .select('*, listings(*, profiles!listings_seller_id_fkey(*)), profiles!orders_buyer_id_fkey(*)')
    .eq('id', orderId)
    .single<OrderWithRelations>();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Check access — buyer, seller, or admin. orders.seller_id is NOT NULL, so
  // it is the authoritative seller for the access check.
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isBuyer = order.buyer_id === user.id;
  const isSeller = order.seller_id === user.id;

  if (!isBuyer && !isSeller && !isAdmin) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const agreementData = buildAgreementDataFromOrder({
    order,
    listing: order.listings,
    buyer: order.profiles,
    seller: order.listings?.profiles ?? null,
  });

  const format = new URL(req.url).searchParams.get('format') || 'html';
  const html = generateAgreementHTML(agreementData);

  if (format === 'json') {
    return NextResponse.json({ agreement: agreementData, html });
  }

  // Return as HTML (can be printed to PDF by the browser)
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${agreementData.reference}.html"`,
    },
  });
}
