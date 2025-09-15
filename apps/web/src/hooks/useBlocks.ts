import { useCallback, useMemo, useState } from 'react';

import { arrayMove } from '@dnd-kit/sortable';
import type { PostgrestError } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TravelDetailResponse } from '@/lib/api/travel';
import { getCurrencyFromLocation } from '@/lib/currency';
import { createClient } from '@/lib/supabase/client/supabase';
import {
  BlockEvent,
  type BlockMeta,
  BlockType,
  type Cost,
  CreateBlockRequest,
  DayBlocks,
  type Location,
  MoveBlockRequest,
  type TimeRange,
  TravelBlock,
  TravelTimeline,
  UpdateBlockRequest,
} from '@/types/travel/blocks';

import { useSession } from './useSession';
import { useToast } from './useToast';

interface UseBlocksProps {
  planId: string;
  startDate: string;
  endDate: string;
  planLocation?: string;
}

/**
 * 여행 블록 관리를 위한 커스텀 훅
 * 블록의 CRUD 작업과 실시간 동기화를 담당
 */
export const useBlocks = ({
  planId,
  startDate,
  endDate,
  planLocation,
}: UseBlocksProps) => {
  const queryClient = useQueryClient();
  const { userProfile } = useSession();
  const toast = useToast();
  const supabase = createClient();

  // 여행지 위치에 따른 기본 통화 설정
  const defaultCurrency = planLocation
    ? getCurrencyFromLocation(planLocation)
    : 'KRW';

  // 낙관적 업데이트를 위한 임시 상태 (사용자 경험 향상)
  const [optimisticBlocks, setOptimisticBlocks] = useState<TravelBlock[]>([]);
  // 충돌 해결을 위한 상태 (동시 편집 시)
  const [conflictResolution] = useState<{
    blockId: string;
    conflicts: { field: string; localValue: unknown; serverValue: unknown }[];
  } | null>(null);

  // Supabase Row 타입들 정의
  type SupabaseLocationRow = {
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    place_id?: string | null;
  };

  type SupabaseTimeRangeRow = {
    start_time?: string | null;
    end_time?: string | null;
    duration?: number | null;
  };

  type SupabaseCostRow = {
    amount?: number | null;
    currency?: Cost['currency'] | null;
  };

  interface SupabaseTravelBlockRow {
    id: string;
    plan_id: string;
    day_number: number;
    order_index: number;
    block_type: BlockType;
    title: string;
    description?: string | null;
    location?: SupabaseLocationRow | null;
    time_range?: SupabaseTimeRangeRow | null;
    cost?: SupabaseCostRow | null;
    meta?: BlockMeta | null;
    created_by: string;
    created_at: string;
    updated_at: string;
  }

  const isPostgrestError = (err: unknown): err is PostgrestError => {
    return (
      !!err &&
      typeof err === 'object' &&
      'code' in (err as Record<string, unknown>) &&
      'message' in (err as Record<string, unknown>)
    );
  };

  // 블록 데이터 조회 (React Query 사용)
  const {
    data: blocks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['travel-blocks', planId],
    queryFn: async () => {
      if (!planId) {
        return [] as TravelBlock[];
      }

      try {
        // Supabase에서 블록 데이터 조회
        const { data, error } = await supabase
          .from('travel_blocks')
          .select('*')
          .eq('plan_id', planId)
          .order('day_number', { ascending: true })
          .order('order_index', { ascending: true });

        if (error) {
          // 테이블이 존재하지 않는 경우 빈 배열 반환 (초기 상태)
          if (
            (isPostgrestError(error) && error.code === 'PGRST116') ||
            (typeof (error as PostgrestError).message === 'string' &&
              ((error as PostgrestError).message.includes('relation') ||
                (error as PostgrestError).message.includes('does not exist') ||
                (error as PostgrestError).message.includes('travel_blocks')))
          ) {
            return [] as TravelBlock[];
          }
          // 기타 에러도 빈 배열 반환
          return [] as TravelBlock[];
        }

        // Supabase 데이터를 TravelBlock 타입으로 변환
        const rows = (data || []) as SupabaseTravelBlockRow[];
        const mapped: TravelBlock[] = rows.map((block) => {
          const location: Location | undefined = block.location
            ? {
                address: block.location.address,
                latitude: block.location.latitude ?? undefined,
                longitude: block.location.longitude ?? undefined,
                placeId: block.location.place_id ?? undefined,
              }
            : undefined;

          const timeRange: TimeRange | undefined = block.time_range
            ? {
                startTime: block.time_range.start_time ?? undefined,
                endTime: block.time_range.end_time ?? undefined,
                duration: block.time_range.duration ?? undefined,
              }
            : undefined;

          const cost: Cost | undefined = block.cost
            ? {
                amount: block.cost.amount ?? 0,
                currency: (block.cost.currency || 'KRW') as Cost['currency'],
              }
            : undefined;

          return {
            id: block.id,
            planId: block.plan_id,
            dayNumber: block.day_number,
            orderIndex: block.order_index,
            blockType: block.block_type,
            title: block.title,
            description: block.description ?? undefined,
            location,
            timeRange,
            cost,
            meta: block.meta ?? undefined,
            createdBy: block.created_by,
            createdAt: block.created_at,
            updatedAt: block.updated_at,
          } as TravelBlock;
        });

        return mapped;
      } catch {
        return [] as TravelBlock[]; // 에러 발생 시 빈 배열 반환
      }
    },
    enabled: !!planId,
    retry: 1,
    retryDelay: 1000,
    // 최신 데이터 보장을 위해 재진입 시 항상 리패치
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    staleTime: 0,
  });

  // 날짜별로 그룹화된 블록 계산 (타임라인 구성)
  const timeline: TravelTimeline = useMemo(() => {
    // 낙관적 업데이트가 있으면 우선 사용, 없으면 서버 데이터 사용
    const currentBlocks =
      optimisticBlocks.length > 0 ? optimisticBlocks : blocks;
    const start = new Date(startDate);
    const end = new Date(endDate);
    // 여행 기간 계산 (시작일과 종료일 포함)
    const dayCount =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const days: DayBlocks[] = [];

    // 각 날짜별로 블록 그룹화
    for (let i = 0; i < dayCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);

      // 해당 날짜의 블록들 필터링
      const dayBlocks = currentBlocks.filter(
        (block) => block.dayNumber === i + 1
      );

      // 해당 날짜의 총 비용 계산
      const totalCost = dayBlocks.reduce(
        (sum, block) => {
          if (block.cost?.amount) {
            return {
              amount: (sum.amount || 0) + block.cost.amount,
              currency: sum.currency, // 기본 통화 유지
              category: 'other' as const,
            };
          }
          return sum;
        },
        { amount: 0, currency: defaultCurrency, category: 'other' as const }
      );

      // 해당 날짜의 총 소요 시간 계산 (분 단위)
      const totalDuration = dayBlocks.reduce((sum, block) => {
        return sum + (block.timeRange?.duration || 0);
      }, 0);

      days.push({
        dayNumber: i + 1,
        date: currentDate.toISOString().split('T')[0],
        blocks: dayBlocks,
        totalCost,
        totalDuration,
      });
    }

    // 전체 타임라인 구성
    return {
      planId,
      days,
      // 전체 여행의 총 비용 계산
      totalCost: days.reduce(
        (sum, day) => ({
          amount: (sum.amount || 0) + (day.totalCost.amount || 0),
          currency: 'KRW' as const,
          category: 'other' as const,
        }),
        { amount: 0, currency: 'KRW' as const, category: 'other' as const }
      ),
      lastUpdated: new Date().toISOString(),
    };
  }, [blocks, optimisticBlocks, planId, startDate, endDate, defaultCurrency]);

  // 블록 생성 Mutation (낙관적 업데이트 포함)
  const createBlockMutation = useMutation<
    { id: string; title: string },
    unknown,
    CreateBlockRequest,
    { tempId: string }
  >({
    mutationFn: async (request: CreateBlockRequest) => {
      if (!userProfile) throw new Error('로그인이 필요합니다.');

      // 해당 날짜의 다음 order_index 계산 (순서 유지)
      const existingBlocks = blocks.filter(
        (b) => b.dayNumber === request.dayNumber
      );
      const nextOrderIndex =
        existingBlocks.length > 0
          ? Math.max(...existingBlocks.map((b) => b.orderIndex)) + 1
          : 0;

      // 서버 API로 생성(권한 검증/활동로그 통합)
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: request.planId,
          title: request.title,
          description: request.description,
          day_number: request.dayNumber,
          order_index: nextOrderIndex,
          block_type: request.blockType,
          location: request.location,
          start_time: request.timeRange?.startTime,
          end_time: request.timeRange?.endTime,
          cost: request.cost?.amount,
          currency: request.cost?.currency,
        }),
      });

      if (!response.ok) {
        let message = '블록 생성 실패';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch {
          // ignore parse error
        }
        throw new Error(message);
      }

      const data = (await response.json()) as { id: string; title: string };
      return data;
    },
    onMutate: async (newBlock) => {
      // 낙관적 업데이트: 서버 응답을 기다리지 않고 즉시 UI 업데이트
      const tempId = `temp-${Date.now()}`;
      const optimisticBlock: TravelBlock = {
        id: tempId,
        planId: newBlock.planId,
        dayNumber: newBlock.dayNumber,
        orderIndex: blocks.filter((b) => b.dayNumber === newBlock.dayNumber)
          .length,
        blockType: newBlock.blockType,
        title: newBlock.title,
        description: newBlock.description,
        location: newBlock.location,
        timeRange: newBlock.timeRange,
        cost: newBlock.cost,
        meta: newBlock.meta,
        createdBy: userProfile?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setOptimisticBlocks((prev) => [...prev, optimisticBlock]);
      return { tempId } as const;
    },
    onSuccess: (data, _variables, context) => {
      // 성공 시 낙관적 업데이트 제거하고 실제 데이터로 교체
      setOptimisticBlocks((prev) =>
        prev.filter((b) => b.id !== context?.tempId)
      );
      queryClient.invalidateQueries({ queryKey: ['travel-blocks', planId] });
      queryClient.invalidateQueries({ queryKey: ['travel-detail', planId] });
      // 최근 변경사항 캐시에 즉시 반영 (UI 지연 방지)
      try {
        queryClient.setQueryData<TravelDetailResponse>(
          ['travel-detail', planId],
          (old) => {
            if (!old) return old;
            const activity = {
              id: `local-${data.id}`,
              type: 'block_add' as const,
              user: {
                id: userProfile?.id || 'me',
                nickname: userProfile?.nickname || '사용자',
                profile_image_url: userProfile?.profile_image_url,
              },
              content: `${userProfile?.nickname || '사용자'}님이 "${data.title}"을 추가했습니다`,
              timestamp: new Date().toISOString(),
              blockId: data.id,
              blockTitle: data.title,
            };
            const next = [activity, ...(old.activities || [])];
            return {
              ...old,
              activities: next.slice(0, 5),
            };
          }
        );
      } catch (e) {
        console.warn('[useBlocks] failed to inject optimistic activity', e);
      }
      toast.success('일정이 추가되었습니다.');
    },
    onError: (error: unknown, _variables, context) => {
      // 실패 시 낙관적 업데이트 롤백
      setOptimisticBlocks((prev) =>
        prev.filter(
          (b) => b.id !== (context as { tempId: string } | undefined)?.tempId
        )
      );
      const msg =
        error instanceof Error ? error.message : '일정 추가에 실패했습니다.';
      toast.error(msg);
    },
  });

  // 블록 업데이트 Mutation
  const updateBlockMutation = useMutation<unknown, unknown, UpdateBlockRequest>(
    {
      mutationFn: async (request: UpdateBlockRequest) => {
        const { data, error } = await supabase
          .from('travel_blocks')
          .update({
            title: request.title,
            description: request.description,
            location: request.location,
            time_range: request.timeRange,
            cost: request.cost,
            meta: request.meta,
            updated_at: new Date().toISOString(),
          })
          .eq('id', request.id as unknown as string)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['travel-blocks', planId] });
        toast.success('일정이 수정되었습니다.');
      },
      onError: () => {
        toast.error('일정 수정에 실패했습니다.');
      },
    }
  );

  // 블록 삭제 Mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const { error } = await supabase
        .from('travel_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-blocks', planId] });
      toast.success('일정이 삭제되었습니다.');
    },
    onError: () => {
      toast.error('일정 삭제에 실패했습니다.');
    },
  });

  // 블록 이동 Mutation (날짜/순서 변경) - 서버 API 일원화 + 낙관적 업데이트
  const moveBlockMutation = useMutation<
    unknown,
    unknown,
    MoveBlockRequest,
    { previous: TravelBlock[] }
  >({
    mutationFn: async (request: MoveBlockRequest) => {
      const res = await fetch(`/api/blocks/${request.id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDayNumber: request.newDayNumber,
          newOrderIndex: request.newOrderIndex,
        }),
      });
      if (!res.ok) {
        let msg = '일정 이동 실패';
        try {
          const body = await res.json();
          msg = body?.error || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      return await res.json();
    },
    onMutate: async (request) => {
      // 기존 데이터 스냅샷 저장
      const previous = optimisticBlocks.length > 0 ? optimisticBlocks : blocks;

      // 낙관적 재배열 계산
      const next: TravelBlock[] = (() => {
        const copy = [...previous];
        const targetIndex = copy.findIndex((b) => b.id === request.id);
        if (targetIndex === -1) return copy;
        const moving = copy[targetIndex];

        // 소스/타겟 일자 블록 분리
        const sourceDay = moving.dayNumber;
        const targetDay = request.newDayNumber;

        // 같은 날 내 재정렬
        if (sourceDay === targetDay) {
          const dayBlocks = copy
            .filter((b) => b.dayNumber === sourceDay)
            .sort((a, b) => a.orderIndex - b.orderIndex);

          const oldIndex = dayBlocks.findIndex((b) => b.id === request.id);
          const newIndex = Math.max(
            0,
            Math.min(request.newOrderIndex, dayBlocks.length - 1)
          );
          const reordered = arrayMove(dayBlocks, oldIndex, newIndex).map(
            (b, idx) => ({ ...b, orderIndex: idx })
          );
          const othersSameDayRemoved = copy.filter(
            (b) => b.dayNumber !== sourceDay
          );
          return [...othersSameDayRemoved, ...reordered];
        }

        // 다른 날로 이동
        const sourceBlocks = copy
          .filter((b) => b.dayNumber === sourceDay && b.id !== request.id)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((b, idx) => ({ ...b, orderIndex: idx }));

        const targetBlocksBase = copy
          .filter((b) => b.dayNumber === targetDay && b.id !== request.id)
          .sort((a, b) => a.orderIndex - b.orderIndex);

        const clampedIndex = Math.max(
          0,
          Math.min(request.newOrderIndex, targetBlocksBase.length)
        );
        const targetBlocks = [
          ...targetBlocksBase.slice(0, clampedIndex),
          { ...moving, dayNumber: targetDay },
          ...targetBlocksBase.slice(clampedIndex),
        ].map((b, idx) => ({ ...b, orderIndex: idx }));

        // 다른 일자들은 그대로 유지
        const others = copy.filter(
          (b) => b.dayNumber !== sourceDay && b.dayNumber !== targetDay
        );

        return [...others, ...sourceBlocks, ...targetBlocks];
      })();

      setOptimisticBlocks(next);

      // 쿼리 무효화 선반영 (협업 동기화를 위해)
      queryClient.invalidateQueries({ queryKey: ['travel-detail', planId] });
      queryClient.invalidateQueries({ queryKey: ['travel-blocks', planId] });

      return { previous };
    },
    onError: (err, _variables, context) => {
      // 롤백
      if (context?.previous) setOptimisticBlocks(context.previous);
      const msg =
        err instanceof Error ? err.message : '일정 이동에 실패했습니다.';
      toast.error(msg);
    },
    onSuccess: () => {
      // 성공 시 서버 데이터 재동기화
      setOptimisticBlocks([]);
      queryClient.invalidateQueries({ queryKey: ['travel-blocks', planId] });
      queryClient.invalidateQueries({ queryKey: ['travel-detail', planId] });
      toast.success('일정이 이동되었습니다.');
    },
  });

  // 실시간 이벤트 처리 (Socket.IO를 통한 협업 기능)
  const handleBlockEvent = useCallback(
    (event: BlockEvent) => {
      switch (event.type) {
        case 'CREATE_BLOCK':
        case 'UPDATE_BLOCK':
        case 'MOVE_BLOCK':
          // 서버에서 온 변경사항 반영 (다른 사용자의 변경사항)
          queryClient.invalidateQueries({
            queryKey: ['travel-blocks', planId],
          });
          break;

        case 'DELETE_BLOCK':
          queryClient.invalidateQueries({
            queryKey: ['travel-blocks', planId],
          });
          break;
      }
    },
    [queryClient, planId]
  );

  // 편의 함수들 (외부에서 사용하기 쉽게 래핑)
  const createBlock = useCallback(
    (request: CreateBlockRequest) => {
      return createBlockMutation.mutate(request);
    },
    [createBlockMutation]
  );

  const updateBlock = useCallback(
    (request: UpdateBlockRequest) => {
      return updateBlockMutation.mutate(request);
    },
    [updateBlockMutation]
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      return deleteBlockMutation.mutate(blockId);
    },
    [deleteBlockMutation]
  );

  const moveBlock = useCallback(
    (request: MoveBlockRequest) => {
      return moveBlockMutation.mutate(request);
    },
    [moveBlockMutation]
  );

  // 특정 날짜의 블록들 조회 함수
  const getBlocksByDay = useCallback(
    (dayNumber: number) => {
      return (
        timeline.days.find((day) => day.dayNumber === dayNumber)?.blocks || []
      );
    },
    [timeline]
  );

  return {
    // 데이터
    timeline,
    blocks,
    isLoading,
    error,

    // 상태
    conflictResolution,

    // 액션 (CRUD 작업)
    createBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    refetch,

    // 실시간 협업
    handleBlockEvent,

    // 유틸리티
    getBlocksByDay,

    // 로딩 상태 (각 작업별)
    isCreating: createBlockMutation.isPending,
    isUpdating: updateBlockMutation.isPending,
    isDeleting: deleteBlockMutation.isPending,
    isMoving: moveBlockMutation.isPending,
  };
};
