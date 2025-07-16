import type React from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

/**
 * 버튼의 시각적 스타일 종류를 정의하는 타입
 * - filled: 색상이 채워진 버튼 (기본 스타일)
 * - text: 배경색 없이 텍스트만 있는 버튼
 * - outlined: 테두리만 있는 버튼
 * - ghost: 투명한 배경, 호버 시에만 배경색 표시
 */
export type ButtonVariant = 'filled' | 'text' | 'outlined' | 'ghost';

/**
 * 버튼 크기를 정의하는 타입
 * - large: 큰 버튼
 * - medium: 중간 크기 버튼
 * - small: 작은 버튼 (기본값)
 */
export type ButtonSize = 'large' | 'medium' | 'small';

/**
 * 버튼 컴포넌트의 Props 타입 정의
 * HTML 버튼 요소의 기본 속성을 모두 상속받음
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // 버튼 컴포넌트의 자식 요소 (버튼 내부 텍스트나 컴포넌트)
  children: React.ReactNode;
  // 버튼 크기 (large, medium, small 중 선택)
  size?: ButtonSize;
  // 버튼 왼쪽에 표시될 아이콘
  leftIcon?: React.ReactNode;
  // 버튼 오른쪽에 표시될 아이콘
  rightIcon?: React.ReactNode;
  // 버튼 변형 스타일 (filled, text, outlined 중 선택)
  variant?: ButtonVariant;
  // 버튼 색상 테마 (blue, purple, pink 등)
  colorTheme?: string;
  // 부모 요소의 너비를 100% 차지할지 여부
  fullWidth?: boolean;
  // 버튼 타입 (HTML 표준: submit, button, reset)
  type?: 'submit' | 'button' | 'reset';
  // 버튼이 활성화되었는지 여부 (시각적으로 강조됨)
  active?: boolean;
}

/**
 * 버튼 크기별 Tailwind CSS 클래스 정의
 * - px: 좌우 패딩, py: 상하 패딩, text: 글자 크기
 */
const sizeStyles: Record<ButtonSize, string> = {
  large: 'px-6 py-3 text-lg',
  medium: 'px-4 py-2 text-base',
  small: 'px-3 py-1.5 text-sm',
};

/**
 * 색상 테마별 버튼 스타일 정의
 * 각 색상마다 filled, outlined, text, ghost, active 상태의 스타일을 정의
 * - 배경색, 텍스트색, 호버 효과, 포커스 링 등을 정의
 */
const themeStyles = {
  // 파란색 테마
  blue: {
    filled: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    outlined:
      'border border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
    text: 'text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-blue-500 bg-transparent hover:bg-blue-50 focus:ring-blue-500',
    active: 'ring-2 ring-blue-500 ring-offset-1',
  },
  // 보라색 테마
  purple: {
    filled:
      'bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500',
    outlined:
      'border border-purple-500 text-purple-500 hover:bg-purple-50 focus:ring-purple-500',
    text: 'text-purple-500 hover:bg-purple-50 focus:ring-purple-500',
    ghost:
      'text-purple-500 bg-transparent hover:bg-purple-50 focus:ring-purple-500',
    active: 'ring-2 ring-purple-500 ring-offset-1',
  },
  // 분홍색 테마
  pink: {
    filled: 'bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-500',
    outlined:
      'border border-pink-500 text-pink-500 hover:bg-pink-50 focus:ring-pink-500',
    text: 'text-pink-500 hover:bg-pink-50 focus:ring-pink-500',
    ghost: 'text-pink-500 bg-transparent hover:bg-pink-50 focus:ring-pink-500',
    active: 'ring-2 ring-pink-500 ring-offset-1',
  },
  // 주황색 테마
  orange: {
    filled:
      'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
    outlined:
      'border border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500',
    text: 'text-orange-500 hover:bg-orange-50 focus:ring-orange-500',
    ghost:
      'text-orange-500 bg-transparent hover:bg-orange-50 focus:ring-orange-500',
    active: 'ring-2 ring-orange-500 ring-offset-1',
  },
  // 초록색 테마
  green: {
    filled: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    outlined:
      'border border-green-500 text-green-500 hover:bg-green-50 focus:ring-green-500',
    text: 'text-green-500 hover:bg-green-50 focus:ring-green-500',
    ghost:
      'text-green-500 bg-transparent hover:bg-green-50 focus:ring-green-500',
    active: 'ring-2 ring-green-500 ring-offset-1',
  },
  // 노란색 테마
  yellow: {
    filled:
      'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    outlined:
      'border border-yellow-500 text-yellow-500 hover:bg-yellow-50 focus:ring-yellow-500',
    text: 'text-yellow-500 hover:bg-yellow-50 focus:ring-yellow-500',
    ghost:
      'text-yellow-500 bg-transparent hover:bg-yellow-50 focus:ring-yellow-500',
    active: 'ring-2 ring-yellow-500 ring-offset-1',
  },
  // 회색 테마
  gray: {
    filled: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
    outlined:
      'border border-gray-500 text-gray-500 hover:bg-gray-50 focus:ring-gray-500',
    text: 'text-gray-500 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500',
    active: 'ring-2 ring-gray-500 ring-offset-1',
  },
  // 빨간색 테마
  red: {
    filled: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    outlined:
      'border border-red-500 text-red-500 hover:bg-red-50 focus:ring-red-500',
    text: 'text-red-500 hover:bg-red-50 focus:ring-red-500',
    ghost: 'text-red-700 bg-transparent hover:bg-red-50 focus:ring-red-500',
    active: 'ring-2 ring-red-500 ring-offset-1',
  },
};

