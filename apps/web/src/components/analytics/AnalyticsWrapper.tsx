'use client';

import { Suspense } from 'react';

import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

function AnalyticsContent({ children }: AnalyticsWrapperProps) {
  useGoogleAnalytics();
  return <>{children}</>;
}

export default function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  return (
    // 구글 애널리틱스 로드 시간 최적화를 위해 Suspense 사용
    <Suspense fallback={<>{children}</>}>
      <AnalyticsContent>{children}</AnalyticsContent>
    </Suspense>
  );
}
