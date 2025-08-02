'use client';

import { useEffect, useState } from 'react';

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
import { MdOutlineDateRange, MdOutlineList } from 'react-icons/md';

import { Avatar, Badge, Button, Icon } from '@ui/components';
import { Typography } from '@ui/components/typography';

import { TrelioLogo } from '@/components/common';
import { NewTravelModal } from '@/components/common';
import { useMobile, useSession } from '@/hooks';

import { filterOptions, mockTravelPlans, navigation } from './constants';

interface HeaderProps {
  sidebarOpen?: boolean;
  shouldShowSidebar?: boolean;
  onSidebarToggle?: () => void;
}

// 헤더 스켈레톤 컴포넌트
const HeaderSkeleton = ({
  sidebarOpen = false,
  shouldShowSidebar = false,
}: {
  sidebarOpen?: boolean;
  shouldShowSidebar?: boolean;
}) => (
  <header
    className={`fixed top-0 z-30 border-b border-gray-200 bg-white shadow-sm backdrop-blur-sm transition-all duration-300 ${
      shouldShowSidebar
        ? sidebarOpen
          ? 'left-80 right-0'
          : 'left-16 right-0'
        : 'left-0 right-0'
    }`}
  >
    <nav className='mx-auto flex h-20 items-center justify-between px-6'>
      <div className='flex md:flex-1'>
        <Link href='/' className='flex items-center'>
          <span className='sr-only'>Trelio</span>
          <div className='flex items-center justify-center md:justify-start'>
            {/* 로고 스켈레톤 */}
            <div className='h-10 w-10 animate-pulse rounded-full bg-gray-200'></div>
            {/* 텍스트 스켈레톤 */}
            <div className='ml-2 h-6 w-16 animate-pulse rounded bg-gray-200'></div>
          </div>
        </Link>
      </div>

      {/* 모바일 스켈레톤 */}
      <div className='flex items-center space-x-2 md:hidden'>
        <div className='h-9 w-9 animate-pulse rounded-lg bg-gray-200'></div>
        <div className='h-9 w-9 animate-pulse rounded-full bg-gray-200'></div>
        <div className='h-9 w-9 animate-pulse rounded-full bg-gray-200'></div>
      </div>

      {/* 데스크톱 스켈레톤 */}
      <div className='hidden min-h-12 md:flex md:flex-1 md:items-center md:justify-end md:space-x-4'>
        <div className='flex h-10 w-32 animate-pulse items-center justify-center rounded-lg bg-gray-200'></div>
        <div className='flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-gray-200'></div>
        <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200'></div>
      </div>
    </nav>
  </header>
);

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
    'all' | 'in-progress' | 'completed'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isMobile = useMobile();
  const {
    isAuthenticated,
    userProfile,
    isSignUpCompleted,
    isSignUpIncomplete,
    loading,
    signOut,
  } = useSession();

  // 디버깅용 로그 (개발 환경에서만)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Header state:', {
        isAuthenticated,
        isSignUpCompleted,
        isSignUpIncomplete,
        loading,
        hasUserProfile: !!userProfile,
        userNickname: userProfile?.nickname,
      });
    }
  }, [
    isAuthenticated,
    isSignUpCompleted,
    isSignUpIncomplete,
    loading,
    userProfile,
  ]);

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

  // 로딩 중일 때 스켈레톤 표시
  if (loading) {
    return (
      <HeaderSkeleton
        sidebarOpen={sidebarOpen}
        shouldShowSidebar={shouldShowSidebar}
      />
    );
  }

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

  // 로그인 후 모바일 헤더 오른쪽 영역 렌더링
  const renderMobileAuthenticatedHeader = () => (
    <div className='flex items-center space-x-2 md:hidden'>
      {/* 새 여행 계획 생성 버튼 (아이콘만) */}
      <button
        onClick={() => setNewTravelModalOpen(true)}
        className='flex h-9 w-9 items-center justify-center rounded-lg bg-[#3182F6] transition-colors hover:bg-[#2b74e0]'
      >
        <Icon as={IoAddOutline} color='white' size={20} />
      </button>

      {/* 알림 아이콘 */}
      <button
        className='flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100'
        onClick={() => {
          // TODO: 알림 모달 열기
          console.log('알림 모달 열기');
        }}
      >
        <Icon as={IoNotificationsOutline} color='#374151' size={20} />
      </button>

      {/* 아바타 (드롭다운) */}
      <div className='profile-dropdown relative'>
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className='flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100'
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
    // 로그인 완료 상태
    if (isAuthenticated && isSignUpCompleted) {
      return renderMobileAuthenticatedHeader();
    }

    // 로그인 전 상태 - 아무것도 표시하지 않음 (햄버거 메뉴는 이제 왼쪽에 있음)
    return null;
  };

  // 필터링된 여행 계획
  const filteredPlans = mockTravelPlans.filter((plan) => {
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
              className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
              onClick={() => setMobileTravelMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-lg'
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
                  <button
                    onClick={() => setMobileTravelMenuOpen(false)}
                    className='rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100'
                    title='메뉴 닫기'
                  >
                    <Icon as={IoCloseOutline} size={24} />
                  </button>
                </div>

                {/* 필터 */}
                <div className='border-b border-gray-200 px-6 py-4'>
                  <div className='flex space-x-2'>
                    {filterOptions.map((option) => (
                      <motion.button
                        key={option.key}
                        onClick={() => setActiveFilter(option.key)}
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
                    {filteredPlans.length > 0 ? (
                      filteredPlans.map((plan, index) => (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={`/travel/${plan.id}`}
                            className='block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 hover:shadow-sm'
                            onClick={() => setMobileTravelMenuOpen(false)}
                          >
                            <div className='mb-3'>
                              <Typography
                                variant='body1'
                                weight='semiBold'
                                className='line-clamp-1 text-gray-900'
                              >
                                {plan.title}
                              </Typography>
                            </div>

                            <div className='mb-3 flex items-center space-x-2 text-gray-600'>
                              <Icon as={MdOutlineDateRange} size={16} />
                              <Typography
                                variant='body2'
                                className='text-gray-600'
                              >
                                {formatDate(plan.startDate)} -{' '}
                                {formatDate(plan.endDate)}
                              </Typography>
                            </div>

                            <div className='flex items-center justify-between'>
                              {/* 참여자 아바타 */}
                              <div className='flex -space-x-2'>
                                {plan.participantAvatars
                                  .slice(0, 3)
                                  .map((avatar, index) => (
                                    <Avatar
                                      key={index}
                                      src={avatar}
                                      alt={`참여자 ${index + 1}`}
                                      size='small'
                                    />
                                  ))}
                                {plan.participantAvatars.length > 3 && (
                                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white'>
                                    +{plan.participantAvatars.length - 3}
                                  </div>
                                )}
                              </div>

                              {/* 상태 뱃지 */}
                              <div
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  plan.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : plan.status === 'in-progress'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
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
                          여행 계획이 없습니다
                        </Typography>
                        <Typography variant='body2' className='text-gray-400'>
                          새로운 여행 계획을 만들어보세요
                        </Typography>
                      </motion.div>
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
