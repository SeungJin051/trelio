import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client/supabase';

/**
 * 실시간 여행 정보 동기화를 위한 훅
 * travel_plans 테이블의 변경사항을 실시간으로 감지하고 캐시를 업데이트합니다.
 */
export const useRealtimeTravelInfo = (planId: string) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!planId) return;

    // travel_plans 테이블 변경사항 구독
    const travelPlansChannel = supabase
      .channel(`travel-plan-${planId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // 여행 정보 수정만 감지
          schema: 'public',
          table: 'travel_plans',
          filter: `id=eq.${planId}`,
        },
        () => {
          // 여행 상세 정보 캐시 무효화 및 새로고침
          queryClient.invalidateQueries({
            queryKey: ['travel-detail', planId],
          });

          // 사이드바 여행 목록도 갱신 (제목, 날짜 등이 변경될 수 있음)
          queryClient.invalidateQueries({
            queryKey: ['travel-plans'],
          });

          // 초대받은 여행 목록도 갱신
          queryClient.invalidateQueries({
            queryKey: ['invited-travel-plans'],
          });

          // 준비율 점수도 갱신 (날짜가 변경되면 준비율 계산이 달라짐)
          queryClient.invalidateQueries({
            queryKey: ['readiness-score', planId],
          });
        }
      )
      .subscribe();

    // 정리 함수
    return () => {
      supabase.removeChannel(travelPlansChannel);
    };
  }, [planId, queryClient, supabase]);
};
