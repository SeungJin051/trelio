import React from 'react';

import { createPortal } from 'react-dom';
import {
  IoCloseOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoWalletOutline,
} from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

import { formatCurrency } from '@/lib/currency';
import { TravelBlock } from '@/types/travel/blocks';

import BoardingPassCard from './flight/BoardingPassCard';
import TransitCard from './move/TransitCard';
import {
  getBlockColor,
  getBlockIcon,
  getBlockLabel,
} from './utils/BlockPresentation';

interface BlockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: TravelBlock | null;
  onEdit?: (block: TravelBlock) => void;
  onDelete?: (blockId: string) => void;
  canEdit?: boolean;
}

// 프리젠테이션 유틸은 import로 대체

export const BlockDetailModal: React.FC<BlockDetailModalProps> = ({
  isOpen,
  onClose,
  block,
  onEdit,
  onDelete,
  canEdit = false,
}) => {
  if (!isOpen || !block) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(block);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      onDelete(block.id);
      onClose();
    }
  };

  const modalContent = (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm'>
      <div className='mx-4 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-2xl'>
        {/* 헤더 */}
        <div className='flex items-center justify-between border-b border-gray-100 p-6'>
          <div className='flex items-center space-x-3'>
            <div
              className={`rounded-lg border p-3 ${getBlockColor(block.blockType)}`}
            >
              {getBlockIcon(block.blockType)}
            </div>
            <div>
              <Typography variant='h4' className='text-gray-900'>
                {block.title}
              </Typography>
              <Typography variant='body2' className='text-gray-500'>
                {getBlockLabel(block.blockType)}
              </Typography>
            </div>
          </div>
          <button
            onClick={onClose}
            className='rounded-xl p-2 transition-colors hover:bg-gray-100'
          >
            <IoCloseOutline className='h-5 w-5 text-gray-500' />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className='space-y-6 p-6'>
          {block.blockType === 'flight' && (
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
            />
          )}
          {block.blockType === 'move' && (
            <TransitCard
              data={{
                title: block.title,
                transportType: block.meta?.transportType,
                fromAddress: block.meta?.fromLocation?.address,
                toAddress: block.meta?.toLocation?.address,
                startTime: block.timeRange?.startTime,
                endTime: block.timeRange?.endTime,
              }}
            />
          )}
          {/* food, activity 타입 카드 중첩 노출 제거 */}
          {/* 설명 */}
          {block.description && (
            <div>
              <Typography
                variant='body1'
                className='mb-2 font-semibold text-gray-800'
              >
                설명
              </Typography>
              <Typography
                variant='body2'
                className='leading-relaxed text-gray-600'
              >
                {block.description}
              </Typography>
            </div>
          )}

          {/* 기본 정보 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* 시간 정보 */}
            {block.timeRange?.startTime && (
              <div className='flex items-center space-x-3 rounded-xl bg-gray-50 p-4'>
                <IoTimeOutline className='h-5 w-5 text-gray-400' />
                <div>
                  <Typography
                    variant='body2'
                    className='font-medium text-gray-800'
                  >
                    시간
                  </Typography>
                  <Typography variant='body2' className='text-gray-600'>
                    {block.timeRange.startTime}
                    {block.timeRange.endTime && ` - ${block.timeRange.endTime}`}
                  </Typography>
                </div>
              </div>
            )}

            {/* 위치 정보 */}
            {block.location && (
              <div className='flex items-center space-x-3 rounded-xl bg-gray-50 p-4'>
                <IoLocationOutline className='h-5 w-5 text-gray-400' />
                <div>
                  <Typography
                    variant='body2'
                    className='font-medium text-gray-800'
                  >
                    위치
                  </Typography>
                  <Typography variant='body2' className='text-gray-600'>
                    {block.location.address}
                  </Typography>
                </div>
              </div>
            )}

            {/* 비용 정보 */}
            {block.cost && block.cost.amount !== undefined && (
              <div className='flex items-center space-x-3 rounded-xl bg-gray-50 p-4'>
                <IoWalletOutline className='h-5 w-5 text-gray-400' />
                <div>
                  <Typography
                    variant='body2'
                    className='font-medium text-gray-800'
                  >
                    비용
                  </Typography>
                  <Typography variant='body2' className='text-gray-600'>
                    {formatCurrency(block.cost.amount, block.cost.currency)}
                  </Typography>
                </div>
              </div>
            )}
          </div>

          {/* 블록 타입별 상세 정보 */}
          {block.meta && (
            <div className='space-y-4'>
              <Typography
                variant='body1'
                className='font-semibold text-gray-800'
              >
                상세 정보
              </Typography>

              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                {/* 교통수단 */}
                {block.meta.transportType && (
                  <div className='rounded-lg bg-blue-50 p-3'>
                    <Typography
                      variant='body2'
                      className='font-medium text-blue-800'
                    >
                      교통수단
                    </Typography>
                    <Typography variant='body2' className='text-blue-600'>
                      {block.meta.transportType}
                    </Typography>
                  </div>
                )}

                {/* 출발지 */}
                {block.meta.fromLocation && (
                  <div className='rounded-lg bg-blue-50 p-3'>
                    <Typography
                      variant='body2'
                      className='font-medium text-blue-800'
                    >
                      출발지
                    </Typography>
                    <Typography variant='body2' className='text-blue-600'>
                      {block.meta.fromLocation.address}
                    </Typography>
                  </div>
                )}

                {/* 도착지 */}
                {block.meta.toLocation && (
                  <div className='rounded-lg bg-blue-50 p-3'>
                    <Typography
                      variant='body2'
                      className='font-medium text-blue-800'
                    >
                      도착지
                    </Typography>
                    <Typography variant='body2' className='text-blue-600'>
                      {block.meta.toLocation.address}
                    </Typography>
                  </div>
                )}

                {/* 식사 종류 */}
                {block.meta.mealType && (
                  <div className='rounded-lg bg-orange-50 p-3'>
                    <Typography
                      variant='body2'
                      className='font-medium text-orange-800'
                    >
                      식사 종류
                    </Typography>
                    <Typography variant='body2' className='text-orange-600'>
                      {block.meta.mealType}
                    </Typography>
                  </div>
                )}

                {/* 요리 종류 */}
                {block.meta.cuisine && (
                  <div className='rounded-lg bg-orange-50 p-3'>
                    <Typography
                      variant='body2'
                      className='font-medium text-orange-800'
                    >
                      요리 종류
                    </Typography>
                    <Typography variant='body2' className='text-orange-600'>
                      {block.meta.cuisine}
                    </Typography>
                  </div>
                )}

                {/* 액티비티 종류 */}
                {block.meta.activityType && (
                  <div className='rounded-lg bg-green-50 p-3'>
                    <Typography
                      variant='body2'
                      className='font-medium text-green-800'
                    >
                      액티비티 종류
                    </Typography>
                    <Typography variant='body2' className='text-green-600'>
                      {block.meta.activityType}
                    </Typography>
                  </div>
                )}

                {/* 객실 타입 */}
                {block.meta.roomType && (
                  <div className='rounded-lg bg-purple-50 p-3'>
                    <Typography
                      variant='body2'
                      className='font-medium text-purple-800'
                    >
                      객실 타입
                    </Typography>
                    <Typography variant='body2' className='text-purple-600'>
                      {block.meta.roomType}
                    </Typography>
                  </div>
                )}

                {/* 체크인 */}
                {block.meta.checkIn && (
                  <div className='rounded-lg bg-purple-50 p-3'>
                    <Typography
                      variant='body2'
                      className='font-medium text-purple-800'
                    >
                      체크인
                    </Typography>
                    <Typography variant='body2' className='text-purple-600'>
                      {block.meta.checkIn}
                    </Typography>
                  </div>
                )}

                {/* 체크아웃 */}
                {block.meta.checkOut && (
                  <div className='rounded-lg bg-purple-50 p-3'>
                    <Typography
                      variant='body2'
                      className='font-medium text-purple-800'
                    >
                      체크아웃
                    </Typography>
                    <Typography variant='body2' className='text-purple-600'>
                      {block.meta.checkOut}
                    </Typography>
                  </div>
                )}

                {/* 예약 필요 */}
                {block.meta.reservationRequired !== undefined && (
                  <div className='rounded-lg bg-green-50 p-3'>
                    <Typography
                      variant='body2'
                      className='font-medium text-green-800'
                    >
                      예약 필요
                    </Typography>
                    <Typography variant='body2' className='text-green-600'>
                      {block.meta.reservationRequired ? '예' : '아니오'}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 시스템 정보 */}
          <div className='border-t border-gray-100 pt-4'>
            <Typography variant='caption' className='text-gray-500'>
              생성일: {new Date(block.createdAt).toLocaleDateString('ko-KR')}
            </Typography>
            {block.updatedAt !== block.createdAt && (
              <Typography variant='caption' className='block text-gray-500'>
                수정일: {new Date(block.updatedAt).toLocaleDateString('ko-KR')}
              </Typography>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        {canEdit && (
          <div className='flex space-x-3 border-t border-gray-100 p-6'>
            <Button
              type='button'
              variant='outlined'
              size='medium'
              onClick={onClose}
              className='flex-1 rounded-xl'
            >
              닫기
            </Button>
            <Button
              type='button'
              variant='filled'
              size='medium'
              onClick={handleEdit}
              className='flex-1 rounded-xl'
            >
              수정
            </Button>
            <Button
              type='button'
              variant='outlined'
              size='medium'
              onClick={handleDelete}
              className='flex-1 rounded-xl border-red-600 text-red-600 hover:bg-red-50'
            >
              삭제
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};
