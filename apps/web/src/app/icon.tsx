/**
 * 파비콘 생성 파일
 *
 * Next.js App Router에서 동적으로 파비콘을 생성합니다.
 * TrelioLogo 컴포넌트의 디자인을 기반으로 32x32 픽셀 크기의 PNG 파비콘을 생성합니다.
 *
 */
import { ImageResponse } from 'next/og';

// Edge Runtime 사용으로 빠른 응답 시간 확보
export const runtime = 'edge';

// 파비콘 크기 설정 (32x32 픽셀)
export const size = {
  width: 32,
  height: 32,
};

// 파비콘 파일 형식 설정
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width='28'
          height='28'
          viewBox='0 0 40 40'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M 8 28 C 12 20 20 12 32 12'
            stroke='#4F46E5'
            strokeWidth='6'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M 20 8 C 20 16 20 24 20 32'
            stroke='#60A5FA'
            strokeWidth='6'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
