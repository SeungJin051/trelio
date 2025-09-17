'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { IoAddOutline } from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

import LoadingView from '@/components/basic/Loading/Loading';
import { BlockCreateModal } from '@/components/travel/detail/BlockCreateModal';
import { BlockDetailModal } from '@/components/travel/detail/BlockDetailModal';
import { TravelTimelineCanvas } from '@/components/travel/detail/TravelTimelineCanvas';
import InviteLinkModal from '@/components/travel/modals/InviteLinkModal';
import { useParticipantsPresence } from '@/hooks/useParticipantsPresence';
import { useRealtimeBlocks } from '@/hooks/useRealtimeBlocks';
import { useRealtimeParticipants } from '@/hooks/useRealtimeParticipants';
import { useRealtimeTravelInfo } from '@/hooks/useRealtimeTravelInfo';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/useToast';
import {
  useCreateBlock,
  useDeleteBlock,
  useTravelDetail,
  useUpdateBlock,
} from '@/hooks/useTravelDetail';
import { useTravelRealtime } from '@/hooks/useTravelRealtime';
import type {
  ActivityItem as ApiActivityItem,
  TravelBlock as ApiBlock,
  Participant as ApiParticipant,
} from '@/lib/api/travel';
import { CurrencyCode } from '@/lib/currency';
import { calculateDDayWithEnd } from '@/lib/travel-utils';
import {
  BlockType,
  CreateBlockRequest,
  TravelBlock,
  UpdateBlockRequest,
} from '@/types/travel/blocks';

import { BriefingBoard, TabContainer, TravelHeader } from './components';
import { TabItem, TRAVEL_DETAIL_CONSTANTS } from './constants';

// 임시로 확장된 타입 정의 제거

