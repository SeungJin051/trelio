'use client';

import { PropsWithChildren } from 'react';

import { usePathname } from 'next/navigation';

import { Footer, Header, SimpleHeader } from '@/components';

/**
 * 클라이언트 측 로직이 필요한 레이아웃 래퍼 컴포넌트
 * 현재 경로에 따라 헤더와 푸터를 조건부로 표시합니다.
 */
const LayoutWrapper = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  // URL 경로에서 현재 경로가 로그인 그룹인지 확인
  const isLoginPage = pathname.includes('log-in');

  return (
    <>
      {/* 로그인 페이지가 아닐 경우 헤더 표시 */}
      {!isLoginPage && <Header />}
      {/* 로그인 페이지나 404 페이지일 경우 심플헤더 표시 */}
      {isLoginPage || pathname.includes('not-found') ? <SimpleHeader /> : null}
      {/* 화면 너비 제한 */}
      <div className='mx-auto min-h-[80vh] max-w-screen-xl'>{children}</div>
      {/* 로그인 페이지가 아닐 경우 푸터 표시 */}
      {!isLoginPage && <Footer />}
    </>
  );
};

export default LayoutWrapper;
