'use client';

import { useEffect, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { Session } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client/supabase';

type UserProfile = {
  id: string;
  email: string | undefined;
  nickname?: string;
  profile_image_url?: string;
};

// 회원가입 완료 상태 타입
type SignUpStatus = 'completed' | 'incomplete' | 'loading';

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [signUpStatus, setSignUpStatus] = useState<SignUpStatus>('loading');

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // 리다이렉트 예외 페이지들 (회원가입 미완료여도 접근 가능한 페이지)
  const excludedPaths = ['/sign-up', '/log-in', '/auth/callback'];

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(data.session);

        // 세션이 있으면 프로필 정보 가져오기
        if (data.session?.user) {
          await fetchUserProfile(data.session.user);
        } else {
          setSignUpStatus('loading'); // 로그인되지 않은 상태
        }

        // 세션 변경 이벤트 구독
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            setSession(newSession);

            if (newSession?.user) {
              await fetchUserProfile(newSession.user);
            } else {
              setUserProfile(null);
              setSignUpStatus('loading');
            }
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('세션 조회 중 오류가 발생했습니다')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [supabase]);

  // 회원가입 완료 여부에 따른 리다이렉트 처리
  useEffect(() => {
    // 로딩 중이거나 예외 페이지인 경우 리다이렉트하지 않음
    if (loading || excludedPaths.includes(pathname)) {
      return;
    }

    // 세션이 있고 회원가입이 미완료인 경우 sign-up으로 리다이렉트
    if (session && signUpStatus === 'incomplete') {
      router.push('/sign-up');
    }
  }, [session, signUpStatus, loading, pathname, router, excludedPaths]);

  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = async (user: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('nickname, profile_image_url')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // console.error('프로필 조회 오류:', error);
        setSignUpStatus('incomplete'); // 오류 발생 시 미완료로 처리
        return;
      }

      if (profile) {
        // 프로필이 존재하는 경우 - 회원가입 완료
        const userProfileData = {
          id: user.id,
          email: user.email,
          nickname: profile.nickname,
          profile_image_url: profile.profile_image_url,
        };
        setUserProfile(userProfileData);
        setSignUpStatus('completed');
      } else {
        // 프로필이 없는 경우 - 회원가입 미완료
        const basicUserData = {
          id: user.id,
          email: user.email,
        };
        setUserProfile(basicUserData);
        setSignUpStatus('incomplete');
        // console.log('⚠️ 회원가입 미완료 사용자 감지:', basicUserData);
      }
    } catch (err) {
      // console.error('프로필 fetch 중 오류:', err);
      setSignUpStatus('incomplete'); // 오류 발생 시 미완료로 처리
    }
  };

  return {
    session,
    userProfile,
    loading,
    error,
    signUpStatus,
    isAuthenticated: !!session,
    isSignUpCompleted: signUpStatus === 'completed',
    isSignUpIncomplete: signUpStatus === 'incomplete',
    signOut: async () => {
      await supabase.auth.signOut();
      setUserProfile(null);
      setSignUpStatus('loading');
    },
  };
};
