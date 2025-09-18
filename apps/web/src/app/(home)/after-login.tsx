'use client';

import React from 'react';

import { Typography } from '@ui/components';

import InvitedTravelWidget from '@/components/travel/overview/InvitedTravelWidget';
import RecentActivitiesWidget from '@/components/travel/overview/RecentActivitiesWidget';
import TravelPlansList from '@/components/travel/overview/TravelPlansList';

const AfterLoginHomeView = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-6 py-8'>
        {/* 헤더 */}
        <div className='mb-8'>
          <Typography variant='h2' weight='bold' className='mb-2 text-gray-900'>
            여행 대시보드
          </Typography>
          <Typography variant='body1' className='text-gray-600'>
            여행 계획을 한눈에 확인하고 관리해보세요.
          </Typography>
        </div>

        {/* 대시보드 위젯들 */}
        <div className='mb-8 grid gap-6 lg:grid-cols-2'>
          {/* 초대받은 여행 목록 위젯 */}
          <InvitedTravelWidget />
          {/* 최근 활동 위젯 */}
          <RecentActivitiesWidget />
        </div>

        {/* 여행 계획 목록 */}
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <Typography
            variant='h5'
            weight='semiBold'
            className='mb-6 text-gray-900'
          >
            📋 나의 여행 계획
          </Typography>
          <TravelPlansList />
        </div>
      </div>
    </div>
  );
};

export default AfterLoginHomeView;
