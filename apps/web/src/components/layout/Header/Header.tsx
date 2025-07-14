'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { CiLogin, CiLogout, CiUser } from 'react-icons/ci';
import { CiMenuBurger } from 'react-icons/ci';
import { FaExclamationTriangle } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';

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

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const {
    isAuthenticated,
    userProfile,
    signUpStatus,
    isSignUpCompleted,
    isSignUpIncomplete,
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

  // 현재 활성화된 메뉴 아이템 감지
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;

      // 메인 페이지인 경우 아무 메뉴도 활성화하지 않음
      if (path === '/') {
        setActiveItem('');
        return;
      }

      // 정확히 일치하는 경로 우선 확인
      const exactMatch = navigation.find((item) => path === item.href);
      if (exactMatch) {
        setActiveItem(exactMatch.href);
        return;
      }

      // 하위 경로 매칭 (메인 페이지가 아닌 경우만)
      const pathMatch = navigation.find(
        (item) => item.href !== '/' && path.startsWith(item.href)
      );
      setActiveItem(pathMatch?.href || '');
    }
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

  // 프로필 영역 렌더링 함수
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

    if (isSignUpCompleted) {
      // 회원가입 완료 상태 - 기존 아바타 로직
      return (
        <div className='profile-dropdown relative'>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className='flex items-center space-x-2 rounded-full p-1 transition-colors hover:bg-gray-100'
          >
            <Avatar
              src={userProfile.profile_image_url}
              alt={userProfile.nickname || userProfile.email || '사용자'}
              size='small'
            />
            <span className='sr-only'>프로필 메뉴</span>
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
                    {userProfile.nickname || '사용자'}
                  </Typography>
                  <Typography variant='body2' className='text-gray-500'>
                    {userProfile.email}
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
      );
    }

    // 로딩 상태
    return (
      <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200'></div>
    );
  };

  console.log(
    'Header - signUpStatus:',
    signUpStatus,
    'userProfile:',
    userProfile
  );

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-sm backdrop-blur-sm' : 'bg-white'
      }`}
    >
      <nav
        className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'
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

        {/* 모바일 메뉴 버튼 */}
        <div className='flex md:hidden'>
          <button
            type='button'
            className='inline-flex items-center justify-center rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100'
            onClick={() => setMobileMenuOpen(true)}
          >
            <Icon as={CiMenuBurger} color='#374151' size={24} />
          </button>
        </div>

        {/* 데스크톱 네비게이션 */}
        <div className='hidden md:flex md:gap-x-8'>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className='relative rounded-lg px-3 py-2 transition-colors hover:bg-gray-100'
              onClick={() => setActiveItem(item.href)}
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
      </nav>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {mobileMenuOpen && (
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

                <div className='flex-1 px-6 py-6'>
                  <div className='flex flex-col space-y-2'>
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className='flex items-center rounded-xl px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50'
                        onClick={() => {
                          setActiveItem(item.href);
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
                  {isAuthenticated && userProfile ? (
                    <>
                      {isSignUpIncomplete ? (
                        <Link
                          href='/sign-up'
                          className='flex w-full items-center justify-center rounded-xl bg-amber-100 px-4 py-3 font-medium text-amber-700 transition-colors hover:bg-amber-200'
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon
                            as={FaExclamationTriangle}
                            className='mr-2 h-4 w-4'
                          />
                          가입 완료하기
                        </Link>
                      ) : (
                        <div className='space-y-3'>
                          <div className='flex items-center space-x-3 px-4 py-2'>
                            <Avatar
                              src={userProfile.profile_image_url}
                              alt={
                                userProfile.nickname ||
                                userProfile.email ||
                                '사용자'
                              }
                              size='small'
                            />
                            <div>
                              <Typography
                                variant='body2'
                                className='font-medium text-gray-900'
                              >
                                {userProfile.nickname || '사용자'}
                              </Typography>
                              <Typography
                                variant='body2'
                                className='text-gray-500'
                              >
                                {userProfile.email}
                              </Typography>
                            </div>
                          </div>

                          <Link
                            href='/profile'
                            className='flex w-full items-center justify-center rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200'
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            프로필 설정
                          </Link>

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
                      )}
                    </>
                  ) : (
                    <Link
                      href='log-in'
                      className='flex w-full items-center justify-center rounded-xl bg-[#3182F6] px-4 py-3 font-medium text-white transition-colors hover:bg-[#2b74e0] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-2'
                    >
                      로그인
                    </Link>
                  )}
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
