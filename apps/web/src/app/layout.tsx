import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { Footer, Header } from '@/components';
import { QueryProvider } from '@/providers/query-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { pretendard } from '@/styles/fonts';

import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Pack & Go - 여행 계획 애플리케이션',
  description: '쉽고 편리한 여행 계획 및 체크리스트 관리 애플리케이션',
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
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <ToastProvider position='top-right'>
              <Header />
              {/* 화면 너비 제한 */}
              <div className='mx-auto min-h-[80vh] max-w-screen-xl pb-12 pt-24'>
                {children}
              </div>
              <Footer />
            </ToastProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
