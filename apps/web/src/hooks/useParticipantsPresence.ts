import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { TravelDetailResponse } from '@/lib/api/travel';
import { createClient } from '@/lib/supabase/client/supabase';

type Params = {
  planId: string;
  userId?: string;
  nickname?: string;
  profileImageUrl?: string;
};

/**
 * 여행 상세 페이지에서 참여자 온라인/오프라인 Presence를 추적하는 훅
 * - Supabase Realtime Presence 사용 (서버 추가 구성 불필요)
 * - presence state를 React Query 캐시에 반영하여 UI에 전달
 */
export function useParticipantsPresence({
  planId,
  userId,
  nickname,
  profileImageUrl,
}: Params) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!planId || !userId) return;

    const supabase = createClient();

    // presence key를 사용자 ID로 설정
    const channel = supabase.channel(`presence-travel-${planId}`, {
      config: {
        presence: { key: userId },
      },
    });

    const updateOnlineStateFromPresence = () => {
      const state = channel.presenceState();
      const onlineUserIds = new Set<string>(Object.keys(state));

      // participants의 isOnline 값을 presence state로 반영
      queryClient.setQueryData<TravelDetailResponse>(
        ['travel-detail', planId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            participants: old.participants.map((p) => ({
              ...p,
              // user_id 기준으로 presence 매칭
              isOnline: onlineUserIds.has(p.user_id),
            })),
          };
        }
      );
    };

    // presence 이벤트 구독 (sync/joins/leaves 모두에서 동기화)
    channel
      .on('presence', { event: 'sync' }, updateOnlineStateFromPresence)
      .on('presence', { event: 'join' }, updateOnlineStateFromPresence)
      .on('presence', { event: 'leave' }, updateOnlineStateFromPresence)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // 내 presence broadcast
          await channel.track({
            user_id: userId,
            nickname,
            profile_image_url: profileImageUrl,
            last_seen_at: new Date().toISOString(),
          });
          // 현재 presence 상태 즉시 반영
          updateOnlineStateFromPresence();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [planId, userId, nickname, profileImageUrl, queryClient]);
}
