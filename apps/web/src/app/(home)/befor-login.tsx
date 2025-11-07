'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  HiHeart,
  HiShieldCheck,
  HiSparkles,
  HiUserGroup,
  HiUsers,
} from 'react-icons/hi2';
import { MdOutlineMonetizationOn } from 'react-icons/md';

import { Button, Icon, Typography } from '@ui/components';

const HeroTypingTitle: React.FC = () => {
  const words = ['더 쉽게', '편하게', '간단하게', '빠르게'];
  const [index, setIndex] = React.useState(0);
  const [display, setDisplay] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const current = words[index % words.length];
    const typingSpeed = isDeleting ? 50 : 90;
    const pauseTime = 3500;

    const tick = () => {
      if (!isDeleting) {
        const next = current.slice(0, display.length + 1);
        setDisplay(next);
        if (next === current) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        const next = current.slice(0, Math.max(0, display.length - 1));
        setDisplay(next);
        if (next === '') {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const timer = setTimeout(tick, typingSpeed);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, isDeleting, index]);

  return (
    <Typography variant='title2'>
      여행을{' '}
      <span className='relative inline-block'>
        <span className=''>{display || ' '}</span>
        <span className='ml-1 inline-block h-8 w-[2px] animate-pulse bg-blue-600 align-middle sm:h-9 md:h-10 lg:h-12' />
      </span>
      ,
      <br />
      <span className='text-blue-600'>함께 계획하세요</span>
    </Typography>
  );
};

const BeforeLoginHomeView = () => {
  const features = [
    {
      name: '혼자 여행',
      icon: HiSparkles,
      description: '나만의 속도로 자유롭게 여행 계획을 세우고 관리하세요.',
    },
    {
      name: '친구와 여행',
      icon: HiUsers,
      description: '친구들과 실시간으로 여행 계획을 세우고 수정할 수 있습니다.',
    },
    {
      name: '가족 여행',
      icon: HiUserGroup,
      description:
        '온 가족이 함께 즐길 수 있는 안전하고 편안한 여행을 계획하세요.',
    },
    {
      name: '연인과 여행',
      icon: HiHeart,
      description:
        '특별한 사람과 함께하는 로맨틱한 여행을 완벽하게 준비하세요.',
    },
  ];
  return (
    <div>
      {/* Hero Section */}
      <section className='container mx-auto px-6 py-8 sm:px-8 sm:py-12 md:px-12 md:py-16 lg:px-16 lg:py-24'>
        <div className='grid grid-cols-1 items-center gap-8 pt-16 text-center sm:gap-10 md:gap-12 md:pt-20 lg:grid-cols-2 lg:pt-24 lg:text-left'>
          {/* 왼쪽 텍스트 영역 */}
          <div className='flex flex-col justify-center space-y-4 px-2 sm:space-y-6 sm:px-4 lg:px-0'>
            <HeroTypingTitle />
            <Typography
              variant='subtitle1'
              className='mx-auto max-w-lg text-sm leading-relaxed text-gray-800 sm:text-base md:text-lg lg:mx-0'
            >
              친구들과 함께 여행 계획을 세우고, 실시간으로 소통하며, 완벽한
              여행을 만들어보세요.
            </Typography>
            <div className='flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center sm:gap-4 lg:justify-start'>
              <Link href='/log-in'>
                <Button
                  variant='filled'
                  size='large'
                  className='w-full sm:w-auto'
                >
                  <Typography className='text-sm leading-relaxed text-white sm:text-base'>
                    Trelio 무료로 사용하기
                  </Typography>
                </Button>
              </Link>
            </div>
          </div>

          {/* 오른쪽 이미지 영역 */}
          <div className='flex items-center justify-center px-4 sm:px-6 lg:px-0'>
            <div className='relative h-[430px] w-[430px] transition-transform duration-300 ease-out hover:scale-105'>
              <Image
                width={430}
                height={430}
                src='/travel_landing.png'
                alt='여행 랜딩 일러스트'
                className='h-full w-full object-contain'
                sizes='(max-width: 768px) 100vw, 430px'
                priority
                fetchPriority='high'
              />
            </div>
          </div>
        </div>
      </section>

      {/* 카피 강조 섹션 */}
      <section className='py-12 sm:py-16'>
        <div className='mx-auto max-w-7xl px-6 text-center lg:px-8'>
          <Typography
            variant='subtitle1'
            weight='semiBold'
            className='text-blue-500'
          >
            더 빠른 여행 계획
          </Typography>
          <Typography
            variant='h2'
            weight='semiBold'
            className='mt-2 text-3xl text-black sm:text-4xl'
          >
            더 나은 여행 경험
          </Typography>
          <Typography variant='body1' className='mt-4 text-gray-700'>
            친구들과 함께 여행을 계획하고, 실시간으로 소통하며, 완벽한 여행을
            만들어보세요.
          </Typography>

          <div className='mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3'>
            <div className='rounded-xl px-4 py-6 shadow-sm ring-1 ring-black/5'>
              <div className='flex items-center justify-center'>
                <Icon as={HiUsers} size={24} className='text-blue-500' />
              </div>
              <Typography
                variant='subtitle2'
                weight='semiBold'
                className='mt-3 text-black'
              >
                실시간 협업 계획
              </Typography>
              <Typography variant='body2' className='mt-2 text-gray-600'>
                친구들과 실시간으로 여행 계획을 세우고 수정할 수 있습니다.
              </Typography>
            </div>
            <div className='rounded-xl px-4 py-6 shadow-sm ring-1 ring-black/5'>
              <div className='flex items-center justify-center'>
                <Icon as={HiShieldCheck} size={24} className='text-blue-500' />
              </div>
              <Typography
                variant='subtitle2'
                weight='semiBold'
                className='mt-3 text-black'
              >
                안전한 데이터 보호
              </Typography>
              <Typography variant='body2' className='mt-2 text-gray-600'>
                여행 계획과 개인정보를 안전하게 보호합니다.
              </Typography>
            </div>
            <div className='rounded-xl px-4 py-6 shadow-sm ring-1 ring-black/5'>
              <div className='flex items-center justify-center'>
                <Icon
                  as={MdOutlineMonetizationOn}
                  size={24}
                  className='text-blue-500'
                />
              </div>
              <Typography
                variant='subtitle2'
                weight='semiBold'
                className='mt-3 text-black'
              >
                환율 적용
              </Typography>
              <Typography variant='body2' className='mt-2 text-gray-600'>
                실시간 환율로 예산을 자동 계산하여 여행 경비를 쉽게 관리하세요.
              </Typography>
            </div>
          </div>
        </div>
      </section>

      {/* 고민이신가요? 섹션 */}
      <section className='py-12 sm:py-16'>
        <div className='py-24 sm:py-32'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='mx-auto max-w-2xl lg:text-center'>
              <Typography
                variant='subtitle1'
                weight='semiBold'
                className='text-blue-500'
              >
                고민이신가요?
              </Typography>
              <Typography
                variant='h2'
                weight='semiBold'
                className='mt-2 text-3xl text-black sm:text-4xl'
              >
                어떤 여행이든 완벽하게
              </Typography>
            </div>
            <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl'>
              <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16'>
                {features.map((feature) => (
                  <div key={feature.name} className='relative pl-16'>
                    <div className='absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-blue-50'>
                      <Icon
                        as={feature.icon}
                        aria-hidden='true'
                        className='size-6 text-blue-500'
                      />
                    </div>
                    <Typography
                      variant='body1'
                      weight='semiBold'
                      className='text-black'
                    >
                      {feature.name}
                    </Typography>
                    <Typography variant='body2' className='mt-2 text-gray-600'>
                      {feature.description}
                    </Typography>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 시작하기 섹션 (CTA) */}
      <section className='py-20 lg:py-28'>
        <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='relative overflow-hidden p-8 text-center sm:p-12 lg:p-16'>
            <div className='relative z-10'>
              <Typography
                variant='h2'
                weight='semiBold'
                className='text-black md:text-4xl lg:text-5xl'
              >
                지금 바로 여행을 시작해보세요
              </Typography>
              <Typography
                variant='body1'
                className='mx-auto mt-5 max-w-xl text-lg text-gray-600'
              >
                로그인하고 팀원을 초대해 실시간으로 계획을 세워보세요.
              </Typography>
              <div className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'>
                <Link href='/log-in'>
                  <Button variant='filled' size='large'>
                    <Typography className='leading-relaxed text-white sm:text-base'>
                      로그인하기
                    </Typography>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BeforeLoginHomeView;
