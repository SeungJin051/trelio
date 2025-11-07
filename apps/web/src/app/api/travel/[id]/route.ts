/**
 * @api {get} /api/trips/:id 여행 상세 정보 조회
 * @apiName GetTravelDetail
 * @apiGroup Trips
 *
 * @apiParam {String} id 여행 계획의 고유 ID
 *
 * @apiSuccess {Object} travelPlan 여행 계획 기본 정보
 * @apiSuccess {String} travelPlan.id 여행 계획 ID
 * @apiSuccess {String} travelPlan.title 여행 제목
 * @apiSuccess {String} travelPlan.location 여행 장소
 * @apiSuccess {String} travelPlan.start_date 시작 날짜
 * @apiSuccess {String} travelPlan.end_date 종료 날짜
 * @apiSuccess {String} travelPlan.owner_id 소유자 ID
 *
 * @apiSuccess {Array} participants 참여자 목록
 * @apiSuccess {String} participants.id 참여자 ID
 * @apiSuccess {String} participants.nickname 참여자 닉네임
 * @apiSuccess {String} participants.role 참여자 역할 (owner, editor, viewer)
 * @apiSuccess {String} participants.profile_image_url 프로필 이미지 URL
 *
 * @apiSuccess {Array} blocks 여행 블록 목록
 * @apiSuccess {String} blocks.id 블록 ID
 * @apiSuccess {String} blocks.title 블록 제목
 * @apiSuccess {String} blocks.block_type 블록 타입
 * @apiSuccess {Number} blocks.day_number 일차
 * @apiSuccess {Number} blocks.order_index 순서
 * @apiSuccess {Object} blocks.location 위치 정보
 * @apiSuccess {Object} blocks.time_range 시간 범위
 * @apiSuccess {Object} blocks.cost 비용 정보
 *
 * @apiSuccess {Array} activities 활동 로그 목록
 * @apiSuccess {String} activities.id 활동 ID
 * @apiSuccess {String} activities.activity_type 활동 타입
 * @apiSuccess {String} activities.description 활동 설명
 * @apiSuccess {String} activities.created_at 생성 시간
 *
 * @apiError {Object} 400 Plan ID is required
 * @apiError {Object} 401 Authentication failed
 * @apiError {Object} 401 Unauthorized
 * @apiError {Object} 404 Travel plan not found
 * @apiError {Object} 500 Failed to fetch participants
 * @apiError {Object} 500 Failed to fetch blocks
 * @apiError {Object} 500 Failed to fetch activities
 *
 * @apiDescription 여행 계획의 상세 정보를 조회합니다. 여행 계획 기본 정보, 참여자 목록, 블록 목록, 활동 로그를 포함합니다.
 * 인증된 사용자만 접근 가능하며, 해당 여행에 참여하고 있거나 소유자인 경우에만 데이터를 조회할 수 있습니다.
 */
import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/client/supabase-server';

