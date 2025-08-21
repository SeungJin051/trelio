'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';

import { useMobile } from '@/hooks';

import { TabItem } from '../constants';
import { DayTab } from './DayTab';

interface TabContainerProps {
  tabs: TabItem[];
  selectedDay: number;
  onDaySelect: (dayNumber: number) => void;
}

export const TabContainer: React.FC<TabContainerProps> = ({
  tabs,
  selectedDay,
  onDaySelect,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedTabRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMobile();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 탭 순서 정렬 (대시보드를 가장 왼쪽에)
  const reorderedTabs = useMemo(() => {
    const dashboardTab = tabs.find((tab) => tab.type === 'dashboard');
    const dayTabs = tabs.filter((tab) => tab.type !== 'dashboard');

    return [...(dashboardTab ? [dashboardTab] : []), ...dayTabs];
  }, [tabs]);

  // 스크롤 가능 여부 체크
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      setCanScrollLeft(scrollLeft > 5); // 약간의 여유값 추가
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // 약간의 여유값 추가
    }
  };

  // 스크롤 이벤트 핸들러
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll =
        direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  // 선택된 탭이 변경될 때 해당 탭으로 스크롤
  useEffect(() => {
    if (selectedTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selectedTab = selectedTabRef.current;

      const containerRect = container.getBoundingClientRect();
      const tabRect = selectedTab.getBoundingClientRect();

      const scrollLeft =
        selectedTab.offsetLeft -
        container.offsetLeft -
        containerRect.width / 2 +
        tabRect.width / 2;

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth',
      });
    }
  }, [selectedDay]);

  // 스크롤 상태 업데이트
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // 초기 체크
      setTimeout(checkScrollButtons, 100);

      // 이벤트 리스너 등록
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);

      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [reorderedTabs]);

  // 탭이 변경될 때마다 스크롤 상태 재체크
  useEffect(() => {
    setTimeout(checkScrollButtons, 100);
  }, [reorderedTabs]);

  return (
    <div className='flex-shrink-0 border-b border-gray-200 bg-white'>
      <div className='relative'>
        {/* 좌측 스크롤 버튼 */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className='absolute left-0 top-0 z-20 flex h-full w-12 items-center justify-center bg-gradient-to-r from-white via-white/80 to-transparent shadow-sm transition-all hover:from-gray-50 hover:shadow-md'
          >
            <IoChevronBackOutline className='h-5 w-5 text-gray-700 transition-colors hover:text-gray-900' />
          </button>
        )}

        {/* 우측 스크롤 버튼 */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className='absolute right-0 top-0 z-20 flex h-full w-12 items-center justify-center bg-gradient-to-l from-white via-white/80 to-transparent shadow-sm transition-all hover:from-gray-50 hover:shadow-md'
          >
            <IoChevronForwardOutline className='h-5 w-5 text-gray-700 transition-colors hover:text-gray-900' />
          </button>
        )}

        <div className='px-3 sm:px-6'>
          <div
            ref={scrollContainerRef}
            className='scrollbar-hide flex space-x-0 overflow-x-auto'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingLeft: canScrollLeft ? '12px' : '0',
              paddingRight: canScrollRight ? '12px' : '0',
            }}
          >
            {reorderedTabs.map((tab) => (
              <div key={tab.id}>
                <DayTab
                  tab={tab}
                  isSelected={selectedDay === tab.dayNumber}
                  onClick={() => onDaySelect(tab.dayNumber)}
                  isDashboard={tab.type === 'dashboard'}
                  ref={selectedDay === tab.dayNumber ? selectedTabRef : null}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
