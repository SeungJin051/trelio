'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  IoAddOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoPeopleOutline,
  IoSearchOutline,
} from 'react-icons/io5';

import { Button, Input, Typography } from '@ui/components';

import TravelBasicInfoModal from '@/components/travel/modals/TravelBasicInfoModal';
import { useSession } from '@/hooks/useSession';
import { createClient } from '@/lib/supabase/client/supabase';

interface TravelPlan {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'all' | 'upcoming' | 'in-progress' | 'completed';
  created_at: string;
  participantCount: number;
  isInvited?: boolean;
  role?: 'owner' | 'editor' | 'viewer';
}

type FilterType = 'all' | 'upcoming' | 'in-progress' | 'completed';
type SortType = 'newest' | 'oldest' | 'alphabetical';

const TravelPlansList: React.FC = () => {
  const router = useRouter();
  const { userProfile } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const getStatus = useCallback(
    (
      startDate: string,
      endDate: string
    ): 'upcoming' | 'in-progress' | 'completed' => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      if (end < today) return 'completed';
      if (start <= today && today <= end) return 'in-progress';
      return 'upcoming';
    },
    []
  );

  const sortPlans = useCallback(
    (plans: TravelPlan[], sortType: SortType): TravelPlan[] => {
      const sortedPlans = [...plans];
      switch (sortType) {
        case 'alphabetical':
          return sortedPlans.sort((a, b) => a.title.localeCompare(b.title));
        case 'newest':
          return sortedPlans.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
        case 'oldest':
          return sortedPlans.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
        default:
          return sortedPlans;
      }
    },
    []
  );

  const fetchTravelPlans = useCallback(async () => {
    if (!userProfile?.id) {
      setLoading(false);
      setInitialLoad(false);
      return;
    }
    try {
      if (initialLoad) setLoading(true);

      // 1) 내가 소유한 계획
      const { data: ownerPlans, error: ownerError } = await supabase
        .from('travel_plans')
        .select('id, title, start_date, end_date, location, created_at')
        .eq('owner_id', userProfile.id);
      if (ownerError) {
        console.error('소유 여행 계획 조회 실패:', ownerError);
      }

      // 2) 내가 참여(소유자 제외) 중인 계획 id + role
      const { data: participationRows, error: partError } = await supabase
        .from('travel_plan_participants')
        .select('plan_id, role')
        .eq('user_id', userProfile.id)
        .neq('role', 'owner');
      if (partError) {
        console.error('참여 여행 계획 조회 실패:', partError);
      }

      const invitedPlanIds = Array.from(
        new Set((participationRows || []).map((p) => p.plan_id))
      );

      // 3) 초대(참여) 계획 메타
      const { data: invitedPlans, error: invitedError } = invitedPlanIds.length
        ? await supabase
            .from('travel_plans')
            .select('id, title, start_date, end_date, location, created_at')
            .in('id', invitedPlanIds)
        : { data: [], error: null };
      if (invitedError) {
        console.error('초대된 여행 계획 조회 실패:', invitedError);
      }

      // 4) 참가자 수 집계
      const allPlanIds = [
        ...new Set([...(ownerPlans || []).map((p) => p.id), ...invitedPlanIds]),
      ];
      const { data: allParticipants, error: participantsError } =
        allPlanIds.length
          ? await supabase
              .from('travel_plan_participants')
              .select('plan_id')
              .in('plan_id', allPlanIds)
          : { data: [], error: null };
      if (participantsError) {
        console.warn('참가자 수 조회 경고:', participantsError);
      }
      const participantCountMap = new Map<string, number>();
      (allParticipants || []).forEach((row) => {
        participantCountMap.set(
          row.plan_id,
          (participantCountMap.get(row.plan_id) || 0) + 1
        );
      });

      // role 매핑
      const roleMap = new Map<string, TravelPlan['role']>();
      (participationRows || []).forEach((r) => {
        if (!roleMap.has(r.plan_id)) {
          roleMap.set(r.plan_id, r.role as TravelPlan['role']);
        }
      });

      // 5) 변환
      const ownTransformed: TravelPlan[] = (ownerPlans || []).map((plan) => ({
        id: plan.id,
        title: plan.title,
        start_date: plan.start_date,
        end_date: plan.end_date,
        location: plan.location,
        status: getStatus(plan.start_date, plan.end_date),
        created_at: plan.created_at,
        participantCount: participantCountMap.get(plan.id) || 1,
        isInvited: false,
        role: 'owner',
      }));

      const invitedTransformed: TravelPlan[] = (invitedPlans || []).map(
        (plan) => ({
          id: plan.id,
          title: plan.title,
          start_date: plan.start_date,
          end_date: plan.end_date,
          location: plan.location,
          status: getStatus(plan.start_date, plan.end_date),
          created_at: plan.created_at,
          participantCount: participantCountMap.get(plan.id) || 1,
          isInvited: true,
          role: roleMap.get(plan.id) || 'viewer',
        })
      );

      const merged = sortPlans(
        [...ownTransformed, ...invitedTransformed],
        sort
      );
      setTravelPlans(merged);
    } catch (error) {
      console.error('여행 계획 조회 중 오류:', error);
      setTravelPlans([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [userProfile?.id, sort, supabase, getStatus, sortPlans, initialLoad]);

  useEffect(() => {
    fetchTravelPlans();
  }, [fetchTravelPlans]);

  // 로그인 직후 또는 토큰이 갱신되면 즉시 목록을 다시 가져온다
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      // userProfile 설정 이후에도 안전하게 재조회
      fetchTravelPlans();
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase, fetchTravelPlans]);

  // 참여 테이블 변경 리얼타임 구독: 내 초대 수락 시 자동 갱신
  useEffect(() => {
    if (!userProfile?.id) return;
    const channel = supabase
      .channel('travel-plan-participants-watch')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'travel_plan_participants',
          filter: `user_id=eq.${userProfile.id}`,
        },
        () => {
          fetchTravelPlans();
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.warn('removeChannel 실패:', error);
      }
    };
  }, [supabase, userProfile?.id, fetchTravelPlans]);

  const sortedPlans = useMemo(
    () => sortPlans(travelPlans, sort),
    [travelPlans, sort, sortPlans]
  );

  const filteredPlans = useMemo(() => {
    let plans = sortedPlans;
    if (filter !== 'all')
      plans = plans.filter((plan) => plan.status === filter);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      plans = plans.filter(
        (plan) =>
          plan.title.toLowerCase().includes(query) ||
          plan.location.toLowerCase().includes(query)
      );
    }
    return plans;
  }, [sortedPlans, filter, searchQuery]);

  const handlePlanClick = useCallback(
    (planId: string) => {
      router.push(`/travel/${planId}`);
    },
    [router]
  );

  const handleCreateTravel = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);
  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);
  const handleSortChange = useCallback((newSort: SortType) => {
    setSort(newSort);
  }, []);
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const filterOptions = useMemo(
    () => [
      { value: 'all' as FilterType, label: '전체' },
      { value: 'upcoming' as FilterType, label: '예정' },
      { value: 'in-progress' as FilterType, label: '진행' },
      { value: 'completed' as FilterType, label: '완료' },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: 'newest' as SortType, label: '최신순' },
      { value: 'oldest' as SortType, label: '과거순' },
      { value: 'alphabetical' as SortType, label: '가나다순' },
    ],
    []
  );

  const SkeletonLoader = useMemo(
    () => (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='mb-4 h-6 w-32 rounded bg-gray-200' />
          <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
            <div className='flex space-x-2'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='h-8 w-16 rounded bg-gray-200' />
              ))}
            </div>
            <div className='h-8 w-48 rounded bg-gray-200' />
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='animate-pulse rounded-lg border border-gray-200 p-6'
            >
              <div className='mb-4 h-6 w-3/4 rounded bg-gray-200' />
              <div className='mb-2 h-4 w-1/2 rounded bg-gray-200' />
              <div className='mb-4 h-4 w-2/3 rounded bg-gray-200' />
              <div className='flex items-center space-x-2'>
                {[...Array(3)].map((_, j) => (
                  <div key={j} className='h-6 w-6 rounded-full bg-gray-200' />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    []
  );

  if (loading && initialLoad) return SkeletonLoader;

  return (
    <div className='space-y-6'>
      <div>
        <Typography variant='h4' weight='bold' className='mb-6 text-gray-900'>
          여행 계획 목록
        </Typography>
        <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <div className='flex space-x-2'>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${filter === option.value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className='flex space-x-3'>
            <div className='relative'>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as SortType)}
                className='appearance-none rounded-lg border border-gray-300 bg-white px-3 py-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <IoChevronDownOutline className='pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            </div>
            <div className='relative'>
              <Input
                placeholder='여행 제목 또는 장소 검색'
                value={searchQuery}
                onChange={handleSearchChange}
                leftIcon={<IoSearchOutline className='h-4 w-4' />}
                className='w-64'
              />
            </div>
          </div>
        </div>
      </div>
      {filteredPlans.length === 0 ? (
        <EmptyState
          searchQuery={searchQuery}
          filter={filter}
          onCreateTravel={handleCreateTravel}
        />
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredPlans.map((plan) => (
            <TravelPlanCard
              key={plan.id}
              plan={plan}
              onClick={() => handlePlanClick(plan.id)}
            />
          ))}
        </div>
      )}
      <TravelBasicInfoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

interface EmptyStateProps {
  searchQuery: string;
  filter: FilterType;
  onCreateTravel: () => void;
}
const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({ searchQuery, filter, onCreateTravel }) => (
    <div className='rounded-lg border border-gray-200 bg-white p-12 text-center'>
      <div className='mb-4 text-6xl'>✈️</div>
      <Typography variant='h6' className='mb-2 text-gray-900'>
        {searchQuery
          ? '일치하는 여행 계획이 없습니다'
          : filter === 'all'
            ? '아직 여행 계획이 없습니다'
            : filter === 'upcoming'
              ? '예정된 여행이 없습니다'
              : filter === 'in-progress'
                ? '진행 중인 여행이 없습니다'
                : '완료된 여행이 없습니다'}
      </Typography>
      <Typography variant='body2' className='mb-6 text-gray-500'>
        {searchQuery
          ? '다른 키워드로 검색해보세요'
          : '새로운 여행을 계획해보세요'}
      </Typography>
      {!searchQuery && filter === 'all' && (
        <Button
          variant='filled'
          colorTheme='blue'
          onClick={onCreateTravel}
          leftIcon={<IoAddOutline className='h-4 w-4' />}
        >
          새 여행 계획 만들기
        </Button>
      )}
    </div>
  )
);
EmptyState.displayName = 'EmptyState';

