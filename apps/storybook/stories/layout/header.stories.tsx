import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { TrelioLogo } from '@web/components/common';
import { CiLogin } from 'react-icons/ci';

import { Icon } from '@ui/components';
import { Typography } from '@ui/components/typography';

// 정적 Mock 헤더 컴포넌트
const MockHeader = ({
  sidebarOpen = false,
  shouldShowSidebar = false,
}: {
  sidebarOpen?: boolean;
  shouldShowSidebar?: boolean;
}) => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-30 border-b border-gray-200 bg-white transition-all duration-300 ${
        scrolled ? 'shadow-sm backdrop-blur-sm' : ''
      } ${
        shouldShowSidebar
          ? sidebarOpen
            ? 'left-80 right-0'
            : 'left-16 right-0'
          : 'left-0 right-0'
      }`}
    >
      <nav
        className='mx-auto flex items-center justify-between px-6 py-4'
        aria-label='Global'
      >
        <div className='flex md:flex-1'>
          <div className='flex items-center'>
            <span className='sr-only'>Trelio</span>
            <div className='flex items-center justify-center md:justify-start'>
              <TrelioLogo
                width={40}
                height={40}
                color='#3182F6'
                accentColor='#60A5FA'
                className='text-[#3182F6]'
              />
              <Typography
                variant='h4'
                weight='semiBold'
                className='ml-2 text-gray-900'
              >
                Trelio
              </Typography>
            </div>
          </div>
        </div>

        {/* 데스크톱 네비게이션 */}
        <div className='hidden md:flex md:gap-x-8'>
          {[
            { name: '여행 목록', href: '/travel-list' },
            { name: '요금제', href: '/price' },
            { name: 'FAQ', href: '/faq' },
            { name: '문의하기', href: '/contact' },
          ].map((item) => (
            <div
              key={item.name}
              className='relative cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-gray-100'
            >
              <Typography
                variant='body2'
                weight='medium'
                className='text-gray-700 transition-colors hover:text-gray-900'
              >
                {item.name}
              </Typography>
            </div>
          ))}
        </div>

        {/* 로그인 버튼 */}
        <div className='hidden md:flex md:flex-1 md:justify-end'>
          <button className='cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100'>
            <Icon as={CiLogin} color='#374151' size={24} />
          </button>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <div className='flex md:hidden'>
          <button
            type='button'
            className='inline-flex items-center justify-center rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100'
          >
            <svg
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

const meta: Meta<typeof MockHeader> = {
  title: 'Layout/Header',
  component: MockHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Trelio 애플리케이션의 메인 헤더 컴포넌트입니다. (Mock 버전)',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    sidebarOpen: {
      control: 'boolean',
      description: '사이드바 열림 상태',
    },
    shouldShowSidebar: {
      control: 'boolean',
      description: '사이드바 표시 여부',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MockHeader>;

// 기본 헤더 (로그인하지 않은 상태)
export const Default: Story = {
  render: (args) => (
    <div className='h-screen'>
      <MockHeader {...args} />
      <div className='flex h-screen items-center justify-center bg-gray-100 pt-24'>
        <div className='max-w-2xl px-4 text-center'>
          <h1 className='mb-6 text-3xl font-bold'>메인 페이지 콘텐츠</h1>
          <p className='text-xl text-gray-600'>
            이것은 헤더 아래에 표시되는 콘텐츠입니다. 헤더는 상단에 고정되어
            있습니다.
          </p>
        </div>
      </div>
    </div>
  ),
  args: {
    sidebarOpen: false,
    shouldShowSidebar: false,
  },
};
