import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { TravelDetailResponse } from '@/lib/api/travel';
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
          console.log('Activity change:', {
            eventType: payload.eventType,
            newRow: payload.new,
          });

          // 활동 로그가 추가되면 캐시 업데이트
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData<TravelDetailResponse>(
              ['travel-detail', planId],
              (oldData) => {
                if (!oldData) return oldData;

                // 새로운 활동을 맨 앞에 추가 (내용 비어있을 때 가독성 있는 문구 생성)
                const participant = oldData.participants.find(
                  (p) => p.user_id === payload.new.user_id
                );
                const relatedBlock = oldData.blocks.find(
                  (b) => b.id === payload.new.block_id
                );

                const inferredType =
                  (payload.new as any).type ||
                  (payload.new as any).activity_type;
                const inferredContent =
                  (payload.new as any).content ||
                  (payload.new as any).description;

                const newActivity = {
                  id: payload.new.id,
                  type: inferredType,
                  user: {
                    id: payload.new.user_id,
                    nickname: participant?.nickname || '사용자',
                    profile_image_url: participant?.profile_image_url,
                  },
                  content:
                    inferredContent ||
                    (() => {
                      const name = participant?.nickname || '사용자';
                      const title = relatedBlock?.title || '블록';
                      switch (inferredType) {
                        case 'block_created':
                          return `${name}님이 "${title}"을 추가했습니다`;
                        case 'block_updated':
                          return `${name}님이 "${title}"을 수정했습니다`;
                        case 'block_move':
                          return `${name}님이 "${title}"을 이동했습니다`;
                        case 'block_deleted':
                          return `${name}님이 블록을 삭제했습니다`;
                        case 'comment':
                          return `${name}님이 댓글을 남겼습니다`;
                        case 'participant_added':
                          return `${name}님이 참여했습니다`;
                        case 'participant_removed':
                          return `${name}님이 나갔습니다`;
                        default:
                          return '활동이 기록되었습니다';
                      }
                    })(),
                  timestamp: payload.new.created_at,
                  blockId: payload.new.block_id,
                  blockTitle: relatedBlock?.title,
                };

                const nextActivities = [newActivity, ...oldData.activities];
                // 최대 5개 유지
                const trimmed = nextActivities.slice(0, 5);
                return {
                  ...oldData,
                  activities: trimmed,
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
