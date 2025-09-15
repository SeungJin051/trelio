'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineMenu, HiOutlineMenuAlt2 } from 'react-icons/hi';
import { IoSearch } from 'react-icons/io5';
import {
  MdOutlineAccessTime,
  MdOutlineCheckCircle,
  MdOutlineDateRange,
  MdOutlineList,
} from 'react-icons/md';

import { Avatar, Badge, Icon } from '@ui/components';
import { Typography } from '@ui/components/typography';

import { useSession } from '@/hooks/useSession';
import { useAccessibleTravelPlans } from '@/hooks/useTravelPlans';
import { createClient } from '@/lib/supabase/client/supabase';

interface TravelPlan {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  created_at: string;
  participantCount: number;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const filterOptions = [
  { key: 'all', label: '전체', icon: MdOutlineList },
  { key: 'upcoming', label: '예정', icon: MdOutlineDateRange },
  { key: 'in-progress', label: '진행', icon: MdOutlineAccessTime },
  { key: 'completed', label: '완료', icon: MdOutlineCheckCircle },
] as const;

// TODO:나중에 RLS 정책을 properly 설정하면 참여한 여행 계획도 모두 볼 수 있도록

const sidebarVariants = {
  open: {
    width: 320,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  closed: {
    width: 64,
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    },
  },
};

const contentVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  closed: {
    opacity: 0,
    x: -5,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

const overlayVariants = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { userProfile } = useSession();
  const supabase = createClient();
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'upcoming' | 'in-progress' | 'completed'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [participantCountMap, setParticipantCountMap] = useState<
    Map<string, number>
  >(new Map());
  const EMPTY_ARRAY: ReadonlyArray<any> = [];

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 여행 계획 목록 가져오기 (React Query 상태 사용)
  const {
    data: accessiblePlans,
    isLoading,
    isFetching,
    refetch,
  } = useAccessibleTravelPlans(100);

  // 참가자 수 집계 (실시간 업데이트)
  useEffect(() => {
    const fetchParticipantCounts = async () => {
      try {
        const planIds = (accessiblePlans || []).map((p: any) => p.id);
        if (!planIds.length) {
          setParticipantCountMap(new Map());
          return;
        }

        const { data } = await supabase
          .from('travel_plan_participants')
          .select('plan_id')
          .in('plan_id', planIds);

        const map = new Map<string, number>();
        (data || []).forEach((row: any) => {
          map.set(row.plan_id, (map.get(row.plan_id) || 0) + 1);
        });
        setParticipantCountMap(map);
      } catch (e) {
        console.warn('참가자 수 집계 실패:', e);
      }
    };

    fetchParticipantCounts();

    // 참여자 변경 실시간 감지
    const planIds = (accessiblePlans || []).map((p: any) => p.id);
    if (planIds.length > 0) {
      const subscription = supabase
        .channel('participant-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'travel_plan_participants',
            filter: `plan_id=in.(${planIds.join(',')})`,
          },
          () => {
            // 참여자 변경 시 다시 계산
            fetchParticipantCounts();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [accessiblePlans, supabase]);

  // 서버 데이터 -> 뷰 모델 변환 (상태 대신 메모이제이션)
  const travelPlans: TravelPlan[] = useMemo(() => {
    const source = accessiblePlans ?? EMPTY_ARRAY;
    return source.map((plan: any) => {
      const startDate = new Date(plan.start_date);
      const endDate = new Date(plan.end_date);
      const today = new Date();

      let status: 'upcoming' | 'in-progress' | 'completed';
      if (endDate < today) {
        status = 'completed';
      } else if (startDate <= today && today <= endDate) {
        status = 'in-progress';
      } else {
        status = 'upcoming';
      }

      return {
        id: plan.id,
        title: plan.title,
        start_date: plan.start_date,
        end_date: plan.end_date,
        location: plan.location,
        status,
        created_at: plan.created_at,
        participantCount: participantCountMap.get(plan.id) || 1,
      };
    });
  }, [accessiblePlans, participantCountMap]);

  const loading = isLoading || isFetching;

  // 모바일에서 사이드바가 열릴 때 데이터 새로고침
  useEffect(() => {
    if (isOpen && isMobile && userProfile) {
      refetch();
    }
  }, [isOpen, isMobile, userProfile, refetch]);

  // 필터링된 여행 계획
  const filteredPlans = travelPlans.filter((plan) => {
    const matchesFilter =
      activeFilter === 'all' || plan.status === activeFilter;
    const matchesSearch = plan.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 모바일에서 링크 클릭 처리
  const handlePlanClick = () => {
    if (isMobile) {
      // 모바일에서는 약간의 지연 후 사이드바 닫기 (페이지 전환을 위해)
      setTimeout(() => {
        onToggle();
      }, 100);
    }
  };

  // 데이터 새로고침 함수
  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      {/* 모바일 오버레이 (사이드바가 열렸을 때만) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial='closed'
            animate='open'
            exit='closed'
            className='fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm sm:hidden'
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* 사이드바 (모바일 + 데스크톱) */}
      <div>
        <motion.div
          variants={sidebarVariants}
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          className='fixed left-0 top-0 z-[80] h-screen overflow-hidden border-r border-gray-200 bg-white shadow-lg sm:z-40 lg:z-40'
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: isMobile ? 80 : 40,
          }}
        >
          <AnimatePresence mode='wait'>
            {isOpen ? (
              <motion.div
                key='open'
                variants={contentVariants}
                initial='closed'
                animate='open'
                exit='closed'
                className='flex h-full w-80 flex-col'
              >
                {/* 헤더 */}
                <div className='flex items-center justify-between border-b border-gray-200 px-6 py-6'>
                  <Typography
                    variant='h6'
                    weight='semiBold'
                    className='text-gray-900'
                  >
                    내 여행 계획
                  </Typography>
                  <div className='flex items-center space-x-2'>
                    {/* 새로고침 버튼 (모바일에서만 표시) */}
                    {isMobile && (
                      <motion.button
                        onClick={handleRefresh}
                        className='rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 active:bg-gray-200'
                        title='새로고침'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                      >
                        <svg
                          className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                          />
                        </svg>
                      </motion.button>
                    )}
                    <motion.button
                      onClick={onToggle}
                      className='rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 active:bg-gray-200'
                      title='사이드바 닫기'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon as={HiOutlineMenuAlt2} size={18} />
                    </motion.button>
                  </div>
                </div>

                {/* 필터 */}
                <div className='border-b border-gray-200 px-6 py-4'>
                  <div className='flex space-x-2'>
                    {filterOptions.map((option) => (
                      <motion.button
                        key={option.key}
                        onClick={() => setActiveFilter(option.key)}
                        className='flex-1 touch-manipulation'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Badge
                          colorTheme={
                            activeFilter === option.key ? 'blue' : 'gray'
                          }
                          size='medium'
                          variant={
                            activeFilter === option.key ? 'filled' : 'outlined'
                          }
                        >
                          <div className='flex items-center space-x-1'>
                            <Icon as={option.icon} size={14} />
                            <span className='text-xs sm:text-sm'>
                              {option.label}
                            </span>
                          </div>
                        </Badge>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 검색 */}
                <div className='border-b border-gray-200 px-6 py-4'>
                  <div className='relative'>
                    <Icon
                      as={IoSearch}
                      size={18}
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    />
                    <input
                      type='text'
                      placeholder='여행 계획 검색...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='w-full touch-manipulation rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-[#3182F6] focus:bg-white focus:outline-none'
                    />
                  </div>
                </div>

                {/* 여행 계획 목록 */}
                <div className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 overflow-y-auto px-6 py-4'>
                  <div className='space-y-3'>
                    {loading ? (
                      // 로딩 상태
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='flex flex-col items-center justify-center py-12'
                      >
                        <div className='mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
                        <Typography variant='body2' className='text-gray-500'>
                          여행 계획을 불러오는 중...
                        </Typography>
                      </motion.div>
                    ) : filteredPlans.length > 0 ? (
                      filteredPlans.map((plan, index) => (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <Link
                            href={`/travel/${plan.id}`}
                            className='block touch-manipulation rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:bg-gray-100'
                            onClick={handlePlanClick}
                          >
                            <div className='mb-3'>
                              <Typography
                                variant='body1'
                                weight='semiBold'
                                className='line-clamp-1 text-gray-900'
                              >
                                {plan.title}
                              </Typography>
                              <Typography
                                variant='caption'
                                className='text-gray-500'
                              >
                                {plan.location}
                              </Typography>
                            </div>

                            <div className='mb-3 flex items-center space-x-2 text-gray-600'>
                              <Icon as={MdOutlineDateRange} size={16} />
                              <Typography
                                variant='body2'
                                className='text-gray-600'
                              >
                                {formatDate(plan.start_date)} -{' '}
                                {formatDate(plan.end_date)}
                              </Typography>
                            </div>

                            <div className='flex items-center justify-between'>
                              {/* 참여자 정보 */}
                              <div className='flex items-center space-x-2'>
                                <Avatar
                                  src={userProfile?.profile_image_url}
                                  alt={userProfile?.nickname || '나'}
                                  size='small'
                                />
                                {plan.participantCount > 1 && (
                                  <span className='text-xs text-gray-500'>
                                    +{plan.participantCount - 1}명
                                  </span>
                                )}
                              </div>

                              {/* 상태 뱃지 */}
                              <div
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  plan.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : plan.status === 'in-progress'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {plan.status === 'completed'
                                  ? '완료'
                                  : plan.status === 'in-progress'
                                    ? '진행 중'
                                    : '예정'}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='flex flex-col items-center justify-center py-12 text-center'
                      >
                        <div className='mb-4 rounded-full bg-gray-100 p-6'>
                          <Icon
                            as={MdOutlineList}
                            size={32}
                            className='text-gray-400'
                          />
                        </div>
                        <Typography
                          variant='body1'
                          weight='medium'
                          className='mb-2 text-gray-500'
                        >
                          {searchQuery
                            ? '검색 결과가 없습니다'
                            : '여행 계획이 없습니다'}
                        </Typography>
                        <Typography variant='body2' className='text-gray-400'>
                          {searchQuery
                            ? '다른 키워드로 검색해보세요'
                            : '새로운 여행 계획을 만들어보세요'}
                        </Typography>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key='closed'
                className='flex h-full w-16 flex-col items-center py-4'
              >
                <motion.button
                  onClick={onToggle}
                  className='rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 active:bg-gray-200'
                  title='사이드바 열기'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon as={HiOutlineMenu} size={24} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

Sidebar.displayName = 'Sidebar';
