'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { IoAddOutline } from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

import LoadingView from '@/components/basic/Loading/Loading';
import { BlockCreateModal } from '@/components/travel/detail/BlockCreateModal';
import { BlockDetailModal } from '@/components/travel/detail/BlockDetailModal';
import { TravelTimelineCanvas } from '@/components/travel/detail/TravelTimelineCanvas';
import { useBlocks } from '@/hooks/useBlocks';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/useToast';
import { useTravelDetail } from '@/hooks/useTravelDetail';
import { useTravelRealtime } from '@/hooks/useTravelRealtime';
import { TravelBlock } from '@/types/travel/blocks';

import { BriefingBoard, TabContainer, TravelHeader } from './components';
import { TabItem, TRAVEL_DETAIL_CONSTANTS } from './constants';

interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  createdAt: string;
}

const TravelDetailView = () => {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useSession();
  const toast = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TravelBlock | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0은 대시보드
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // TODO: 실제 데이터는 API에서 가져와야 함
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: '1',
      title: '렌터카 예약',
      isCompleted: true,
      assigneeId: 'user1',
      assigneeName: '민준',
      assigneeAvatar: undefined,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: '여행자 보험 가입',
      isCompleted: false,
      assigneeId: 'user2',
      assigneeName: '지혜',
      assigneeAvatar: undefined,
      createdAt: '2024-01-15',
    },
    {
      id: '3',
      title: '맛집 리스트 최종 확정',
      isCompleted: false,
      createdAt: '2024-01-15',
    },
  ]);

  const planId = params.id as string;

  // 새로운 API 훅 사용
  const {
    data: travelData,
    isLoading,
    error,
    refetch,
  } = useTravelDetail(planId);

  const travelPlan = travelData?.travelPlan;
  const participants = travelData?.participants || [];
  const blocks = travelData?.blocks || [];
  const activities = travelData?.activities || [];

  // 실시간 기능 활성화 (항상 호출)
  useTravelRealtime(planId);

  // 블록 시스템 Hook (항상 호출)
  const {
    timeline,
    isLoading: blocksLoading,
    createBlock,
    moveBlock,
    deleteBlock,
    isCreating,
    isMoving,
    isDeleting,
    handleBlockEvent,
  } = useBlocks({
    planId,
    startDate: travelPlan?.start_date || '',
    endDate: travelPlan?.end_date || '',
    planLocation: travelPlan?.location || '',
  });

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
  }, [error]);

  // 총 예산 계산
  const totalBudget = useMemo(() => {
    return blocks.reduce((total, block) => {
      if (block.cost && typeof block.cost === 'object' && block.cost !== null) {
        const costObj = block.cost as any;
        if (typeof costObj.amount === 'number') {
          return total + costObj.amount;
        }
      }
      return total;
    }, 0);
  }, [blocks]);

  // 준비도 점수 계산
  const readinessScore = useMemo(() => {
    if (!travelPlan) return 0;

    const totalDays =
      Math.ceil(
        (new Date(travelPlan.end_date).getTime() -
          new Date(travelPlan.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const blocksPerDay = blocks.length / totalDays;
    const participantsCount = participants.length;

    // 간단한 준비도 계산 (블록 수, 참여자 수 기반)
    let score = 0;
    if (blocksPerDay >= 2) score += 30;
    else if (blocksPerDay >= 1) score += 20;
    else score += 10;

    if (participantsCount >= 3) score += 30;
    else if (participantsCount >= 2) score += 20;
    else score += 10;

    // 최근 활동이 있으면 추가 점수
    if (activities.length > 0) score += 20;

    return Math.min(score, 100);
  }, [travelPlan, blocks, participants, activities]);

  // 핫 토픽 계산 (댓글이 많은 블록들)
  const hotTopics = useMemo(() => {
    // 실제로는 댓글 수를 API에서 가져와야 함
    // 현재는 임시로 최근 활동에서 블록 관련 활동을 찾아서 반환
    const blockActivities = activities.filter((activity) => activity.blockId);

    // 블록별 활동 수 계산
    const blockActivityCounts = blockActivities.reduce(
      (acc, activity) => {
        const blockId = activity.blockId!;
        acc[blockId] = (acc[blockId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 활동이 많은 순으로 정렬하여 상위 3개 반환
    return Object.entries(blockActivityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([blockId]) => ({
        id: blockId,
        title: blocks.find((b) => b.id === blockId)?.title || '알 수 없는 블록',
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
    setShowExportModal(true);
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleBudgetClick = () => {
    // TODO: 예산 상세 모달 또는 페이지로 이동
    console.log('Budget detail clicked');
  };

  const handleReadinessClick = () => {
    // TODO: 준비율 상세 모달 또는 페이지로 이동
    console.log('Readiness detail clicked');
  };

  const handleAddTodo = (title: string) => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const handleAssignTodo = (todoId: string, assigneeId: string) => {
    const assignee = participants.find((p) => p.id === assigneeId);
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              assigneeId,
              assigneeName: assignee?.nickname,
              assigneeAvatar: assignee?.profile_image_url,
            }
          : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
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

  // D-Day 계산
  const getDDay = () => {
    if (!travelPlan) return '';

    const startDateObj = new Date(travelPlan.start_date);
    const endDateObj = new Date(travelPlan.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(0, 0, 0, 0);

    const diffTime = startDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 여행 시작 전
    if (diffDays > 0) return `D-${diffDays}`;

    // 여행 시작일
    if (diffDays === 0) return 'D-Day';

    // 여행 중
    if (today >= startDateObj && today <= endDateObj) {
      const daysSinceStart = Math.ceil(
        (today.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `D+${daysSinceStart}`;
    }

    // 여행 종료 후
    const daysSinceEnd = Math.ceil(
      (today.getTime() - endDateObj.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `여행 종료 ${daysSinceEnd}일`;
  };

  // 여행 기간 계산
  const getTripDuration = () => {
    if (!travelPlan) return '';

    const start = new Date(travelPlan.start_date);
    const end = new Date(travelPlan.end_date);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays - 1}박 ${diffDays}일`;
  };

  // 편집 권한 확인 (임시로 true, 나중에 실제 권한 체크 로직으로 교체)
  const canEdit = true;

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* 메인 컨텐츠 */}
      <div className='flex flex-1 flex-col'>
        {/* 헤더 */}
        <TravelHeader
          title={travelPlan.title}
          location={travelPlan.location}
          startDate={travelPlan.start_date}
          endDate={travelPlan.end_date}
          participantsCount={participants.length}
          dDay={getDDay()}
        />

        {/* 탭 컨테이너 */}
        <TabContainer
          tabs={tabs}
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
        />

        {/* 컨텐츠 영역 */}
        <div className='flex-1 overflow-hidden'>
          {selectedDay === 0 ? (
            <div>
              <BriefingBoard
                title={travelPlan.title}
                location={travelPlan.location}
                startDate={travelPlan.start_date}
                endDate={travelPlan.end_date}
                participants={participants.map((p) => ({
                  id: p.id,
                  nickname: p.nickname || '알 수 없음',
                  profile_image_url: p.profile_image_url,
                  isOnline: p.isOnline || false,
                }))}
                totalBudget={totalBudget}
                currency='KRW'
                readinessScore={readinessScore}
                hotTopics={hotTopics}
                onInviteParticipants={handleInviteParticipants}
                onExport={handleExport}
                onSettings={handleSettings}
                onBudgetClick={handleBudgetClick}
                onReadinessClick={handleReadinessClick}
                onBlockClick={handleBlockClick}
                onHotTopicClick={handleHotTopicClick}
                todos={todos}
                onAddTodo={handleAddTodo}
                onToggleTodo={handleToggleTodo}
                onAssignTodo={handleAssignTodo}
                onDeleteTodo={handleDeleteTodo}
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
                moveBlock({
                  id: blockId,
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
    </div>
  );
};

export default TravelDetailView;
