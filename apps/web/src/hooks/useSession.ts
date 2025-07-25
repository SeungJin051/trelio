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
type SignUpStatus = 'completed' | 'incomplete' | 'unauthenticated';

export const useSession = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [signUpStatus, setSignUpStatus] =
    useState<SignUpStatus>('unauthenticated');
  const [initialized, setInitialized] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // 리다이렉트 예외 페이지들 (회원가입 미완료여도 접근 가능한 페이지)
  const excludedPaths = useMemo(
    () => ['/sign-up', '/log-in', '/auth/callback'],
    []
  );

  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = useCallback(async (user: User) => {
    try {
      const supabaseClient = createClient();
      const { data: profile, error } = await supabaseClient
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
      }
    } catch (fetchError) {
      console.error('프로필 조회 오류:', fetchError);
      // 오류 발생 시에도 기본 사용자 데이터 설정
      const basicUserData = {
        id: user.id,
        email: user.email,
      };
      setUserProfile(basicUserData);
      setSignUpStatus('incomplete');
    }
  }, []);

  // 세션 초기화
  useEffect(() => {
    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error('세션 조회 오류:', error);
          setError(error);
          setSession(null);
          setUserProfile(null);
          setSignUpStatus('unauthenticated');
          return;
        }

        // 세션 설정
        setSession(data.session);

        // 세션이 있으면 프로필 정보 가져오기
        if (data.session?.user) {
          await fetchUserProfile(data.session.user);
        } else {
          setUserProfile(null);
          setSignUpStatus('unauthenticated');
        }

        // Auth state 변경 리스너 설정
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, newSession: Session | null) => {
            if (!isMounted) return;

            console.log('Auth 상태 변경:', event);

            // 세션 상태 업데이트
            setSession(newSession);

            if (newSession?.user) {
              await fetchUserProfile(newSession.user);
            } else {
              setUserProfile(null);
              setSignUpStatus('unauthenticated');
            }
          }
        );

        authSubscription = subscription;
        setInitialized(true);
      } catch (err) {
        if (!isMounted) return;
        console.error('인증 초기화 오류:', err);
        setError(err instanceof Error ? err : new Error('인증 초기화 실패'));
        setSession(null);
        setUserProfile(null);
        setSignUpStatus('unauthenticated');
        setInitialized(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 클린업 함수
    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  // 회원가입 완료 여부에 따른 리다이렉트 처리
  useEffect(() => {
    // 초기화되지 않았거나 로딩 중이거나 예외 페이지인 경우 리다이렉트하지 않음
    if (!initialized || loading || excludedPaths.includes(pathname)) {
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
    initialized,
  ]);

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      // 상태는 onAuthStateChange에서 자동으로 업데이트됨
    } catch (err) {
      console.error('로그아웃 중 오류:', err);
    }
  }, []);

  return {
    session,
    userProfile,
    loading,
    error,
    signUpStatus,
    isAuthenticated: !!session,
    isSignUpCompleted: signUpStatus === 'completed',
    isSignUpIncomplete: signUpStatus === 'incomplete',
    signOut,
  };
};
