'use client';

import { useRouter } from 'next/navigation';

import {
  IoArrowBack,
  IoCalendarOutline,
  IoLocationOutline,
  IoPeopleOutline,
} from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

import { useTravelParticipants } from '@/hooks/useTravelDetail';

interface TravelHeaderProps {
  planId: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  participantsCount: number;
  dDay?: string | null;
}

export const TravelHeader: React.FC<TravelHeaderProps> = ({
  planId,
  title,
  location,
  startDate,
  endDate,
  dDay,
}) => {
  const router = useRouter();
  const { data: participants = [] } = useTravelParticipants(planId);

  return (
    <div className='flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='ghost'
            size='small'
            onClick={() => router.push('/')}
            className='p-2'
          >
            <IoArrowBack className='h-5 w-5' />
          </Button>
          <div>
            <div className='mb-1 flex items-center space-x-3'>
              <Typography variant='h3' className='text-gray-900'>
                {title}
              </Typography>
              {dDay && (
                <div className='rounded-full bg-blue-50 px-3 py-1 text-blue-600'>
                  <Typography variant='caption' className='font-semibold'>
                    {dDay}
                  </Typography>
                </div>
              )}
            </div>
            <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
              <div className='flex min-w-0 items-center text-gray-600'>
                <IoLocationOutline className='mr-1 h-3 w-3 shrink-0 sm:h-4 sm:w-4' />
                <Typography variant='caption' className='truncate'>
                  {location}
                </Typography>
              </div>
              <div className='flex min-w-0 items-center text-gray-600'>
                <IoCalendarOutline className='mr-1 h-3 w-3 shrink-0 sm:h-4 sm:w-4' />
                <Typography variant='caption' className='truncate'>
                  {new Date(startDate).toLocaleDateString()} -{' '}
                  {new Date(endDate).toLocaleDateString()}
                </Typography>
              </div>
              <div className='flex items-center text-gray-600'>
                <IoPeopleOutline className='mr-1 h-3 w-3 shrink-0 sm:h-4 sm:w-4' />
                <Typography variant='caption'>
                  {participants.length}명
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
