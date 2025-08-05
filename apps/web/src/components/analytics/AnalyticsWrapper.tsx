'use client';

import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

export default function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  useGoogleAnalytics();
  return <>{children}</>;
}
