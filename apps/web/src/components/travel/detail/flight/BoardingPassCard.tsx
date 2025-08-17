import React from 'react';

import { Typography } from '@ui/components';

import { getBlockColor, getBlockLabel } from '../utils/BlockPresentation';

interface FlightCardData {
  title: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  seatNumber?: string;
  startTime?: string;
  endTime?: string;
}

interface BoardingPassCardProps {
  data: FlightCardData;
  compact?: boolean;
}

export const BoardingPassCard: React.FC<BoardingPassCardProps> = ({
  data,
  compact = false,
}) => {
  const color = getBlockColor('flight');
  return (
    <div className={`overflow-hidden rounded-xl border ${color}`}>
      <div className={`${compact ? 'p-3' : 'p-4'} bg-white`}>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-2'>
            <span className='rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700'>
              {getBlockLabel('flight')}
            </span>
            {data.flightNumber && (
              <Typography
                variant={compact ? 'caption' : 'body2'}
                className='text-sky-700'
              >
                {data.flightNumber}
              </Typography>
            )}
          </div>
          {data.seatNumber && (
            <div className='text-right'>
              <Typography variant='caption' className='text-gray-500'>
                좌석
              </Typography>
              <Typography
                variant={compact ? 'body2' : 'body1'}
                className='font-semibold text-gray-800'
              >
                {data.seatNumber}
              </Typography>
            </div>
          )}
        </div>

        <div
          className={`mt-3 grid items-center ${compact ? 'gap-3' : 'gap-4'} grid-cols-5`}
        >
          <div className='col-span-2'>
            <Typography variant='caption' className='text-gray-500'>
              출발
            </Typography>
            <Typography
              variant={compact ? 'body2' : 'body1'}
              className='truncate font-semibold text-gray-900'
            >
              {data.departureAirport ?? '-'}
            </Typography>
          </div>
          <div className='flex items-center justify-center'>
            <div className='h-px w-full max-w-[60px] bg-sky-300' />
          </div>
          <div className='col-span-2 text-right'>
            <Typography variant='caption' className='text-gray-500'>
              도착
            </Typography>
            <Typography
              variant={compact ? 'body2' : 'body1'}
              className='truncate font-semibold text-gray-900'
            >
              {data.arrivalAirport ?? '-'}
            </Typography>
          </div>
        </div>

        {(data.startTime || data.endTime) && (
          <div className='mt-3 flex items-center justify-between'>
            <Typography variant='caption' className='text-gray-500'>
              시간
            </Typography>
            <Typography
              variant={compact ? 'caption' : 'body2'}
              className='text-gray-700'
            >
              {data.startTime}
              {data.endTime ? ` - ${data.endTime}` : ''}
            </Typography>
          </div>
        )}

        {!compact && (
          <div className='mt-3'>
            <Typography variant='body2' className='font-medium text-gray-800'>
              {data.title}
            </Typography>
          </div>
        )}
      </div>
      <div className='bg-sky-50 px-4 py-2 text-center text-xs text-sky-700'>
        Boarding Pass
      </div>
    </div>
  );
};

export default BoardingPassCard;
