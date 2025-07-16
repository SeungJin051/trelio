'use client';

import { PropsWithChildren, useState } from 'react';

import { usePathname } from 'next/navigation';

import { useSession } from '@/hooks/useSession';

import { Footer } from './Footer';
import { Header, SimpleHeader } from './Header';
import { Sidebar } from './Sidebar';

/**
 * 클라이언트 측 로직이 필요한 레이아웃 래퍼 컴포넌트
 * 현재 경로에 따라 헤더와 푸터를 조건부로 표시합니다.
 */
const LayoutWrapper = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isSignUpCompleted } = useSession();

  // URL 경로에서 현재 경로가 Auth 그룹인지 확인
  const isAuthPage =
    pathname.includes('log-in') || pathname.includes('sign-up');

  // 사이드바를 표시할지 결정 (로그인 완료된 사용자만)
  const shouldShowSidebar = isAuthenticated && isSignUpCompleted && !isAuthPage;

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* 로그인 페이지가 아닐 경우 심플헤더 컴포넌트 표시 */}
      {isAuthPage ? (
        <SimpleHeader />
      ) : (
        <Header
          sidebarOpen={sidebarOpen}
          shouldShowSidebar={shouldShowSidebar}
        />
      )}

      {/* 사이드바 (로그인 완료된 사용자만) */}
      {shouldShowSidebar && (
        <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      )}

      {/* 메인 콘텐츠 영역 */}
      <div
        className={`mx-auto mt-[64px] min-h-dvh transition-all duration-300 ${
          shouldShowSidebar ? (sidebarOpen ? 'sm:pl-80' : 'sm:pl-16') : ''
        }`}
      >
        {children}
      </div>
    </>
  );
};

export default LayoutWrapper;
