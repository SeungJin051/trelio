import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { TravelDetailResponse } from '@/lib/api/trips';
import { createClient } from '@/lib/supabase/client/supabase';

export function useTravelRealtime(planId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!planId) return;

    const supabase = createClient();

    // 실시간 구독 설정
    const channel = supabase
      .channel(`travel-${planId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_blocks',
          filter: `plan_id=eq.${planId}`,
        },
        (payload) => {
          console.log('Block change:', payload);

          // 캐시 무효화하여 최신 데이터 가져오기
          queryClient.invalidateQueries({
            queryKey: ['travel-detail', planId],
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_activities',
          filter: `plan_id=eq.${planId}`,
        },
        (payload) => {
          console.log('Activity change:', payload);

          // 활동 로그가 추가되면 캐시 업데이트
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData<TravelDetailResponse>(
              ['travel-detail', planId],
              (oldData) => {
                if (!oldData) return oldData;

                // 새로운 활동을 맨 앞에 추가
                const newActivity = {
                  id: payload.new.id,
                  type: payload.new.type,
                  user: {
                    id: payload.new.user_id,
                    nickname: '사용자', // TODO: 사용자 정보 조회
                    profile_image_url: undefined,
                  },
                  content: payload.new.content,
                  timestamp: payload.new.created_at,
                  blockId: payload.new.block_id,
                  blockTitle: undefined, // TODO: 블록 정보 조회
                };

                return {
                  ...oldData,
                  activities: [newActivity, ...oldData.activities.slice(0, 4)], // 최대 5개 유지
                };
              }
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_plan_participants',
          filter: `plan_id=eq.${planId}`,
        },
        (payload) => {
          console.log('Participant change:', payload);

          // 참여자 변경 시 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ['travel-detail', planId],
          });
        }
      )
      .subscribe();

    // 클린업 함수
    return () => {
      supabase.removeChannel(channel);
    };
  }, [planId, queryClient]);
}
