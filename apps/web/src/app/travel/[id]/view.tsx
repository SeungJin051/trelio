'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { useDroppable } from '@dnd-kit/core';
import {
  IoAddOutline,
  IoArrowBack,
  IoCalendarOutline,
  IoLocationOutline,
  IoPeopleOutline,
} from 'react-icons/io5';

import { Button, Typography } from '@ui/components';
import { Avatar } from '@ui/components';

import LoadingView from '@/components/basic/Loading/Loading';
import { BlockCreateModal } from '@/components/travel/detail/BlockCreateModal';
import { BlockDetailModal } from '@/components/travel/detail/BlockDetailModal';
import { TravelSidePanel } from '@/components/travel/detail/TravelSidePanel';
import { TravelTimelineCanvas } from '@/components/travel/detail/TravelTimelineCanvas';
import { useBlocks } from '@/hooks/useBlocks';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/currency';
import { createClient } from '@/lib/supabase/client/supabase';
import { TravelBlock } from '@/types/travel/blocks';

interface TravelPlanDetail {
  id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface Participant {
  id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
  user_id: string;
  nickname?: string;
  profile_image_url?: string;
  isOnline?: boolean;
}

// 날짜 탭 컴포넌트 (드롭 영역 포함)
const DayTab = ({
  day,
  isSelected,
  onClick,
}: {
  day: any;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.dayNumber}`,
  });

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`border-b-2 px-2 py-4 transition-colors ${
        isSelected
          ? 'border-blue-500 text-blue-600'
          : isOver
            ? 'border-blue-300 bg-blue-50 text-blue-500'
            : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <div className='text-center'>
        <Typography
          variant='body2'
          className={`font-medium ${
            isSelected
              ? 'text-blue-600'
              : isOver
                ? 'text-blue-500'
                : 'text-gray-900'
          }`}
        >
          Day {day.dayNumber}
        </Typography>
        <Typography variant='caption' className='text-gray-500'>
          {new Date(day.date).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
          })}
        </Typography>
        {(day.totalCost.amount || 0) > 0 && (
          <Typography variant='caption' className='block text-gray-400'>
            {formatCurrency(
              day.totalCost.amount || 0,
              day.totalCost.currency || 'KRW'
            )}
          </Typography>
        )}
      </div>
    </button>
  );
};

