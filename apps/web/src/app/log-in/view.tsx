'use client';

import { useState } from 'react';

import Link from 'next/link';

import { BiSolidMessageRounded } from 'react-icons/bi';
import { BsArrowRight } from 'react-icons/bs';

import { Spinner, Typography } from '@ui/components';

const LoginView = () => {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({
    kakao: false,
    google: false,
  });

  const handleSocialLogin = (provider: string) => {
    setIsLoading({ ...isLoading, [provider]: true });

    // 실제 로그인 로직은 여기에 구현
    // 예시를 위한 타이머
    setTimeout(() => {
      setIsLoading({ ...isLoading, [provider]: false });
    }, 1500);
  };

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <div className='h-[800px] w-[372px] bg-white p-8'>
        {/* 로고 및 헤더 */}
        <div className='mb-8'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#3182F6]'>
            <span className='text-xl font-bold text-white'>P&G</span>
          </div>
          <Typography
            variant='h3'
            className='mb-2 text-left text-2xl font-bold text-gray-900'
          >
            어서오세요! 10초 만에 가입하고
          </Typography>
          <Typography variant='h3' className='mb-2 text-gray-900'>
            모든 것을 경험하세요.
          </Typography>
          <Typography variant='body2' className='text-gray-500'>
            여행 준비의 모든 솔루션, Pack & Go
          </Typography>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className='space-y-3'>
          <button
            onClick={() => handleSocialLogin('kakao')}
            disabled={isLoading.kakao}
            className='flex w-full items-center justify-center rounded-xl bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#191919] transition-colors hover:bg-[#F4DC00] focus:outline-none focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2 disabled:opacity-70'
          >
            {isLoading.kakao ? (
              <Spinner size='small' />
            ) : (
              <>
                <BiSolidMessageRounded className='mr-2' />
                <Typography variant='body2'>
                  카카오 계정으로 계속하기
                </Typography>
              </>
            )}
          </button>

          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading.google}
            className='flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 disabled:opacity-70'
          >
            {isLoading.google ? (
              <Spinner size='small' />
            ) : (
              <>
                <svg
                  viewBox='0 0 16 16'
                  width='16'
                  height='16'
                  fill='none'
                  className='css-1h47l4s'
                >
                  <g id='Group'>
                    <path
                      id='Vector'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M15.4057 8.17566C15.4057 7.6288 15.3569 7.10251 15.2651 6.59766H8V9.58137H12.152C11.9729 10.5457 11.4294 11.3634 10.6126 11.9102V13.8457H13.1051C14.564 12.5025 15.4057 10.5251 15.4057 8.17566Z'
                      fill='#3D82F0'
                    ></path>
                    <path
                      id='Vector_2'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M8.0002 15.7146C10.0831 15.7146 11.8291 15.0238 13.1053 13.8461L10.6128 11.9098C9.92192 12.3726 9.0382 12.6461 8.0002 12.6461C5.99106 12.6461 4.29049 11.2892 3.68363 9.46606H1.1062V11.4649C2.37563 13.9858 4.98477 15.7146 8.0002 15.7146Z'
                      fill='#31A752'
                    ></path>
                    <path
                      id='Vector_3'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M3.68348 9.46593C3.5292 9.00307 3.44177 8.5085 3.44177 8.00022C3.44177 7.49193 3.5292 6.99736 3.68348 6.5345V4.53564H1.10605C0.584052 5.57707 0.285767 6.75564 0.285767 8.00022C0.285767 9.24479 0.584052 10.4234 1.10605 11.4648L3.68348 9.46593Z'
                      fill='#F9BA00'
                    ></path>
                    <path
                      id='Vector_4'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M8.0002 3.35422C9.13249 3.35422 10.1499 3.74336 10.9488 4.50793L13.1619 2.29564C11.8256 1.05022 10.0796 0.285645 8.0002 0.285645C4.98477 0.285645 2.37563 2.0145 1.1062 4.53622L3.68363 6.53422C4.29049 4.71107 5.99106 3.35422 8.0002 3.35422Z'
                      fill='#E64234'
                    ></path>
                  </g>
                </svg>
                <Typography variant='body2' className='ml-2'>
                  구글 계정으로 계속하기
                </Typography>
              </>
            )}
          </button>
        </div>

        {/* 추가 링크 */}
        <div className='mt-8 text-center'>
          <p className='text-xs text-gray-500'>
            계속 진행하시면 Pack & Go의{' '}
            <Link href='/terms' className='text-[#3182F6] hover:underline'>
              이용약관
            </Link>
            에 동의하시게 됩니다.{' '}
          </p>
        </div>

        {/* 홈으로 돌아가기 */}
        <div className='mt-8 text-center'>
          <Link
            href='/'
            className='inline-flex items-center text-sm font-medium text-[#3182F6] hover:text-[#1b64da]'
          >
            홈으로 돌아가기
            <BsArrowRight className='ml-1 h-4 w-4' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
