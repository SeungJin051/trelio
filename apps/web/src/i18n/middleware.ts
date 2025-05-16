import createMiddleware from 'next-intl/middleware';

import { locales } from './config';

export default createMiddleware({
  // 지원하는 언어 목록
  locales,

  // 기본 언어 설정
  defaultLocale: 'ko',

  // 로케일 탐지 전략
  localeDetection: true,

  // 로케일 접두사 경로
  localePrefix: 'always',
});

export const config = {
  // Next-intl 미들웨어가 적용될 경로 패턴 정의
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
