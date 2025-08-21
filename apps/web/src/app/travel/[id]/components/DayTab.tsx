'use client';

import { forwardRef } from 'react';

import { useDroppable } from '@dnd-kit/core';
import { IoGridOutline } from 'react-icons/io5';

import { Typography } from '@ui/components';

import { useMobile } from '@/hooks';
import { formatCurrency } from '@/lib/currency';

import { TabItem } from '../constants';

interface DayTabProps {
  tab: TabItem;
  isSelected: boolean;
  onClick: () => void;
  isDashboard?: boolean;
}

export const DayTab = forwardRef<HTMLButtonElement, DayTabProps>(
  ({ tab, isSelected, onClick, isDashboard = false }, ref) => {
    const isMobile = useMobile();
    const { setNodeRef, isOver } = useDroppable({
      id: `day-${tab.dayNumber}`,
    });

    // ref 합성
    const combinedRef = (node: HTMLButtonElement | null) => {
      setNodeRef(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const getTabContent = () => {
      if (isDashboard) {
        // 모든 화면에서 그리드 아이콘 사용
        const DashboardIcon = IoGridOutline;
        const dashboardText = isMobile ? '대시보드' : tab.label;
        const subText = '전체 보기';

        return (
          <div className='flex h-full flex-col items-center justify-center'>
            <div className='mb-1 flex items-center justify-center'>
              <DashboardIcon className='mr-1 h-3 w-3 sm:h-4 sm:w-4' />
              <Typography
                variant='body2'
                className={`text-xs font-medium sm:text-sm ${
                  isSelected
                    ? 'text-blue-600'
                    : isOver
                      ? 'text-blue-500'
                      : 'text-gray-900'
                }`}
              >
                {dashboardText}
              </Typography>
            </div>
            <Typography variant='caption' className='text-xs text-gray-500'>
              {subText}
            </Typography>
          </div>
        );
      }

      return (
        <div className='flex h-full flex-col items-center justify-center'>
          <Typography
            variant='body2'
            className={`text-xs font-medium sm:text-sm ${
              isSelected
                ? 'text-blue-600'
                : isOver
                  ? 'text-blue-500'
                  : 'text-gray-900'
            }`}
          >
            Day {tab.dayNumber}
          </Typography>
          {tab.date && (
            <Typography variant='caption' className='text-xs text-gray-500'>
              {new Date(tab.date).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          )}
          {tab.totalCost && tab.totalCost.amount > 0 ? (
            <Typography variant='caption' className='text-xs text-gray-400'>
              {formatCurrency(
                tab.totalCost.amount,
                (tab.totalCost.currency || 'KRW') as any
              )}
            </Typography>
          ) : (
            <div className='h-3'></div> // 비용이 없을 때도 공간 확보
          )}
        </div>
      );
    };

    return (
      <button
        ref={combinedRef}
        onClick={onClick}
        className={`flex-shrink-0 border-b-2 px-2 py-3 transition-colors sm:px-4 sm:py-4 ${
          isSelected
            ? 'border-blue-500 text-blue-600'
            : isOver
              ? 'border-blue-300 bg-blue-50 text-blue-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
        style={{
          minWidth: '80px',
          maxWidth: '120px',
          height: '80px', // 고정 높이 설정
        }}
      >
        {getTabContent()}
      </button>
    );
  }
);

DayTab.displayName = 'DayTab';
