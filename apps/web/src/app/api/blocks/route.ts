/**
 * @api {post} /api/blocks 여행 블록 생성
 * @apiName CreateTravelBlock
 * @apiGroup Blocks
 *
 * @apiBody {String} plan_id 여행 계획 ID
 * @apiBody {String} title 블록 제목
 * @apiBody {String} [description] 블록 설명
 * @apiBody {Number} day_number 일차
 * @apiBody {Number} order_index 순서
 * @apiBody {String} [block_type] 블록 타입 (flight, accommodation, activity, etc.)
 * @apiBody {Object} [location] 위치 정보
 * @apiBody {String} [start_time] 시작 시간
 * @apiBody {String} [end_time] 종료 시간
 * @apiBody {Object} [cost] 비용 정보
 * @apiBody {String} [currency] 통화
 *
 * @apiSuccess {Object} 201 생성된 블록 정보
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
 * @apiSuccess {String} created_by 생성자 ID
 * @apiSuccess {String} created_at 생성 시간
 *
 * @apiError {Object} 400 Missing required fields
 * @apiError {Object} 401 Unauthorized
 * @apiError {Object} 403 Access denied
 * @apiError {Object} 500 Failed to create block
 *
 * @apiDescription 새로운 여행 블록을 생성합니다. 인증된 사용자만 접근 가능하며,
 * 해당 여행에 참여하고 있는 사용자만 블록을 생성할 수 있습니다.
 * 블록 생성 시 활동 로그도 함께 생성됩니다.
 */
import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/client/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      plan_id,
      title,
      description,
      day_number,
      order_index,
      block_type,
      location,
      start_time,
      end_time,
      cost,
      currency,
    } = body;

    // 필수 필드 검증
    if (!plan_id || !title || !day_number || order_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 사용자가 해당 여행 계획에 참여하고 있는지 확인
    const { data: participant, error: participantError } = await supabase
      .from('travel_plan_participants')
      .select('role')
      .eq('plan_id', plan_id)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 블록 생성
    const { data: newBlock, error: blockError } = await supabase
      .from('travel_blocks')
      .insert({
        plan_id,
        title,
        description,
        day_number,
        order_index,
        block_type,
        location,
        start_time,
        end_time,
        cost,
        currency,
        created_by: user.id,
      })
      .select()
      .single();

    if (blockError) {
      console.error('Error creating block:', blockError);
      return NextResponse.json(
        { error: 'Failed to create block' },
        { status: 500 }
      );
    }

    // 활동 로그 생성
    const { error: activityError } = await supabase
      .from('travel_activities')
      .insert({
        plan_id,
        user_id: user.id,
        type: 'block_add',
        content: `${title} 블록을 추가했습니다`,
        block_id: newBlock.id,
      });

    if (activityError) {
      console.error('Error creating activity log:', activityError);
      // 활동 로그 생성 실패는 블록 생성을 실패시키지 않음
    }

    return NextResponse.json(newBlock, { status: 201 });
  } catch (error) {
    console.error('Error creating block:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
