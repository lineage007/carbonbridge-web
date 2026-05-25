import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// Admin: list all cb_orders with KYC queue and buyer info

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: orders, error } = await supabase
      .from('cb_orders')
      .select(`
        *,
        buyer:profiles!buyer_id(company_name, email),
        kyc_queue(id, status, business_name, business_country, intended_use, reviewer_notes, rejection_reason, reviewed_at)
      `)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ orders: orders || [] });
  } catch (err) {
    console.error('[admin/orders GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
