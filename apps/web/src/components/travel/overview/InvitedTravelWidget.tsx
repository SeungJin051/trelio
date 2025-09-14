'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { IoCalendarOutline, IoPeopleOutline } from 'react-icons/io5';

import { Typography } from '@ui/components';

import { useInvitedTravelPlans } from '@/hooks/useTravelPlans';

const InvitedTravelWidget: React.FC = () => {
  const { data: plans = [], isLoading } = useInvitedTravelPlans(5);
  const router = useRouter();

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
      <Typography variant='h6' weight='semiBold' className='mb-4 text-gray-900'>
        📩 초대받은 여행
      </Typography>

      {plans.length === 0 ? (
        <div className='py-8 text-center'>
          <div className='mb-2 text-4xl'>🗺️</div>
          <Typography variant='body2' className='mb-1 text-gray-500'>
            초대받은 여행이 없습니다
          </Typography>
          <Typography variant='caption' className='text-gray-400'>
            초대 링크를 받거나 공유된 여행에 참여해 보세요
          </Typography>
        </div>
      ) : (
        <div className='space-y-3'>
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
    </div>
  );
};

export default InvitedTravelWidget;
