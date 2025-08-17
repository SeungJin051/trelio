import React from 'react';

import { Typography } from '@ui/components';

import { getBlockColor, getBlockLabel } from '../utils/BlockPresentation';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | string;

interface FoodCardData {
  title: string;
  mealType?: MealType;
  cuisine?: string;
  address?: string;
  startTime?: string;
  endTime?: string;
}

interface FoodCardProps {
  data: FoodCardData;
  compact?: boolean;
}

const mealTypeLabel: Record<string, string> = {
  breakfast: '아침식사',
  lunch: '점심식사',
  dinner: '저녁식사',
  snack: '간식',
};

export const FoodCard: React.FC<FoodCardProps> = ({
  data,
  compact = false,
}) => {
  const color = getBlockColor('food');
  const mealLabel = data.mealType
    ? (mealTypeLabel[data.mealType] ?? data.mealType)
    : undefined;

  return (
    <div className={`overflow-hidden rounded-xl border ${color}`}>
      <div className={`${compact ? 'p-3' : 'p-4'} bg-white`}>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-2'>
            <span className='rounded-md bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700'>
              {getBlockLabel('food')}
            </span>
            {mealLabel && (
              <Typography
                variant={compact ? 'caption' : 'body2'}
                className='text-orange-700'
              >
                {mealLabel}
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
          {data.cuisine && (
            <div>
              <Typography variant='caption' className='text-gray-500'>
                요리
              </Typography>
              <Typography
                variant={compact ? 'body2' : 'body1'}
                className='font-semibold text-gray-900'
              >
                {data.cuisine}
              </Typography>
            </div>
          )}
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

export default FoodCard;
