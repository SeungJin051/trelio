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

import type { PostgrestError } from '@supabase/supabase-js';

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
      .select('plan_id, title, day_number, order_index')
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
    const { error: moveError } = await supabase.rpc('move_travel_block', {
      block_id: blockId,
      new_day_number: newDayNumber,
      new_order_index: newOrderIndex,
    });

    if (moveError) {
      // Fallback: unique 제약(23505) 등으로 RPC 실패 시 수동 재정렬 수행
      const isUniqueViolation =
        (moveError as PostgrestError)?.code === '23505' ||
        String((moveError as PostgrestError)?.message || '').includes(
          'duplicate key value violates unique constraint'
        );

      if (!isUniqueViolation) {
        console.error('Block move error (non-unique):', moveError);
        return NextResponse.json(
          { error: 'Failed to move block' },
          { status: 500 }
        );
      }

      // 안전 재정렬 로직
      const planId = existingBlock.plan_id as string;
      const currentDay = existingBlock.day_number as number;
      const tempOffset = 10000;

      // 같은 날 내 이동
      if (currentDay === newDayNumber) {
        const { data: dayBlocks } = await supabase
          .from('travel_blocks')
          .select('id, order_index')
          .eq('plan_id', planId)
          .eq('day_number', currentDay)
          .order('order_index', { ascending: true });

        const list = (dayBlocks || []) as { id: string; order_index: number }[];
        const fromIndex = list.findIndex((b) => b.id === blockId);
        const toIndex = Math.max(0, Math.min(newOrderIndex, list.length - 1));
        if (fromIndex === -1) {
          return NextResponse.json(
            { error: 'Block not found in day' },
            { status: 404 }
          );
        }
        // 임시로 모든 블록의 order_index를 크게 이동
        for (let i = 0; i < list.length; i++) {
          const b = list[i];
          await supabase
            .from('travel_blocks')
            .update({ order_index: tempOffset + i })
            .eq('id', b.id);
        }
        // 순서 재배열
        const reordered = [...list];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        for (let i = 0; i < reordered.length; i++) {
          await supabase
            .from('travel_blocks')
            .update({ order_index: i })
            .eq('id', reordered[i].id);
        }
      } else {
        // 다른 날로 이동
        // 1) 타겟 날짜 블록 임시 오프셋
        const { data: targetBlocks } = await supabase
          .from('travel_blocks')
          .select('id')
          .eq('plan_id', planId)
          .eq('day_number', newDayNumber)
          .order('order_index', { ascending: true });

        const targetList = (targetBlocks || []) as { id: string }[];
        const clampedIndex = Math.max(
          0,
          Math.min(newOrderIndex, targetList.length)
        );
        for (let i = 0; i < targetList.length; i++) {
          await supabase
            .from('travel_blocks')
            .update({
              order_index: tempOffset + (i >= clampedIndex ? i + 1 : i),
            })
            .eq('id', targetList[i].id);
        }

        // 2) 이동할 블록의 날짜/순서 임시 설정
        await supabase
          .from('travel_blocks')
          .update({
            day_number: newDayNumber,
            order_index: tempOffset + clampedIndex,
          })
          .eq('id', blockId);

        // 3) 소스 날짜 정규화(블록 제거 후 0..N-1)
        const { data: sourceBlocks } = await supabase
          .from('travel_blocks')
          .select('id')
          .eq('plan_id', planId)
          .eq('day_number', currentDay)
          .order('order_index', { ascending: true });
        const sourceList = (sourceBlocks || []) as { id: string }[];
        for (let i = 0; i < sourceList.length; i++) {
          await supabase
            .from('travel_blocks')
            .update({ order_index: i })
            .eq('id', sourceList[i].id);
        }

        // 4) 타겟 날짜 최종 정규화(0..M)
        const { data: targetFinal } = await supabase
          .from('travel_blocks')
          .select('id')
          .eq('plan_id', planId)
          .eq('day_number', newDayNumber)
          .order('order_index', { ascending: true });
        const targetFinalList = (targetFinal || []) as { id: string }[];
        for (let i = 0; i < targetFinalList.length; i++) {
          await supabase
            .from('travel_blocks')
            .update({ order_index: i })
            .eq('id', targetFinalList[i].id);
        }
      }
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
