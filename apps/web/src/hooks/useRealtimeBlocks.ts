import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client/supabase';

/**
 * 실시간 블록 동기화를 위한 훅
 * travel_blocks 테이블의 변경사항을 실시간으로 감지하고 캐시를 업데이트합니다.
 */
export const useRealtimeBlocks = (planId: string) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!planId) return;

    // travel_blocks 테이블 변경사항 구독
    const blocksChannel = supabase
      .channel(`blocks-${planId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 모든 이벤트
          schema: 'public',
          table: 'travel_blocks',
          filter: `plan_id=eq.${planId}`,
        },
        (payload) => {
          // 블록 목록 캐시 무효화 및 새로고침
          queryClient.invalidateQueries({
            queryKey: ['travel-blocks', planId],
          });

          // 여행 상세 정보도 함께 갱신
          queryClient.invalidateQueries({
            queryKey: ['travel-detail', planId],
          });

          // 준비율 점수도 함께 갱신 (블록 추가/삭제 시에만)
          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'DELETE'
          ) {
            queryClient.invalidateQueries({
              queryKey: ['readiness-score', planId],
            });
          }
        }
      )
      .subscribe();

    // travel_activities 테이블도 구독 (활동 로그 실시간 업데이트)
    const activitiesChannel = supabase
      .channel(`activities-${planId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'travel_activities',
          filter: `plan_id=eq.${planId}`,
        },
        () => {
          // 최근 활동 위젯 갱신
          queryClient.invalidateQueries({
            queryKey: ['recent-activities', planId],
          });
        }
      )
      .subscribe();

    // 정리 함수
    return () => {
      supabase.removeChannel(blocksChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [planId, queryClient, supabase]);
};
