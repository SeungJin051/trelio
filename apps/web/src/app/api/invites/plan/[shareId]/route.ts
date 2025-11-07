import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/client/supabase-server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    const supabase = await createServerSupabaseClient();

    // UUID 형식 검증
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(shareId);
    if (!isUuid) {
      return NextResponse.json(
        { error: 'Invalid share id', shareId },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('fn_verify_share_link', {
      p_share_id: shareId,
    });

    if (error) {
      console.error('[verify_share_link] RPC error', error);
      return NextResponse.json(
        { error: 'RPC error', detail: String(error.message || '') },
        { status: 500 }
      );
    }

    const row = Array.isArray(data)
      ? (data[0] as { plan_id: string; title: string } | undefined)
      : (data as { plan_id: string; title: string } | null);
    if (!row)
      return NextResponse.json(
        { error: 'Not found', shareId },
        { status: 404 }
      );

    return NextResponse.json({ planId: row.plan_id, title: row.title });
  } catch (err) {
    console.error('[verify_share_link] Unexpected error', err);
    return NextResponse.json(
      {
        error: 'Unexpected error',
        detail: String((err as Error)?.message || ''),
      },
      { status: 500 }
    );
  }
}
