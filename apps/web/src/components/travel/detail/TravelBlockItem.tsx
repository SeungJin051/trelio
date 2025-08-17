import React, { useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IoEllipsisVerticalOutline,
  IoLocationOutline,
  IoSwapVerticalOutline,
  IoTimeOutline,
  IoWalletOutline,
} from 'react-icons/io5';

import { Typography } from '@ui/components';

import { formatCurrency } from '@/lib/currency';
import { TravelBlock } from '@/types/travel/blocks';

import ActivityCard from './activity/ActivityCard';
import BoardingPassCard from './flight/BoardingPassCard';
import FoodCard from './food/FoodCard';
import MemoCard from './memo/MemoCard';
import TransitCard from './move/TransitCard';
import {
  getBlockColor,
  getBlockIcon,
  getBlockLabel,
} from './utils/BlockPresentation';

interface TravelBlockItemProps {
  block: TravelBlock;
  canEdit: boolean;
  onClick?: (block: TravelBlock) => void;
  onEdit?: (block: TravelBlock) => void;
  onDelete?: (blockId: string) => void;
  onCopy?: (block: TravelBlock) => void;
  onShare?: (block: TravelBlock) => void;
  onBookmark?: (block: TravelBlock) => void;
  onReport?: (block: TravelBlock) => void;
}

export const TravelBlockItem: React.FC<TravelBlockItemProps> = ({
  block,
  canEdit,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // 드래그 앤 드롭 기능을 위한 useSortable 훅 사용 (드래그 핸들만 활성화)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled: !canEdit, // 편집 권한이 없으면 드래그 비활성화
  });

  // 드래그 시 적용할 스타일 계산
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardClick = () => {
    if (onClick && !isDragging) {
      onClick(block);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border bg-white transition-all duration-200 ${
        isDragging ? 'scale-105 opacity-50 shadow-2xl' : ''
      } ${
        isHovered
          ? 'border-gray-300 shadow-lg'
          : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* 드래그 핸들 (편집 가능한 경우에만 표시) */}
      {canEdit && (
        <div
          {...attributes}
          {...listeners}
          className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors ${
            isHovered
              ? 'bg-gray-100 text-gray-600'
              : 'text-gray-400 opacity-0 group-hover:opacity-100'
          } cursor-grab active:cursor-grabbing`}
          onClick={(e) => e.stopPropagation()} // 카드 클릭 이벤트 방지
        >
          <IoSwapVerticalOutline className='h-4 w-4' />
        </div>
      )}

      <div className={`p-4 ${canEdit ? 'pl-10' : ''}`}>
        {/* 헤더 영역 */}
        <div className='mb-3 flex items-start justify-between'>
          <div className='flex items-center space-x-3'>
            <div
              className={`rounded-lg border p-2 ${getBlockColor(block.blockType)}`}
            >
              {getBlockIcon(block.blockType, 'sm')}
            </div>
            <div>
              <Typography
                variant='body1'
                className='font-semibold text-gray-900'
              >
                {block.title}
              </Typography>
              <Typography variant='caption' className='text-gray-500'>
                {getBlockLabel(block.blockType)}
              </Typography>
            </div>
          </div>

          {/* 메뉴 버튼 */}
          {canEdit && (
            <button
              className={`rounded-md p-1 transition-colors ${
                isHovered
                  ? 'bg-gray-100 text-gray-600'
                  : 'text-gray-400 opacity-0 group-hover:opacity-100'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <IoEllipsisVerticalOutline className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* 설명 영역 */}
        {block.description && (
          <Typography
            variant='body2'
            className='mb-3 leading-relaxed text-gray-600'
          >
            {block.description}
          </Typography>
        )}

        {/* 타입별 프리젠테이션 */}
        {block.blockType === 'flight' && (
          <div className='mb-3'>
            <BoardingPassCard
              data={{
                title: block.title,
                flightNumber: block.meta?.flightNumber,
                departureAirport: block.meta?.departureAirport,
                arrivalAirport: block.meta?.arrivalAirport,
                seatNumber: block.meta?.seatNumber,
                startTime: block.timeRange?.startTime,
                endTime: block.timeRange?.endTime,
              }}
              compact
            />
          </div>
        )}

        {/* 타입별 프리젠테이션 */}
        {block.blockType === 'move' && (
          <div className='mb-3'>
            <TransitCard
              data={{
                title: block.title,
                transportType: block.meta?.transportType,
                fromAddress: block.meta?.fromLocation?.address,
                toAddress: block.meta?.toLocation?.address,
                startTime: block.timeRange?.startTime,
                endTime: block.timeRange?.endTime,
              }}
              compact
            />
          </div>
        )}
        {block.blockType === 'food' && (
          <div className='mb-3'>
            <FoodCard
              data={{
                title: block.title,
                mealType: block.meta?.mealType,
                cuisine: block.meta?.cuisine,
                address: block.location?.address,
                startTime: block.timeRange?.startTime,
                endTime: block.timeRange?.endTime,
              }}
              compact
            />
          </div>
        )}
        {block.blockType === 'activity' && (
          <div className='mb-3'>
            <ActivityCard
              data={{
                title: block.title,
                activityType: block.meta?.activityType,
                reservationRequired: block.meta?.reservationRequired,
                address: block.location?.address,
                startTime: block.timeRange?.startTime,
                endTime: block.timeRange?.endTime,
              }}
              compact
            />
          </div>
        )}
        {block.blockType === 'memo' && (
          <div className='mb-3'>
            <MemoCard
              data={{
                title: block.title,
                description: block.description,
              }}
              compact
            />
          </div>
        )}

        {/* 메타데이터 영역 */}
        <div className='space-y-2'>
          {/* 시간 정보 */}
          {block.timeRange?.startTime && (
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
              <IoTimeOutline className='h-4 w-4 text-gray-400' />
              <span className='font-medium'>
                {block.timeRange.startTime}
                {block.timeRange.endTime && ` - ${block.timeRange.endTime}`}
              </span>
            </div>
          )}

          {/* 위치 정보 */}
          {block.location && (
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
              <IoLocationOutline className='h-4 w-4 text-gray-400' />
              <span className='truncate'>{block.location.address}</span>
            </div>
          )}

          {/* 비용 정보 */}
          {block.cost && block.cost.amount !== undefined && (
            <div className='flex items-center space-x-2 text-sm'>
              <IoWalletOutline className='h-4 w-4 text-gray-400' />
              <span className='font-semibold text-gray-700'>
                {formatCurrency(block.cost.amount, block.cost.currency)}
              </span>
            </div>
          )}
        </div>
        <div className='mt-3 border-t border-gray-100 pt-3' />
      </div>
    </div>
  );
};
