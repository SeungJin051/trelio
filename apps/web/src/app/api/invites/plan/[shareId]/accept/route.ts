import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/client/supabase-server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    // UUID 형식 검증
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(shareId);
    if (!isUuid) {
      return NextResponse.json(
        { error: 'Invalid share id', shareId },
        { status: 400 }
      );
    }
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
      console.error('[accept_share_link] RPC error', error);
      const msg = String(error.message || '').toUpperCase();
      if (msg.includes('NOT_FOUND'))
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (msg.includes('ALREADY_PARTICIPANT'))
        return NextResponse.json({ error: 'Already' }, { status: 409 });
      if (msg.includes('PARTICIPATION_LIMIT_EXCEEDED'))
        return NextResponse.json({ error: 'Limit' }, { status: 422 });
      if (msg.includes('EXPIRED'))
        return NextResponse.json({ error: 'Expired' }, { status: 410 });
      if (msg.includes('INVALID'))
        return NextResponse.json({ error: 'Invalid' }, { status: 400 });
      if (msg.includes('CLOSED'))
        return NextResponse.json({ error: 'Closed' }, { status: 423 });
      if (msg.includes('OWNER_CANNOT_JOIN'))
        return NextResponse.json({ error: 'Owner' }, { status: 409 });
      // 디버깅을 위해 상세 메시지도 함께 반환 (프로덕션에선 제거 고려)
      return NextResponse.json(
        { error: 'Join failed', detail: String(error.message || '') },
        { status: 500 }
      );
    }

    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ planId: row.plan_id }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
