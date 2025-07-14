'use client';

import Image from 'next/image';
import Link from 'next/link';

import { HiArrowRight, HiCheck } from 'react-icons/hi';

import { Button, Icon, Typography, TypographyWeight } from '@ui/components';
import { cn } from '@ui/utils/cn';

/**
 * Card 컴포넌트의 Props 인터페이스
 *
 * @property {string} slug - 카드의 고유 식별자 (선택적)
 * @property {string} title - 카드의 제목 (필수)
 * @property {string} description - 카드의 설명 텍스트 (필수)
 * @property {string} image - 카드에 표시될 이미지 URL (선택적)
 * @property {string} cardType - 카드의 유형 (default, button, link, image, horizontal, pricing, cta, clickable, selectable 중 하나)
 * @property {string} buttonText - 버튼이 있는 카드 유형에서 버튼에 표시될 텍스트 (선택적)
 * @property {string} linkText - 링크가 있는 카드 유형에서 링크에 표시될 텍스트 (선택적)
 * @property {string} linkHref - 링크가 있는 카드 유형에서 이동할 URL (선택적)
 * @property {Function} onClick - 카드 또는 버튼 클릭 시 실행될 함수 (선택적)
 * @property {string[]} features - pricing 카드 유형에서 표시할 기능 목록 (선택적)
 * @property {string} price - pricing 카드 유형에서 가격 (선택적)
 * @property {string} period - pricing 카드 유형에서 가격의 기간 (예: 월, 년) (선택적)
 * @property {boolean} selected - 선택 상태 (selectable 타입에서 사용)
 * @property {React.ReactNode} icon - 아이콘 (clickable, selectable 타입에서 사용)
 * @property {React.ReactNode} children - 자식 요소 (clickable, selectable 타입에서 사용)
 * @property {string} className - 카드에 추가할 클래스 이름 (선택적)
 */
