import { useEffect } from 'react';

import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';

import type {
  ActivityItem as ApiActivityItem,
  TravelDetailResponse,
} from '@/lib/api/travel';
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
        (_payload) => {
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
        (
          payload: RealtimePostgresChangesPayload<{
            id: string;
            plan_id: string;
            user_id: string;
            block_id?: string | null;
            type?: string | null;
            activity_type?: string | null;
            content?: string | null;
            description?: string | null;
            created_at: string;
          }>
        ) => {
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

                const rawType =
                  payload.new.type || payload.new.activity_type || undefined;
                const mapActivityType = (
                  t?: string | null
                ): ApiActivityItem['type'] => {
                  switch (t) {
                    case 'block_created':
                    case 'block_add':
                      return 'block_add';
                    case 'block_updated':
                    case 'block_edit':
                      return 'block_edit';
                    case 'block_deleted':
                    case 'block_delete':
                      return 'block_delete';
                    case 'block_move':
                      return 'block_move';
                    case 'participant_join':
                    case 'participant_added':
                      return 'participant_join';
                    case 'comment':
                    default:
                      return 'comment';
                  }
                };
                const inferredType = mapActivityType(rawType);
                const inferredContent =
                  payload.new.content || payload.new.description || undefined;

                const newActivity: ApiActivityItem = {
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
                        case 'block_add':
                          return `${name}님이 "${title}"을 추가했습니다`;
                        case 'block_edit':
                          return `${name}님이 "${title}"을 수정했습니다`;
                        case 'block_move':
                          return `${name}님이 "${title}"을 이동했습니다`;
                        case 'block_delete':
                          return `${name}님이 블록을 삭제했습니다`;
                        case 'participant_join':
                          return `${name}님이 참여했습니다`;
                        case 'comment':
                        default:
                          return '활동이 기록되었습니다';
                      }
                    })(),
                  timestamp: payload.new.created_at,
                  blockId: payload.new.block_id ?? undefined,
                  blockTitle: relatedBlock?.title,
                };

                const nextActivities = [
                  newActivity,
                  ...(oldData.activities || []),
                ];
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
        (_payload) => {
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
