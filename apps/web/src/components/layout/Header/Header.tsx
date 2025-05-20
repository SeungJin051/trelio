'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { CiLogin } from 'react-icons/ci';
import { CiMenuBurger } from 'react-icons/ci';
import { IoCloseOutline } from 'react-icons/io5';

import { Icon } from '@ui/components/icon';
import { Typography } from '@ui/components/typography';

interface NavItem {
  name: string;
  href: string;
}

const navigation: NavItem[] = [
  { name: '여행 계획', href: '/travel-plan' },
  { name: '여행지 추천', href: '/recommendations' },
  { name: '항공권 검색', href: '/flights' },
  { name: '여행 팁', href: '/tips' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('');
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
      const active = navigation.find((item) => path.startsWith(item.href));
      setActiveItem(active?.href || '');
    }
  }, []);

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
            <span className='sr-only'>Pack & Go</span>
            <div className='flex items-center justify-center md:justify-start'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-[#3182F6] font-bold text-white'>
                P&G
              </div>
              <Typography variant='h4' weight='semiBold' className='ml-2'>
                Pack & Go
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
              className='relative py-2'
              onClick={() => setActiveItem(item.href)}
            >
              <Typography
                variant='body1'
                weight='medium'
                className={`transition-colors ${
                  activeItem === item.href
                    ? 'text-[#3182F6]'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Typography>
              {activeItem === item.href && (
                <motion.div
                  layoutId='activeIndicator'
                  className='absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[#3182F6]'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* 로그인 버튼 */}
        <Link
          href='log-in'
          className='hidden cursor-pointer md:flex md:flex-1 md:justify-end'
        >
          <Icon as={CiLogin} color='#374151' size={24} />
        </Link>
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
                    <Image
                      className='h-8 w-auto'
                      src='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=blue&shade=500'
                      alt='Pack & Go'
                      width={32}
                      height={32}
                    />
                    <span className='ml-2 text-lg font-medium text-gray-900'>
                      Pack & Go
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
                        className={`flex items-center rounded-xl px-4 py-3 transition-colors ${
                          activeItem === item.href
                            ? 'bg-blue-50 text-[#3182F6]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
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
                  <Link
                    href='log-in'
                    className='flex w-full items-center justify-center rounded-xl bg-[#3182F6] px-4 py-3 font-medium text-white transition-colors hover:bg-[#2b74e0] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-2'
                  >
                    로그인
                  </Link>
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
