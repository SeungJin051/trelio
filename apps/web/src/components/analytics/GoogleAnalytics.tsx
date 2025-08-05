'use client';

import Script from 'next/script';

// TODO: 추후 도메인 설정시 수정해야함.
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID as string;

export default function GoogleAnalytics() {
  // GA ID가 없으면 컴포넌트를 렌더링하지 않음
  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy='afterInteractive'
      />
      <Script id='google-analytics' strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>
    </>
  );
}