const TravelDetailView = () => {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useSession();
  const toast = useToast();
  const supabase = createClient();

  const [travelPlan, setTravelPlan] = useState<TravelPlanDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TravelBlock | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const planId = params.id as string;

  // 블록 시스템 Hook
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

  // 블록 클릭 핸들러
  const handleBlockClick = (block: TravelBlock) => {
    setSelectedBlock(block);
    setShowDetailModal(true);
  };

  // 여행 계획 기본 정보 로드
  useEffect(() => {
    let isMounted = true;

    const fetchTravelPlan = async () => {
      if (!planId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        // 여행 계획 정보 조회
        const { data: planData, error: planError } = await supabase
          .from('travel_plans')
          .select('*')
          .eq('id', planId)
          .single();

        if (!isMounted) return;

        if (planError || !planData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setTravelPlan(planData);

        // 참여자 정보 조회
        try {
          const { data: participantsData, error: participantsError } =
            await supabase
              .from('travel_plan_participants')
              .select('id, role, joined_at, user_id')
              .eq('plan_id', planId);

          if (!isMounted) return;

          if (participantsError) {
            setParticipants([]);
          } else if (participantsData && participantsData.length > 0) {
            try {
              // 사용자 프로필 정보 조회
              const userIds = participantsData.map((p) => p.user_id);
              const { data: userProfilesData, error: profilesError } =
                await supabase
                  .from('user_profiles')
                  .select('id, nickname, profile_image_url')
                  .in('id', userIds);

              if (!isMounted) return;

              if (profilesError) {
                // 프로필 조회 실패시 기본 참여자 정보 사용
                const basicParticipants = participantsData.map((p) => ({
                  id: p.id,
                  role: p.role as 'owner' | 'editor' | 'viewer',
                  joined_at: p.joined_at,
                  user_id: p.user_id,
                  nickname: '알 수 없음',
                  profile_image_url: undefined,
                  isOnline: false,
                }));
                setParticipants(basicParticipants);
              } else {
                const formattedParticipants = participantsData.map((p) => {
                  const userProfile = userProfilesData?.find(
                    (u) => u.id === p.user_id
                  );
                  return {
                    id: p.id,
                    role: p.role as 'owner' | 'editor' | 'viewer',
                    joined_at: p.joined_at,
                    user_id: p.user_id,
                    nickname: userProfile?.nickname || '알 수 없음',
                    profile_image_url: userProfile?.profile_image_url,
                    isOnline: false,
                  };
                });
                setParticipants(formattedParticipants);
              }
            } catch (profileError) {
              // 프로필 조회 중 예외 발생시 기본 참여자 정보 사용
              const basicParticipants = participantsData.map((p) => ({
                id: p.id,
                role: p.role as 'owner' | 'editor' | 'viewer',
                joined_at: p.joined_at,
                user_id: p.user_id,
                nickname: '알 수 없음',
                profile_image_url: undefined,
                isOnline: false,
              }));
              setParticipants(basicParticipants);
            }
          } else {
            setParticipants([]);
          }
        } catch (participantsError) {
          setParticipants([]);
        }
      } catch (error) {
        if (!isMounted) return;
        toast('여행 계획을 불러오는데 실패했습니다.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTravelPlan();

    return () => {
      isMounted = false;
    };
  }, [planId]);

  // 권한 체크
  const currentUserRole = participants.find(
    (p) => p.user_id === userProfile?.id
  )?.role;

  const isOwner = travelPlan?.owner_id === userProfile?.id;
  const canEdit =
    currentUserRole === 'owner' ||
    currentUserRole === 'editor' ||
    isOwner ||
    (process.env.NODE_ENV === 'development' && !!userProfile?.id);

  // D-Day 계산
  const getDDay = () => {
    if (!travelPlan?.start_date) return null;
    const startDate = new Date(travelPlan.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `D-${diffDays}`;
    if (diffDays === 0) return 'D-Day';
    return `D+${Math.abs(diffDays)}`;
  };

  if (loading) {
    return <LoadingView />;
  }

  if (notFound || !travelPlan) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Typography variant='h2' className='text-gray-800'>
            404
          </Typography>
          <Typography variant='body1' className='mt-2 text-gray-600'>
            존재하지 않는 여행 계획입니다.
          </Typography>
          <Button
            variant='filled'
            className='mt-4'
            onClick={() => router.push('/main')}
          >
            메인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen flex-col bg-gray-50'>
      <div className='flex min-h-0 flex-1'>
        <div className='flex flex-1 flex-col'>
          <div className='flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Button
                  variant='ghost'
                  size='small'
                  onClick={() => router.push('/main')}
                  className='p-2'
                >
                  <IoArrowBack className='h-5 w-5' />
                </Button>
                <div>
                  <div className='mb-1 flex items-center space-x-3'>
                    <Typography variant='h3' className='text-gray-900'>
                      {travelPlan.title}
                    </Typography>
                    {getDDay() && (
                      <div className='rounded-full bg-blue-50 px-3 py-1 text-blue-600'>
                        <Typography variant='caption' className='font-semibold'>
                          {getDDay()}
                        </Typography>
                      </div>
                    )}
                  </div>
                  <div className='flex items-center space-x-6'>
                    <div className='flex items-center text-gray-600'>
                      <IoLocationOutline className='mr-1 h-4 w-4' />
                      <Typography variant='caption'>
                        {travelPlan.location}
                      </Typography>
                    </div>
                    <div className='flex items-center text-gray-600'>
                      <IoCalendarOutline className='mr-1 h-4 w-4' />
                      <Typography variant='caption'>
                        {new Date(travelPlan.start_date).toLocaleDateString()} -{' '}
                        {new Date(travelPlan.end_date).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div className='flex items-center text-gray-600'>
                      <IoPeopleOutline className='mr-1 h-4 w-4' />
                      <Typography variant='caption'>
                        {participants.length}명
                      </Typography>
                      <div className='ml-2 flex items-center -space-x-1'>
                        {participants.slice(0, 3).map((participant) => (
                          <Avatar
                            key={participant.id}
                            src={participant.profile_image_url}
                            alt={participant.nickname || '참여자'}
                            size='small'
                            className='border-2 border-white'
                          />
                        ))}
                        {participants.length > 3 && (
                          <div className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600'>
                            +{participants.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex-shrink-0 border-b border-gray-200 bg-white'>
            <div className='px-6'>
              <div className='flex space-x-8'>
                {timeline.days.map((day) => (
                  <DayTab
                    key={day.dayNumber}
                    day={day}
                    isSelected={selectedDay === day.dayNumber}
                    onClick={() => setSelectedDay(day.dayNumber)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className='relative flex-1 overflow-hidden'>
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
              onBlockClick={handleBlockClick}
            />
          </div>
        </div>

        <TravelSidePanel
          timeline={timeline}
          selectedDay={selectedDay}
          planLocation={travelPlan.location}
        />
      </div>

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

      {showDetailModal && (
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
