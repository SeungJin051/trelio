'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { HiArrowRight, HiCheck } from 'react-icons/hi';

import { Button, Icon, Typography } from '@ui/components';
import { cn } from '@ui/utils/cn';

/**
 * Card 컴포넌트의 Props 인터페이스
 *
 * @property {string} slug - 카드의 고유 식별자 (선택적)
 * @property {string} title - 카드의 제목 (필수)
 * @property {string} description - 카드의 설명 텍스트 (필수)
 * @property {string} image - 카드에 표시될 이미지 URL (선택적)
 * @property {string} cardType - 카드의 유형 (default, button, link, image, horizontal, pricing, cta 중 하나)
 * @property {string} buttonText - 버튼이 있는 카드 유형에서 버튼에 표시될 텍스트 (선택적)
 * @property {string} linkText - 링크가 있는 카드 유형에서 링크에 표시될 텍스트 (선택적)
 * @property {string} linkHref - 링크가 있는 카드 유형에서 이동할 URL (선택적)
 * @property {Function} onClick - 버튼 클릭 시 실행될 함수 (선택적)
 * @property {string[]} features - pricing 카드 유형에서 표시할 기능 목록 (선택적)
 * @property {string} price - pricing 카드 유형에서 표시할 가격 (선택적)
 * @property {string} period - pricing 카드 유형에서 가격의 기간 (예: 월, 년) (선택적)
 * @property {string} avatarSrc - 작성자 아바타 이미지 URL (선택적, 현재 미사용)
 * @property {string} authorName - 작성자 이름 (선택적, 현재 미사용)
 * @property {string} authorRole - 작성자 역할 (선택적, 현재 미사용)
 */
interface Props {
  slug?: string;
  title: string;
  description: string;
  image?: string;
  cardType:
    | 'default'
    | 'button'
    | 'link'
    | 'image'
    | 'horizontal'
    | 'pricing'
    | 'cta';
  buttonText?: string;
  linkText?: string;
  linkHref?: string;
  onClick?: () => void;
  features?: string[];
  price?: string;
  period?: string;
  avatarSrc?: string;
  authorName?: string;
  authorRole?: string;
}

// 카드 타입에 따른 클래스 매핑 (Toss 스타일로 업데이트)
const cardClassMap = {
  default:
    'block max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px]',
  button:
    'max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px]',
  link: 'max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px]',
  image:
    'max-w-sm overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px]',
  horizontal:
    'flex flex-col md:flex-row max-w-xl rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] overflow-hidden',
  pricing:
    'max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px)] text-center',
  cta: 'max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px)] text-center',
};

export const Card = ({
  slug,
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
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderCardContent = () => {
    switch (cardType) {
      case 'default':
        return (
          <div className='flex flex-col'>
            <Typography
              variant='h6'
              weight='bold'
              className='mb-3 text-gray-900'
            >
              {title}
            </Typography>
            <Typography
              variant='body2'
              weight='light'
              className='text-gray-600'
            >
              {description}
            </Typography>
          </div>
        );

      case 'button':
        return (
          <div className='flex flex-col'>
            <Typography
              variant='h6'
              weight='bold'
              className='mb-3 text-gray-900'
            >
              {title}
            </Typography>
            <Typography
              variant='body2'
              weight='light'
              className='mb-4 text-gray-600'
            >
              {description}
            </Typography>
            {buttonText && (
              <Button
                onClick={onClick}
                className='inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-[#3182F6] px-4 py-2.5 text-center text-sm font-medium text-white transition-all duration-200 hover:bg-[#1b64da] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-2'
              >
                <span className='flex items-center'>
                  {buttonText}
                  <Icon
                    as={HiArrowRight}
                    className={cn(
                      'ms-2 h-3.5 w-3.5 transition-transform duration-200 rtl:rotate-180',
                      isHovered && 'translate-x-[2px]'
                    )}
                  />
                </span>
              </Button>
            )}
          </div>
        );

      case 'link':
        return (
          <div className='flex flex-col'>
            <Typography
              variant='h6'
              weight='bold'
              className='mb-3 text-gray-900'
            >
              {title}
            </Typography>
            <Typography
              variant='body2'
              weight='light'
              className='mb-4 text-gray-600'
            >
              {description}
            </Typography>
            {linkText && linkHref && (
              <Link
                href={linkHref}
                className='inline-flex items-center whitespace-nowrap font-medium text-[#3182F6] transition-all duration-200 hover:text-[#1b64da]'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className='flex items-center'>
                  {linkText}
                  <Icon
                    as={HiArrowRight}
                    className={cn(
                      'ms-2 h-3.5 w-3.5 transition-transform duration-200 rtl:rotate-180',
                      isHovered && 'translate-x-[2px]'
                    )}
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
                  alt={title}
                  width={500}
                  height={300}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
            <div className='p-6'>
              <Typography
                variant='h6'
                weight='bold'
                className='mb-3 text-gray-900'
              >
                {title}
              </Typography>
              <Typography
                variant='body2'
                weight='light'
                className='mb-4 text-gray-600'
              >
                {description}
              </Typography>
              {buttonText && (
                <Button
                  onClick={onClick}
                  className='inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-[#3182F6] px-4 py-2.5 text-center text-sm font-medium text-white transition-all duration-200 hover:bg-[#1b64da] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-2'
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <span className='flex items-center'>
                    {buttonText}
                    <Icon
                      as={HiArrowRight}
                      className={cn(
                        'ms-2 h-3.5 w-3.5 transition-transform duration-200 rtl:rotate-180',
                        isHovered && 'translate-x-[2px]'
                      )}
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
                  alt={title}
                  width={300}
                  height={250}
                />
              </div>
            )}
            <div className='flex flex-col justify-between p-6 leading-normal md:w-3/5'>
              <Typography
                variant='h6'
                weight='bold'
                className='mb-3 text-gray-900'
              >
                {title}
              </Typography>
              <Typography
                variant='body2'
                weight='light'
                className='text-gray-600'
              >
                {description}
              </Typography>
            </div>
          </>
        );

      case 'pricing':
        return (
          <div className='flex flex-col items-center'>
            <Typography
              variant='h6'
              weight='bold'
              className='mb-4 text-gray-900'
            >
              {title}
            </Typography>
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
            <Typography
              variant='body2'
              weight='light'
              className='mb-6 text-gray-600'
            >
              {description}
            </Typography>
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
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
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
            <Typography
              variant='h5'
              weight='bold'
              className='mb-3 text-gray-900'
            >
              {title}
            </Typography>
            <Typography
              variant='body2'
              weight='light'
              className='mb-6 text-gray-600'
            >
              {description}
            </Typography>
            {buttonText && (
              <Button
                onClick={onClick}
                className='inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-[#3182F6] px-5 py-3 text-center text-sm font-medium text-white transition-all duration-200 hover:bg-[#1b64da] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-2'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className='flex items-center'>{buttonText}</span>
              </Button>
            )}
          </div>
        );

      default:
        return (
          <div className='flex flex-col'>
            <Typography
              variant='h6'
              weight='bold'
              className='mb-3 text-gray-900'
            >
              {title}
            </Typography>
            <Typography
              variant='body2'
              weight='light'
              className='text-gray-600'
            >
              {description}
            </Typography>
          </div>
        );
    }
  };

  return (
    <div
      className={cardClassMap[cardType]}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderCardContent()}
    </div>
  );
};

Card.displayName = 'Card';
