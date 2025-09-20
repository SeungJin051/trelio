import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import AnalyticsWrapper from '@/components/analytics/AnalyticsWrapper';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { QueryProvider } from '@/providers/query-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { pretendard } from '@/styles/fonts';

import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Trelio - 여행 계획 애플리케이션',
    template: '%s | Trelio',
  },
  description: '쉽고 편리한 여행 계획 애플리케이션',
  keywords: ['여행', '계획', '체크리스트', '여행 앱', 'Trelio'],
  authors: [{ name: 'Trelio Team' }],
  creator: 'Trelio',
  publisher: 'Trelio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL as string),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    title: 'Trelio - 여행 계획 애플리케이션',
    description: '쉽고 편리한 여행 계획 애플리케이션',
    siteName: 'Trelio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trelio - 여행 계획 애플리케이션',
    description: '쉽고 편리한 여행 계획 및 애플리케이션',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={pretendard.variable}>
      <body className={pretendard.className}>
        {/* Analytics - 페이지 로드 시 즉시 실행 */}
        <GoogleAnalytics />

        {/* App Providers */}
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <ToastProvider position='top-right'>
              <AnalyticsWrapper>
                <LayoutWrapper>{children}</LayoutWrapper>
              </AnalyticsWrapper>
            </ToastProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
