'use client';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { useSession } from '@/hooks/useSession';

import BeforeLoginHomeView from './befor-login';

// 로그인 후 페이지는 필요할 때만 동적으로 로드하여 초기 번들 크기 감소
const AfterLoginHomeView = dynamic(() => import('./after-login'), {
  ssr: false,
});

// framer-motion을 동적 import로 로드하여 초기 번들 크기 감소
const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => mod.AnimatePresence),
  { ssr: false }
);
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false }
);

const HomeView = () => {
  const { session, loading } = useSession();
  const [showAnimation, setShowAnimation] = useState(false);

  // 로그인 전 페이지를 먼저 렌더링하고, 세션 체크 완료 후 애니메이션 활성화
  useEffect(() => {
    if (!loading) {
      // 세션 체크가 완료된 후 약간의 지연을 두고 애니메이션 활성화
      const timer = setTimeout(() => {
        setShowAnimation(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // 로딩 중이면 로그인 전 페이지를 먼저 표시 (더 나은 UX)
  if (loading) {
    return <BeforeLoginHomeView />;
  }

  // 세션이 있으면 로그인 후 페이지 표시
  if (session) {
    // 애니메이션이 활성화되지 않았으면 즉시 표시
    if (!showAnimation) {
      return <AfterLoginHomeView />;
    }

    // 애니메이션 활성화 후에는 애니메이션과 함께 표시
    return (
      <AnimatePresence mode='wait'>
        <MotionDiv
          key='after-login'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <AfterLoginHomeView />
        </MotionDiv>
      </AnimatePresence>
    );
  }

  // 로그인 전 페이지 (기본 렌더링)
  return <BeforeLoginHomeView />;
};

export default HomeView;
