'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { IoCalendarOutline, IoPeopleOutline } from 'react-icons/io5';

import { Typography } from '@ui/components';

import { useToast } from '@/hooks/useToast';
import {
  useInvitationActions,
  usePendingInvitations,
} from '@/hooks/useTravelPlans';

const InvitedTravelWidget: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { data: invitations = [], isLoading } = usePendingInvitations(5);
  const { acceptInvitation, declineInvitation, accepting, declining } =
    useInvitationActions();

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

      {invitations.length === 0 ? (
        <div className='py-8 text-center'>
          <div className='mb-2 text-4xl'>🗺️</div>
          <Typography variant='body2' className='mb-1 text-gray-500'>
            초대받은 여행이 없습니다
          </Typography>
          <Typography variant='caption' className='text-gray-400'>
            초대 링크를 받거나 공유된 여행에 참여해 보세요
          </Typography>
        </div>
      ) : (
        <div className='space-y-3'>
          {invitations.map((inv) => (
            <button
              key={inv.id}
              onClick={() => router.push(`/travel/${inv.plan.id}`)}
              className='flex w-full items-start space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50'
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600'>
                <IoPeopleOutline className='h-4 w-4' />
              </div>
              <div className='min-w-0 flex-1'>
                <Typography variant='body2' className='mb-1 text-gray-900'>
                  <span className='font-medium'>
                    &lsquo;{inv.plan.title}&rsquo;
                  </span>{' '}
                  여행에 초대가 왔습니다. 수락하시겠습니까?
                </Typography>
                <div className='flex items-center gap-3 text-gray-500'>
                  <span className='inline-flex items-center gap-1'>
                    <IoCalendarOutline className='h-3.5 w-3.5' />
                    <Typography variant='caption'>
                      {new Date(inv.plan.start_date).toLocaleDateString(
                        'ko-KR',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      )}{' '}
                      –{' '}
                      {new Date(inv.plan.end_date).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  </span>
                </div>
                <div className='mt-3 flex items-center gap-2'>
                  <button
                    className='rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
                    disabled={accepting || declining}
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        await acceptInvitation(inv.id);
                        toast.success('초대를 수락했어요');
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : '수락에 실패했어요'
                        );
                      }
                    }}
                  >
                    예
                  </button>
                  <button
                    className='rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                    disabled={accepting || declining}
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        await declineInvitation(inv.id);
                        toast('초대를 거절했어요');
                      } catch (error) {
                        toast.error('거절에 실패했어요');
                      }
                    }}
                  >
                    아니요
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvitedTravelWidget;
