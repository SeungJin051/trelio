'use client';

import { useCallback, useEffect, useState } from 'react';

import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { CiLogin, CiLogout, CiUser } from 'react-icons/ci';
import { CiMenuBurger } from 'react-icons/ci';
import { FaExclamationTriangle } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import {
  IoAddOutline,
  IoNotificationsOutline,
  IoSearch,
} from 'react-icons/io5';
import {
  MdOutlineAccessTime,
  MdOutlineCheckCircle,
  MdOutlineDateRange,
  MdOutlineList,
} from 'react-icons/md';

import { Avatar, Badge, Button, Icon } from '@ui/components';
import { Typography } from '@ui/components/typography';

import { TrelioLogo } from '@/components/common';
import { NewTravelModal } from '@/components/common';
import { useMobile, useSession } from '@/hooks';
import { createClient } from '@/lib/supabase/client/supabase';

import { navigation } from './constants';

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

interface HeaderProps {
  sidebarOpen?: boolean;
  shouldShowSidebar?: boolean;
  onSidebarToggle?: () => void;
}

export const Header = ({
  sidebarOpen = false,
  shouldShowSidebar = false,
}: HeaderProps = {}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTravelMenuOpen, setMobileTravelMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [newTravelModalOpen, setNewTravelModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'upcoming' | 'in-progress' | 'completed'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 여행 계획 데이터 상태 추가
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const isMobile = useMobile();
  const {
    isAuthenticated,
    userProfile,
    isSignUpCompleted,
    isSignUpIncomplete,
    signOut,
  } = useSession();
  const supabase = createClient();

  // 모바일용 필터 옵션 (사이드바와 동일)
  const mobileFilterOptions = [
    { key: 'all', label: '전체', icon: MdOutlineList },
    { key: 'upcoming', label: '예정', icon: MdOutlineDateRange },
    { key: 'in-progress', label: '진행', icon: MdOutlineAccessTime },
    { key: 'completed', label: '완료', icon: MdOutlineCheckCircle },
  ] as const;

  // 여행 계획 목록 가져오기 (Sidebar와 동일한 로직)
  const fetchTravelPlans = useCallback(
    async (forceRefresh = false) => {
      if (!userProfile) {
        setLoading(false);
        return;
      }

      // 이미 데이터가 있고 강제 새로고침이 아닌 경우 스킵
      if (!forceRefresh && travelPlans.length > 0 && hasInitialized) {
        return;
      }

      try {
        setLoading(true);

        // RLS 재귀 문제 회피: SECURITY DEFINER RPC로 조회
        const { data: userRes } = await supabase.auth.getUser();
        const userId = userRes?.user?.id;
        if (!userId) {
          setLoading(false);
          return;
        }
        const { data: plansData, error: plansError } = await supabase.rpc(
          'fn_list_accessible_travel_plans',
          { p_user_id: userId, p_limit: 100 }
        );

        if (plansError) {
          console.error(
            '여행 계획 조회 실패:',
            plansError?.message || plansError
          );
          setTravelPlans([]);
          setLoading(false);
          return;
        }

        // 참가자 수 집계
        const planIds = (plansData || []).map((p: any) => p.id);
        const participantCountMap = new Map<string, number>();
        if (planIds.length > 0) {
          const { data: allParticipants } = await supabase
            .from('travel_plan_participants')
            .select('plan_id')
            .in('plan_id', planIds);
          (allParticipants || []).forEach((row: any) => {
            participantCountMap.set(
              row.plan_id,
              (participantCountMap.get(row.plan_id) || 0) + 1
            );
          });
        }

        // 데이터 변환 및 상태 결정
        const transformedPlans: TravelPlan[] = (plansData || []).map(
          (plan: any) => {
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
          }
        );

        setTravelPlans(transformedPlans);
        setHasInitialized(true);
      } catch (error) {
        console.error(error);
        setTravelPlans([]);
      } finally {
        setLoading(false);
      }
    },
    [userProfile, travelPlans.length, hasInitialized, supabase]
  );

  // 컴포넌트 마운트 시 및 userProfile 변경 시 데이터 가져오기
  useEffect(() => {
    if (userProfile) {
      fetchTravelPlans();
    }
  }, [userProfile, fetchTravelPlans]);

  // 모바일 여행 메뉴가 열릴 때 데이터 새로고침
  useEffect(() => {
    if (mobileTravelMenuOpen && isMobile && userProfile) {
      // 모바일에서 여행 메뉴가 열릴 때 항상 최신 데이터 확인
      fetchTravelPlans(true);
    }
  }, [mobileTravelMenuOpen, isMobile, userProfile, fetchTravelPlans]);

  // 필터링된 여행 계획
  const filteredPlans = travelPlans.filter((plan) => {
    const matchesFilter =
      activeFilter === 'all' || plan.status === activeFilter;
    const matchesSearch = plan.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // 디버깅용 로그
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Header state:', {
        isAuthenticated,
        isSignUpCompleted,
        isSignUpIncomplete,
        hasUserProfile: !!userProfile,
        userNickname: userProfile?.nickname,
      });
    }
  }, [isAuthenticated, isSignUpCompleted, isSignUpIncomplete, userProfile]);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setProfileDropdownOpen(false);
  };

  // 로그인 전 헤더 렌더링
  const renderUnauthenticatedHeader = () => (
    <>
      {/* 데스크톱 네비게이션 */}
      <div className='hidden md:flex md:gap-x-8'>
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className='relative rounded-lg px-3 py-2 transition-colors hover:bg-gray-100'
          >
            <Typography
              variant='body2'
              weight='medium'
              className='text-gray-700 transition-colors hover:text-gray-900'
            >
              {item.name}
            </Typography>
          </Link>
        ))}
      </div>

      {/* 로그인/프로필 영역 */}
      <div className='hidden md:flex md:flex-1 md:justify-end'>
        {renderProfileArea()}
      </div>

      {/* 모바일 햄버거 메뉴 버튼 */}
      <div className='flex items-center md:hidden'>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className='rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100'
          title='메뉴'
        >
          <Icon as={CiMenuBurger} color='#374151' size={24} />
        </button>
      </div>
    </>
  );

  // 로그인 후 헤더 렌더링
  const renderAuthenticatedHeader = () => (
    <div className='hidden md:flex md:flex-1 md:items-center md:justify-end md:space-x-3'>
      {/* 새 여행 계획 생성 버튼 */}
      <Button
        onClick={() => setNewTravelModalOpen(true)}
        colorTheme='blue'
        size='medium'
        className='flex items-center space-x-2'
        leftIcon={<Icon as={IoAddOutline} size={20} />}
      >
        <Typography variant='body2' weight='medium' className='text-white'>
          새 여행 계획
        </Typography>
      </Button>

      {/* 알림 아이콘 */}
      <button
        className='flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100'
        onClick={() => {
          // TODO: 알림 모달 열기
          console.log('알림 모달 열기');
        }}
      >
        <Icon as={IoNotificationsOutline} color='#374151' size={24} />
      </button>

      {/* 아바타 */}
      <div className='profile-dropdown relative'>
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className='flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100'
        >
          <Avatar
            src={userProfile?.profile_image_url}
            alt={userProfile?.nickname || userProfile?.email || '사용자'}
            size='small'
          />
        </button>

        <AnimatePresence>
          {profileDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className='absolute right-0 mt-2 w-48 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5'
            >
              <div className='border-b border-gray-100 px-4 py-2'>
                <Typography
                  variant='body2'
                  className='font-medium text-gray-900'
                >
                  {userProfile?.nickname || '사용자'}
                </Typography>
                <Typography variant='body2' className='text-gray-500'>
                  {userProfile?.email}
                </Typography>
              </div>

              <Link
                href='/profile'
                className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                onClick={() => setProfileDropdownOpen(false)}
              >
                <Icon as={CiUser} className='mr-2 h-4 w-4' />
                프로필 설정
              </Link>

              <button
                onClick={handleSignOut}
                className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              >
                <Icon as={CiLogout} className='mr-2 h-4 w-4' />
                로그아웃
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // 프로필 영역 렌더링 함수 (로그인 전 사용자용)
  const renderProfileArea = () => {
    if (!isAuthenticated || !userProfile) {
      // 로그인되지 않은 상태
      return (
        <Link href='/log-in'>
          <Icon
            as={CiLogin}
            color='#374151'
            size={24}
            className='cursor-pointer'
          />
        </Link>
      );
    }

    if (isSignUpIncomplete) {
      // 회원가입 미완료 상태
      return (
        <Link
          href='/sign-up'
          className='flex items-center space-x-2 rounded-full bg-amber-100 px-3 py-2 transition-colors hover:bg-amber-200'
        >
          <Icon as={FaExclamationTriangle} color='#D97706' size={16} />
          <Typography variant='body2' className='font-medium text-amber-700'>
            가입 완료하기
          </Typography>
        </Link>
      );
    }

    // 로그인 완료 상태에서는 새로운 헤더 레이아웃을 사용하므로 여기서는 null 반환
    return null;
  };

  // 모바일 하단 영역 렌더링
  const renderMobileBottomArea = () => {
    if (isAuthenticated && userProfile && isSignUpCompleted) {
      // 로그인 완료 상태 - 새로운 모바일 레이아웃
      return (
        <div className='space-y-3'>
          {/* 새 여행 계획 생성 버튼 */}
          <button
            onClick={() => {
              setNewTravelModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className='flex w-full items-center justify-center space-x-2 rounded-xl bg-[#3182F6] px-4 py-3 font-medium text-white transition-colors hover:bg-[#2b74e0]'
          >
            <Icon as={IoAddOutline} size={20} />
            <span>새 여행 계획 생성</span>
          </button>

          {/* 알림 버튼 */}
          <button
            className='flex w-full items-center justify-center space-x-2 rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200'
            onClick={() => {
              // TODO: 알림 모달 열기
              console.log('알림 모달 열기');
              setMobileMenuOpen(false);
            }}
          >
            <Icon as={IoNotificationsOutline} size={20} />
            <span>알림</span>
          </button>

          {/* 사용자 프로필 정보 */}
          <div className='flex items-center space-x-3 px-4 py-2'>
            <Avatar
              src={userProfile.profile_image_url}
              alt={userProfile.nickname || userProfile.email || '사용자'}
              size='small'
            />
            <div>
              <Typography variant='body2' className='font-medium text-gray-900'>
                {userProfile.nickname || '사용자'}
              </Typography>
              <Typography variant='body2' className='text-gray-500'>
                {userProfile.email}
              </Typography>
            </div>
          </div>

          {/* 프로필 설정 버튼 */}
          <Link
            href='/profile'
            className='flex w-full items-center justify-center rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200'
            onClick={() => setMobileMenuOpen(false)}
          >
            프로필 설정
          </Link>

          {/* 로그아웃 버튼 */}
          <button
            onClick={() => {
              handleSignOut();
              setMobileMenuOpen(false);
            }}
            className='flex w-full items-center justify-center rounded-xl bg-red-100 px-4 py-3 font-medium text-red-700 transition-colors hover:bg-red-200'
          >
            로그아웃
          </button>
        </div>
      );
    }

    if (isAuthenticated && userProfile && isSignUpIncomplete) {
      // 회원가입 미완료 상태
      return (
        <Link
          href='/sign-up'
          className='flex w-full items-center justify-center rounded-xl bg-amber-100 px-4 py-3 font-medium text-amber-700 transition-colors hover:bg-amber-200'
          onClick={() => setMobileMenuOpen(false)}
        >
          <Icon as={FaExclamationTriangle} className='mr-2 h-4 w-4' />
          가입 완료하기
        </Link>
      );
    }

    // 로그인되지 않은 상태
    return (
      <Link
        href='/log-in'
        className='flex w-full items-center justify-center rounded-xl bg-[#3182F6] px-4 py-3 font-medium text-white transition-colors hover:bg-[#2b74e0] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-2'
        onClick={() => setMobileMenuOpen(false)}
      >
        로그인
      </Link>
    );
  };

  // 헤더 오른쪽 영역 렌더링 로직
  const renderHeaderRightArea = () => {
    // 로그인 완료 상태
    if (isAuthenticated && isSignUpCompleted) {
      return renderAuthenticatedHeader();
    }

    // 로그인 전 상태
    return renderUnauthenticatedHeader();
  };

  // 모바일 오른쪽 영역 렌더링 로직
  const renderMobileRightArea = () => {
    if (!isAuthenticated || !isSignUpCompleted) {
      // 로그인 전 상태 - 아무것도 표시하지 않음 (햄버거 메뉴는 이제 왼쪽에 있음)
      return null;
    }

    // 로그인 후 모바일 헤더
    return (
      <div className='flex items-center space-x-2 md:hidden'>
        {/* 새 여행 계획 생성 버튼 */}
        <button
          onClick={() => setNewTravelModalOpen(true)}
          className='flex items-center justify-center rounded-lg bg-blue-500 px-3 py-2 text-white transition-colors hover:bg-blue-600'
        >
          <IoAddOutline className='mr-1 h-4 w-4' />
          <span className='text-sm font-medium'>새 여행</span>
        </button>

        {/* 알림 버튼 */}
        <button className='rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100'>
          <IoNotificationsOutline className='h-5 w-5' />
        </button>

        {/* 프로필 영역 */}
        {renderProfileArea()}
      </div>
    );
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 데이터 새로고침 함수
  const handleRefresh = () => {
    fetchTravelPlans(true);
  };

  return (
    <header
      className={`fixed top-0 z-30 border-b border-gray-200 bg-white transition-all duration-300 ${
        scrolled ? 'shadow-sm backdrop-blur-sm' : ''
      } ${
        shouldShowSidebar && !isMobile
          ? sidebarOpen
            ? 'left-80 right-0'
            : 'left-16 right-0'
          : 'left-0 right-0'
      }`}
    >
      <nav
        className='mx-auto flex h-20 items-center justify-between px-6'
        aria-label='Global'
      >
        <div className='flex items-center md:flex-1'>
          {/* 모바일 햄버거 메뉴 (로고 왼쪽) - 로그인 완료 사용자만 */}
          {isMobile && isAuthenticated && isSignUpCompleted && (
            <button
              onClick={() => setMobileTravelMenuOpen(true)}
              className='mr-3 rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100'
              title='여행 계획 메뉴'
            >
              <Icon as={CiMenuBurger} color='#374151' size={24} />
            </button>
          )}

          <Link href='/' className='flex items-center'>
            <span className='sr-only'>Trelio</span>
            <div className='flex items-center justify-center md:justify-start'>
              <TrelioLogo width={40} height={40} className='text-[#3182F6]' />
              <Typography
                variant='h4'
                weight='semiBold'
                className='ml-2 text-gray-900'
              >
                Trelio
              </Typography>
            </div>
          </Link>
        </div>

        {/* 모바일 오른쪽 영역 */}
        {renderMobileRightArea()}

        {/* 헤더 오른쪽 영역 (데스크톱) */}
        {renderHeaderRightArea()}
      </nav>

      {/* 모바일 메뉴 (로그인 전 사용자만) */}
      <AnimatePresence>
        {mobileMenuOpen && (!isAuthenticated || !isSignUpCompleted) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-lg'
            >
              <div className='flex h-full flex-col overflow-y-auto'>
                <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
                  <Link
                    href='/'
                    className='flex items-center'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <TrelioLogo
                      width={32}
                      height={32}
                      className='text-[#3182F6]'
                    />
                    <span className='ml-2 text-lg font-medium text-gray-900'>
                      Trelio
                    </span>
                  </Link>
                  <button
                    type='button'
                    className='rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className='sr-only'>메뉴 닫기</span>
                    <Icon as={IoCloseOutline} color='#374151' size={24} />
                  </button>
                </div>

                {/* 네비게이션 메뉴 */}
                <div className='flex-1 px-6 py-6'>
                  <div className='flex flex-col space-y-2'>
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className='flex items-center rounded-xl px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50'
                        onClick={() => {
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Typography variant='body1' weight='medium'>
                          {item.name}
                        </Typography>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className='border-t border-gray-100 px-6 py-6'>
                  {renderMobileBottomArea()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 모바일 여행 계획 메뉴 */}
      <AnimatePresence>
        {mobileTravelMenuOpen && isAuthenticated && isSignUpCompleted && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm'
              onClick={() => setMobileTravelMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 90,
              }}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='fixed inset-y-0 left-0 z-[95] w-full max-w-sm bg-white shadow-lg'
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                zIndex: 95,
              }}
            >
              <div className='flex h-full flex-col overflow-y-auto'>
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
                    {/* 새로고침 버튼 */}
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
                    <button
                      onClick={() => setMobileTravelMenuOpen(false)}
                      className='rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100'
                      title='메뉴 닫기'
                    >
                      <Icon as={IoCloseOutline} size={24} />
                    </button>
                  </div>
                </div>

                {/* 필터 */}
                <div className='border-b border-gray-200 px-6 py-4'>
                  <div className='flex space-x-2'>
                    {mobileFilterOptions.map((option) => (
                      <motion.button
                        key={option.key}
                        onClick={() =>
                          setActiveFilter(
                            option.key as
                              | 'all'
                              | 'upcoming'
                              | 'in-progress'
                              | 'completed'
                          )
                        }
                        className='flex-1'
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
                            <span>{option.label}</span>
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
                      className='w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-[#3182F6] focus:bg-white focus:outline-none'
                    />
                  </div>
                </div>

                {/* 여행 계획 목록 */}
                <div className='flex-1 overflow-y-auto px-6 py-4'>
                  <div className='space-y-3'>
                    {loading ? (
                      <div className='flex flex-col items-center justify-center py-12 text-center'>
                        <div className='mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
                        <Typography variant='body2' className='text-gray-500'>
                          여행 계획을 불러오는 중...
                        </Typography>
                      </div>
                    ) : filteredPlans.length === 0 ? (
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
                    ) : (
                      filteredPlans.map((plan, index) => (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <Link
                            href={`/travel/${plan.id}`}
                            className='block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:bg-gray-100'
                            onClick={() => {
                              // 모바일에서는 링크 클릭 시 메뉴 닫기
                              setTimeout(() => {
                                setMobileTravelMenuOpen(false);
                              }, 100);
                            }}
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
                    )}
                  </div>
                </div>

                {/* 새 여행 계획 버튼 */}
                <div className='border-t border-gray-100 px-6 py-6'>
                  <Button
                    onClick={() => {
                      setNewTravelModalOpen(true);
                      setMobileTravelMenuOpen(false);
                    }}
                    colorTheme='blue'
                    size='medium'
                    className='flex w-full items-center justify-center space-x-2'
                    leftIcon={<Icon as={IoAddOutline} size={20} />}
                  >
                    <Typography
                      variant='body2'
                      weight='medium'
                      className='text-white'
                    >
                      새 여행 계획 생성
                    </Typography>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 새 여행 계획 모달 */}
      <NewTravelModal
        isOpen={newTravelModalOpen}
        onClose={() => setNewTravelModalOpen(false)}
      />
    </header>
  );
};

Header.displayName = 'Header';
