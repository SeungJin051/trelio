/**
 * @api {get} /api/todos 투두리스트 조회
 * @apiName GetTodos
 * @apiGroup Todos
 *
 * @apiParam {String} planId 여행 계획의 고유 ID (query parameter)
 *
 * @apiSuccess {Array} todos 투두 목록
 * @apiSuccess {String} todos.id 투두 ID
 * @apiSuccess {String} todos.plan_id 여행 계획 ID
 * @apiSuccess {String} todos.title 투두 제목
 * @apiSuccess {String} todos.description 투두 설명
 * @apiSuccess {Boolean} todos.is_completed 완료 여부
 * @apiSuccess {String} todos.assigned_user_id 담당자 ID
 * @apiSuccess {String} todos.created_by 생성자 ID
 * @apiSuccess {String} todos.due_date 마감일
 * @apiSuccess {Number} todos.priority 우선순위
 * @apiSuccess {String} todos.created_at 생성 시간
 * @apiSuccess {String} todos.updated_at 수정 시간
 * @apiSuccess {Object} todos.assignee 담당자 정보
 * @apiSuccess {Object} todos.creator 생성자 정보
 *
 * @api {post} /api/todos 투두 생성
 * @apiName CreateTodo
 * @apiGroup Todos
 *
 * @apiParam {String} plan_id 여행 계획 ID
 * @apiParam {String} title 투두 제목
 * @apiParam {String} [description] 투두 설명
 * @apiParam {String} [assigned_user_id] 담당자 ID
 * @apiParam {String} [due_date] 마감일
 * @apiParam {Number} [priority] 우선순위 (기본값: 1)
 *
 * @apiSuccess {Object} todo 생성된 투두 정보
 *
 * @apiError {Object} 400 Plan ID is required / Invalid request
 * @apiError {Object} 401 Authentication failed
 * @apiError {Object} 403 Unauthorized access to travel plan
 * @apiError {Object} 500 Internal server error
 *
 * @apiDescription 여행 계획의 투두리스트를 조회하거나 새로운 투두를 생성합니다.
 * 인증된 사용자만 접근 가능하며, 해당 여행 계획의 참여자만 투두를 조회/생성할 수 있습니다.
 */
import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/client/supabase-server';

/**
 * 투두리스트 조회 (GET)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json(
        { error: '여행 계획 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 여행 계획 참여자 확인
    const { data: participant, error: participantError } = await supabase
      .from('travel_plan_participants')
      .select('id')
      .eq('plan_id', planId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: '해당 여행 계획에 접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 투두리스트 조회
    const { data: todos, error: todosError } = await supabase
      .from('travel_todos')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false });

    if (todosError) {
      console.error('투두리스트 조회 실패:', todosError);
      return NextResponse.json(
        { error: '투두리스트 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 투두가 없는 경우 빈 배열 반환
    if (!todos || todos.length === 0) {
      return NextResponse.json({ todos: [] });
    }

    // 사용자 정보 조회 (profiles 테이블이 있는 경우)
    type UserProfile = {
      id: string;
      nickname?: string;
      profile_image_url?: string;
    };
    const usersMap = new Map<string, UserProfile>();
    try {
      const userIds = new Set<string>();
      todos.forEach((todo) => {
        if (todo.assigned_user_id) userIds.add(todo.assigned_user_id as string);
        if (todo.created_by) userIds.add(todo.created_by as string);
      });

      if (userIds.size > 0) {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, nickname, profile_image_url')
          .in('id', Array.from(userIds));

        if (!usersError && users) {
          users.forEach((u) => {
            usersMap.set(u.id as string, u as UserProfile);
          });
        }
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }

    // 투두 데이터에 사용자 정보 추가
    const todosWithUsers = todos.map((todo) => ({
      ...todo,
      assignee: todo.assigned_user_id
        ? usersMap.get(todo.assigned_user_id as string) || null
        : null,
      creator: usersMap.get(todo.created_by as string) || null,
    }));

    return NextResponse.json({ todos: todosWithUsers });
  } catch (error) {
    console.error('투두리스트 조회 API 에러:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 새 투두 생성 (POST)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      plan_id,
      title,
      description,
      assigned_user_id,
      due_date,
      priority = 0,
    } = body;

    if (!plan_id || !title) {
      return NextResponse.json(
        { error: '여행 계획 ID와 제목은 필수입니다.' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 여행 계획 참여자 확인
    const { data: participant, error: participantError } = await supabase
      .from('travel_plan_participants')
      .select('id')
      .eq('plan_id', plan_id)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: '해당 여행 계획에 접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 담당자가 지정된 경우, 해당 사용자가 여행 계획 참여자인지 확인
    if (assigned_user_id) {
      const { data: assigneeParticipant, error: assigneeError } = await supabase
        .from('travel_plan_participants')
        .select('id')
        .eq('plan_id', plan_id)
        .eq('user_id', assigned_user_id)
        .single();

      if (assigneeError || !assigneeParticipant) {
        return NextResponse.json(
          { error: '담당자가 해당 여행 계획의 참여자가 아닙니다.' },
          { status: 400 }
        );
      }
    }

    // 투두 생성
    const { data: newTodo, error: createError } = await supabase
      .from('travel_todos')
      .insert({
        plan_id,
        title,
        description,
        assigned_user_id,
        created_by: user.id,
        due_date,
        priority,
      })
      .select('*')
      .single();

    if (createError) {
      console.error('투두 생성 실패:', createError);
      return NextResponse.json(
        { error: '투두 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 사용자 정보 조회 및 추가
    type UserProfile = {
      id: string;
      nickname?: string;
      profile_image_url?: string;
    };
    const usersMap = new Map<string, UserProfile>();
    try {
      const userIds = new Set<string>();
      if (newTodo.assigned_user_id) userIds.add(newTodo.assigned_user_id);
      if (newTodo.created_by) userIds.add(newTodo.created_by);

      if (userIds.size > 0) {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, nickname, profile_image_url')
          .in('id', Array.from(userIds));

        if (!usersError && users) {
          users.forEach((u) => {
            usersMap.set(u.id as string, u as UserProfile);
          });
        }
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }

    const todoWithUsers = {
      ...newTodo,
      assignee: newTodo.assigned_user_id
        ? usersMap.get(newTodo.assigned_user_id)
        : null,
      creator: usersMap.get(newTodo.created_by),
    };

    return NextResponse.json({ todo: todoWithUsers }, { status: 201 });
  } catch (error) {
    console.error('투두 생성 API 에러:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
