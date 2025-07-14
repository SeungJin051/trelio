'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

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
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [signUpStatus, setSignUpStatus] = useState<SignUpStatus>('loading');

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // 리다이렉트 예외 페이지들 (회원가입 미완료여도 접근 가능한 페이지)
  const excludedPaths = useMemo(
    () => ['/sign-up', '/log-in', '/auth/callback'],
    []
  );

  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = useCallback(
    async (user: User) => {
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('nickname, profile_image_url')
          .eq('id', user.id)
          .single();

        if (error) {
          // 프로필이 없는 경우 (새 사용자)
          const basicUserData = {
            id: user.id,
            email: user.email,
          };
          setUserProfile(basicUserData);
          setSignUpStatus('incomplete');
          // console.log('회원가입 미완료 사용자 감지:', basicUserData);
        } else {
          // 프로필이 있는 경우 (기존 사용자)
          const userData = {
            id: user.id,
            email: user.email,
            nickname: profile.nickname,
            profile_image_url: profile.profile_image_url,
          };
          setUserProfile(userData);
          setSignUpStatus('completed');
          // console.log('회원가입 완료된 사용자:', userData);
        }
      } catch {
        // console.error('프로필 fetch 중 오류');
        setSignUpStatus('incomplete'); // 오류 발생 시 미완료로 처리
      }
    },
    [supabase]
  );

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

        // Auth state 변경 리스너 설정
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          async (_event: AuthChangeEvent, newSession: Session | null) => {
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
          subscription.unsubscribe();
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
  }, [supabase, fetchUserProfile]);

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
  }, [
    session,
    signUpStatus,
    loading,
    pathname,
    router,
    excludedPaths,
    fetchUserProfile,
  ]);

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
