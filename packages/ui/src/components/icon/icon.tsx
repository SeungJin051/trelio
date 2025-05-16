import { IconType } from 'react-icons';

import { cn } from '@ui/utils/cn';

interface IconProps {
  /** react-icons에서 가져온 아이콘 컴포넌트 (예: FaBeer, MdSettings) */
  as: IconType;
  /** 아이콘 크기 (픽셀 또는 CSS 단위) */
  size?: number | string;
  /** 아이콘 색상 (CSS color 값) */
  color?: string;
  /** 추가적인 CSS 클래스 */
  className?: string;
  /** 접근성을 위한 title 속성 (툴팁으로도 사용될 수 있음) */
  title?: string;
  /** aria-label 대체 텍스트 */
  ariaLabel?: string;
  /** 클릭 이벤트 핸들러 */
  onClick?: () => void;
}

export const Icon = ({
  as: IconComponent, // 'as' prop으로 아이콘 컴포넌트를 받음
  size,
  color,
  className,
  title,
  ariaLabel,
  onClick,
  ...rest // 나머지 DOM 속성 (예: style)
}: IconProps) => {
  const iconStyles: React.CSSProperties = {
    ...(size && { fontSize: size }),
    ...(color && { color: color }),
  };

  const effectiveAriaLabel = ariaLabel || title;

  return (
    <IconComponent
      size={size} // react-icons는 size prop을 직접 받음
      color={color} // react-icons는 color prop을 직접 받음
      className={cn('app-icon', className)} // 공통 클래스 및 커스텀 클래스 적용
      style={iconStyles} // style prop은 우선순위가 높으므로 주의해서 사용
      title={title} // HTML title 속성 (마우스 오버 시 툴팁)
      aria-label={effectiveAriaLabel} // 스크린 리더를 위한 레이블
      aria-hidden={effectiveAriaLabel ? undefined : true} // 레이블이 없으면 장식용으로 간주
      role='img' // 명시적인 이미지 역할
      onClick={onClick}
      {...rest}
    />
  );
};

Icon.displayName = 'Icon';
