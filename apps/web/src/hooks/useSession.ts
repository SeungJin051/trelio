'use client';

import { useEffect, useState } from 'react';

import { Session } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client/supabase';

type UserProfile = {
  id: string;
  email: string | undefined;
};

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(data.session);

        // 세션 변경 이벤트 구독
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession);
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

  // 사용자 프로필 정보 반환 또는 false
  const getUserProfile = (): UserProfile | false => {
    if (!session || !session.user) {
      return false;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      // 필요한 경우 추가 프로필 정보를 여기에 포함
    };
  };

  return {
    session,
    loading,
    error,
    isAuthenticated: !!session,
    userProfile: getUserProfile(),
    signOut: () => supabase.auth.signOut(),
  };
};
