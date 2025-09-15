import { useEffect } from 'react';

import { createClient } from '@/lib/supabase/client/supabase';

/**
 * 실시간 할일 동기화를 위한 훅
 * travel_todos 테이블의 변경사항을 실시간으로 감지합니다.
 */
export const useRealtimeTodos = <T = unknown>(
  planId: string,
  onTodosChange?: (todos: T[]) => void
) => {
  const supabase = createClient();

  useEffect(() => {
    if (!planId) return;

    // travel_todos 테이블 변경사항 구독
    const todosChannel = supabase
      .channel(`todos-${planId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모든 이벤트
          schema: 'public',
          table: 'travel_todos',
          filter: `plan_id=eq.${planId}`,
        },
        async () => {
          // 할일 목록 다시 조회해서 콜백으로 전달
          if (onTodosChange) {
            try {
              const response = await fetch(`/api/todos?planId=${planId}`);
              if (response.ok) {
                const data = await response.json();
                onTodosChange(data.todos || []);
              }
            } catch {
              // 에러 발생 시 무시 (네트워크 문제 등)
            }
          }
        }
      )
      .subscribe();

    // 정리 함수
    return () => {
      supabase.removeChannel(todosChannel);
    };
  }, [planId, onTodosChange, supabase]);
};
