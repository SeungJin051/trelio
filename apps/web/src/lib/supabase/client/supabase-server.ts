import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';

/**
 * 서버 환경에서 사용할 Supabase 클라이언트 생성
 * 서버 컴포넌트, API 라우트, 미들웨어에서 사용
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );
}
