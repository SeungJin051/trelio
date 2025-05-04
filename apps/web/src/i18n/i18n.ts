import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // locale이 undefined인 경우 기본값 'ko' 사용
  const currentLocale = locale || 'ko';

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default,
  };
});
