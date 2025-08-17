import React from 'react';

import { Typography } from '@ui/components';

import { getBlockColor, getBlockLabel } from '../utils/BlockPresentation';

type ActivityType =
  | 'sightseeing'
  | 'shopping'
  | 'entertainment'
  | 'sports'
  | 'culture'
  | string;

interface ActivityCardData {
  title: string;
  activityType?: ActivityType;
  reservationRequired?: boolean;
  address?: string;
  startTime?: string;
  endTime?: string;
}

interface ActivityCardProps {
  data: ActivityCardData;
  compact?: boolean;
}

const activityTypeLabel: Record<string, string> = {
  sightseeing: '관광',
  shopping: '쇼핑',
  entertainment: '엔터테인먼트',
  sports: '스포츠',
  culture: '문화',
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  data,
  compact = false,
}) => {
  const color = getBlockColor('activity');
  const typeLabel = data.activityType
    ? (activityTypeLabel[data.activityType] ?? data.activityType)
    : undefined;

  return (
    <div className={`overflow-hidden rounded-xl border ${color}`}>
      <div className={`${compact ? 'p-3' : 'p-4'} bg-white`}>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-2'>
            <span className='rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700'>
              {getBlockLabel('activity')}
            </span>
            {typeLabel && (
              <Typography
                variant={compact ? 'caption' : 'body2'}
                className='text-green-700'
              >
                {typeLabel}
              </Typography>
            )}
          </div>

          {(data.startTime || data.endTime) && (
            <div className='text-right'>
              <Typography variant='caption' className='text-gray-500'>
                시간
              </Typography>
              <Typography
                variant={compact ? 'caption' : 'body2'}
                className='font-medium text-gray-800'
              >
                {data.startTime}
                {data.endTime ? ` - ${data.endTime}` : ''}
              </Typography>
            </div>
          )}
        </div>

        <div className={`mt-3 grid ${compact ? 'gap-2' : 'gap-3'}`}>
          {data.address && (
            <div>
              <Typography variant='caption' className='text-gray-500'>
                위치
              </Typography>
              <Typography
                variant={compact ? 'body2' : 'body1'}
                className='truncate font-medium text-gray-800'
              >
                {data.address}
              </Typography>
            </div>
          )}
          {data.reservationRequired !== undefined && (
            <div>
              <Typography variant='caption' className='text-gray-500'>
                예약
              </Typography>
              <Typography variant='body2' className='font-medium text-gray-900'>
                {data.reservationRequired ? '필요' : '불필요'}
              </Typography>
            </div>
          )}
        </div>

        {!compact && data.title && (
          <div className='mt-3'>
            <Typography variant='body2' className='font-medium text-gray-800'>
              {data.title}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
