import React from 'react';

import { IoArrowForwardOutline } from 'react-icons/io5';

import { Typography } from '@ui/components';

import { getBlockColor, getBlockLabel } from '../utils/BlockPresentation';

interface TransitCardData {
  title: string;
  transportType?: string;
  fromAddress?: string;
  toAddress?: string;
  startTime?: string;
  endTime?: string;
}

interface TransitCardProps {
  data: TransitCardData;
  compact?: boolean;
}

export const TransitCard: React.FC<TransitCardProps> = ({
  data,
  compact = false,
}) => {
  const color = getBlockColor('move');

  const transportLabelMap: Record<string, string> = {
    walk: '도보',
    car: '자동차',
    bus: '버스',
    subway: '지하철',
    taxi: '택시',
    train: '기차',
    plane: '비행기',
  };

  const transportLabel = data.transportType
    ? (transportLabelMap[data.transportType] ?? data.transportType)
    : undefined;

  return (
    <div className={`overflow-hidden rounded-xl border ${color}`}>
      <div className={`${compact ? 'p-3' : 'p-4'} bg-white`}>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-2'>
            <span className='rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700'>
              {getBlockLabel('move')}
            </span>
            {transportLabel && (
              <Typography
                variant={compact ? 'caption' : 'body2'}
                className='text-blue-700'
              >
                {transportLabel}
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

        <div
          className={`mt-3 grid items-center ${compact ? 'gap-2' : 'gap-3'} grid-cols-5`}
        >
          <div className='col-span-2'>
            <Typography variant='caption' className='text-gray-500'>
              출발
            </Typography>
            <Typography
              variant={compact ? 'body2' : 'body1'}
              className='truncate font-semibold text-gray-900'
            >
              {data.fromAddress ?? '-'}
            </Typography>
          </div>
          <div className='flex items-center justify-center'>
            <IoArrowForwardOutline className='h-4 w-4 text-blue-400' />
          </div>
          <div className='col-span-2 text-right'>
            <Typography variant='caption' className='text-gray-500'>
              도착
            </Typography>
            <Typography
              variant={compact ? 'body2' : 'body1'}
              className='truncate font-semibold text-gray-900'
            >
              {data.toAddress ?? '-'}
            </Typography>
          </div>
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

export default TransitCard;
