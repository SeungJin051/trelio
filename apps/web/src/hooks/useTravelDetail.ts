import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createBlock,
  type CreateBlockRequest,
  deleteBlock,
  fetchTravelDetail,
  moveBlock,
  type MoveBlockRequest,
  type TravelDetailResponse,
  updateBlock,
  type UpdateBlockRequest,
} from '@/lib/api/travel';

export function useTravelDetail(planId: string) {
  return useQuery({
    queryKey: ['travel-detail', planId],
    queryFn: () => fetchTravelDetail(planId),
    enabled: !!planId,
    staleTime: 1000 * 60 * 5, // 5분
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
      data: UpdateBlockRequest;
    }) => updateBlock(blockId, data),
    onSuccess: (updatedBlock, variables) => {
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
    onSuccess: (_, variables) => {
      // 블록 이동 후 전체 데이터를 다시 가져옴 (순서가 복잡하게 변경되므로)
      // 실제로는 낙관적 업데이트를 구현할 수 있지만, 복잡성을 줄이기 위해 무효화
      queryClient.invalidateQueries({ queryKey: ['travel-detail'] });
    },
  });
}
