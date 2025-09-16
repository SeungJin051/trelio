import React from 'react';

import {
  IoAirplaneOutline,
  IoArrowForwardOutline,
  IoBusOutline,
  IoCarOutline,
  IoCarSportOutline,
  IoTrainOutline,
  IoWalkOutline,
} from 'react-icons/io5';

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

  const transportConfig: Record<
    string,
    { label: string; icon: React.ReactNode; color: string; bgColor: string }
  > = {
    walk: {
      label: '도보',
      icon: <IoWalkOutline className='h-4 w-4' />,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    car: {
      label: '자동차',
      icon: <IoCarOutline className='h-4 w-4' />,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
    },
    bus: {
      label: '버스',
      icon: <IoBusOutline className='h-4 w-4' />,
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
    },
    subway: {
      label: '지하철',
      icon: <IoTrainOutline className='h-4 w-4' />,
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
    },
    taxi: {
      label: '택시',
      icon: <IoCarSportOutline className='h-4 w-4' />,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    },
    train: {
      label: '기차',
      icon: <IoTrainOutline className='h-4 w-4' />,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-100',
    },
    plane: {
      label: '비행기',
      icon: <IoAirplaneOutline className='h-4 w-4' />,
      color: 'text-sky-700',
      bgColor: 'bg-sky-100',
    },
  };

  const currentTransport = data.transportType
    ? transportConfig[data.transportType]
    : null;

  return (
    <div className='relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50/30 to-white shadow-lg shadow-blue-100/20'>
      {/* 배경 패턴 */}
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute right-4 top-4 text-5xl text-blue-500'>
          {currentTransport?.icon || <IoArrowForwardOutline />}
        </div>
      </div>

      <div
        className={`relative ${compact ? 'p-4' : 'p-5'} bg-white/80 backdrop-blur-sm`}
      >
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-3'>
            {currentTransport && (
              <div
                className={`rounded-xl px-3 py-2 ${currentTransport.bgColor} flex items-center space-x-2`}
              >
                {currentTransport.icon}
                <Typography
                  variant={compact ? 'caption' : 'body2'}
                  className={`font-semibold ${currentTransport.color}`}
                >
                  {currentTransport.label}
                </Typography>
              </div>
            )}
            {!currentTransport && (
              <span className='rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700'>
                {getBlockLabel('move')}
              </span>
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

        <div className={`mt-4 ${compact ? 'space-y-3' : 'space-y-4'}`}>
          {/* 경로 시각화 */}
          <div className='relative'>
            <div className='flex items-center space-x-4'>
              {/* 출발지 */}
              <div className='min-w-0 flex-1'>
                <div className='flex items-center space-x-2'>
                  <div className='h-3 w-3 flex-shrink-0 rounded-full bg-green-500' />
                  <div className='min-w-0 flex-1'>
                    <Typography
                      variant='caption'
                      className='font-medium text-green-600'
                    >
                      출발
                    </Typography>
                    <div title={data.fromAddress}>
                      <Typography
                        variant={compact ? 'body2' : 'body1'}
                        className='truncate font-semibold text-gray-900'
                      >
                        {data.fromAddress ||
                          (data.title ? `${data.title} 출발지` : '출발지')}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* 경로 라인과 아이콘 */}
              <div className='flex flex-shrink-0 items-center space-x-2'>
                <div className='h-px w-8 bg-gradient-to-r from-green-300 to-red-300' />
                <div
                  className={`rounded-full p-1.5 ${currentTransport?.bgColor || 'bg-blue-100'}`}
                >
                  {currentTransport?.icon || (
                    <IoArrowForwardOutline className='h-3 w-3 text-blue-500' />
                  )}
                </div>
                <div className='h-px w-8 bg-gradient-to-r from-green-300 to-red-300' />
              </div>

              {/* 도착지 */}
              <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-end space-x-2'>
                  <div className='min-w-0 flex-1 text-right'>
                    <Typography
                      variant='caption'
                      className='font-medium text-red-600'
                    >
                      도착
                    </Typography>
                    <div title={data.toAddress}>
                      <Typography
                        variant={compact ? 'body2' : 'body1'}
                        className='truncate font-semibold text-gray-900'
                      >
                        {data.toAddress ||
                          (data.title ? `${data.title} 도착지` : '도착지')}
                      </Typography>
                    </div>
                  </div>
                  <div className='h-3 w-3 flex-shrink-0 rounded-full bg-red-500' />
                </div>
              </div>
            </div>
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
