import { createBrowserClient } from '@supabase/ssr';

/**
 * 브라우저 환경에서 사용할 Supabase 클라이언트 생성
 * 클라이언트 컴포넌트에서 사용
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Supabase 환경 변수 검증
 * 개발 시 환경 변수가 올바르게 설정되었는지 확인
 */
export function validateSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
  }

  if (!url.includes('supabase.co')) {
    console.warn('Supabase URL 형식이 올바르지 않을 수 있습니다.');
  }

  return { url, anonKey };
}
