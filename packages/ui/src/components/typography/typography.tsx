import React from 'react';

import { clsx } from 'clsx';

// 타이포그래피 컴포넌트에서 사용 가능한 텍스트 크기 변형
// h1~h6: 제목용 크기, subtitle: 부제목, body: 본문, caption: 작은 설명, overline: 상단 작은 텍스트
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline';

// 타이포그래피 컴포넌트에서 사용 가능한 폰트 두께
// thin(100)부터 black(900)까지 9단계로 구분
export type TypographyWeight =
  | 'thin'
  | 'extraLight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semiBold'
  | 'bold'
  | 'extraBold'
  | 'black';

// 타이포그래피 컴포넌트의 props 타입 정의
export interface TypographyProps {
  variant?: TypographyVariant; // 텍스트 크기 변형 (기본값: body1)
  weight?: TypographyWeight; // 폰트 두께 (기본값: regular)
  as?: React.ElementType; // 렌더링할 HTML 요소 타입 (예: div, span, p 등)
  className?: string; // 추가 CSS 클래스명
  children: React.ReactNode; // 타이포그래피 내부에 들어갈 내용
}

/**
 * 프리텐다드 폰트를 사용하는 타이포그래피 컴포넌트
 *
 * 이 컴포넌트는 일관된 텍스트 스타일을 유지하기 위해 사용됩니다.
 * variant로 텍스트 크기를, weight로 폰트 두께를 설정할 수 있습니다.
 *
 * 사용 예시:
 * <Typography variant="h1" weight="bold">큰 제목</Typography>
 * <Typography variant="body1">일반 본문</Typography>
 */
export const Typography = ({
  variant = 'body1',
  weight = 'regular',
  as,
  className = '',
  children,
  ...rest
}: TypographyProps) => {
  // 각 variant에 해당하는 Tailwind CSS 클래스 매핑
  const variantClassMap: Record<TypographyVariant, string> = {
    h1: 'text-4xl', // 가장 큰 제목 (2.25rem)
    h2: 'text-3xl', // 큰 제목 (1.875rem)
    h3: 'text-2xl', // 중간 제목 (1.5rem)
    h4: 'text-xl', // 작은 제목 (1.25rem)
    h5: 'text-lg', // 더 작은 제목 (1.125rem)
    h6: 'text-base', // 가장 작은 제목 (1rem)
    subtitle1: 'text-base', // 부제목 1 (1rem)
    subtitle2: 'text-sm', // 부제목 2 (0.875rem)
    body1: 'text-base', // 본문 1 (1rem)
    body2: 'text-sm', // 본문 2 (0.875rem)
    caption: 'text-xs', // 캡션 텍스트 (0.75rem)
    overline: 'text-xs uppercase tracking-wider', // 상단 레이블 (대문자, 자간 넓게)
  };

  // 각 weight에 해당하는 Tailwind CSS 클래스 매핑
  const weightClassMap: Record<TypographyWeight, string> = {
    thin: 'font-thin', // 100
    extraLight: 'font-extralight', // 200
    light: 'font-light', // 300
    regular: 'font-normal', // 400
    medium: 'font-medium', // 500
    semiBold: 'font-semibold', // 600
    bold: 'font-bold', // 700
    extraBold: 'font-extrabold', // 800
    black: 'font-black', // 900
  };

  // as prop이 제공되지 않은 경우 variant에 맞는 기본 HTML 요소 사용
  const Component = as || getDefaultComponent(variant);

  // 최종 렌더링: 적절한 HTML 요소에 Tailwind 클래스 적용
  return (
    <Component
      className={clsx(
        'font-pretendard', // 프리텐다드 폰트 적용
        variantClassMap[variant], // 텍스트 크기 클래스
        weightClassMap[weight], // 폰트 두께 클래스
        className // 사용자 정의 클래스
      )}
      {...rest} // 추가 props 전달 (예: onClick, aria-* 속성 등)
    >
      {children}
    </Component>
  );
};

/**
 * 각 variant에 맞는 기본 HTML 태그를 반환하는 함수
 *
 * 예를 들어:
 * - h1-h6 변형은 실제 HTML h1-h6 태그로 렌더링
 * - body 변형은 p 태그로 렌더링
 * - subtitle은 h6 태그로 렌더링
 */
const getDefaultComponent = (variant: TypographyVariant): React.ElementType => {
  switch (variant) {
    case 'h1':
      return 'h1'; // 주요 제목
    case 'h2':
      return 'h2'; // 섹션 제목
    case 'h3':
      return 'h3'; // 하위 섹션 제목
    case 'h4':
      return 'h4'; // 단락 제목
    case 'h5':
      return 'h5'; // 작은 제목
    case 'h6':
      return 'h6'; // 가장 작은 제목
    case 'subtitle1':
    case 'subtitle2':
      return 'h6'; // 부제목은 h6으로 렌더링 (시맨틱하게)
    case 'body1':
    case 'body2':
      return 'p'; // 본문은 p 태그로 렌더링
    case 'caption':
      return 'span'; // 캡션은 span으로 (인라인 요소)
    case 'overline':
      return 'span'; // 오버라인도 span으로 (인라인 요소)
    default:
      return 'p'; // 기본값은 p 태그
  }
};

// 개발 도구에서 컴포넌트 이름을 표시하기 위한 설정
Typography.displayName = 'Typography';
