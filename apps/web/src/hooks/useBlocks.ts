import { useCallback, useEffect, useMemo, useState } from 'react';

import { arrayMove } from '@dnd-kit/sortable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getCurrencyFromLocation } from '@/lib/currency';
import { createClient } from '@/lib/supabase/client/supabase';
import {
  BlockEvent,
  BlockType,
  CreateBlockRequest,
  DayBlocks,
  MoveBlockRequest,
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
  const [conflictResolution, setConflictResolution] = useState<{
    blockId: string;
    conflicts: { field: string; localValue: any; serverValue: any }[];
  } | null>(null);

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
            (error as any).code === 'PGRST116' ||
            (error as any).message.includes('relation') ||
            (error as any).message.includes('does not exist') ||
            (error as any).message.includes('travel_blocks')
          ) {
            return [] as TravelBlock[];
          }
          // 기타 에러도 빈 배열 반환
          return [] as TravelBlock[];
        }

        // Supabase 데이터를 TravelBlock 타입으로 변환
        return (
          (data?.map((block) => ({
            id: (block as any).id,
            planId: (block as any).plan_id,
            dayNumber: (block as any).day_number,
            orderIndex: (block as any).order_index,
            blockType: (block as any).block_type as BlockType,
            title: (block as any).title,
            description: (block as any).description,
            // 위치 정보 변환
            location: (block as any).location
              ? {
                  address: (block as any).location.address,
                  latitude: (block as any).location.latitude,
                  longitude: (block as any).location.longitude,
                  placeId: (block as any).location.place_id,
                }
              : undefined,
            // 시간 정보 변환
            timeRange: (block as any).time_range
              ? {
                  startTime: (block as any).time_range.start_time,
                  endTime: (block as any).time_range.end_time,
                  duration: (block as any).time_range.duration,
                }
              : undefined,
            // 비용 정보 변환
            cost: (block as any).cost
              ? {
                  amount: (block as any).cost.amount,
                  currency: (block as any).cost.currency,
                }
              : undefined,
            meta: (block as any).meta,
            createdBy: (block as any).created_by,
            createdAt: (block as any).created_at,
            updatedAt: (block as any).updated_at,
          })) as TravelBlock[]) || []
        );
      } catch (error) {
        return [] as TravelBlock[]; // 에러 발생 시 빈 배열 반환
      }
    },
    enabled: !!planId,
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
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
  const createBlockMutation = useMutation({
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
        } catch (e) {
          // ignore parse error
        }
        throw new Error(message);
      }

      const data = await response.json();
      return data as any;
    },
    onMutate: async (newBlock) => {
      // 낙관적 업데이트: 서버 응답을 기다리지 않고 즉시 UI 업데이트
      const tempId = `temp-${Date.now()}`;
      const optimisticBlock: TravelBlock = {
        id: tempId,
        planId: (newBlock as any).planId,
        dayNumber: (newBlock as any).dayNumber,
        orderIndex: blocks.filter(
          (b) => b.dayNumber === (newBlock as any).dayNumber
        ).length,
        blockType: (newBlock as any).blockType,
        title: (newBlock as any).title,
        description: (newBlock as any).description,
        location: (newBlock as any).location,
        timeRange: (newBlock as any).timeRange,
        cost: (newBlock as any).cost,
        meta: (newBlock as any).meta,
        createdBy: userProfile?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setOptimisticBlocks((prev) => [...prev, optimisticBlock]);
      return { tempId } as const;
    },
    onSuccess: (data, variables, context) => {
      // 성공 시 낙관적 업데이트 제거하고 실제 데이터로 교체
      setOptimisticBlocks((prev) =>
        prev.filter((b) => b.id !== (context as any)?.tempId)
      );
      queryClient.invalidateQueries({ queryKey: ['travel-blocks', planId] });
      queryClient.invalidateQueries({ queryKey: ['travel-detail', planId] });
      // 최근 변경사항 캐시에 즉시 반영 (UI 지연 방지)
      try {
        queryClient.setQueryData(['travel-detail', planId], (old: any) => {
          if (!old) return old;
          const activity = {
            id: `local-${(data as any).id}`,
            type: 'block_add' as const,
            user: {
              id: userProfile?.id || 'me',
              nickname: userProfile?.nickname || '사용자',
              profile_image_url: userProfile?.profile_image_url,
            },
            content: `${userProfile?.nickname || '사용자'}님이 "${(data as any).title}"을 추가했습니다`,
            timestamp: new Date().toISOString(),
            blockId: (data as any).id,
            blockTitle: (data as any).title,
          };
          const next = [activity, ...(old.activities || [])];
          return {
            ...old,
            activities: next.slice(0, 5),
          };
        });
      } catch (e) {
        console.warn('[useBlocks] failed to inject optimistic activity', e);
      }
      toast.success('일정이 추가되었습니다.');
    },
    onError: (error: any, variables, context) => {
      // 실패 시 낙관적 업데이트 롤백
      setOptimisticBlocks((prev) =>
        prev.filter((b) => b.id !== (context as any)?.tempId)
      );
      const msg =
        typeof error?.message === 'string'
          ? error.message
          : '일정 추가에 실패했습니다.';
      toast.error(msg);
    },
  });

  // 블록 업데이트 Mutation
  const updateBlockMutation = useMutation({
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
        .eq('id', (request as any).id)
        .select()
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-blocks', planId] });
      toast.success('일정이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error('일정 수정에 실패했습니다.');
    },
  });

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
    onError: (error) => {
      toast.error('일정 삭제에 실패했습니다.');
    },
  });

  // 블록 이동 Mutation (날짜/순서 변경)
  const moveBlockMutation = useMutation({
    mutationFn: async (request: MoveBlockRequest) => {
      try {
        // 기존 블록 정보 조회
        const { data: currentBlock, error: fetchError } = await supabase
          .from('travel_blocks')
          .select('*')
          .eq('id', (request as any).id)
          .single();

        if (fetchError) {
          console.error('블록 조회 실패:', fetchError);
          throw fetchError;
        }

        if (!currentBlock) {
          throw new Error('이동할 블록을 찾을 수 없습니다.');
        }

        // 같은 날짜 내에서 순서만 변경하는 경우
        if (
          (currentBlock as any).day_number === (request as any).newDayNumber
        ) {
          // 현재 날짜의 모든 블록 조회 (순서대로)
          const { data: dayBlocks, error: dayBlocksError } = await supabase
            .from('travel_blocks')
            .select('*')
            .eq('plan_id', (currentBlock as any).plan_id)
            .eq('day_number', (request as any).newDayNumber)
            .order('order_index', { ascending: true });

          if (dayBlocksError) {
            console.error('날짜별 블록 조회 실패:', dayBlocksError);
            throw dayBlocksError;
          }

          if (!dayBlocks) {
            throw new Error('날짜별 블록을 찾을 수 없습니다.');
          }

          // 현재 블록의 인덱스 찾기
          const currentIndex = dayBlocks.findIndex(
            (block) => block.id === (request as any).id
          );
          if (currentIndex === -1) {
            throw new Error('이동할 블록을 찾을 수 없습니다.');
          }

          // 새로운 순서로 블록들 재배열
          const reorderedBlocks = arrayMove(
            dayBlocks as any[],
            currentIndex,
            (request as any).newOrderIndex
          );

          // 순서 업데이트 (임시로 큰 값으로 설정하여 중복 방지)
          const tempOrderOffset = 10000;

          // 먼저 모든 블록의 순서를 임시로 변경
          for (let i = 0; i < reorderedBlocks.length; i++) {
            const block = reorderedBlocks[i] as any;
            const { error: tempUpdateError } = await supabase
              .from('travel_blocks')
              .update({
                order_index: tempOrderOffset + i,
                updated_at: new Date().toISOString(),
              })
              .eq('id', block.id);

            if (tempUpdateError) {
              console.error('임시 순서 업데이트 실패:', tempUpdateError);
              throw tempUpdateError;
            }
          }

          // 그 다음 올바른 순서로 설정
          for (let i = 0; i < reorderedBlocks.length; i++) {
            const block = reorderedBlocks[i] as any;
            const { error: finalUpdateError } = await supabase
              .from('travel_blocks')
              .update({
                order_index: i,
                updated_at: new Date().toISOString(),
              })
              .eq('id', block.id);

            if (finalUpdateError) {
              console.error('최종 순서 업데이트 실패:', finalUpdateError);
              throw finalUpdateError;
            }
          }
        } else {
          // 다른 날짜로 이동하는 경우
          // 대상 날짜의 모든 블록 조회
          const { data: targetDayBlocks, error: targetDayBlocksError } =
            await supabase
              .from('travel_blocks')
              .select('*')
              .eq('plan_id', (currentBlock as any).plan_id)
              .eq('day_number', (request as any).newDayNumber)
              .order('order_index', { ascending: true });

          if (targetDayBlocksError) {
            console.error('대상 날짜 블록 조회 실패:', targetDayBlocksError);
            throw targetDayBlocksError;
          }

          // 대상 날짜의 블록들 순서 조정 (새 블록을 위한 공간 확보)
          const targetBlocks = targetDayBlocks || [];
          const tempOrderOffset = 10000;

          // 대상 날짜의 블록들을 임시로 순서 조정
          for (let i = 0; i < targetBlocks.length; i++) {
            const block = targetBlocks[i] as any;
            const newOrder = i >= (request as any).newOrderIndex ? i + 1 : i;
            const { error: tempUpdateError } = await supabase
              .from('travel_blocks')
              .update({
                order_index: tempOrderOffset + newOrder,
                updated_at: new Date().toISOString(),
              })
              .eq('id', block.id);

            if (tempUpdateError) {
              console.error(
                '대상 날짜 임시 순서 업데이트 실패:',
                tempUpdateError
              );
              throw tempUpdateError;
            }
          }

          // 대상 날짜의 블록들을 최종 순서로 설정
          for (let i = 0; i < targetBlocks.length; i++) {
            const block = targetBlocks[i] as any;
            const newOrder = i >= (request as any).newOrderIndex ? i + 1 : i;
            const { error: finalUpdateError } = await supabase
              .from('travel_blocks')
              .update({
                order_index: newOrder,
                updated_at: new Date().toISOString(),
              })
              .eq('id', block.id);

            if (finalUpdateError) {
              console.error(
                '대상 날짜 최종 순서 업데이트 실패:',
                finalUpdateError
              );
              throw finalUpdateError;
            }
          }

          // 이동할 블록을 새로운 날짜와 순서로 설정
          const { error: moveError } = await supabase
            .from('travel_blocks')
            .update({
              day_number: (request as any).newDayNumber,
              order_index: (request as any).newOrderIndex,
              updated_at: new Date().toISOString(),
            })
            .eq('id', (request as any).id);

          if (moveError) {
            console.error('블록 날짜/순서 업데이트 실패:', moveError);
            throw moveError;
          }
        }
      } catch (error) {
        console.error('블록 이동 중 에러 발생:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-blocks', planId] });
      toast.success('일정이 이동되었습니다.');
    },
    onError: (error) => {
      console.error('블록 이동 실패:', error);
      toast.error('일정 이동에 실패했습니다.');
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
    isCreating: (createBlockMutation as any).isPending,
    isUpdating: (updateBlockMutation as any).isPending,
    isDeleting: (deleteBlockMutation as any).isPending,
    isMoving: (moveBlockMutation as any).isPending,
  };
};
