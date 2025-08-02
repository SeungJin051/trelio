import React, { useEffect, useState } from 'react';

import {
  IoAddOutline,
  IoCheckboxOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoLocationOutline,
  IoMapOutline,
  IoTrashOutline,
  IoWalletOutline,
} from 'react-icons/io5';

import { Typography } from '@ui/components';

import { formatCurrency, getCurrencyFromLocation } from '@/lib/currency';
import { BlockType, TravelTimeline } from '@/types/travel/blocks';

interface TravelSidePanelProps {
  timeline: TravelTimeline;
  selectedDay: number;
  planLocation: string;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

type TabType = 'map' | 'budget' | 'checklist';

// 블록 타입을 한국어 카테고리명으로 변환하는 함수
const getCategoryLabel = (blockType: BlockType): string => {
  const categoryMap = {
    flight: '항공',
    move: '교통',
    food: '식사',
    hotel: '숙박',
    activity: '액티비티',
    memo: '기타',
  };
  return categoryMap[blockType] || '기타';
};

// 통화별 환율 정보 (실제로는 API에서 가져와야 함)
const getExchangeRate = (currency: string): number => {
  const rateMap: Record<string, number> = {
    JPY: 9.2,
    USD: 1340,
    EUR: 1450,
    CNY: 185,
    THB: 37,
  };
  return rateMap[currency] || 1;
};

export const TravelSidePanel: React.FC<TravelSidePanelProps> = ({
  timeline,
  selectedDay,
  planLocation,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // 여행지 위치에 따른 기본 통화 설정
  const planCurrency = getCurrencyFromLocation(planLocation);

  // 체크리스트 플레이스홀더 텍스트들
  const todoPlaceholders = [
    '비자 신청하기',
    '여행자 보험 가입',
    '항공권 예약 확인',
    '숙소 체크인 시간 확인',
    '현지 교통카드 구매',
    '환전하기',
    '여권 유효기간 확인',
    '국제운전면허증 발급',
    '로밍 신청하기',
    '필수 약품 준비',
  ];

  // 컴포넌트 마운트 시 랜덤 플레이스홀더 설정
  useEffect(() => {
    setPlaceholderIndex(Math.floor(Math.random() * todoPlaceholders.length));
  }, []);

  // 사이드패널 탭 설정
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'map', label: '지도', icon: <IoMapOutline className='h-4 w-4' /> },
    {
      id: 'budget',
      label: '예산',
      icon: <IoWalletOutline className='h-4 w-4' />,
    },
    {
      id: 'checklist',
      label: '체크리스트',
      icon: <IoCheckboxOutline className='h-4 w-4' />,
    },
  ];

  // 선택된 날짜의 데이터 추출
  const selectedDayData = timeline.days.find(
    (day) => day.dayNumber === selectedDay
  );
  // 선택된 날짜의 위치 정보만 필터링
  const locationsInDay =
    selectedDayData?.blocks
      .filter((block) => block.location)
      .map((block) => block.location) || [];

  // 카테고리별 예산 계산 함수
  const getCategoryBudget = () => {
    const allBlocks = timeline.days.flatMap((day) => day.blocks);
    const categories: Record<string, { amount: number; count: number }> = {};

    // 모든 블록을 순회하며 카테고리별 비용 집계
    allBlocks.forEach((block) => {
      if (block.cost?.amount) {
        const category = getCategoryLabel(block.blockType);
        if (!categories[category]) {
          categories[category] = { amount: 0, count: 0 };
        }
        categories[category].amount += block.cost.amount;
        categories[category].count += 1;
      }
    });

    return categories;
  };

  // 체크리스트 항목 추가 함수
  const addTodo = () => {
    if (!newTodoText.trim()) return;

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodoItems([...todoItems, newTodo]);
    setNewTodoText('');
    // 다음 플레이스홀더로 순환
    setPlaceholderIndex((prev) => (prev + 1) % todoPlaceholders.length);
  };

  // 체크리스트 항목 토글 함수 (완료/미완료 상태 변경)
  const toggleTodo = (id: string) => {
    setTodoItems((items) =>
      items
        .map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
        .sort((a, b) => {
          // 완료된 항목을 아래로 정렬
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        })
    );
  };

  // 체크리스트 항목 삭제 함수
  const deleteTodo = (id: string) => {
    setTodoItems((items) => items.filter((item) => item.id !== id));
  };

