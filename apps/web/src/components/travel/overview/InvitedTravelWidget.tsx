'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { IoCalendarOutline, IoPeopleOutline } from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

import { Modal } from '@/components/basic/Modal';
import { useInvitedTravelPlans } from '@/hooks/useTravelPlans';

const InvitedTravelWidget: React.FC = () => {
  const { data: plans = [], isLoading } = useInvitedTravelPlans(10); // 더 많은 데이터를 가져옴
  const router = useRouter();
  const [showAllModal, setShowAllModal] = useState(false);

  const displayedPlans = plans.slice(0, 3); // 처음 3개만 표시
  const hasMorePlans = plans.length > 3;

  if (isLoading) {
    return (
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='animate-pulse'>
          <div className='mb-4 h-6 w-40 rounded bg-gray-200' />
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='flex items-center space-x-3'>
                <div className='h-8 w-8 rounded-full bg-gray-200' />
                <div className='flex-1'>
                  <div className='mb-1 h-4 rounded bg-gray-200' />
                  <div className='h-3 w-16 rounded bg-gray-200' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
      <Typography variant='h5' weight='semiBold' className='mb-4 text-gray-900'>
        📩 초대받은 여행
      </Typography>

      {plans.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-center'>
          <div className='mb-2 text-4xl'>🗺️</div>
          <Typography variant='body2' className='mb-1 text-gray-500'>
            초대받은 여행이 없습니다
          </Typography>
          <Typography variant='caption' className='text-gray-400'>
            초대 링크를 받거나 공유된 여행에 만들어 보세요
          </Typography>
        </div>
      ) : (
        <div className='space-y-3'>
          {displayedPlans.map((plan) => {
            const start = new Date(plan.start_date).toLocaleDateString(
              'ko-KR',
              {
                month: 'short',
                day: 'numeric',
              }
            );
            const end = new Date(plan.end_date).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            });
            return (
              <div
                key={plan.id}
                onClick={() => router.push(`/travel/${plan.id}`)}
                className='flex cursor-pointer items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50'
              >
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
                  <IoPeopleOutline className='h-4 w-4' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-1 flex items-center justify-between gap-2'>
                    <Typography
                      variant='body2'
                      className='truncate text-gray-900'
                    >
                      {plan.title}
                    </Typography>
                    <span className='whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600'>
                      {plan.role === 'owner'
                        ? '소유자'
                        : plan.role === 'editor'
                          ? '편집자'
                          : '읽기'}
                    </span>
                  </div>
                  <Typography
                    variant='caption'
                    className='mb-1 block text-gray-600'
                  >
                    {plan.location}
                  </Typography>
                  <div className='flex items-center justify-between text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <IoCalendarOutline className='h-3.5 w-3.5' />
                      <Typography variant='caption'>
                        {start} - {end}
                      </Typography>
                    </div>
                    <Typography variant='caption'>
                      {plan.participantCount}명
                    </Typography>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMorePlans && (
        <div className='mt-4 border-t border-gray-100 pt-4'>
          <button
            className='w-full text-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700'
            onClick={() => setShowAllModal(true)}
          >
            모든 초대받은 여행 보기 ({plans.length}개)
          </button>
        </div>
      )}

      {/* 모든 초대받은 여행 모달 */}
      <Modal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        width='responsive'
      >
        <div className='p-4 sm:p-6'>
          <Typography
            variant='h5'
            weight='semiBold'
            className='mb-4 text-gray-900'
          >
            📩 초대받은 여행 ({plans.length}개)
          </Typography>
          <div className='max-h-[60vh] space-y-3 overflow-y-auto sm:max-h-96'>
            {plans.map((plan) => {
              const start = new Date(plan.start_date).toLocaleDateString(
                'ko-KR',
                {
                  month: 'short',
                  day: 'numeric',
                }
              );
              const end = new Date(plan.end_date).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              });
              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    router.push(`/travel/${plan.id}`);
                    setShowAllModal(false);
                  }}
                  className='flex cursor-pointer items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50'
                >
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600'>
                    <IoPeopleOutline className='h-4 w-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-1 flex items-center justify-between gap-2'>
                      <Typography
                        variant='body2'
                        className='truncate text-gray-900'
                      >
                        {plan.title}
                      </Typography>
                      <span className='whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600'>
                        {plan.role === 'owner'
                          ? '소유자'
                          : plan.role === 'editor'
                            ? '편집자'
                            : '읽기'}
                      </span>
                    </div>
                    <Typography
                      variant='caption'
                      className='mb-1 block text-gray-600'
                    >
                      {plan.location}
                    </Typography>
                    <div className='flex items-center justify-between text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <IoCalendarOutline className='h-3.5 w-3.5' />
                        <Typography variant='caption'>
                          {start} - {end}
                        </Typography>
                      </div>
                      <Typography variant='caption'>
                        {plan.participantCount}명
                      </Typography>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className='mt-6 flex justify-end border-t border-gray-100 pt-4'>
            <Button
              variant='outlined'
              onClick={() => setShowAllModal(false)}
              className='w-full sm:w-auto'
            >
              닫기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvitedTravelWidget;