const TravelDetailView = () => {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useSession();
  const toast = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TravelBlock | null>(null);
  const [editingBlock, setEditingBlock] = useState<TravelBlock | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0은 대시보드

  const planId = params.id as string;

  // 새로운 API 훅 사용
  const { data: travelData, isLoading, error } = useTravelDetail(planId);
  const createBlockMutation = useCreateBlock();
  const updateBlockMutation = useUpdateBlock();
  const deleteBlockMutation = useDeleteBlock();

  const travelPlan = travelData?.travelPlan;
  const participants = useMemo(
    () => travelData?.participants ?? [],
    [travelData?.participants]
  );
  const blocks = useMemo(() => travelData?.blocks ?? [], [travelData?.blocks]);
  const activities = useMemo(
    () => travelData?.activities ?? [],
    [travelData?.activities]
  );

  // 편집 권한 확인: owner 또는 editor (항상 호출되도록 조기 리턴 이전에 배치)
  const canEdit = useMemo(() => {
    if (!userProfile || !travelPlan) return false;
    if (travelPlan.owner_id === userProfile.id) return true;
    const role = (participants as ApiParticipant[]).find(
      (p) => p.id === userProfile.id
    )?.role;
    return role === 'editor' || role === 'owner';
  }, [userProfile, travelPlan, participants]);

  // 실시간 기능 활성화 (항상 호출)
  useTravelRealtime(planId);

  // 블록 실시간 동기화 추가
  useRealtimeBlocks(planId);

  // 참여자 실시간 동기화 추가
  useRealtimeParticipants(planId);

  // 여행 정보 실시간 동기화 추가
  useRealtimeTravelInfo(planId);

  // 참여자 Presence (온라인/오프라인)
  useParticipantsPresence({
    planId,
    userId: userProfile?.id,
    nickname: userProfile?.nickname,
    profileImageUrl: userProfile?.profile_image_url,
  });

  // 로딩 상태 관리
  const isCreating = createBlockMutation.isPending;
  const isUpdating = updateBlockMutation.isPending;
  const isDeleting = deleteBlockMutation.isPending;

  // API 블록을 TravelBlock 타입으로 변환
  const convertApiBlockToTravelBlock = (apiBlock: ApiBlock): TravelBlock => {
    return {
      id: apiBlock.id,
      planId: apiBlock.plan_id,
      dayNumber: apiBlock.day_number,
      orderIndex: apiBlock.order_index,
      blockType: (apiBlock.block_type as BlockType) || 'activity',
      title: apiBlock.title,
      description: apiBlock.description,
      location: apiBlock.location
        ? typeof apiBlock.location === 'string'
          ? { address: apiBlock.location }
          : apiBlock.location
        : undefined,
      timeRange:
        apiBlock.start_time || apiBlock.end_time
          ? {
              startTime: apiBlock.start_time,
              endTime: apiBlock.end_time,
            }
          : undefined,
      cost:
        apiBlock.cost && apiBlock.currency
          ? {
              amount: apiBlock.cost,
              currency: (apiBlock.currency as CurrencyCode) || 'KRW',
            }
          : undefined,
      meta: apiBlock.meta || {},
      createdBy: apiBlock.created_by,
      createdAt: apiBlock.created_at,
      updatedAt: apiBlock.updated_at,
    };
  };

  // 탭 데이터 생성
  const tabs = useMemo((): TabItem[] => {
    const dashboardTab: TabItem = {
      id: TRAVEL_DETAIL_CONSTANTS.DASHBOARD_TAB.id,
      label: TRAVEL_DETAIL_CONSTANTS.DASHBOARD_TAB.label,
      dayNumber: TRAVEL_DETAIL_CONSTANTS.DASHBOARD_TAB.dayNumber,
      type: 'dashboard',
    };

    if (!travelPlan?.start_date || !travelPlan?.end_date) {
      return [dashboardTab];
    }

    const startDate = new Date(travelPlan.start_date);
    const endDate = new Date(travelPlan.end_date);
    const dayCount =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    const dayTabs: TabItem[] = Array.from({ length: dayCount }, (_, index) => {
      const dayNumber = index + 1;
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);

      // 해당 일의 블록들 찾기
      const dayBlocks = blocks.filter(
        (block) => block.day_number === dayNumber
      );
      const totalCost = dayBlocks.reduce((sum, block) => {
        return sum + (block.cost || 0);
      }, 0);

      return {
        id: `day-${dayNumber}`,
        label: `Day ${dayNumber}`,
        dayNumber: dayNumber,
        type: 'day',
        date: currentDate.toISOString().split('T')[0],
        totalCost: {
          amount: totalCost,
          currency: 'KRW' as const, // TODO: 여행 기본 통화로 설정
        },
      };
    });

    return [dashboardTab, ...dayTabs];
  }, [travelPlan?.start_date, travelPlan?.end_date, blocks]);

  // 타임라인 데이터 생성
  const timeline = useMemo(() => {
    if (!travelPlan)
      return {
        planId,
        days: [],
        totalCost: { amount: 0, currency: 'KRW' as const },
        lastUpdated: new Date().toISOString(),
      };

    const startDate = new Date(travelPlan.start_date);
    const endDate = new Date(travelPlan.end_date);
    const dayCount =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    const days = Array.from({ length: dayCount }, (_, index) => {
      const dayNumber = index + 1;
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);

      const dayBlocks = blocks.filter(
        (block) => block.day_number === dayNumber
      );
      const totalCost = dayBlocks.reduce(
        (sum, block) => sum + (block.cost || 0),
        0
      );
      const totalDuration = 0; // TODO: duration 계산 구현

      return {
        dayNumber,
        date: currentDate.toISOString().split('T')[0],
        blocks: dayBlocks.map(convertApiBlockToTravelBlock),
        totalCost: { amount: totalCost, currency: 'KRW' as const },
        totalDuration,
      };
    });

    const overallTotalCost = days.reduce(
      (sum, day) => sum + day.totalCost.amount,
      0
    );

    return {
      planId,
      days,
      totalCost: { amount: overallTotalCost, currency: 'KRW' as const },
      lastUpdated: new Date().toISOString(),
    };
  }, [planId, travelPlan, blocks]);

  // 에러 처리: 동일 에러 중복 토스트 방지 및 무한 루프 방지
  const hasShownErrorRef = useRef(false);
  useEffect(() => {
    if (error && !hasShownErrorRef.current) {
      hasShownErrorRef.current = true;
      toast.error('여행 정보를 불러오는데 실패했습니다.');
    }
  }, [error, toast]);

  // 핫 토픽 계산 (댓글이 많은 블록들)
  const hotTopics = useMemo(() => {
    // 실제로는 댓글 수를 API에서 가져와야 함
    // 현재는 임시로 최근 활동에서 블록 관련 활동을 찾아서 반환
    const blockActivities = (activities as ApiActivityItem[]).filter(
      (activity) => !!activity.blockId
    );

    // 블록별 활동 수 계산
    const blockActivityCounts = blockActivities.reduce(
      (acc: Record<string, number>, activity) => {
        const blockId = activity.blockId!;
        acc[blockId] = (acc[blockId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 활동이 많은 순으로 정렬하여 상위 3개 반환
    return Object.entries(blockActivityCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([blockId]) => ({
        id: blockId,
        title:
          (blocks as ApiBlock[]).find((b) => b.id === blockId)?.title ||
          '알 수 없는 블록',
        commentCount: blockActivityCounts[blockId] || 0,
        blockId: blockId,
      }));
  }, [activities, blocks]);

  // 로딩 상태
  if (isLoading) {
    return <LoadingView />;
  }

  // 데이터가 없는 경우
  if (!travelPlan) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <Typography variant='h4' className='mb-4'>
            여행을 찾을 수 없습니다
          </Typography>
          <Button
            onClick={() => router.push('/')}
            colorTheme='blue'
            size='medium'
          >
            메인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const handleInviteParticipants = () => {
    setShowInviteModal(true);
  };

  const handleExport = () => {
    toast('내보내기 기능은 준비 중입니다.');
  };

  const handleSettings = () => {
    toast('설정 기능은 준비 중입니다.');
  };

  const handleBudgetClick = () => {
    // TODO: 예산 상세 모달 또는 페이지로 이동
    console.log('Budget detail clicked');
  };

  const handleReadinessClick = () => {
    // TODO: 준비율 상세 모달 또는 페이지로 이동
    console.log('Readiness detail clicked');
  };

  const handleBlockClick = (blockId: string) => {
    // TODO: 새로운 API 데이터와 기존 TravelBlock 타입 매핑 필요
    console.log('Block click:', blockId);
  };

  const handleHotTopicClick = (blockId: string) => {
    // TODO: 새로운 API 데이터와 기존 TravelBlock 타입 매핑 필요
    console.log('Hot topic click:', blockId);
  };

  const handleBlockDetailClick = (block: TravelBlock) => {
    setSelectedBlock(block);
    setShowDetailModal(true);
  };

  const handleEditBlock = (block: TravelBlock) => {
    setEditingBlock(block);
    setSelectedDay(block.dayNumber);
    setShowEditModal(true);
  };

  const handleCreateBlock = (request: CreateBlockRequest) => {
    // API 서버 형식에 맞게 데이터 변환
    const apiData: import('@/lib/api/travel').CreateBlockRequest = {
      plan_id: request.planId,
      title: request.title,
      description: request.description,
      day_number: request.dayNumber,
      order_index: 0, // 새 블록은 맨 뒤에 추가
      block_type: request.blockType,
      location:
        typeof request.location === 'object'
          ? request.location.address
          : request.location,
      start_time: request.timeRange?.startTime,
      end_time: request.timeRange?.endTime,
      cost: request.cost?.amount,
      currency: request.cost?.currency,
    };

    console.log('[handleCreateBlock] sending data:', apiData);

    createBlockMutation.mutate(apiData);
  };

  const handleUpdateBlock = (request: UpdateBlockRequest) => {
    // API 서버 형식에 맞게 데이터 변환
    const apiData = {
      title: request.title,
      description: request.description,
      day_number: request.dayNumber,
      block_type: request.blockType,
      location:
        typeof request.location === 'object'
          ? request.location.address
          : request.location,
      start_time: request.timeRange?.startTime,
      end_time: request.timeRange?.endTime,
      cost: request.cost?.amount,
      currency: request.cost?.currency,
      meta: request.meta,
    };

    // undefined 값들 제거
    const cleanData = Object.fromEntries(
      Object.entries(apiData).filter(([_, value]) => value !== undefined)
    );

    console.log('[handleUpdateBlock] sending data:', cleanData);

    updateBlockMutation.mutate({
      blockId: request.id!,
      data: cleanData,
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    deleteBlockMutation.mutate(blockId);
  };

  const ddayText = travelPlan
    ? calculateDDayWithEnd(travelPlan.start_date, travelPlan.end_date)
    : '';

  const isOwner = Boolean(
    travelPlan?.owner_id &&
      userProfile?.id &&
      travelPlan.owner_id === userProfile.id
  );

  return (
    <div className='flex min-h-screen w-full bg-gray-50'>
      {/* 메인 컨텐츠 */}
      <div className='flex w-full flex-1 flex-col'>
        {/* 헤더 */}
        <TravelHeader
          planId={travelPlan.id}
          title={travelPlan.title}
          location={travelPlan.location}
          startDate={travelPlan.start_date}
          endDate={travelPlan.end_date}
          participantsCount={participants.length}
          dDay={ddayText}
        />

        {/* 탭 컨테이너 (DayTab은 droppable) */}
        <TabContainer
          tabs={tabs}
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
        />

        {/* 컨텐츠 영역 */}
        <div className='flex-1 overflow-x-hidden'>
          {selectedDay === 0 ? (
            <div className='h-full'>
              <BriefingBoard
                planId={planId}
                title={travelPlan.title}
                location={travelPlan.location}
                startDate={travelPlan.start_date}
                endDate={travelPlan.end_date}
                participants={(participants as ApiParticipant[]).map((p) => ({
                  id: p.id,
                  user_id: p.user_id,
                  nickname: p.nickname || '알 수 없음',
                  profile_image_url: p.profile_image_url,
                  isOnline: p.isOnline || false,
                }))}
                activities={activities}
                totalBudget={
                  (
                    travelPlan as unknown as Partial<{
                      target_budget: number;
                    }>
                  )?.target_budget || 0
                }
                currency={
                  (
                    travelPlan as unknown as Partial<{
                      budget_currency: string;
                    }>
                  )?.budget_currency || 'KRW'
                }
                destinationCountry={
                  (
                    travelPlan as unknown as Partial<{
                      destination_country: string;
                    }>
                  )?.destination_country
                }
                userNationality={userProfile?.nationality}
                hotTopics={hotTopics}
                onInviteParticipants={handleInviteParticipants}
                onExport={handleExport}
                onSettings={handleSettings}
                onBudgetClick={handleBudgetClick}
                onReadinessClick={handleReadinessClick}
                onBlockClick={handleBlockClick}
                onHotTopicClick={handleHotTopicClick}
              />
            </div>
          ) : (
            // 타임라인 캔버스
            <TravelTimelineCanvas
              timeline={timeline}
              canEdit={canEdit}
              selectedDay={selectedDay}
              onDaySelect={setSelectedDay}
              onBlockCreate={(dayNumber: number) => {
                setSelectedDay(dayNumber);
                setShowCreateModal(true);
              }}
              onBlockMove={(
                blockId: string,
                newDayNumber: number,
                newOrderIndex: number
              ) => {
                // TODO: moveBlock API 구현 필요
                console.log('Block move:', {
                  blockId,
                  newDayNumber,
                  newOrderIndex,
                });
              }}
              onBlockClick={handleBlockDetailClick}
            />
          )}
        </div>

        {/* 플로팅 액션 버튼 - 대시보드에서는 숨김 */}
        {selectedDay !== 0 && (
          <div className='fixed bottom-16 left-1/2 z-50 -translate-x-1/2 transform'>
            <button
              onClick={() => setShowCreateModal(true)}
              className='flex h-14 w-14 transform items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-600 hover:shadow-xl active:scale-95'
            >
              <IoAddOutline className='h-6 w-6' />
            </button>
            <div className='pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1 text-xs text-white opacity-0 transition-opacity duration-200 hover:opacity-100'>
              일정 추가 {canEdit ? '✅' : '❌권한없음'}
            </div>
          </div>
        )}
      </div>

      {/* 모달들 */}
      {showCreateModal && (
        <BlockCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          planId={planId}
          dayNumber={selectedDay}
          onCreateBlock={handleCreateBlock}
          isLoading={isCreating}
          planLocation={travelPlan.location}
        />
      )}

      {showEditModal && editingBlock && (
        <BlockCreateModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          planId={planId}
          dayNumber={editingBlock.dayNumber}
          onCreateBlock={handleCreateBlock}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          editingBlock={editingBlock}
          isLoading={isUpdating || isDeleting}
          planLocation={travelPlan.location}
        />
      )}

      {showDetailModal && selectedBlock && (
        <BlockDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          block={selectedBlock}
          onEdit={handleEditBlock}
          onDelete={handleDeleteBlock}
          canEdit={canEdit}
        />
      )}

      {showInviteModal && (
        <InviteLinkModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          planId={planId}
          shareLinkId={
            (travelPlan as { share_link_id?: string }).share_link_id || ''
          }
          participants={participants}
          isOwner={isOwner}
        />
      )}
    </div>
  );
};

export default TravelDetailView;
