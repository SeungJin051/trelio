'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import {
  IoCalendarOutline,
  IoCashOutline,
  IoCheckboxOutline,
  IoDocumentTextOutline,
  IoPeopleOutline,
} from 'react-icons/io5';

import { Typography } from '@ui/components';

import { useRecentActivities } from '@/hooks/useTravelPlans';
import { formatTimeAgo, getUserDisplayName } from '@/lib/travel-utils';
import type { Activity } from '@/types/travel';

const getActivityIcon = (actionType: Activity['action_type']) => {
  switch (actionType) {
    case 'updated_schedule':
      return <IoCalendarOutline className='h-4 w-4' />;
    case 'updated_budget':
      return <IoCashOutline className='h-4 w-4' />;
    case 'completed_checklist':
      return <IoCheckboxOutline className='h-4 w-4' />;
    case 'added_participant':
      return <IoPeopleOutline className='h-4 w-4' />;
    default:
      return <IoDocumentTextOutline className='h-4 w-4' />;
  }
};

const getActivityColor = (actionType: Activity['action_type']) => {
  switch (actionType) {
    case 'updated_schedule':
      return 'bg-blue-50 text-blue-600';
    case 'updated_budget':
      return 'bg-green-50 text-green-600';
    case 'completed_checklist':
      return 'bg-purple-50 text-purple-600';
    case 'added_participant':
      return 'bg-orange-50 text-orange-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

const RecentActivitiesWidget: React.FC = () => {
  const router = useRouter();
  const { data: activities = [], isLoading } = useRecentActivities(5);

  const handleActivityClick = (activity: Activity) => {
    router.push(`/travel/${activity.travel_plan_id}`);
  };

  if (isLoading) {
    return (
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='animate-pulse'>
          <div className='mb-4 h-6 w-32 rounded bg-gray-200' />
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
        🤝 최근 협업 활동
      </Typography>

      {activities.length === 0 ? (
        <div className='py-8 text-center'>
          <div className='mb-2 text-4xl'>📋</div>
          <Typography variant='body2' className='mb-1 text-gray-500'>
            아직 활동이 없어요
          </Typography>
          <Typography variant='caption' className='text-gray-400'>
            여행 계획을 만들고 협업을 시작해보세요!
          </Typography>
        </div>
      ) : (
        <div className='space-y-3'>
          {activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
              className='flex cursor-pointer items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50'
            >
              {/* 액션 아이콘 */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(activity.action_type)}`}
              >
                {getActivityIcon(activity.action_type)}
              </div>

              {/* 활동 내용 */}
              <div className='min-w-0 flex-1'>
                <Typography variant='body2' className='mb-1 text-gray-900'>
                  <span className='font-medium'>
                    {activity.user && activity.user.email
                      ? getUserDisplayName(
                          activity.user as { nickname?: string; email: string }
                        )
                      : '알 수 없는 사용자'}
                    님이
                  </span>{' '}
                  <span className='font-medium text-blue-600'>
                    &lsquo;{activity.travel_plan?.title || '여행 계획'}&rsquo;
                  </span>
                  {activity.description}
                </Typography>
                <Typography variant='caption' className='text-gray-500'>
                  {formatTimeAgo(activity.created_at)}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 더보기 링크 */}
      {activities.length > 0 && (
        <div className='mt-4 border-t border-gray-100 pt-4'>
          <button
            className='w-full text-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700'
            onClick={() => router.push('/travel/activities')}
          >
            모든 활동 보기
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivitiesWidget;
