'use client';

import dynamic from 'next/dynamic';

// 로그인 후 페이지는 클라이언트에서만 필요하므로 동적 import
const AfterLoginHomeView = dynamic(() => import('../after-login'), {
  ssr: false,
});

/**
 * 로그인 후 페이지 래퍼
 * 클라이언트 컴포넌트에서 dynamic import를 사용하여 코드 스플리팅
 */
export default function AfterLoginWrapper() {
  return <AfterLoginHomeView />;
}
