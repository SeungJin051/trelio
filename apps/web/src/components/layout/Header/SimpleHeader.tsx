'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Typography } from '@ui/components/typography';

import { TrelioLogo } from '@/components/common';

export const SimpleHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-sm backdrop-blur-sm' : 'bg-white'
      }`}
    >
      <nav
        className='mx-auto flex h-20 items-center justify-between px-6'
        aria-label='Global'
      >
        <div className='flex md:flex-1'>
          <Link href='/' className='flex items-center'>
            <span className='sr-only'>Trelio</span>
            <TrelioLogo width={40} height={40} className='text-[#3182F6]' />
            <div className='ml-2 flex items-center justify-center md:justify-start'>
              <Typography
                variant='h4'
                weight='semiBold'
                className='text-gray-900'
              >
                Trelio
              </Typography>
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
};

SimpleHeader.displayName = 'SimpleHeader';
