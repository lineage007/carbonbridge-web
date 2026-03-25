import { createClient } from '@/lib/supabase-server';
import { generateAgreementHTML, generateAgreementReference, type AgreementData } from '@/lib/purchase-agreement';
import { NextRequest, NextResponse } from 'next/server';

// GET: Retrieve purchase agreement HTML for an order
// POST: Generate and store a new purchase agreement

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
    .single();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Check access — buyer, seller, or admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isBuyer = order.buyer_id === user.id;
  const isSeller = order.listings?.seller_id === user.id;

  if (!isBuyer && !isSeller && !isAdmin) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const listing = order.listings;
  const buyerProfile = order.profiles;
  const sellerProfile = listing?.profiles;
  const isCBDirect = listing?.listing_type === 'cb_direct' || listing?.seller_id === null;

  // Check for insurance on this order
  const { data: insurancePolicies } = await supabase
    .from('insurance_policies')
    .select('*')
    .eq('order_id', orderId);

  const agreementData: AgreementData = {
    reference: order.agreement_reference || generateAgreementReference(),
    date: new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    buyer: {
      companyName: buyerProfile?.company_name || 'Unknown',
      registeredAddress: buyerProfile?.country || 'Not provided',
      registrationNumber: undefined,
      contactPerson: buyerProfile?.contact_name || 'Not provided',
      email: buyerProfile?.email || '',
      country: buyerProfile?.country || 'AE',
    },
    seller: isCBDirect ? {
      companyName: 'CarbonBridge Ltd',
      registeredAddress: 'Abu Dhabi Global Market, Al Maryah Island, Abu Dhabi, UAE',
      registrationNumber: '[ADGM Registration Number]',
      contactPerson: 'CarbonBridge Operations',
      email: 'operations@carbonbridge.ae',
      country: 'AE',
    } : {
      companyName: sellerProfile?.company_name || 'Third-Party Seller',
      registeredAddress: sellerProfile?.country || 'Not provided',
      registrationNumber: undefined,
      contactPerson: sellerProfile?.contact_name || 'Not provided',
      email: sellerProfile?.email || '',
      country: sellerProfile?.country || '',
    },
    isCBDirect,
    credits: {
      projectName: listing?.project_name || 'Unknown Project',
      registryProjectId: listing?.project_id_verra || 'N/A',
      registry: listing?.registry || 'verra',
      methodology: listing?.methodology || 'N/A',
      creditType: listing?.credit_type || 'unknown',
      vintageYear: listing?.vintage_year || new Date().getFullYear(),
      qualityRating: listing?.quality_rating || 'Unrated',
      quantity: order.quantity,
      unitPrice: order.unit_price,
      totalPrice: order.quantity * order.unit_price,
      complianceEligibility: [
        ...(listing?.corsia_eligible ? ['CORSIA'] : []),
        ...(listing?.cbam_eligible ? ['CBAM'] : []),
        ...(listing?.nrcc_eligible ? ['NRCC'] : []),
        ...(listing?.icvcm_ccp_aligned ? ['ICVCM CCP'] : []),
      ],
    },
    insurance: {
      selected: (insurancePolicies?.length || 0) > 0,
      products: (insurancePolicies || []).map(p => ({
        type: p.policy_type,
        premium: p.premium_amount,
        premiumRate: p.premium_rate,
        underwriter: p.provider === 'kita' ? 'Kita Earth Ltd (Lloyd\'s Coverholder)' : 'CFC Underwriting Ltd (Lloyd\'s)',
      })),
      totalPremium: (insurancePolicies || []).reduce((s: number, p: { premium_amount: number }) => s + p.premium_amount, 0),
    },
    paymentMethod: order.payment_method || 'card',
    totalAmount: order.total_amount,
    validityPeriod: order.payment_method === 'bank_transfer' ? 5 : 3,
    acceptedAt: order.status !== 'pending_payment' ? new Date(order.created_at).toISOString() : undefined,
  };

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
