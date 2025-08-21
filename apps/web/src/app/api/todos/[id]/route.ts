import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/client/supabase-server';

// 타입 정의
interface Todo {
  id: string;
  plan_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  assigned_user_id?: string;
  created_by: string;
  due_date?: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  nickname?: string;
  profile_image_url?: string;
}

/**
 * 투두 수정 (PATCH)
 */
export async function PATCH(request: Request, context: any) {
  try {
    const todoId = context?.params?.id as string;
    const body = await request.json();

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

    // 기존 투두 조회 및 권한 확인
    const { data: existingTodo, error: fetchError } = await supabase
      .from('travel_todos')
      .select(
        `
        *,
        travel_plan:plan_id(
          id,
          owner_id
        )
      `
      )
      .eq('id', todoId)
      .single();

    if (fetchError || !existingTodo) {
      return NextResponse.json(
        { error: '투두를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인: 투두 생성자이거나 여행 계획 소유자
    const isCreator = existingTodo.created_by === user.id;
    // travel_plan은 single() 결과에서 단일 객체. 타입 경고 회피를 위해 any 캐스팅
    const isOwner = (existingTodo as any).travel_plan?.owner_id === user.id;

    if (!isCreator && !isOwner) {
      return NextResponse.json(
        { error: '투두를 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 담당자가 변경되는 경우, 해당 사용자가 여행 계획 참여자인지 확인
    if (body.assigned_user_id !== undefined && body.assigned_user_id !== null) {
      const { data: assigneeParticipant, error: assigneeError } = await supabase
        .from('travel_plan_participants')
        .select('id')
        .eq('plan_id', existingTodo.plan_id)
        .eq('user_id', body.assigned_user_id)
        .single();

      if (assigneeError || !assigneeParticipant) {
        return NextResponse.json(
          { error: '담당자가 해당 여행 계획의 참여자가 아닙니다.' },
          { status: 400 }
        );
      }
    }

    // 투두 업데이트
    const { data: updatedTodo, error: updateError } = await supabase
      .from('travel_todos')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', todoId)
      .select('*')
      .single();

    if (updateError) {
      console.error('투두 업데이트 실패:', updateError);
      return NextResponse.json(
        { error: '투두 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 사용자 정보 조회
    const usersMap = new Map<string, User>();
    try {
      const userIds = new Set<string>();
      if (updatedTodo.assigned_user_id)
        userIds.add(updatedTodo.assigned_user_id);
      if (updatedTodo.created_by) userIds.add(updatedTodo.created_by);

      if (userIds.size > 0) {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, nickname, profile_image_url')
          .in('id', Array.from(userIds));

        if (!usersError && users) {
          users.forEach((user: User) => {
            usersMap.set(user.id, user);
          });
        }
      }
    } catch (error) {
      console.log(
        'profiles 테이블을 찾을 수 없습니다. 기본 정보만 사용합니다.'
      );
    }

    // 사용자 정보 추가
    const todoWithUsers = {
      ...updatedTodo,
      assignee: updatedTodo.assigned_user_id
        ? usersMap.get(updatedTodo.assigned_user_id)
        : null,
      creator: usersMap.get(updatedTodo.created_by),
    };

    return NextResponse.json({ todo: todoWithUsers });
  } catch (error) {
    console.error('투두 수정 API 에러:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 투두 삭제 (DELETE)
 */
export async function DELETE(request: Request, context: any) {
  try {
    const todoId = context?.params?.id as string;

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

    // 기존 투두 조회 및 권한 확인
    const { data: existingTodo, error: fetchError } = await supabase
      .from('travel_todos')
      .select(
        `
        id,
        created_by,
        travel_plan:plan_id(
          id,
          owner_id
        )
      `
      )
      .eq('id', todoId)
      .single();

    if (fetchError || !existingTodo) {
      return NextResponse.json(
        { error: '투두를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인: 투두 생성자이거나 여행 계획 소유자
    const isCreator = existingTodo.created_by === user.id;
    const isOwner = (existingTodo as any).travel_plan?.owner_id === user.id;

    if (!isCreator && !isOwner) {
      return NextResponse.json(
        { error: '투두를 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 투두 삭제
    const { error: deleteError } = await supabase
      .from('travel_todos')
      .delete()
      .eq('id', todoId);

    if (deleteError) {
      console.error('투두 삭제 실패:', deleteError);
      return NextResponse.json(
        { error: '투두 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '투두가 삭제되었습니다.' });
  } catch (error) {
    console.error('투두 삭제 API 에러:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
