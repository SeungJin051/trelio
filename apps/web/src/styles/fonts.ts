import localFont from 'next/font/local';

/**
 * Pretendard 폰트 설정
 *
 * - 실제로 사용되는 웨이트만 로드하여 초기 로딩 시간 단축
 * - Regular(400) 폰트를 preload하여 FCP 개선
 * - display: swap으로 폰트 로딩 중에도 텍스트 표시
 */
export const pretendard = localFont({
  src: [
    {
      path: '../../public/fonts/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-pretendard',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    'Helvetica Neue',
    'Segoe UI',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    'Malgun Gothic',
    'sans-serif',
  ],
});
