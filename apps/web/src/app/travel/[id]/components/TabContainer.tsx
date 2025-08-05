'use client';

import { useEffect, useRef } from 'react';

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

  return (
    <div className='flex-shrink-0 border-b border-gray-200 bg-white'>
      <div className='px-3 sm:px-6'>
        <div
          ref={scrollContainerRef}
          className='scrollbar-hide flex space-x-0 overflow-x-auto'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => (
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
  );
};
