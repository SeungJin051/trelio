import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/client/supabase-server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    const supabase = await createServerSupabaseClient();

    // auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.rpc('fn_accept_share_link', {
      p_share_id: shareId,
      p_user_id: user.id,
    });

    if (error) {
      const msg = String(error.message || '').toUpperCase();
      if (msg.includes('NOT_FOUND'))
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (msg.includes('ALREADY_PARTICIPANT'))
        return NextResponse.json({ error: 'Already' }, { status: 409 });
      if (msg.includes('PARTICIPATION_LIMIT_EXCEEDED'))
        return NextResponse.json({ error: 'Limit' }, { status: 422 });
      return NextResponse.json({ error: 'Join failed' }, { status: 500 });
    }

    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ planId: row.plan_id }, { status: 200 });
  } catch (_err) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
