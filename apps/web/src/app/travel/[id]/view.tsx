'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { IoAddOutline } from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

import LoadingView from '@/components/basic/Loading/Loading';
import { BlockCreateModal } from '@/components/travel/detail/BlockCreateModal';
import { BlockDetailModal } from '@/components/travel/detail/BlockDetailModal';
import { TravelTimelineCanvas } from '@/components/travel/detail/TravelTimelineCanvas';
import InviteLinkModal from '@/components/travel/modals/InviteLinkModal';
import {
  useBlocks,
  useRealtimeBlocks,
  useRealtimeParticipants,
  useRealtimeTravelInfo,
} from '@/hooks/useBlocks';
import { useParticipantsPresence } from '@/hooks/useParticipantsPresence';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/useToast';
import { useTravelDetail } from '@/hooks/useTravelDetail';
import { useTravelRealtime } from '@/hooks/useTravelRealtime';
import type {
  ActivityItem as ApiActivityItem,
  TravelBlock as ApiBlock,
  Participant as ApiParticipant,
} from '@/lib/api/travel';
import { calculateDDayWithEnd } from '@/lib/travel-utils';
import { TravelBlock } from '@/types/travel/blocks';

import { BriefingBoard, TabContainer, TravelHeader } from './components';
import { TabItem, TRAVEL_DETAIL_CONSTANTS } from './constants';

// 임시로 확장된 타입 정의 제거

const TravelDetailView = () => {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useSession();
  const toast = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TravelBlock | null>(null);
  const [activeBlock, setActiveBlock] = useState<TravelBlock | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0은 대시보드

  const planId = params.id as string;

  // 새로운 API 훅 사용
  const { data: travelData, isLoading, error } = useTravelDetail(planId);

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
      (p) => (p as any).user_id === userProfile.id
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

  // 블록 시스템 Hook (항상 호출)
  const { timeline, createBlock, moveBlock, deleteBlock, isCreating } =
    useBlocks({
      planId,
      startDate: travelPlan?.start_date || '',
      endDate: travelPlan?.end_date || '',
      planLocation: travelPlan?.location || '',
    });
  // DnD 센서
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // DnD 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const selectedDayData = timeline.days.find(
      (d) => d.dayNumber === selectedDay
    );
    const found = selectedDayData?.blocks.find((b) => b.id === active.id);
    if (found) setActiveBlock(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // 같은 아이템이면 무시
    if (activeId === overId) return;

    const selectedDayData = timeline.days.find(
      (d) => d.dayNumber === selectedDay
    );
    if (!selectedDayData) return;

    // 같은 날 내 재정렬
    const droppedInSameList = selectedDayData.blocks.some(
      (b) => b.id === overId
    );
    if (droppedInSameList) {
      const newIndex = selectedDayData.blocks.findIndex((b) => b.id === overId);
      if (newIndex >= 0) {
        moveBlock({
          id: activeId,
          newDayNumber: selectedDay,
          newOrderIndex: newIndex,
        });
      }
      return;
    }

    // 다른 날 탭으로 드롭: overId = day-<n>
    const match = /^day-(\d+)$/.exec(overId);
    if (match) {
      const targetDay = Number(match[1]);
      if (targetDay && targetDay !== selectedDay) {
        const targetDayData = timeline.days.find(
          (d) => d.dayNumber === targetDay
        );
        const newOrderIndex = targetDayData?.blocks.length || 0;
        moveBlock({ id: activeId, newDayNumber: targetDay, newOrderIndex });
      }
    }
  };

  // 탭 데이터 생성
  const tabs = useMemo((): TabItem[] => {
    const dashboardTab: TabItem = {
      id: TRAVEL_DETAIL_CONSTANTS.DASHBOARD_TAB.id,
      label: TRAVEL_DETAIL_CONSTANTS.DASHBOARD_TAB.label,
      dayNumber: TRAVEL_DETAIL_CONSTANTS.DASHBOARD_TAB.dayNumber,
      type: 'dashboard',
    };

    const dayTabs: TabItem[] = timeline.days.map((day) => ({
      id: `day-${day.dayNumber}`,
      label: `Day ${day.dayNumber}`,
      dayNumber: day.dayNumber,
      type: 'day',
      date: day.date,
      totalCost: day.totalCost,
    }));

    return [dashboardTab, ...dayTabs];
  }, [timeline.days]);

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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
                  moveBlock({ id: blockId, newDayNumber, newOrderIndex });
                }}
                onBlockClick={handleBlockDetailClick}
              />
            )}
          </div>

          <DragOverlay>
            {activeBlock ? (
              <div className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm opacity-95 shadow-lg'>
                {activeBlock.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

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
          onCreateBlock={createBlock}
          isLoading={isCreating}
          planLocation={travelPlan.location}
        />
      )}

      {showDetailModal && selectedBlock && (
        <BlockDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          block={selectedBlock}
          onDelete={deleteBlock}
          canEdit={canEdit}
        />
      )}

      {showInviteModal && (
        <InviteLinkModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          planId={planId}
          shareLinkId={(travelPlan as any).share_link_id}
          participants={participants as any}
          isOwner={isOwner}
        />
      )}
    </div>
  );
};

export default TravelDetailView;