  // 현재 플레이스홀더 텍스트 반환
  const getCurrentPlaceholder = () => {
    return todoPlaceholders[placeholderIndex];
  };

  // 지도 탭 렌더링
  const renderMapTab = () => (
    <div className='space-y-4 p-4'>
      <Typography variant='h6' className='text-gray-900'>
        Day {selectedDay} 위치
      </Typography>

      {locationsInDay.length === 0 ? (
        <div className='py-8 text-center'>
          <Typography variant='body2' className='text-gray-500'>
            아직 위치가 등록된 일정이 없습니다.
          </Typography>
        </div>
      ) : (
        <div className='space-y-3'>
          {locationsInDay.map((location, index) => (
            <div
              key={index}
              className='flex items-start space-x-3 rounded-lg bg-gray-50 p-3'
            >
              <IoLocationOutline className='mt-1 h-4 w-4 text-gray-400' />
              <div className='flex-1'>
                <Typography variant='body2' className='text-gray-900'>
                  {location?.address}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='flex h-64 items-center justify-center rounded-lg bg-gray-100'>
        <Typography variant='body2' className='text-gray-500'>
          지도 컴포넌트
        </Typography>
      </div>
    </div>
  );

  // 예산 탭 렌더링
  const renderBudgetTab = () => {
    const totalBudget = timeline.totalCost.amount || 0;
    const dayBudget = selectedDayData?.totalCost.amount || 0;
    const categoryBudget = getCategoryBudget();
    const exchangeRate = getExchangeRate(planCurrency);
    // 원화 기준 환산 금액 계산
    const totalInKRW =
      planCurrency === 'KRW' ? totalBudget : totalBudget * exchangeRate;

    return (
      <div className='space-y-4 p-4'>
        <Typography variant='h6' className='text-gray-900'>
          예산 현황
        </Typography>

        <div className='space-y-4'>
          {/* 전체 예산 표시 */}
          <div className='rounded-lg bg-blue-50 p-4'>
            <Typography variant='caption' className='text-blue-600'>
              전체 예산
            </Typography>
            <Typography variant='h5' className='font-bold text-blue-900'>
              {formatCurrency(totalBudget, planCurrency)}
            </Typography>
            {/* 원화가 아닌 경우 원화 환산 금액도 표시 */}
            {planCurrency !== 'KRW' && (
              <Typography variant='caption' className='text-blue-600'>
                ≈ {formatCurrency(totalInKRW, 'KRW')}
              </Typography>
            )}
          </div>

          {/* 선택된 날짜 예산 표시 */}
          <div className='rounded-lg bg-gray-50 p-4'>
            <Typography variant='caption' className='text-gray-600'>
              Day {selectedDay} 예산
            </Typography>
            <Typography variant='h6' className='font-semibold text-gray-900'>
              {formatCurrency(dayBudget, planCurrency)}
            </Typography>
          </div>

          {/* 카테고리별 지출 현황 */}
          <div className='space-y-3'>
            <Typography variant='body2' className='font-medium text-gray-700'>
              카테고리별 지출
            </Typography>
            {Object.entries(categoryBudget).map(([category, data]) => (
              <div
                key={category}
                className='flex items-center justify-between rounded-lg bg-gray-50 p-3'
              >
                <div>
                  <Typography
                    variant='body2'
                    className='font-medium text-gray-700'
                  >
                    {category}
                  </Typography>
                  <Typography variant='caption' className='text-gray-500'>
                    {data.count}건
                  </Typography>
                </div>
                <Typography
                  variant='body2'
                  className='font-semibold text-gray-900'
                >
                  {formatCurrency(data.amount, planCurrency)}
                </Typography>
              </div>
            ))}
          </div>

          {/* 선택된 날짜의 세부 지출 내역 */}
          {selectedDayData && selectedDayData.blocks.length > 0 && (
            <div className='space-y-2'>
              <Typography variant='body2' className='font-medium text-gray-700'>
                Day {selectedDay} 세부 내역
              </Typography>
              {selectedDayData.blocks
                .filter((block) => block.cost?.amount)
                .map((block) => (
                  <div
                    key={block.id}
                    className='flex items-center justify-between border-b border-gray-100 py-2'
                  >
                    <div>
                      <Typography variant='body2' className='text-gray-600'>
                        {block.title}
                      </Typography>
                      <Typography variant='caption' className='text-gray-400'>
                        {getCategoryLabel(block.blockType)}
                      </Typography>
                    </div>
                    <Typography variant='body2' className='font-medium'>
                      {formatCurrency(
                        block.cost?.amount || 0,
                        block.cost?.currency || planCurrency
                      )}
                    </Typography>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 체크리스트 탭 렌더링
  const renderChecklistTab = () => {
    // 완료/미완료 항목 분리
    const incompleteTodos = todoItems.filter((item) => !item.completed);
    const completedTodos = todoItems.filter((item) => item.completed);

    return (
      <div className='space-y-4 p-4'>
        <Typography variant='h6' className='text-gray-900'>
          여행 체크리스트
        </Typography>

        {/* 새 항목 추가 입력 필드 */}
        <div className='flex space-x-2'>
          <input
            type='text'
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder={getCurrentPlaceholder()}
            className='flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
          <button
            onClick={addTodo}
            className='flex items-center justify-center rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600'
          >
            <IoAddOutline className='h-4 w-4' />
          </button>
        </div>

        {/* 미완료 항목 목록 */}
        <div className='space-y-2'>
          {incompleteTodos.map((todo) => (
            <div
              key={todo.id}
              className='flex items-center space-x-3 rounded-lg bg-gray-50 p-3'
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className='flex h-5 w-5 items-center justify-center rounded border-2 border-gray-300 hover:border-blue-500'
              >
                {todo.completed && (
                  <IoCheckboxOutline className='h-3 w-3 text-blue-500' />
                )}
              </button>
              <Typography variant='body2' className='flex-1 text-gray-900'>
                {todo.text}
              </Typography>
              <button
                onClick={() => deleteTodo(todo.id)}
                className='text-gray-400 hover:text-red-500'
              >
                <IoTrashOutline className='h-4 w-4' />
              </button>
            </div>
          ))}
        </div>

        {/* 완료된 항목 목록 */}
        {completedTodos.length > 0 && (
          <div className='space-y-2'>
            <Typography variant='caption' className='text-gray-500'>
              완료된 항목 ({completedTodos.length})
            </Typography>
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className='flex items-center space-x-3 rounded-lg bg-green-50 p-3 opacity-60'
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className='flex h-5 w-5 items-center justify-center rounded border-2 border-green-500 bg-green-500'
                >
                  <IoCheckboxOutline className='h-3 w-3 text-white' />
                </button>
                <Typography
                  variant='body2'
                  className='flex-1 text-gray-600 line-through'
                >
                  {todo.text}
                </Typography>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className='text-gray-400 hover:text-red-500'
                >
                  <IoTrashOutline className='h-4 w-4' />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 빈 상태 표시 */}
        {todoItems.length === 0 && (
          <div className='py-8 text-center'>
            <Typography variant='body2' className='text-gray-500'>
              체크리스트가 비어있습니다.
            </Typography>
            <Typography variant='caption' className='text-gray-400'>
              여행 준비사항을 추가해보세요!
            </Typography>
          </div>
        )}
      </div>
    );
  };

  // 현재 활성 탭에 따른 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return renderMapTab();
      case 'budget':
        return renderBudgetTab();
      case 'checklist':
        return renderChecklistTab();
      default:
        return renderMapTab();
    }
  };

  // 사이드패널이 접혀있는 상태 렌더링
  if (isCollapsed) {
    return (
      <div className='relative'>
        <button
          onClick={() => setIsCollapsed(false)}
          className='absolute right-0 top-1/2 z-10 -translate-y-1/2 transform rounded-l-lg border border-r-0 border-gray-200 bg-white p-2 shadow-lg hover:bg-gray-50'
        >
          <IoChevronBackOutline className='h-5 w-5 text-gray-600' />
        </button>
      </div>
    );
  }

  return (
    <div className='relative flex w-96 flex-col border-l border-gray-200 bg-white'>
      {/* 접기 버튼 */}
      <button
        onClick={() => setIsCollapsed(true)}
        className='absolute -left-6 top-1/2 z-10 -translate-y-1/2 transform rounded-l-lg border border-r-0 border-gray-200 bg-white p-2 shadow-lg hover:bg-gray-50'
      >
        <IoChevronForwardOutline className='h-5 w-5 text-gray-600' />
      </button>

      {/* 탭 헤더 */}
      <div className='border-b border-gray-200'>
        <div className='flex'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className='flex-1 overflow-auto'>{renderTabContent()}</div>
    </div>
  );
};
