/**
 * @api {post} /api/blocks/:id/move 여행 블록 이동
 * @apiName MoveTravelBlock
 * @apiGroup Blocks
 *
 * @apiParam {String} id 블록의 고유 ID
 *
 * @apiBody {Number} newDayNumber 새로운 일차
 * @apiBody {Number} newOrderIndex 새로운 순서 인덱스
 *
 * @apiSuccess {Object} 200 이동 성공 응답
 * @apiSuccess {Boolean} success 이동 성공 여부
 *
 * @apiError {Object} 401 Authentication failed
 * @apiError {Object} 403 Insufficient permissions
 * @apiError {Object} 404 Block not found
 * @apiError {Object} 500 Failed to move block
 * @apiError {Object} 500 Internal server error
 *
 * @apiDescription 여행 블록의 일차와 순서를 변경합니다. 인증된 사용자만 접근 가능하며,
 * 해당 여행의 소유자(owner) 또는 편집자(editor) 권한이 있는 사용자만 이동할 수 있습니다.
 * 블록 이동 시 Supabase RPC 함수를 사용하여 복잡한 순서 재정렬을 처리하며,
 * 이동 완료 후 활동 로그도 함께 생성됩니다.
 */
import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/client/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: blockId } = await params;
    const supabase = await createServerSupabaseClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newDayNumber, newOrderIndex } = body;

    // 블록 존재 확인 및 권한 확인
    const { data: existingBlock, error: fetchError } = await supabase
      .from('travel_blocks')
      .select('plan_id, title')
      .eq('id', blockId)
      .single();

    if (fetchError || !existingBlock) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // 참여자 권한 확인
    const { data: participant, error: participantError } = await supabase
      .from('travel_plan_participants')
      .select('role')
      .eq('plan_id', existingBlock.plan_id)
      .eq('user_id', user.id)
      .single();

    if (
      participantError ||
      !participant ||
      !['owner', 'editor'].includes(participant.role)
    ) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Supabase RPC 함수 호출하여 블록 이동
    const { data: result, error: moveError } = await supabase.rpc(
      'move_travel_block',
      {
        block_id: blockId,
        new_day_number: newDayNumber,
        new_order_index: newOrderIndex,
      }
    );

    if (moveError) {
      console.error('Block move error:', moveError);
      return NextResponse.json(
        { error: 'Failed to move block' },
        { status: 500 }
      );
    }

    // 활동 로그 생성
    await supabase.from('travel_activities').insert({
      plan_id: existingBlock.plan_id,
      user_id: user.id,
      type: 'block_move',
      content: `블록 "${existingBlock.title}"을(를) Day ${newDayNumber}로 이동했습니다.`,
      block_id: blockId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Block move error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
