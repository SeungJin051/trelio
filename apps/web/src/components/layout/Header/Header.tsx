'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { CiLogin, CiLogout, CiUser } from 'react-icons/ci';
import { CiMenuBurger } from 'react-icons/ci';
import { FaExclamationTriangle } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import { IoAddOutline, IoNotificationsOutline } from 'react-icons/io5';

import { Avatar, Icon } from '@ui/components';
import { Typography } from '@ui/components/typography';

import { TrelioLogo } from '@/components/common';
import { useSession } from '@/hooks/useSession';

interface NavItem {
  name: string;
  href: string;
}

const navigation: NavItem[] = [
  { name: '여행 목록', href: '/travel-list' },
  { name: '요금제', href: '/price' },
  { name: 'FAQ', href: '/faq' },
  { name: '문의하기', href: '/contact' },
];

// 헤더 스켈레톤 컴포넌트
const HeaderSkeleton = () => (
  <div className='hidden min-h-12 md:flex md:flex-1 md:items-center md:justify-end md:space-x-4'>
    <div className='flex h-10 w-32 animate-pulse items-center justify-center rounded-lg bg-gray-200'></div>

    <div className='flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-gray-200'></div>

    <div className='flex h-10 animate-pulse items-center space-x-3 rounded-full bg-gray-100 pr-4'>
      <div className='ml-2 h-8 w-8 rounded-full bg-gray-200'></div>
      <div className='h-4 w-16 rounded bg-gray-200'></div>
    </div>
  </div>
);

// 모바일 헤더 스켈레톤 컴포넌트 (로그인 후)
const MobileHeaderSkeleton = () => (
  <div className='flex items-center space-x-2 md:hidden'>
    <div className='flex h-9 w-9 animate-pulse items-center justify-center rounded-lg bg-gray-200'></div>

    <div className='flex h-9 w-9 animate-pulse items-center justify-center rounded-full bg-gray-200'></div>

    <div className='flex h-9 w-9 animate-pulse items-center justify-center rounded-full bg-gray-200'></div>
  </div>
);

// 모바일 스켈레톤 컴포넌트
const MobileBottomSkeleton = () => (
  <div className='space-y-3'>
    <div className='h-12 w-full animate-pulse rounded-xl bg-gray-200'></div>

    <div className='h-12 w-full animate-pulse rounded-xl bg-gray-200'></div>

    <div className='flex items-center space-x-3 px-4 py-2'>
      <div className='h-10 w-10 animate-pulse rounded-full bg-gray-200'></div>
      <div className='flex-1 space-y-2'>
        <div className='h-4 w-20 animate-pulse rounded bg-gray-200'></div>
        <div className='h-3 w-32 animate-pulse rounded bg-gray-200'></div>
      </div>
    </div>

    <div className='h-12 w-full animate-pulse rounded-xl bg-gray-200'></div>
    <div className='h-12 w-full animate-pulse rounded-xl bg-gray-200'></div>
  </div>
);

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const {
    isAuthenticated,
    userProfile,
    isSignUpCompleted,
    isSignUpIncomplete,
    loading,
    signOut,
  } = useSession();

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
    </>
  );

  // 로그인 후 헤더 렌더링
  const renderAuthenticatedHeader = () => (
    <div className='hidden md:flex md:flex-1 md:items-center md:justify-end md:space-x-4'>
      {/* 새 여행 계획 생성 버튼 */}
      <Link
        href='/travel/new'
        className='flex items-center space-x-2 rounded-lg bg-[#3182F6] px-4 py-2 transition-colors hover:bg-[#2b74e0]'
      >
        <Icon as={IoAddOutline} color='white' size={18} />
        <Typography variant='body2' weight='medium' className='text-white'>
          새 여행 계획
        </Typography>
      </Link>

      {/* 알림 아이콘 */}
      <button
        className='rounded-full p-2 transition-colors hover:bg-gray-100'
        onClick={() => {
          // TODO: 알림 모달 열기
          console.log('알림 모달 열기');
        }}
      >
        <Icon as={IoNotificationsOutline} color='#374151' size={24} />
      </button>

      {/* 아바타 및 닉네임 */}
      <div className='profile-dropdown relative'>
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className='flex items-center space-x-3 rounded-full p-2 transition-colors hover:bg-gray-100'
        >
          <Avatar
            src={userProfile?.profile_image_url}
            alt={userProfile?.nickname || userProfile?.email || '사용자'}
            size='small'
          />
          <Typography variant='body2' weight='medium' className='text-gray-900'>
            {userProfile?.nickname || '사용자'}
          </Typography>
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
      <Link
        href='/travel/new'
        className='flex items-center justify-center rounded-lg bg-[#3182F6] p-2 transition-colors hover:bg-[#2b74e0]'
      >
        <Icon as={IoAddOutline} color='white' size={20} />
      </Link>

      {/* 알림 아이콘 */}
      <button
        className='rounded-full p-2 transition-colors hover:bg-gray-100'
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
          className='rounded-full p-1 transition-colors hover:bg-gray-100'
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
    // 로딩 중일 때 스켈레톤 표시
    if (loading) {
      return <MobileBottomSkeleton />;
    }

    if (isAuthenticated && userProfile && isSignUpCompleted) {
      // 로그인 완료 상태 - 새로운 모바일 레이아웃
      return (
        <div className='space-y-3'>
          {/* 새 여행 계획 생성 버튼 */}
          <Link
            href='/travel/new'
            className='flex w-full items-center justify-center space-x-2 rounded-xl bg-[#3182F6] px-4 py-3 font-medium text-white transition-colors hover:bg-[#2b74e0]'
            onClick={() => setMobileMenuOpen(false)}
          >
            <Icon as={IoAddOutline} size={20} />
            <span>새 여행 계획 생성</span>
          </Link>

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
    // 로딩 중일 때 스켈레톤 표시
    if (loading) {
      return <HeaderSkeleton />;
    }

    // 로그인 완료 상태
    if (isAuthenticated && isSignUpCompleted) {
      return renderAuthenticatedHeader();
    }

    // 로그인 전 상태
    return renderUnauthenticatedHeader();
  };

  // 모바일 오른쪽 영역 렌더링 로직
  const renderMobileRightArea = () => {
    // 로딩 중일 때 스켈레톤 표시
    if (loading) {
      return <MobileHeaderSkeleton />;
    }

    // 로그인 완료 상태
    if (isAuthenticated && isSignUpCompleted) {
      return renderMobileAuthenticatedHeader();
    }

    // 로그인 전 상태 - 햄버거 메뉴 버튼
    return (
      <div className='flex md:hidden'>
        <button
          type='button'
          className='inline-flex items-center justify-center rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100'
          onClick={() => setMobileMenuOpen(true)}
        >
          <Icon as={CiMenuBurger} color='#374151' size={24} />
        </button>
      </div>
    );
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white transition-all duration-300 ${
        scrolled ? 'shadow-sm backdrop-blur-sm' : ''
      }`}
    >
      <nav
        className='mx-auto flex items-center justify-between px-6 py-4'
        aria-label='Global'
      >
        <div className='flex md:flex-1'>
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
        {mobileMenuOpen &&
          !loading &&
          (!isAuthenticated || !isSignUpCompleted) && (
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
    </header>
  );
};

Header.displayName = 'Header';
