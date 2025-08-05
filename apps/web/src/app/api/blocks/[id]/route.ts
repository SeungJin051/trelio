/**
 * @api {put} /api/blocks/:id 여행 블록 수정
 * @apiName UpdateTravelBlock
 * @apiGroup Blocks
 *
 * @apiParam {String} id 블록의 고유 ID
 *
 * @apiBody {String} [title] 블록 제목
 * @apiBody {String} [description] 블록 설명
 * @apiBody {Number} [day_number] 일차
 * @apiBody {Number} [order_index] 순서
 * @apiBody {String} [block_type] 블록 타입
 * @apiBody {Object} [location] 위치 정보
 * @apiBody {String} [start_time] 시작 시간
 * @apiBody {String} [end_time] 종료 시간
 * @apiBody {Object} [cost] 비용 정보
 * @apiBody {String} [currency] 통화
 *
 * @apiSuccess {Object} 200 수정된 블록 정보
 * @apiSuccess {String} id 블록 ID
 * @apiSuccess {String} plan_id 여행 계획 ID
 * @apiSuccess {String} title 블록 제목
 * @apiSuccess {String} description 블록 설명
 * @apiSuccess {Number} day_number 일차
 * @apiSuccess {Number} order_index 순서
 * @apiSuccess {String} block_type 블록 타입
 * @apiSuccess {Object} location 위치 정보
 * @apiSuccess {String} start_time 시작 시간
 * @apiSuccess {String} end_time 종료 시간
 * @apiSuccess {Object} cost 비용 정보
 * @apiSuccess {String} currency 통화
 * @apiSuccess {String} updated_at 수정 시간
 *
 * @apiError {Object} 401 Authentication failed
 * @apiError {Object} 403 Insufficient permissions
 * @apiError {Object} 404 Block not found
 * @apiError {Object} 500 Failed to update block
 * @apiError {Object} 500 Internal server error
 *
 * @apiDescription 기존 여행 블록을 수정합니다. 인증된 사용자만 접근 가능하며,
 * 해당 여행의 소유자(owner) 또는 편집자(editor) 권한이 있는 사용자만 수정할 수 있습니다.
 * 블록 수정 시 활동 로그도 함께 생성됩니다.
 */
/**
 * @api {delete} /api/blocks/:id 여행 블록 삭제
 * @apiName DeleteTravelBlock
 * @apiGroup Blocks
 *
 * @apiParam {String} id 블록의 고유 ID
 *
 * @apiSuccess {Object} 200 삭제 성공 메시지
 * @apiSuccess {String} message 삭제 완료 메시지
 *
 * @apiError {Object} 401 Authentication failed
 * @apiError {Object} 403 Insufficient permissions
 * @apiError {Object} 404 Block not found
 * @apiError {Object} 500 Failed to delete block
 * @apiError {Object} 500 Internal server error
 *
 * @apiDescription 여행 블록을 삭제합니다. 인증된 사용자만 접근 가능하며,
 * 해당 여행의 소유자(owner) 또는 편집자(editor) 권한이 있는 사용자만 삭제할 수 있습니다.
 * 블록 삭제 시 활동 로그도 함께 생성됩니다.
 */
import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/client/supabase-server';

export async function PUT(
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

    // 블록 존재 확인 및 권한 확인
    const { data: existingBlock, error: fetchError } = await supabase
      .from('travel_blocks')
      .select('plan_id')
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

    // 블록 업데이트
    const { data: updatedBlock, error: updateError } = await supabase
      .from('travel_blocks')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', blockId)
      .select()
      .single();

    if (updateError) {
      console.error('Block update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update block' },
        { status: 500 }
      );
    }

    // 활동 로그 생성
    await supabase.from('travel_activities').insert({
      plan_id: existingBlock.plan_id,
      user_id: user.id,
      type: 'block_updated',
      content: `블록 "${updatedBlock.title}"을(를) 수정했습니다.`,
      block_id: blockId,
    });

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error('Block update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // 블록 삭제
    const { error: deleteError } = await supabase
      .from('travel_blocks')
      .delete()
      .eq('id', blockId);

    if (deleteError) {
      console.error('Block delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete block' },
        { status: 500 }
      );
    }

    // 활동 로그 생성
    await supabase.from('travel_activities').insert({
      plan_id: existingBlock.plan_id,
      user_id: user.id,
      type: 'block_deleted',
      content: `블록 "${existingBlock.title}"을(를) 삭제했습니다.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Block delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
