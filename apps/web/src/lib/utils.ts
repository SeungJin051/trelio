import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 환경에 따른 동적 URL 생성 함수
 * Supabase Auth redirectTo에 사용
 * 개발환경: localhost:3000
 * Vercel 프리뷰: 자동 감지된 Vercel URL
 * 프로덕션: 설정된 사이트 URL
 */
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // 프로덕션 환경에서 설정된 사이트 URL
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercel에서 자동으로 설정되는 URL
    'http://localhost:3000/'; // 로컬 개발 환경 기본값

  // https:// 프로토콜 확인 (localhost가 아닌 경우)
  url = url.startsWith('http') ? url : `https://${url}`;

  // 마지막 슬래시 확인
  url = url.endsWith('/') ? url : `${url}/`;

  return url;
};
