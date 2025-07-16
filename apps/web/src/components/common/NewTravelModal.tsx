'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { FaPencilAlt, FaRobot } from 'react-icons/fa';

import { Icon, Typography } from '@ui/components';

import { Modal } from '../basic';

interface NewTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTravelModal: React.FC<NewTravelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  const handleDirectPlanning = () => {
    onClose();
    router.push('/travel/new/manual'); // 직접 계획 짜기 페이지로 이동
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='새로운 여행 계획 만들기'
      width='lg'
    >
      <div className='px-8 pb-8 pt-4'>
        <Typography variant='body1' className='mb-8 text-center text-gray-500'>
          여행 계획을 어떻게 시작할지 선택해주세요!
        </Typography>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* 직접 계획 짜기 카드 */}
          <div
            onClick={handleDirectPlanning}
            className='group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg'
          >
            {/* 콘텐츠 */}
            <div className='relative z-10'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-200'>
                <Icon as={FaPencilAlt} size={20} />
              </div>

              <Typography
                variant='h6'
                weight='semiBold'
                className='mb-2 text-gray-900 transition-colors duration-200 group-hover:text-blue-700'
              >
                직접 계획 짜기
              </Typography>

              <Typography
                variant='body2'
                className='leading-relaxed text-gray-600 transition-colors duration-200 group-hover:text-gray-700'
              >
                나만의 아이디어로 자유롭게 계획을 세워보세요. 모든 일정을
                세부적으로 직접 조율할 수 있습니다.
              </Typography>
            </div>

            {/* 호버 시 나타나는 화살표 */}
            <div className='absolute bottom-4 right-4 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white'>
                <svg
                  className='h-3 w-3'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* AI 계획 짜기 카드 (비활성화) */}
          <div className='group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50/50 p-6 transition-all duration-200'>
            {/* 콘텐츠 */}
            <div className='relative z-10'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-gray-400'>
                <Icon as={FaRobot} size={20} />
              </div>

              <Typography
                variant='h6'
                weight='semiBold'
                className='mb-2 text-gray-500'
              >
                AI 계획 짜기
              </Typography>

              <Typography
                variant='body2'
                className='mb-3 leading-relaxed text-gray-400'
              >
                AI가 당신의 취향에 맞춰 최적의 여행 일정을 제안해드립니다.
              </Typography>

              {/* Coming Soon */}
              <div className='inline-flex items-center rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1'>
                <Typography
                  variant='caption'
                  weight='medium'
                  className='text-purple-700'
                >
                  COMING SOON
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
