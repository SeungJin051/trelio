import React from 'react';

import { IoAirplaneOutline } from 'react-icons/io5';

import { Typography } from '@ui/components';

import { getBlockLabel } from '../utils/BlockPresentation';

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
  return (
    <div className='relative overflow-hidden rounded-2xl border border-sky-200/60 shadow-md shadow-sky-100/20'>
      {/* 내부 그라디언트 레이어 */}
      <div className='absolute inset-0 bg-gradient-to-br from-sky-50 to-white' />

      {/* 배경 패턴 */}
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute right-4 top-4 text-6xl text-sky-500'>
          <IoAirplaneOutline className='rotate-45' />
        </div>
      </div>

      <div className={`relative ${compact ? 'p-4' : 'p-5'}`}>
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
          className={`mt-4 grid items-center ${compact ? 'gap-3' : 'gap-4'} grid-cols-5`}
        >
          <div className='col-span-2'>
            <Typography variant='caption' className='font-medium text-sky-600'>
              FROM
            </Typography>
            <div className='mt-1'>
              <Typography
                variant={compact ? 'body1' : 'h6'}
                className='font-bold tracking-wide text-gray-900'
              >
                {data.departureAirport || '출발공항'}
              </Typography>
            </div>
          </div>

          <div className='flex flex-col items-center justify-center'>
            <IoAirplaneOutline className='mb-1 h-5 w-5 text-sky-500' />
          </div>

          <div className='col-span-2 text-right'>
            <Typography variant='caption' className='font-medium text-sky-600'>
              TO
            </Typography>
            <div className='mt-1'>
              <Typography
                variant={compact ? 'body1' : 'h6'}
                className='font-bold tracking-wide text-gray-900'
              >
                {data.arrivalAirport || '도착공항'}
              </Typography>
            </div>
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
      </div>

      <div className='relative bg-gradient-to-r from-sky-100 to-sky-50 px-4 py-3'>
        {/* 점선 구분 */}
        <div className='absolute left-0 right-0 top-0 border-t-2 border-dashed border-sky-200/40' />
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Typography
              variant='caption'
              className='font-semibold tracking-wider text-sky-700'
            >
              BOARDING PASS
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardingPassCard;
