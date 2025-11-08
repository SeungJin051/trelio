'use client';

import dynamic from 'next/dynamic';

import { useSession } from '@/hooks/useSession';

import BeforeLoginHomeView from '../befor-login';

// 로그인 후 페이지는 클라이언트에서만 필요하므로 동적 import
const AfterLoginHomeView = dynamic(() => import('../after-login'), {
  ssr: false,
});

/**
 * 홈 페이지 클라이언트 컴포넌트
 * 세션 체크를 클라이언트에서 수행하여 서버 컴포넌트가 SSG로 빌드되도록 함
 */
export default function HomeClient() {
  const { session, loading } = useSession();

  // 로딩 중이면 로그인 전 페이지 표시 (SSG HTML 사용)
  if (loading) {
    return <BeforeLoginHomeView />;
  }

  // 세션이 있으면 로그인 후 페이지 표시
  if (session) {
    return <AfterLoginHomeView />;
  }

  // 세션이 없으면 로그인 전 페이지 표시 (SSG HTML)
  return <BeforeLoginHomeView />;
}