interface TravelPlanCardProps {
  plan: TravelPlan;
  onClick: () => void;
}
const TravelPlanCard: React.FC<TravelPlanCardProps> = React.memo(
  ({ plan, onClick }) => {
    const statusDisplay = useMemo(() => {
      switch (plan.status) {
        case 'completed':
          return { label: '완료', color: 'bg-green-100 text-green-700' };
        case 'in-progress':
          return { label: '진행', color: 'bg-blue-100 text-blue-700' };
        case 'upcoming':
          return { label: '예정', color: 'bg-orange-100 text-orange-700' };
        default:
          return { label: '예정', color: 'bg-gray-100 text-gray-700' };
      }
    }, [plan.status]);
    const formattedDates = useMemo(() => {
      const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
        });
      return {
        start: formatDate(plan.start_date),
        end: formatDate(plan.end_date),
      };
    }, [plan.start_date, plan.end_date]);
    return (
      <div
        onClick={onClick}
        className='cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md'
      >
        <div className='mb-4 flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <Typography
                variant='h6'
                weight='semiBold'
                className='mb-1 text-gray-900'
              >
                {plan.title}
              </Typography>
              {plan.isInvited && (
                <span className='rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700'>
                  초대
                </span>
              )}
            </div>
            <Typography variant='body2' className='text-gray-600'>
              {plan.location}
            </Typography>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${statusDisplay.color}`}
          >
            {statusDisplay.label}
          </span>
        </div>
        <div className='mb-4 flex items-center space-x-2 text-gray-600'>
          <IoCalendarOutline className='h-4 w-4' />
          <Typography variant='body2'>
            {formattedDates.start} - {formattedDates.end}
          </Typography>
        </div>
        <div className='flex items-center space-x-2'>
          <IoPeopleOutline className='h-4 w-4 text-gray-600' />
          <Typography variant='caption' className='text-gray-500'>
            {plan.participantCount}명
          </Typography>
        </div>
      </div>
    );
  }
);
TravelPlanCard.displayName = 'TravelPlanCard';

export default TravelPlansList;
