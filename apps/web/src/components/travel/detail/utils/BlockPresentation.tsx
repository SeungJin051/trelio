import React from 'react';

import {
  IoAirplaneOutline,
  IoBedOutline,
  IoCarOutline,
  IoDocumentTextOutline,
  IoGameControllerOutline,
  IoRestaurantOutline,
} from 'react-icons/io5';

import { BlockType } from '@/types/travel/blocks';

export const getBlockIcon = (
  blockType: BlockType,
  size: 'sm' | 'md' = 'md'
): React.ReactNode => {
  const sizeClass = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  const iconMap: Record<BlockType, React.ReactNode> = {
    flight: <IoAirplaneOutline className={sizeClass} />,
    move: <IoCarOutline className={sizeClass} />,
    food: <IoRestaurantOutline className={sizeClass} />,
    hotel: <IoBedOutline className={sizeClass} />,
    activity: <IoGameControllerOutline className={sizeClass} />,
    memo: <IoDocumentTextOutline className={sizeClass} />,
  };
  return iconMap[blockType] ?? <IoDocumentTextOutline className={sizeClass} />;
};

export const getBlockColor = (blockType: BlockType): string => {
  const colorMap: Record<BlockType, string> = {
    flight: 'text-sky-500 bg-sky-50 border-sky-200',
    move: 'text-blue-500 bg-blue-50 border-blue-200',
    food: 'text-orange-500 bg-orange-50 border-orange-200',
    hotel: 'text-purple-500 bg-purple-50 border-purple-200',
    activity: 'text-green-500 bg-green-50 border-green-200',
    memo: 'text-gray-500 bg-gray-50 border-gray-200',
  };
  return colorMap[blockType] ?? 'text-gray-500 bg-gray-50 border-gray-200';
};

export const getBlockLabel = (blockType: BlockType): string => {
  const labelMap: Record<BlockType, string> = {
    flight: '항공',
    move: '이동',
    food: '식사',
    hotel: '숙소',
    activity: '액티비티',
    memo: '메모',
  };
  return labelMap[blockType] ?? '기타';
};
