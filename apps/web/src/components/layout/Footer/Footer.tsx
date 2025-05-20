'use client';

import Link from 'next/link';

import { FiGithub } from 'react-icons/fi';
import { FiInstagram } from 'react-icons/fi';
import { IoIosArrowUp } from 'react-icons/io';

import { Icon, Typography } from '@ui/components';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 개인 프로젝트에 필요한 최소한의 링크만 유지
  const footerLinks = [
    { name: '여행 계획', href: '/travel-plan' },
    { name: '여행지 추천', href: '/recommendations' },
    { name: '항공권 검색', href: '/flights' },
    { name: '여행 팁', href: '/tips' },
  ];

  const socialLinks = [
    { name: 'Github', href: 'https://github.com/SeungJin051', icon: 'github' },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/__seung_jin__/',
      icon: 'instagram',
    },
  ];

  return (
    <footer className='border-t border-gray-100 bg-white'>
      <div className='mx-auto max-w-7xl px-6 py-12'>
        <div className='flex flex-col items-center text-center md:flex-row md:items-start md:text-left'>
          {/* 로고 및 설명 */}
          <div className='md:max-w-sm'>
            <div className='flex items-center justify-center md:justify-start'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-[#3182F6] font-bold text-white'>
                P&G
              </div>
              <Typography variant='h4' weight='semiBold' className='ml-2'>
                Pack & Go
              </Typography>
            </div>

            <p className='mt-4 text-base leading-relaxed text-gray-600'>
              팩앤고는 여행 계획 서비스,
              <br />
              여행 계획을 쉽고 편리하게 관리할 수 있어요
            </p>

            <div className='mt-4'>
              <p className='text-sm text-gray-500'>seungjin051@gmail.com</p>
            </div>
          </div>

          {/* 간단한 링크 */}
          <div className='mt-8 md:ml-auto md:mt-0'>
            <h3 className='text-sm font-medium text-gray-900'>서비스</h3>
            <ul className='mt-4 flex flex-wrap justify-center gap-4 md:justify-start md:gap-6'>
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-sm text-gray-600 transition-colors hover:text-[#3182F6]'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* 소셜 링크 */}
            <div className='mt-6 flex justify-center space-x-4 md:justify-start'>
              {socialLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-[#3182F6] hover:text-[#3182F6]'
                  aria-label={link.name}
                >
                  {link.icon === 'github' ? (
                    <Icon as={FiGithub} color='#374151' size={18} />
                  ) : (
                    <Icon as={FiInstagram} color='#374151' size={18} />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className='mt-8 flex flex-col-reverse items-center justify-between border-t border-gray-100 pt-8 md:flex-row'>
          <p className='mt-4 text-sm text-gray-500 md:mt-0'>
            © 2025 Pack & Go. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className='group inline-flex items-center justify-center rounded-full border border-gray-200 p-2 text-gray-500 transition-colors hover:border-[#3182F6] hover:text-[#3182F6]'
            aria-label='맨 위로 이동'
          >
            <Icon as={IoIosArrowUp} color='#374151' size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