/**
 * @api {put} /api/travel/:id 여행 계획 정보 수정
 * @apiName UpdateTravelPlan
 * @apiGroup Travel
 *
 * @apiParam {String} id 여행 계획의 고유 ID
 *
 * @apiBody {String} [title] 여행 제목
 * @apiBody {String} [location] 여행 장소
 * @apiBody {String} [start_date] 시작 날짜 (YYYY-MM-DD)
 * @apiBody {String} [end_date] 종료 날짜 (YYYY-MM-DD)
 * @apiBody {Number} [target_budget] 목표 예산
 * @apiBody {String} [budget_currency] 예산 통화
 * @apiBody {String} [destination_country] 목적지 국가 코드
 *
 * @apiSuccess {Object} travelPlan 수정된 여행 계획 정보
 *
 * @apiError {Object} 400 Plan ID is required / Invalid request
 * @apiError {Object} 401 Authentication failed / Unauthorized
 * @apiError {Object} 403 Insufficient permissions
 * @apiError {Object} 404 Travel plan not found
 * @apiError {Object} 500 Internal server error
 *
 * @apiDescription 여행 계획의 기본 정보를 수정합니다.
 * 인증된 사용자만 접근 가능하며, 해당 여행의 소유자(owner) 또는 편집자(editor) 권한이 있는 사용자만 수정할 수 있습니다.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const body = await request.json();

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

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // 기존 여행 계획 조회
    const { data: existingPlan, error: fetchError } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (fetchError || !existingPlan) {
      return NextResponse.json(
        { error: 'Travel plan not found' },
        { status: 404 }
      );
    }

    // 권한 확인: 소유자이거나 편집자인지 확인
    const isOwner = existingPlan.owner_id === user.id;
    let hasEditPermission = isOwner;

    if (!isOwner) {
      const { data: participant } = await supabase
        .from('travel_plan_participants')
        .select('role')
        .eq('plan_id', planId)
        .eq('user_id', user.id)
        .single();

      hasEditPermission = participant?.role === 'editor';
    }

    if (!hasEditPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // 수정할 데이터 준비
    const updateData: {
      updated_at: string;
      title?: string;
      location?: string;
      start_date?: string;
      end_date?: string;
      target_budget?: string;
      budget_currency?: string;
      destination_country?: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.location !== undefined) updateData.location = body.location.trim();
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.target_budget !== undefined)
      updateData.target_budget = body.target_budget;
    if (body.budget_currency !== undefined)
      updateData.budget_currency = body.budget_currency;
    if (body.destination_country !== undefined)
      updateData.destination_country = body.destination_country;

    // 여행 계획 수정
    const { data: updatedPlan, error: updateError } = await supabase
      .from('travel_plans')
      .update(updateData)
      .eq('id', planId)
      .select()
      .single();

    if (updateError) {
      console.error('Travel plan update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update travel plan' },
        { status: 500 }
      );
    }

    // 활동 로그 생성
    await supabase.from('travel_activities').insert({
      plan_id: planId,
      user_id: user.id,
      type: 'plan_updated',
      description: '여행 계획 정보가 수정되었습니다.',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ travelPlan: updatedPlan });
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @api {delete} /api/travel/:id 여행 계획 삭제
 * @apiName DeleteTravelPlan
 * @apiGroup Travel
 *
 * @apiParam {String} id 여행 계획의 고유 ID
 *
 * @apiSuccess {Object} message 삭제 성공 메시지
 *
 * @apiError {Object} 400 Plan ID is required
 * @apiError {Object} 401 Authentication failed / Unauthorized
 * @apiError {Object} 403 Insufficient permissions
 * @apiError {Object} 404 Travel plan not found
 * @apiError {Object} 500 Internal server error
 *
 * @apiDescription 여행 계획을 삭제합니다.
 * 인증된 사용자만 접근 가능하며, 해당 여행의 소유자(owner)만 삭제할 수 있습니다.
 * 삭제 시 관련된 모든 데이터(참여자, 블록, 활동 로그 등)도 함께 삭제됩니다.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;

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

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // 기존 여행 계획 조회
    const { data: existingPlan, error: fetchError } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (fetchError || !existingPlan) {
      return NextResponse.json(
        { error: 'Travel plan not found' },
        { status: 404 }
      );
    }

    // 권한 확인: 소유자만 삭제 가능
    if (existingPlan.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // 관련 데이터 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
    // 1. 활동 로그 삭제
    await supabase.from('travel_activities').delete().eq('plan_id', planId);

    // 2. 참여자 삭제
    await supabase
      .from('travel_plan_participants')
      .delete()
      .eq('plan_id', planId);

    // 3. 블록 삭제
    await supabase.from('travel_blocks').delete().eq('plan_id', planId);

    // 4. 여행 계획 삭제
    const { error: deleteError } = await supabase
      .from('travel_plans')
      .delete()
      .eq('id', planId);

    if (deleteError) {
      console.error('Travel plan delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete travel plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Travel plan deleted successfully' });
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;

    const supabase = await createServerSupabaseClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('API: Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // 1. 여행 계획 기본 정보 조회
    const { data: travelPlan, error: planError } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) {
      return NextResponse.json(
        { error: 'Travel plan not found' },
        { status: 404 }
      );
    }

    if (!travelPlan) {
      return NextResponse.json(
        { error: 'Travel plan not found' },
        { status: 404 }
      );
    }

    // 2. 참여자 목록 조회
    const { data: participants, error: participantsError } = await supabase
      .from('travel_plan_participants')
      .select('*')
      .eq('plan_id', planId);

    if (participantsError) {
      console.error('API: Participants fetch error:', participantsError);
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    // 3. 블록 목록 조회 (날짜, 순서대로 정렬)
    const { data: blocks, error: blocksError } = await supabase
      .from('travel_blocks')
      .select('*')
      .eq('plan_id', planId)
      .order('day_number', { ascending: true })
      .order('order_index', { ascending: true });

    if (blocksError) {
      console.error('API: Blocks fetch error:', blocksError);
      return NextResponse.json(
        { error: 'Failed to fetch blocks' },
        { status: 500 }
      );
    }

    // 4. 최근 활동 로그 5개 조회
    const { data: activities, error: activitiesError } = await supabase
      .from('travel_activities')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (activitiesError) {
      console.error('API: Activities fetch error:', activitiesError);
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      );
    }

    // 5. 사용자 프로필 조회 (참여자 + 활동 작성자)
    type ParticipantRow = {
      id: string;
      plan_id: string;
      user_id: string;
      role: string;
      joined_at: string;
    };
    type BlockRow = { id: string; title: string };
    type ActivityRow = {
      id: string;
      plan_id: string;
      user_id: string;
      block_id?: string | null;
      type?: string | null;
      activity_type?: string | null;
      description?: string | null;
      content?: string | null;
      created_at: string;
    };

    const participantUserIds = ((participants as ParticipantRow[] | null) || [])
      .map((p) => p.user_id)
      .filter(Boolean);
    const activityUserIds = ((activities as ActivityRow[] | null) || [])
      .map((a) => a.user_id)
      .filter(Boolean);
    const uniqueUserIds = Array.from(
      new Set<string>([...participantUserIds, ...activityUserIds])
    );

    const profilesMap = new Map<
      string,
      { nickname?: string; profile_image_url?: string }
    >();
    if (uniqueUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, nickname, profile_image_url')
        .in('id', uniqueUserIds);

      for (const p of profiles || []) {
        const { nickname, profile_image_url } = p as {
          nickname?: string;
          profile_image_url?: string;
          id: string;
        };
        profilesMap.set(p.id as string, {
          nickname: nickname ?? undefined,
          profile_image_url: profile_image_url ?? undefined,
        });
      }
    }

    // 6. 블록 제목 맵
    const blocksMap = new Map<string, string>();
    for (const b of (blocks as BlockRow[] | null) || []) {
      blocksMap.set(b.id, b.title);
    }

    // 7. 통합 응답 데이터 구성 (프로필/제목 매핑 반영)
    const response = {
      travelPlan,
      participants:
        ((participants as ParticipantRow[] | null) || []).map((p) => {
          const profile = profilesMap.get(p.user_id) || {};
          return {
            id: p.id,
            role: p.role,
            joined_at: p.joined_at,
            user_id: p.user_id,
            nickname: profile.nickname || '(이름 없음)',
            profile_image_url: profile.profile_image_url,
            isOnline: false,
          };
        }) || [],
      blocks: blocks || [],
      activities:
        ((activities as ActivityRow[] | null) || []).map((a) => {
          const profile = profilesMap.get(a.user_id) || {};
          const type = a.type ?? a.activity_type;
          const blockTitle = a.block_id ? blocksMap.get(a.block_id) : undefined;
          // 콘텐츠가 비어있으면 의미 있는 메시지 생성
          const contentFallback = (() => {
            if (type === 'block_created') {
              return `${profile.nickname || '사용자'}님이 "${blockTitle || '블록'}"을 추가했습니다`;
            }
            if (type === 'block_updated') {
              return `${profile.nickname || '사용자'}님이 "${blockTitle || '블록'}"을 수정했습니다`;
            }
            if (type === 'block_move') {
              return `${profile.nickname || '사용자'}님이 "${blockTitle || '블록'}"을 이동했습니다`;
            }
            if (type === 'block_deleted') {
              return `${profile.nickname || '사용자'}님이 블록을 삭제했습니다`;
            }
            if (type === 'comment') {
              return `${profile.nickname || '사용자'}님이 댓글을 남겼습니다`;
            }
            if (type === 'participant_added') {
              return `${profile.nickname || '새 참여자'}님이 참여했습니다`;
            }
            if (type === 'participant_removed') {
              return `${profile.nickname || '사용자'}님이 나갔습니다`;
            }
            return a.description || '활동이 기록되었습니다';
          })();

          return {
            id: a.id,
            type,
            user: {
              id: a.user_id,
              nickname: profile.nickname || '(이름 없음)',
              profile_image_url: profile.profile_image_url,
            },
            content: a.content ?? a.description ?? contentFallback,
            timestamp: a.created_at,
            blockId: a.block_id || undefined,
            blockTitle,
          };
        }) || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
