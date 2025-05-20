'use client';

import React from 'react';

import Link from 'next/link';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { BsArrowRight } from 'react-icons/bs';

import { Icon, Typography } from '@ui/components';

import { NOT_FOUND_LOTTIE_URL } from '@/constants/constants';

const NotFound = () => {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='max-w-[400px] text-center'>
        <h1 className='mb-4 text-6xl font-bold text-gray-700'>404 Error</h1>

        <Typography
          variant='body2'
          weight='light'
          className='mb-1 text-gray-700'
        >
          요청하신 페이지를 찾을 수 없습니다.
        </Typography>

        <Typography
          variant='body2'
          weight='light'
          className='mb-8 text-gray-700'
        >
          입력하신 주소가 정확한지 다시 한번 확인해주세요.
        </Typography>

        <Link
          href='/'
          className='mb-8 inline-flex items-center text-sm font-medium text-[#3182F6] hover:text-[#1b64da]'
        >
          홈으로 돌아가기
          <Icon as={BsArrowRight} className='ml-2 h-4 w-4' />
        </Link>

        <div className='mt-4 flex h-[200px] w-full items-center justify-center'>
          <div className='h-[180px] w-[180px]'>
            <DotLottieReact src={NOT_FOUND_LOTTIE_URL} loop autoplay />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
