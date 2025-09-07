'use client';

import React from 'react';

import { Typography } from '@ui/components';

import { useInvitedTravelPlans } from '@/hooks/useTravelPlans';

const InvitedTravelWidget: React.FC = () => {
  const { data: plans = [], isLoading } = useInvitedTravelPlans(5);

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

      <div className='py-8 text-center'>
        <div className='mb-2 text-4xl'>🗺️</div>
        <Typography variant='body2' className='mb-1 text-gray-500'>
          초대받은 여행이 없습니다
        </Typography>
        <Typography variant='caption' className='text-gray-400'>
          초대 링크를 받거나 공유된 여행에 참여해 보세요
        </Typography>
      </div>
    </div>
  );
};

export default InvitedTravelWidget;
