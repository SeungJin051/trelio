import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 여러 클래스 값을 하나의 문자열로 병합하는 함수
 * @param inputs - 병합할 클래스 값들
 * @returns 병합된 클래스 문자열
 */
export function cn(...inputs: ClassValue[]): string {
  // twMerge는 여러 클래스 값을 하나의 문자열로 병합하는 함수
  return twMerge(clsx(inputs));
}
