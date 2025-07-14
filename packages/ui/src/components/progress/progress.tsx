import type React from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

/**
 * Progress 컴포넌트의 크기를 정의하는 타입
 */
export type ProgressSize = 'small' | 'medium' | 'large';

/**
 * Progress 컴포넌트의 색상 테마를 정의하는 타입
 */
export type ProgressColorTheme =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'gray';

/**
 * Progress 컴포넌트의 Props 타입 정의
 */
export interface ProgressProps {
  /** 진행률 (0-100) */
  value: number;
  /** 최대값 (기본값: 100) */
  max?: number;
  /** 크기 */
  size?: ProgressSize;
  /** 색상 테마 */
  colorTheme?: ProgressColorTheme;
  /** 애니메이션 사용 여부 */
  animated?: boolean;
  /** 진행률 텍스트 표시 여부 */
  showValue?: boolean;
  /** 커스텀 클래스명 */
  className?: string;
  /** 라벨 텍스트 */
  label?: string;
}

/**
 * 크기별 스타일 정의
 */
const sizeStyles: Record<
  ProgressSize,
  { container: string; bar: string; text: string }
> = {
  small: {
    container: 'h-1',
    bar: 'h-1',
    text: 'text-xs',
  },
  medium: {
    container: 'h-2',
    bar: 'h-2',
    text: 'text-sm',
  },
  large: {
    container: 'h-3',
    bar: 'h-3',
    text: 'text-base',
  },
};

/**
 * 색상 테마별 스타일 정의
 */
const colorThemeStyles: Record<
  ProgressColorTheme,
  { bg: string; text: string }
> = {
  blue: {
    bg: 'bg-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-600',
    text: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
  },
  orange: {
    bg: 'bg-orange-600',
    text: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-600',
    text: 'text-red-600',
  },
  gray: {
    bg: 'bg-gray-600',
    text: 'text-gray-600',
  },
};

/**
 * Progress 컴포넌트
 *
 * 사용 예시:
 * <Progress
 *   value={75}
 *   size="medium"
 *   colorTheme="blue"
 *   showValue
 *   label="업로드 진행률"
 * />
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'medium',
      colorTheme = 'blue',
      animated = true,
      showValue = false,
      className,
      label,
      ...rest
    }: ProgressProps,
    ref
  ) => {
    // 진행률 계산 (0-100 범위로 제한)
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    // 스타일 가져오기
    const sizeStyle = sizeStyles[size];
    const colorStyle = colorThemeStyles[colorTheme];

    return (
      <div ref={ref} className={clsx('w-full', className)} {...rest}>
        {/* 라벨과 진행률 텍스트 */}
        {(label || showValue) && (
          <div className='mb-1 flex items-center justify-between'>
            {label && (
              <span
                className={clsx('font-medium text-gray-700', sizeStyle.text)}
              >
                {label}
              </span>
            )}
            {showValue && (
              <span
                className={clsx('font-medium', colorStyle.text, sizeStyle.text)}
              >
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        {/* 프로그레스 바 컨테이너 */}
        <div
          className={clsx(
            'w-full overflow-hidden rounded-full bg-gray-200',
            sizeStyle.container
          )}
        >
          {/* 프로그레스 바 */}
          <div
            className={clsx(
              'rounded-full',
              colorStyle.bg,
              sizeStyle.bar,
              animated && 'transition-all duration-300 ease-out'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';
