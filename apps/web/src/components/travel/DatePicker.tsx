'use client';

import React, { useEffect, useRef, useState } from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { IoCalendarOutline } from 'react-icons/io5';

import { Typography } from '@ui/components';
import { cn } from '@ui/utils/cn';

interface TravelDatePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  className?: string;
}

const TravelDatePicker: React.FC<TravelDatePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  label,
  helperText,
  errorText,
  disabled = false,
  className,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'start' | 'end' | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // 날짜 계산 함수
  const calculateDays = (start: Date | null, end: Date | null): number => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // 날짜 포맷팅 함수
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
        setFocusedInput(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateSelect = (date: Date | null, type: 'start' | 'end') => {
    if (type === 'start') {
      // 시작일 선택
      if (endDate && date && date > endDate) {
        // 시작일이 종료일보다 늦으면 종료일을 시작일과 같게 설정 (당일치기)
        onDateChange(date, date);
      } else {
        onDateChange(date, endDate);
      }
      setFocusedInput('end');
    } else {
      // 종료일 선택
      if (startDate && date && date < startDate) {
        // 종료일이 시작일보다 빠르면 시작일을 종료일과 같게 설정
        onDateChange(date, date);
      } else {
        onDateChange(startDate, date);
      }
      setShowCalendar(false);
      setFocusedInput(null);
    }
  };

  const isError = !!errorText;
  const days = calculateDays(startDate, endDate);

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className='mb-1.5 block text-sm font-medium text-gray-700'>
          {label}
        </label>
      )}

      <div className='relative'>
        {/* 입력 필드 */}
        <div
          className={cn(
            'flex w-full cursor-pointer items-center rounded-lg border bg-white px-4 py-3 text-base transition-all duration-200',
            isError
              ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/10'
              : 'border-gray-200 focus-within:border-[#3182F6] focus-within:ring-2 focus-within:ring-[#3182F6]/10',
            disabled ? 'cursor-not-allowed bg-gray-50 opacity-50' : ''
          )}
          onClick={() => {
            if (!disabled) {
              setShowCalendar(true);
              setFocusedInput('start');
            }
          }}
        >
          <IoCalendarOutline className='mr-3 h-5 w-5 text-gray-400' />

          <div className='flex-1'>
            {startDate && endDate ? (
              <div>
                <span className='text-gray-900'>
                  {formatDate(startDate)} ~ {formatDate(endDate)}
                </span>
                {days > 0 && (
                  <span className='ml-2 text-sm text-gray-500'>({days}일)</span>
                )}
              </div>
            ) : (
              <span className='text-gray-400'>여행 날짜를 선택해주세요</span>
            )}
          </div>
        </div>

        {/* 캘린더 */}
        {showCalendar && !disabled && (
          <div className='absolute z-50 mt-2 w-auto rounded-lg border bg-white p-4 shadow-lg'>
            <div className='mb-3'>
              <Typography variant='body2' className='text-gray-600'>
                {focusedInput === 'start'
                  ? '시작일을 선택해주세요'
                  : '종료일을 선택해주세요'}
              </Typography>
            </div>

            <DatePicker
              selected={focusedInput === 'start' ? startDate : endDate}
              onChange={(date) => handleDateSelect(date, focusedInput!)}
              minDate={new Date()} // 오늘 이후만 선택 가능
              startDate={startDate}
              endDate={endDate}
              selectsStart={focusedInput === 'start'}
              selectsEnd={focusedInput === 'end'}
              inline
              calendarClassName='custom-calendar'
              locale='ko'
            />

            {startDate && endDate && (
              <div className='mt-3 rounded-md bg-blue-50 p-2'>
                <Typography variant='caption' className='text-blue-700'>
                  선택된 기간: {days}일
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 도움말 텍스트 또는 에러 메시지 */}
      {helperText && !errorText && (
        <p className='mt-1.5 text-xs text-gray-500'>{helperText}</p>
      )}
      {errorText && <p className='mt-1.5 text-xs text-red-500'>{errorText}</p>}
    </div>
  );
};

export default TravelDatePicker;
