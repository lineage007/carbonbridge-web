import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// Admin: approve or reject a KYC entry
// POST { kyc_id, action: 'approve' | 'reject', notes?, reason? }

export async function POST(req: NextRequest) {
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

    const { kyc_id, action, notes, reason } = await req.json();

    if (!kyc_id || !action) {
      return NextResponse.json({ error: 'kyc_id and action required' }, { status: 400 });
    }
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
    }

    let result;
    if (action === 'approve') {
      const { data, error } = await supabase.rpc('admin_approve_kyc', {
        p_kyc_id: kyc_id,
        p_reviewer_id: user.id,
        p_notes: notes || null,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      result = data;
    } else {
      if (!reason) {
        return NextResponse.json({ error: 'reason required for rejection' }, { status: 400 });
      }
      const { data, error } = await supabase.rpc('admin_reject_kyc', {
        p_kyc_id: kyc_id,
        p_reviewer_id: user.id,
        p_reason: reason,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      result = data;
    }

    await supabase.from('activity_log').insert({
      actor_id: user.id,
      action: `kyc_${action}d`,
      entity_type: 'kyc_queue',
      entity_id: kyc_id,
      details: { notes, reason, result },
    });

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('[admin/kyc POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
