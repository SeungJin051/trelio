'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Typography } from '@ui/components/typography';

interface NavItem {
  name: string;
  href: string;
}

const navigation: NavItem[] = [
  { name: '여행지', href: '/travel' },
  { name: '여행글', href: '/travel-article' },
  { name: '항공권', href: '/airline' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='fixed left-0 right-0 top-0 z-50 bg-white'>
      <nav
        className='mx-auto flex max-w-7xl items-center justify-between p-6'
        aria-label='Global'
      >
        <div className='flex md:flex-1'>
          <Link href='/' className='-m-1.5 p-1.5'>
            <Typography variant='caption' weight='light' className='sr-only'>
              Your Company
            </Typography>
            <Image
              className='h-8 w-auto'
              src='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600'
              alt='Company logo'
              width={32}
              height={32}
            />
          </Link>
        </div>
        <div className='flex md:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
            onClick={() => setMobileMenuOpen(true)}
          >
            <Typography variant='caption' weight='light' className='sr-only'>
              Open main menu
            </Typography>
            <svg
              className='size-6'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
              />
            </svg>
          </button>
        </div>
        <div className='hidden md:flex md:gap-x-12'>
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className='text-gray-900'>
              <Typography variant='subtitle1' weight='light'>
                {item.name}
              </Typography>
            </Link>
          ))}
        </div>
        <div className='hidden md:flex md:flex-1 md:justify-end'>
          <Link href='/login' className='text-gray-900'>
            <Typography variant='subtitle1' weight='medium'>
              로그인 <span aria-hidden='true'>&rarr;</span>
            </Typography>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='md:hidden' role='dialog' aria-modal='true'>
          <div className='fixed inset-0 z-10'></div>
          <div className='fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
            <div className='flex items-center justify-between'>
              <Link href='/' className='-m-1.5 p-1.5'>
                <Typography
                  variant='caption'
                  weight='light'
                  className='sr-only'
                >
                  Your Company
                </Typography>
                <Image
                  className='h-8 w-auto'
                  src='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600'
                  alt='Company logo'
                  width={32}
                  height={32}
                />
              </Link>
              <button
                type='button'
                className='-m-2.5 rounded-md p-2.5 text-gray-700'
                onClick={() => setMobileMenuOpen(false)}
              >
                <Typography
                  variant='caption'
                  weight='light'
                  className='sr-only'
                >
                  Close menu
                </Typography>
                <svg
                  className='size-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6 18 18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <div className='mt-6 flow-root'>
              <div className='-my-6 divide-y divide-gray-500/10'>
                <div className='space-y-2 py-6'>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className='-mx-3 block rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-50'
                    >
                      <Typography variant='body1' weight='semiBold'>
                        {item.name}
                      </Typography>
                    </Link>
                  ))}
                </div>
                <div className='py-6'>
                  <Link
                    href='/login'
                    className='-mx-3 block rounded-lg px-3 py-2.5 text-gray-900 hover:bg-gray-50'
                  >
                    <Typography variant='body1' weight='semiBold'>
                      로그인
                    </Typography>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

Header.displayName = 'Header';
