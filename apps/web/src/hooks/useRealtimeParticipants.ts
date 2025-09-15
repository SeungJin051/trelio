import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client/supabase';

/**
 * 실시간 참여자 동기화를 위한 훅
 * travel_plan_participants 테이블의 변경사항을 실시간으로 감지하고 캐시를 업데이트합니다.
 */
export const useRealtimeParticipants = (planId: string) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!planId) return;

    // travel_plan_participants 테이블 변경사항 구독
    const participantsChannel = supabase
      .channel(`participants-${planId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모든 이벤트
          schema: 'public',
          table: 'travel_plan_participants',
          filter: `plan_id=eq.${planId}`,
        },
        (payload) => {
          // 참여자 목록 캐시 무효화 및 새로고침
          queryClient.invalidateQueries({
            queryKey: ['travel-participants', planId],
          });

          // 여행 상세 정보도 함께 갱신
          queryClient.invalidateQueries({
            queryKey: ['travel-detail', planId],
          });

          // 참여자 수 변경 시에만 목록 갱신
          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'DELETE'
          ) {
            queryClient.invalidateQueries({
              queryKey: ['travel-plans'],
            });
            queryClient.invalidateQueries({
              queryKey: ['invited-travel-plans'],
            });
          }
        }
      )
      .subscribe();

    // 정리 함수
    return () => {
      supabase.removeChannel(participantsChannel);
    };
  }, [planId, queryClient, supabase]);
};
