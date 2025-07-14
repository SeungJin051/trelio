import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/client/supabase-server';

/**
 * Supabase Auth 콜백 처리 API 라우트
 * OAuth 로그인 후 리다이렉트되는 엔드포인트
 */
export async function GET(request: NextRequest) {
  try {
    // URL에서 인증 코드와 상태 파라미터 추출
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next');

    if (code) {
      // Supabase 클라이언트 생성 (서버 사이드)
      const supabase = await createServerSupabaseClient();

      // 인증 코드를 세션으로 교환 (세션을 심는다라는 생각)
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('인증 코드 교환 실패:', error);
        // 에러 발생 시 로그인 페이지로 리다이렉트 (에러 파라미터 포함)
        return NextResponse.redirect(
          new URL(
            `/log-in?error=${encodeURIComponent(error.message)}`,
            requestUrl.origin
          )
        );
      }

      // 인증 성공 후 사용자 프로필 확인
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          console.log('🔍 콜백에서 사용자 프로필 확인 중...', user.id);

          // 사용자 프로필이 존재하는지 확인
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('프로필 조회 오류:', profileError);
            // 오류 발생 시 로그인 페이지로 리다이렉트
            return NextResponse.redirect(new URL('/log-in', requestUrl.origin));
          }

          if (profile) {
            // 프로필이 존재하는 경우 - 메인 페이지로 리다이렉트
            return NextResponse.redirect(new URL('/', requestUrl.origin));
          } else {
            // 프로필이 없는 경우 - 회원가입 페이지로 리다이렉트
            return NextResponse.redirect(
              new URL('/sign-up', requestUrl.origin)
            );
          }
        }
      } catch (profileCheckError) {
        console.error('프로필 확인 중 예외 발생:', profileCheckError);
        // 프로필 확인 실패 시 안전하게 회원가입 페이지로 이동
        return NextResponse.redirect(new URL('/sign-up', requestUrl.origin));
      }
    }

    // next 파라미터가 있으면 해당 페이지로, 없으면 홈으로 리다이렉트
    const redirectUrl = next
      ? new URL(next, requestUrl.origin)
      : new URL('/', requestUrl.origin);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('콜백 처리 중 예외 발생:', error);
    // 예외 발생 시 로그인 페이지로 리다이렉트
    return NextResponse.redirect(
      new URL('/log-in?error=callback_error', request.url)
    );
  }
}
