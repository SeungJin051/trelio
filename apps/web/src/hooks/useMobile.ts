'use client';

import { useEffect, useState } from 'react';

/**
 * 모바일/데스크탑 상태를 감지하는 커스텀 훅
 * @param breakpoint - 모바일과 데스크탑을 구분하는 브레이크포인트 (기본값: 768px)
 * @returns isMobile - 현재 화면이 모바일인지 여부
 */
export const useMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 초기 상태 설정
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // 첫 렌더링 시 체크
    checkIsMobile();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', checkIsMobile);

    // 클린업
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
};
