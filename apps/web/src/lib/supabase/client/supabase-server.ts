import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';

/**
 * 서버 환경에서 사용할 Supabase 클라이언트 생성
 * 서버 컴포넌트, API 라우트, 미들웨어에서 사용
 */
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 런타임에서 환경 변수 검증
  if (!url || !anonKey) {
    console.warn(
      'Supabase 환경 변수가 설정되지 않았습니다. 더미 클라이언트를 사용합니다.'
    );

    // 빌드 시에만 사용되는 더미 클라이언트
    // createServerClient에서 오류가 발생하지 않도록 최소한의 구현
    return createServerClient('https://dummy.supabase.co', 'dummy-anon-key', {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // 빌드 시에는 쿠키 설정하지 않음
        },
      },
      // 추가 옵션으로 API 호출을 방지
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 서버 컴포넌트에서 쿠키 설정 시 에러가 발생할 수 있음
          // 이는 정상적인 동작이므로 무시
        }
      },
    },
  });
}
