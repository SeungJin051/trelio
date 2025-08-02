import React, { useEffect, useRef, useState } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IoAirplaneOutline,
  IoBedOutline,
  IoBookmarkOutline,
  IoCarOutline,
  IoCopyOutline,
  IoDocumentTextOutline,
  IoEllipsisVerticalOutline,
  IoFlagOutline,
  IoGameControllerOutline,
  IoLocationOutline,
  IoPencilOutline,
  IoRestaurantOutline,
  IoShareOutline,
  IoSwapVerticalOutline,
  IoTimeOutline,
  IoTrashOutline,
  IoWalletOutline,
} from 'react-icons/io5';

import { Typography } from '@ui/components';

import { formatCurrency } from '@/lib/currency';
import { BlockType, TravelBlock } from '@/types/travel/blocks';

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

// 블록 타입별 아이콘 매핑 함수
const getBlockIcon = (blockType: BlockType) => {
  const iconMap = {
    flight: <IoAirplaneOutline className='h-5 w-5' />,
    move: <IoCarOutline className='h-5 w-5' />,
    food: <IoRestaurantOutline className='h-5 w-5' />,
    hotel: <IoBedOutline className='h-5 w-5' />,
    activity: <IoGameControllerOutline className='h-5 w-5' />,
    memo: <IoDocumentTextOutline className='h-5 w-5' />,
  };
  return iconMap[blockType] || <IoDocumentTextOutline className='h-5 w-5' />;
};

// 블록 타입별 색상 매핑 함수
const getBlockColor = (blockType: BlockType) => {
  const colorMap = {
    flight: 'text-sky-500 bg-sky-50 border-sky-200',
    move: 'text-blue-500 bg-blue-50 border-blue-200',
    food: 'text-orange-500 bg-orange-50 border-orange-200',
    hotel: 'text-purple-500 bg-purple-50 border-purple-200',
    activity: 'text-green-500 bg-green-50 border-green-200',
    memo: 'text-gray-500 bg-gray-50 border-gray-200',
  };
  return colorMap[blockType] || 'text-gray-500 bg-gray-50 border-gray-200';
};

// 블록 타입별 라벨 매핑 함수
const getBlockLabel = (blockType: BlockType) => {
  const labelMap = {
    flight: '항공',
    move: '이동',
    food: '식사',
    hotel: '숙소',
    activity: '액티비티',
    memo: '메모',
  };
  return labelMap[blockType] || '기타';
};

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
              {getBlockIcon(block.blockType)}
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
          {block.cost?.amount && (
            <div className='flex items-center space-x-2 text-sm'>
              <IoWalletOutline className='h-4 w-4 text-gray-400' />
              <span className='font-semibold text-gray-700'>
                {formatCurrency(block.cost.amount, block.cost.currency)}
              </span>
            </div>
          )}
        </div>

        {/* 블록 타입별 추가 정보 */}
        {block.meta && (
          <div className='mt-3 border-t border-gray-100 pt-3'>
            {block.meta.transportType && (
              <div className='flex items-center space-x-2 text-xs text-gray-500'>
                <span className='font-medium'>교통수단:</span>
                <span>{block.meta.transportType}</span>
              </div>
            )}
            {block.meta.mealType && (
              <div className='flex items-center space-x-2 text-xs text-gray-500'>
                <span className='font-medium'>식사:</span>
                <span>{block.meta.mealType}</span>
              </div>
            )}
            {block.meta.activityType && (
              <div className='flex items-center space-x-2 text-xs text-gray-500'>
                <span className='font-medium'>종류:</span>
                <span>{block.meta.activityType}</span>
              </div>
            )}
            {block.meta.roomType && (
              <div className='flex items-center space-x-2 text-xs text-gray-500'>
                <span className='font-medium'>객실:</span>
                <span>{block.meta.roomType}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
