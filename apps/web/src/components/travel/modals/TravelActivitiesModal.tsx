'use client';

import React from 'react';

import { IoTimeOutline } from 'react-icons/io5';

import { Avatar, Typography } from '@ui/components';

import { Modal } from '@/components/basic';

interface ActivityItem {
  id: string;
  type:
    | 'block_add'
    | 'block_edit'
    | 'block_delete'
    | 'block_move'
    | 'comment'
    | 'participant_join';
  user: {
    id: string;
    nickname: string;
    profile_image_url?: string;
  };
  content: string;
  timestamp: string;
  blockId?: string;
  blockTitle?: string;
}

interface TravelActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
  travelTitle: string;
  onBlockClick?: (blockId: string) => void;
}

const TravelActivitiesModal: React.FC<TravelActivitiesModalProps> = ({
  isOpen,
  onClose,
  activities,
  travelTitle,
  onBlockClick,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${travelTitle} - 전체 활동 내역`}
      width='responsive'
    >
      <div className='flex flex-col'>
        <div className='max-h-[70vh] overflow-y-auto py-6'>
          {activities.length === 0 ? (
            <div className='py-12 text-center'>
              <Typography variant='body1' className='text-gray-500'>
                아직 활동 내역이 없습니다.
              </Typography>
            </div>
          ) : (
            <div className='space-y-4'>
              {activities.map((activity: ActivityItem) => (
                <div
                  key={activity.id}
                  className={`rounded-lg border border-gray-200 p-4 transition-all duration-200 ${
                    activity.blockId
                      ? 'cursor-pointer hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
                      : 'hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => {
                    if (activity.blockId && onBlockClick) {
                      onBlockClick(activity.blockId);
                      onClose(); // 모달 닫기
                    }
                  }}
                >
                  <div className='flex items-start space-x-4'>
                    <Avatar
                      src={activity.user.profile_image_url}
                      alt={activity.user.nickname}
                      size='medium'
                    />
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center space-x-2'>
                        <Typography
                          variant='body1'
                          className='font-semibold text-gray-900'
                        >
                          {activity.user.nickname}
                        </Typography>
                        <div className='flex items-center space-x-1'>
                          <IoTimeOutline className='h-3 w-3 text-gray-400' />
                          <Typography
                            variant='caption'
                            className='text-gray-400'
                          >
                            {new Date(activity.timestamp).toLocaleString(
                              'ko-KR',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </Typography>
                        </div>
                      </div>
                      <Typography variant='body2' className='text-gray-700'>
                        {activity.content}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TravelActivitiesModal;
