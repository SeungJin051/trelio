import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createBlock,
  deleteBlock,
  fetchTravelDetail,
  moveBlock,
  type MoveBlockRequest,
  type TravelDetailResponse,
  updateBlock,
  type UpdateBlockData,
} from '@/lib/api/travel';
import { createClient } from '@/lib/supabase/client/supabase';

export function useTravelDetail(planId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['travel-detail', planId],
    queryFn: () => fetchTravelDetail(planId),
    enabled: !!planId,
    // 서버 데이터로 캐시 갱신 시, 기존 캐시에 반영돼 있던 presence(isOnline)를 유지
    select: (fresh) => {
      const prev = queryClient.getQueryData<TravelDetailResponse>([
        'travel-detail',
        planId,
      ]);
      if (!prev) return fresh;

      const onlineUserIdSet = new Set(
        (prev.participants || [])
          .filter((p) => p.isOnline)
          .map((p) => p.user_id)
      );

      return {
        ...fresh,
        participants: (fresh.participants || []).map((p) => ({
          ...p,
          isOnline: onlineUserIdSet.has(p.user_id),
        })),
      } as TravelDetailResponse;
    },
    // 최신 데이터 보장을 위해 재진입 시 항상 리패치
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    staleTime: 0,
    gcTime: 1000 * 60 * 10, // 10분
  });
}

export function useCreateBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlock,
    onSuccess: (newBlock, variables) => {
      // 여행 상세 정보 캐시 업데이트
      queryClient.setQueryData<TravelDetailResponse>(
        ['travel-detail', variables.plan_id],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            blocks: [...oldData.blocks, newBlock],
          };
        }
      );
    },
  });
}

export function useUpdateBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      blockId,
      data,
    }: {
      blockId: string;
      data: UpdateBlockData;
    }) => updateBlock(blockId, data),
    onSuccess: (updatedBlock) => {
      // 여행 상세 정보 캐시 업데이트
      queryClient.setQueryData<TravelDetailResponse>(
        ['travel-detail', updatedBlock.plan_id],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            blocks: oldData.blocks.map((block) =>
              block.id === updatedBlock.id ? updatedBlock : block
            ),
          };
        }
      );
    },
  });
}

export function useDeleteBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlock,
    onSuccess: (_, blockId) => {
      // 모든 여행 상세 정보 캐시에서 해당 블록 제거
      queryClient.setQueriesData<TravelDetailResponse>(
        { queryKey: ['travel-detail'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            blocks: oldData.blocks.filter((block) => block.id !== blockId),
          };
        }
      );
    },
  });
}

export function useMoveBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      blockId,
      data,
    }: {
      blockId: string;
      data: MoveBlockRequest;
    }) => moveBlock(blockId, data),
    onSuccess: (_) => {
      // 블록 이동 후 전체 데이터를 다시 가져옴 (순서가 복잡하게 변경되므로)
      // 실제로는 낙관적 업데이트를 구현할 수 있지만, 복잡성을 줄이기 위해 무효화
      queryClient.invalidateQueries({ queryKey: ['travel-detail'] });
    },
  });
}

// 여행 참여자 정보만 조회하는 훅 (아바타 표시용)
export function useTravelParticipants(planId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['travel-participants', planId],
    queryFn: async () => {
      if (!planId) return [];

      try {
        // 1단계: 참여자 목록 조회
        const { data: participants, error: participantsError } = await supabase
          .from('travel_plan_participants')
          .select('id, user_id, role, joined_at')
          .eq('plan_id', planId)
          .order('joined_at', { ascending: true });

        if (participantsError) {
          console.error('참여자 조회 오류:', participantsError);
          console.error('Plan ID:', planId);
          console.error(
            '에러 상세:',
            JSON.stringify(participantsError, null, 2)
          );
          return [];
        }

        if (!participants || participants.length === 0) {
          return [];
        }

        // 2단계: 프로필 정보 조회
        const userIds = participants.map((p) => p.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, nickname, profile_image_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('프로필 조회 오류:', profilesError);
          // 프로필 조회 실패해도 참여자 정보는 반환
        }

        // 3단계: 데이터 결합
        const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

        return participants.map((p) => ({
          id: p.id,
          user_id: p.user_id,
          role: p.role,
          joined_at: p.joined_at,
          nickname: profileMap.get(p.user_id)?.nickname || '사용자',
          profile_image_url:
            profileMap.get(p.user_id)?.profile_image_url || null,
        }));
      } catch (error) {
        console.error('참여자 조회 예외:', error);
        return [];
      }
    },
    enabled: !!planId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
