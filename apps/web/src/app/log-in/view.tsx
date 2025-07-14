'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { BiSolidMessageRounded } from 'react-icons/bi';
import { BsArrowRight } from 'react-icons/bs';

import { Icon, Spinner, Typography } from '@ui/components';

import { useToast } from '@/hooks/useToast';
import { createClient } from '@/lib/supabase/client/supabase';
import { getURL } from '@/lib/utils';

const LoginView = () => {
  const supabase = createClient();
  const router = useRouter();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({
    kakao: false,
    google: false,
  });

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    // 이미 로그인된 사용자가 있는지 확인
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 세션이 존재하는 경우
      if (session) {
        try {
          // 사용자 프로필이 존재하는지 확인
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('프로필 조회 오류:', error);
            // 오류 발생 시 로그인 페이지에 그대로 있음
            return;
          }

          if (profile) {
            // 프로필이 존재하는 경우 - 메인 페이지로 리다이렉트
            router.push('/');
          } else {
            // 프로필이 없는 경우 - 회원가입 페이지로 리다이렉트
            router.push('/sign-up');
          }
        } catch (error) {
          console.error('자동 로그인 중 프로필 확인 오류:', error);
        }
      }
    };

    checkUser();

    // 인증 상태 변화 감지 (로그인/로그아웃)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            // 사용자 프로필이 존재하는지 확인
            const { data: profile, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error && error.code !== 'PGRST116') {
              // PGRST116: 데이터가 없음 (프로필 미등록)
              toast.error('프로필 정보를 확인하는 중 오류가 발생했습니다.');
              return;
            }

            if (profile) {
              // 프로필이 존재하는 경우 - 메인 페이지로 리다이렉트
              router.push('/');
            } else {
              // 프로필이 없는 경우 - 회원가입 페이지로 리다이렉트
              toast.success('환영합니다! 프로필을 설정해주세요.');
              router.push('/sign-up');
            }
          } catch (error) {
            console.error('onAuthStateChange 프로필 확인 중 오류:', error);
            toast.error('프로필 확인 중 문제가 발생했습니다.');
            // 오류 발생 시 안전하게 메인 페이지로 이동
            router.push('/');
          }
        } else if (event === 'SIGNED_OUT') {
          toast.success('로그아웃되었습니다.');
        }
      }
    );

    // subscription.unsubscribe()를 호출하여 onAuthStateChange에서 등록한 인증 상태 변화 감지 콜백을 제거함
    return () => subscription.unsubscribe();
  }, [supabase, router, toast]);

  /**
   * 카카오 소셜 로그인 처리 함수
   * Supabase Auth의 OAuth 기능을 사용하여 카카오 로그인 구현
   */
  const handleKakaoLogin = async () => {
    try {
      // 카카오 로그인 버튼 로딩 상태 활성화
      setIsLoading((prev) => ({ ...prev, kakao: true }));

      // Supabase Auth를 통한 카카오 OAuth 로그인 시작
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${getURL()}auth/callback`,
          scopes: 'profile_nickname profile_image account_email',
          queryParams: {
            prompt: 'login',
          },
        },
      });

      if (error) {
        console.error('카카오 로그인 에러:', error);

        // 에러 타입별 사용자 친화적 메시지 표시
        switch (error.message) {
          case 'Email not confirmed':
            toast.error('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
            break;
          case 'Invalid login credentials':
            toast.error('로그인 정보가 올바르지 않습니다.');
            break;
          case 'Too many requests':
            toast.error(
              '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
            );
            break;
          default:
            toast.error(
              '카카오 로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
            );
        }
        return;
      }

      // 성공적으로 OAuth URL로 리다이렉트되는 경우
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      // 예상치 못한 에러 처리
      console.error('카카오 로그인 예외:', error);
      toast.error('로그인 처리 중 문제가 발생했습니다.');
    } finally {
      // 로딩 상태 비활성화
      setIsLoading((prev) => ({ ...prev, kakao: false }));
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center'>
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
            여행 준비의 모든 솔루션, Trelio
          </Typography>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className='space-y-3'>
          {/* 카카오 로그인 버튼 */}
          <button
            onClick={handleKakaoLogin}
            disabled={isLoading.kakao || isLoading.google}
            className='flex w-full items-center justify-center rounded-xl bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#191919] transition-colors hover:bg-[#F4DC00] focus:outline-none focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70'
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

          {/* 구글 로그인 버튼 */}
          <button
            onClick={() => {}}
            disabled={isLoading.google || isLoading.kakao}
            className='flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70'
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
            계속 진행하시면 Trelio의{' '}
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
            <Icon as={BsArrowRight} className='ml-1 h-4 w-4' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