interface Props {
  slug?: string;
  title?: string;
  description?: string;
  image?: string;
  cardType:
    | 'default'
    | 'button'
    | 'link'
    | 'image'
    | 'horizontal'
    | 'pricing'
    | 'cta'
    | 'selectable';
  buttonText?: string;
  linkText?: string;
  linkHref?: string;
  onClick?: () => void;
  features?: string[];
  price?: string;
  period?: string;
  selected?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

// 기본 카드 스타일 (대부분의 카드 타입에 공통 적용)
const baseCardStyle =
  'rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px]';

// 카드 타입별 스타일 설정
const cardTypeConfig = {
  default: { base: baseCardStyle, layout: 'max-w-sm p-6' },
  button: { base: baseCardStyle, layout: 'max-w-sm p-6' },
  link: { base: baseCardStyle, layout: 'max-w-sm p-6' },
  image: { base: baseCardStyle, layout: 'max-w-sm overflow-hidden' },
  horizontal: {
    base: baseCardStyle,
    layout: 'flex flex-col md:flex-row max-w-xl overflow-hidden',
  },
  pricing: { base: baseCardStyle, layout: 'max-w-sm p-6 text-center' },
  cta: { base: baseCardStyle, layout: 'max-w-sm p-6 text-center' },
  clickable: {
    base: 'cursor-pointer rounded-lg border bg-white transition-all duration-200 hover:shadow-md',
    layout: '',
  },
  selectable: {
    base: 'cursor-pointer rounded-lg border bg-white transition-all duration-200 hover:shadow-md',
    layout: '',
  },
};

// 공통 제목 및 설명 렌더링 함수
const renderTitleAndDescription = (
  title?: string,
  description?: string,
  titleOptions: {
    className?: string;
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    weight?: TypographyWeight;
  } = {},
  descriptionOptions: {
    className?: string;
    variant?: 'body1' | 'body2' | 'caption';
    weight?: TypographyWeight;
  } = {}
) => (
  <>
    {title && (
      <Typography
        variant={titleOptions.variant || 'h6'}
        weight={titleOptions.weight || 'semiBold'}
        className={cn('text-gray-900', titleOptions.className)} // 기본값과 사용자 정의 병합
      >
        {title}
      </Typography>
    )}
    {description && (
      <Typography
        variant={descriptionOptions.variant || 'body2'}
        weight={descriptionOptions.weight || 'light'}
        className={cn('text-gray-600', descriptionOptions.className)} // 기본값과 사용자 정의 병합
      >
        {description}
      </Typography>
    )}
  </>
);

export const Card = ({
  // slug, // slug는 현재 사용되지 않으므로 주석 처리 또는 필요시 활용
  title,
  description,
  image,
  cardType,
  buttonText,
  linkText,
  linkHref,
  onClick,
  features,
  price,
  period,
  selected,
  icon,
  children,
  className,
}: Props) => {
  // isHovered 상태 및 관련 핸들러 제거

  const renderCardContent = () => {
    switch (cardType) {
      case 'default':
        return (
          <div className='flex flex-col'>
            {renderTitleAndDescription(title, description, {
              className: 'mb-3',
            })}
          </div>
        );

      case 'button':
        return (
          <div className='flex flex-col'>
            {renderTitleAndDescription(
              title,
              description,
              { className: 'mb-3' },
              { className: 'mb-4' }
            )}
            {buttonText && (
              <Button
                onClick={onClick}
                className='group inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-[#3182F6] px-4 py-2.5 text-center text-sm font-medium text-white transition-all duration-200 hover:bg-[#1b64da] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-2'
              >
                <span className='flex items-center'>
                  {buttonText}
                  <Icon
                    as={HiArrowRight}
                    className='ms-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-[2px] rtl:rotate-180'
                  />
                </span>
              </Button>
            )}
          </div>
        );

      case 'link':
        return (
          <div className='flex flex-col'>
            {renderTitleAndDescription(
              title,
              description,
              { className: 'mb-3' },
              { className: 'mb-4' }
            )}
            {linkText && linkHref && (
              <Link
                href={linkHref}
                className='group inline-flex items-center whitespace-nowrap font-medium text-[#3182F6] transition-all duration-200 hover:text-[#1b64da]'
              >
                <span className='flex items-center'>
                  {linkText}
                  <Icon
                    as={HiArrowRight}
                    className='ms-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-[2px] rtl:rotate-180'
                  />
                </span>
              </Link>
            )}
          </div>
        );

      case 'image':
        return (
          <>
            {image && (
              <div className='w-full overflow-hidden'>
                <Image
                  className='h-auto w-full transition-transform duration-700 hover:scale-105'
                  src={image || '/placeholder.svg'}
                  alt={title || 'Card image'}
                  width={500}
                  height={300}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
            <div className='p-6'>
              {renderTitleAndDescription(
                title,
                description,
                { className: 'mb-3' },
                { className: 'mb-4' }
              )}
              {buttonText && (
                <Button
                  onClick={onClick}
                  className='group inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-[#3182F6] px-4 py-2.5 text-center text-sm font-medium text-white transition-all duration-200 hover:bg-[#1b64da] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-2'
                >
                  <span className='flex items-center'>
                    {buttonText}
                    <Icon
                      as={HiArrowRight}
                      className='ms-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-[2px] rtl:rotate-180'
                    />
                  </span>
                </Button>
              )}
            </div>
          </>
        );

      case 'horizontal':
        return (
          <>
            {image && (
              <div className='overflow-hidden md:w-2/5'>
                <Image
                  className='h-auto w-full object-cover transition-transform duration-700 hover:scale-105 md:h-full'
                  src={image || '/placeholder.svg'}
                  alt={title || 'Card image'}
                  width={300}
                  height={250}
                />
              </div>
            )}
            <div className='flex flex-col justify-between p-6 leading-normal md:w-3/5'>
              {renderTitleAndDescription(title, description, {
                className: 'mb-3',
              })}
            </div>
          </>
        );

      case 'pricing':
        return (
          <div className='flex flex-col items-center'>
            {renderTitleAndDescription(title, undefined, { className: 'mb-4' })}
            {price && (
              <div className='mb-4 flex items-baseline'>
                <Typography
                  variant='h3'
                  weight='bold'
                  className='mr-2 text-[#3182F6]'
                >
                  {price}
                </Typography>
                {period && (
                  <Typography
                    variant='body2'
                    weight='light'
                    className='text-gray-500'
                  >
                    /{period}
                  </Typography>
                )}
              </div>
            )}
            {description && (
              <Typography
                variant='body2'
                weight='light'
                className='mb-6 text-gray-600'
              >
                {description}
              </Typography>
            )}
            {features && features.length > 0 && (
              <ul className='mb-8 w-full space-y-4 text-left'>
                {features.map((feature, index) => (
                  <li key={index} className='flex items-center space-x-3'>
                    <Icon
                      as={HiCheck}
                      className='h-5 w-5 flex-shrink-0 text-[#3182F6]'
                    />
                    <span className='text-gray-600'>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            {buttonText && (
              <Button
                onClick={onClick}
                className='inline-flex w-full items-center justify-center whitespace-nowrap rounded-xl bg-[#3182F6] px-4 py-3 text-center text-sm font-medium text-white transition-all duration-200 hover:bg-[#1b64da] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-2'
              >
                <span className='flex items-center justify-center'>
                  {buttonText}
                </span>
              </Button>
            )}
          </div>
        );

      case 'cta':
        return (
          <div className='flex flex-col items-center'>
            {renderTitleAndDescription(
              title,
              description,
              { variant: 'h5', className: 'mb-3' },
              { className: 'mb-6' }
            )}
            {buttonText && (
              <Button
                onClick={onClick}
                className='inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-[#3182F6] px-5 py-3 text-center text-sm font-medium text-white transition-all duration-200 hover:bg-[#1b64da] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-2'
              >
                <span className='flex items-center'>{buttonText}</span>
              </Button>
            )}
          </div>
        );

      case 'selectable':
        return (
          <div className='p-4'>
            {children || (
              <div className='flex flex-col'>
                {icon && <div className='mb-3'>{icon}</div>}
                {renderTitleAndDescription(title, description, {
                  className: 'mb-3',
                })}
              </div>
            )}
          </div>
        );

      default: // 기본값은 default 타입과 동일하게 처리
        return (
          <div className='flex flex-col'>
            {renderTitleAndDescription(title, description, {
              className: 'mb-3',
            })}
          </div>
        );
    }
  };

  const getCardClasses = () => {
    const config = cardTypeConfig[cardType];
    let effectiveClasses = cn(config.base, config.layout);

    if (cardType === 'selectable') {
      const interactiveStateClasses = selected
        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' // 선택 시 좀 더 명확한 스타일 (Toss 느낌)
        : 'border-gray-200 hover:border-gray-400'; // 기본 및 호버 시 테두리 강화
      effectiveClasses = cn(config.base, interactiveStateClasses); // layout은 내부에서 p-4로 처리
    }
    return cn(effectiveClasses, className); // 사용자 정의 className 병합
  };

  // 접근성을 위한 role 및 tabIndex 설정
  const isInteractiveCard = cardType === 'selectable';
  const cardRole = isInteractiveCard ? 'button' : undefined; // 자식으로 실제 버튼/링크가 없다면 'button' 역할
  const cardTabIndex = isInteractiveCard && onClick ? 0 : undefined; // onClick이 있을 때만 포커스 가능

  return (
    <div
      className={getCardClasses()}
      onClick={onClick} // onClick은 Card 컴포넌트에 전달된 그대로 사용
      role={cardRole}
      tabIndex={cardTabIndex}
      aria-selected={cardType === 'selectable' ? selected : undefined}
      // onMouseEnter, onMouseLeave 제거
    >
      {renderCardContent()}
    </div>
  );
};

Card.displayName = 'Card';
