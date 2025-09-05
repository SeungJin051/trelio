import React, { useState } from 'react';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
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

// 블록 타입별 아이콘 매핑 함수
const getBlockIcon = (blockType: BlockType) => {
  const iconMap = {
    flight: <IoAirplaneOutline className='h-4 w-4' />,
    move: <IoCarOutline className='h-4 w-4' />,
    food: <IoRestaurantOutline className='h-4 w-4' />,
    hotel: <IoBedOutline className='h-4 w-4' />,
    activity: <IoGameControllerOutline className='h-4 w-4' />,
    memo: <IoDocumentTextOutline className='h-4 w-4' />,
  };
  return iconMap[blockType] || <IoDocumentTextOutline className='h-4 w-4' />;
};

export const TravelTimelineCanvas: React.FC<TravelTimelineCanvasProps> = ({
  timeline,
  canEdit,
  selectedDay,
  onDaySelect: _onDaySelect,
  onBlockCreate: _onBlockCreate,
  onBlockMove,
  onBlockClick,
}) => {
  // 드래그 중인 블록 상태 관리
  const [activeBlock, setActiveBlock] = useState<TravelBlock | null>(null);

  // 드래그 앤 드롭 센서 설정 (포인터 기반, 최소 드래그 거리 8px)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  // 드래그 시작 시 호출되는 함수
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // 드래그 중인 블록 정보 찾기
    const block = selectedDayData.blocks.find(
      (block) => block.id === active.id
    );

    if (block) {
      setActiveBlock(block);
    }
  };

  // 드래그 종료 시 호출되는 함수
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);

    if (!over || !canEdit) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 같은 블록을 드래그한 경우 무시
    if (activeId === overId) return;

    // 드래그한 블록 찾기
    const draggedBlock = selectedDayData.blocks.find(
      (block) => block.id === activeId
    );

    if (!draggedBlock) return;

    // 드롭된 위치의 블록 찾기
    const droppedBlock = selectedDayData.blocks.find(
      (block) => block.id === overId
    );

    if (droppedBlock) {
      // 같은 날짜 내에서 순서 변경
      const newIndex = selectedDayData.blocks.findIndex(
        (block) => block.id === overId
      );

      // 블록 이동 실행
      if (onBlockMove) {
        onBlockMove(activeId, selectedDay, newIndex);
      }
    } else {
      // 다른 날짜로 이동하는 경우
      // overId가 "day-{dayNumber}" 형식인지 확인
      const dayMatch = overId.match(/^day-(\d+)$/);
      if (dayMatch) {
        const targetDayNumber = parseInt(dayMatch[1]);
        if (targetDayNumber !== selectedDay) {
          // 다른 날짜로 이동
          if (onBlockMove) {
            // 대상 날짜의 마지막 순서로 이동
            const targetDayData = timeline.days.find(
              (day) => day.dayNumber === targetDayNumber
            );
            const newOrderIndex = targetDayData?.blocks.length || 0;
            onBlockMove(activeId, targetDayNumber, newOrderIndex);
          }
        }
      }
    }
  };

  return (
    <div className='h-full overflow-auto bg-gray-50'>
      {/* 드래그 앤 드롭 컨텍스트 설정 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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

        {/* 드래그 중인 블록의 오버레이 표시 */}
        <DragOverlay>
          {activeBlock && (
            <div className='rounded-lg border border-gray-300 bg-white p-4 opacity-95 shadow-lg'>
              <div className='flex items-center space-x-3'>
                <div className='text-blue-500'>
                  {getBlockIcon(activeBlock.blockType)}
                </div>
                <Typography variant='body2' className='font-medium'>
                  {activeBlock.title}
                </Typography>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
