import React from 'react';

// DnD 컨텍스트는 상위(view.tsx)에서 제공
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  IoAddOutline,
  IoAirplaneOutline,
  IoBedOutline,
  IoCarOutline,
  IoDocumentTextOutline,
  IoGameControllerOutline,
  IoRestaurantOutline,
} from 'react-icons/io5';

import { Typography } from '@ui/components';

// DnD 컨텍스트는 상위에서 제공됩니다.

import { BlockType, TravelBlock, TravelTimeline } from '@/types/travel/blocks';

import { TravelBlockItem } from './TravelBlockItem';

interface TravelTimelineCanvasProps {
  timeline: TravelTimeline;
  canEdit: boolean;
  selectedDay: number;
  onDaySelect: (_dayNumber: number) => void;
  onBlockCreate: (_dayNumber: number) => void;
  onBlockMove?: (
    blockId: string,
    newDayNumber: number,
    newOrderIndex: number
  ) => void;
  onBlockClick?: (block: TravelBlock) => void;
}

export const TravelTimelineCanvas: React.FC<TravelTimelineCanvasProps> = ({
  timeline,
  canEdit,
  selectedDay,
  onDaySelect: _onDaySelect,
  onBlockCreate: _onBlockCreate,
  onBlockMove,
  onBlockClick,
}) => {
  // 선택된 날짜의 블록 데이터 추출
  const selectedDayData = timeline.days.find(
    (day) => day.dayNumber === selectedDay
  );

  // 선택된 날짜 데이터가 없는 경우 빈 상태 표시
  if (!selectedDayData) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <Typography variant='body2' className='text-gray-500'>
          선택된 날짜의 데이터가 없습니다.
        </Typography>
      </div>
    );
  }

  return (
    <div className='h-full overflow-auto bg-gray-50'>
      <div className='mx-auto min-h-full max-w-4xl p-6'>
        {/* 선택된 날짜에 블록이 없는 경우 빈 상태 표시 */}
        {selectedDayData.blocks.length === 0 ? (
          <div className='flex h-full min-h-[60vh] items-center justify-center'>
            <div className='text-center'>
              <div className='mb-6'>
                <IoDocumentTextOutline className='mx-auto h-20 w-20 text-gray-300' />
              </div>
              <Typography variant='h5' className='mb-3 text-gray-400'>
                Day {selectedDay}에 일정이 없습니다
              </Typography>
              <Typography
                variant='body2'
                className='mb-8 max-w-md text-gray-500'
              >
                하단의{' '}
                <span className='mx-1 inline-flex items-center rounded-full bg-blue-100 px-1 py-1 text-xs text-blue-600'>
                  <IoAddOutline className='h-3 w-3' />
                </span>{' '}
                버튼을 눌러 첫 번째 일정을 추가해보세요!
              </Typography>
            </div>
          </div>
        ) : (
          /* 블록 목록 렌더링 (드래그 앤 드롭 가능) */
          <SortableContext
            items={selectedDayData.blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-4 pb-20'>
              {selectedDayData.blocks.map((block) => (
                <TravelBlockItem
                  key={block.id}
                  block={block}
                  canEdit={canEdit}
                  onClick={onBlockClick}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
};
