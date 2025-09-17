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

/**
 * @api {get} /api/blocks 여행 블록 조회
 * @apiName GetTravelBlocks
 * @apiGroup Blocks
 *
 * @apiQuery {String} planId 여행 계획 ID
 *
 * @apiSuccess {Object[]} blocks 블록 목록
 *
 * @apiError {Object} 400 Missing planId
 * @apiError {Object} 401 Unauthorized
 * @apiError {Object} 403 Access denied
 * @apiError {Object} 500 Failed to fetch blocks
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json(
        { error: 'Missing planId parameter' },
        { status: 400 }
      );
    }

    // 사용자가 해당 여행 계획에 참여하고 있는지 확인
    const { data: participant, error: participantError } = await supabase
      .from('travel_plan_participants')
      .select('role')
      .eq('plan_id', planId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 블록 조회
    const { data: blocks, error: blocksError } = await supabase
      .from('travel_blocks')
      .select('*')
      .eq('plan_id', planId)
      .order('day_number', { ascending: true })
      .order('order_index', { ascending: true });

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError);
      return NextResponse.json(
        { error: 'Failed to fetch blocks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ blocks: blocks || [] });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      meta,
    } = body;

    // 필수 필드 검증
    if (!plan_id || !title || !day_number) {
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

    // order_index 자동 계산 (해당 날짜의 마지막 순서 + 1)
    let calculatedOrderIndex = 0;
    if (order_index === undefined) {
      const { data: existingBlocks, error: blocksError } = await supabase
        .from('travel_blocks')
        .select('order_index')
        .eq('plan_id', plan_id)
        .eq('day_number', day_number)
        .order('order_index', { ascending: false })
        .limit(1);

      if (blocksError) {
        console.error('Error fetching existing blocks:', blocksError);
        return NextResponse.json(
          { error: 'Failed to calculate order index' },
          { status: 500 }
        );
      }

      calculatedOrderIndex =
        existingBlocks && existingBlocks.length > 0
          ? (existingBlocks[0].order_index || 0) + 1
          : 0;
    } else {
      calculatedOrderIndex = order_index;
    }

    // 비용 정보를 JSONB 형태로 구성 (문자/숫자 모두 허용)
    const costData =
      cost !== undefined && cost !== null && currency
        ? {
            amount: typeof cost === 'number' ? cost : parseFloat(String(cost)),
            currency: String(currency),
          }
        : null;

    // 시간 범위 JSONB (스키마: time_range JSONB, startTime/endTime 키)
    const timeRangeData =
      start_time && end_time
        ? {
            startTime: String(start_time),
            endTime: String(end_time),
          }
        : null;

    // 위치 JSONB (스키마: location JSONB, 최소 address 키 필요)
    const locationData =
      location === undefined || location === null
        ? null
        : typeof location === 'string'
          ? { address: location }
          : {
              address: (location as any)?.address ?? '',
              latitude: (location as any)?.latitude ?? undefined,
              longitude: (location as any)?.longitude ?? undefined,
              placeId: (location as any)?.placeId ?? undefined,
            };

    // 블록 생성
    const { data: newBlock, error: blockError } = await supabase
      .from('travel_blocks')
      .insert({
        plan_id,
        title,
        description,
        day_number,
        order_index: calculatedOrderIndex,
        block_type: [
          'flight',
          'move',
          'food',
          'hotel',
          'activity',
          'memo',
        ].includes(String(block_type))
          ? String(block_type)
          : 'activity',
        location: locationData,
        time_range: timeRangeData,
        cost: costData,
        meta: meta || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (blockError) {
      console.error('Error creating block:', blockError);
      return NextResponse.json(
        {
          error: blockError.message || 'Failed to create block',
          details: (blockError as any).details,
          hint: (blockError as any).hint,
          code: (blockError as any).code,
        },
        { status: 500 }
      );
    }

    // 활동 로그 생성 (스키마 준수: type/content)
    const { error: activityError } = await supabase
      .from('travel_activities')
      .insert({
        plan_id,
        user_id: user.id,
        type: 'block_created',
        content: `${title} 블록을 추가했습니다`,
        block_id: newBlock.id,
      })
      .select()
      .single();

    if (activityError) {
      console.error('Error creating activity log:', activityError);
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
