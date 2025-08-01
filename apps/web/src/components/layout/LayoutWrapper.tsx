'use client';

import { PropsWithChildren, useState } from 'react';

import { usePathname } from 'next/navigation';

import { useMobile, useSession } from '@/hooks';

import { Footer } from './Footer';
import { Header, SimpleHeader } from './Header';
import { Sidebar } from './Sidebar';

/**
 * 클라이언트 측 로직이 필요한 레이아웃 래퍼 컴포넌트
 * 현재 경로에 따라 헤더와 푸터를 조건부로 표시합니다.
 */
const LayoutWrapper = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const isMobile = useMobile();
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
    <div className='min-h-screen bg-[#FAFAFA]'>
      {/* 헤더 */}
      {isAuthPage ? (
        <SimpleHeader />
      ) : (
        <Header
          sidebarOpen={sidebarOpen}
          shouldShowSidebar={shouldShowSidebar}
          onSidebarToggle={handleSidebarToggle}
        />
      )}

      {/* 사이드바 (로그인 완료된 사용자만) */}
      {shouldShowSidebar && (
        <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      )}

      {/* 메인 콘텐츠 영역 */}
      <main
        className={`transition-all duration-300 ease-in-out ${
          // 헤더 높이만큼 상단 여백 (모든 페이지 공통)
          isAuthPage ? 'pt-20' : 'pt-20'
        } ${
          // 사이드바가 있는 경우 좌측 여백 적용
          shouldShowSidebar && !isMobile
            ? sidebarOpen
              ? 'md:pl-80'
              : 'md:pl-16'
            : 'pl-0'
        } ${
          // 최소 높이 설정 (헤더 높이 제외한 전체 화면)
          'min-h-[calc(100vh-5rem)]'
        } `}
      >
        <div className='h-full w-full'>{children}</div>
      </main>

      {/* 푸터 */}
      {!isAuthenticated && <Footer />}
    </div>
  );
};

export default LayoutWrapper;