/**
 * 버튼 컴포넌트
 *
 * 사용 예시:
 * <Button
 *   size="medium"
 *   variant="filled"
 *   colorTheme="blue"
 *   onClick={() => console.log('클릭됨')}
 * >
 *   버튼 텍스트
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      size = 'small',
      leftIcon,
      rightIcon,
      variant = 'filled',
      colorTheme = 'blue',
      fullWidth = false,
      type = 'button',
      active,
      disabled,
      ...rest // 기타 HTML 버튼 속성들 (onClick 등)
    }: ButtonProps,
    ref // 외부에서 버튼 요소에 접근할 수 있게 해주는 ref
  ) => {
    // 모든 버튼에 공통으로 적용되는 기본 클래스
    const commonBaseClasses =
      'font-semibold rounded-md transition-colors duration-150 ease-in-out';

    // 포커스 시 적용되는 링 효과 (접근성 향상)
    const commonFocusRing =
      'focus:outline-none focus:ring-2 focus:ring-offset-2';

    // 비활성화 상태의 스타일 (모든 테마에 공통)
    const disabledClasses =
      'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200';

    // colorTheme에 맞는 스타일 객체 가져오기 (없으면 기본값 blue 사용)
    const theme =
      themeStyles[colorTheme as keyof typeof themeStyles] || themeStyles.blue;

    // 선택된 variant에 맞는 스타일 적용 (disabled가 아닐 때만)
    const currentVariantStyles = !disabled
      ? theme[variant as keyof typeof theme] || theme.filled
      : '';

    // active 상태 스타일 (disabled가 아닐 때만 적용)
    const activeClasses = !disabled && active ? theme.active : '';

    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          // 기본 클래스 적용
          commonBaseClasses,
          // 크기에 따른 스타일 적용
          sizeStyles[size],
          // 비활성화 상태면 disabledClasses, 아니면 variant 스타일 적용
          disabled ? disabledClasses : currentVariantStyles,
          // 비활성화 상태가 아닐 때만 포커스 링 효과 적용
          !disabled && commonFocusRing,
          // active 상태 클래스 적용
          activeClasses,
          // fullWidth가 true이면 w-full 클래스 적용
          fullWidth && 'w-full',
          // 사용자 정의 클래스 적용
          className
        )}
        disabled={disabled}
        {...rest} // 기타 속성들 전달 (onClick, name 등)
      >
        {/* 버튼 내용을 감싸는 컨테이너 */}
        <span className='flex items-center justify-center space-x-2'>
          {/* 왼쪽 아이콘이 있으면 표시 */}
          {leftIcon && (
            <span className='inline-flex items-center'>{leftIcon}</span>
          )}
          {/* 버튼 텍스트/내용 */}
          <span>{children}</span>
          {/* 오른쪽 아이콘이 있으면 표시 */}
          {rightIcon && (
            <span className='inline-flex items-center'>{rightIcon}</span>
          )}
        </span>
      </button>
    );
  }
);

// 개발 도구에서 컴포넌트 이름을 올바르게 표시하기 위한 설정
Button.displayName = 'Button';
