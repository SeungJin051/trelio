'use client';

import React, { useEffect, useRef, useState } from 'react';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  IoCalendarOutline,
  IoChevronBackOutline,
  IoChevronDownOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';

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
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date());

  const calculateDays = (start: Date | null, end: Date | null): number => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  const handleDateSelect = (date: Date) => {
    const type = focusedInput;
    if (type === 'start') {
      if (endDate && date > endDate) {
        onDateChange(date, date);
      } else {
        onDateChange(date, endDate);
      }
      setFocusedInput('end');
    } else {
      if (startDate && date < startDate) {
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

  const formatRangeDisplay = (): string => {
    if (!startDate || !endDate) return '여행 날짜를 선택해주세요';
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  const formatMobileRangeDisplay = (): string => {
    if (!startDate || !endDate) return '여행 날짜를 선택해주세요';
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${startDate.getFullYear()}.${pad(
      startDate.getMonth() + 1
    )}.${pad(startDate.getDate())} ~ ${pad(endDate.getMonth() + 1)}.${pad(
      endDate.getDate()
    )}`;
  };

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className='mb-1.5 block text-sm font-medium text-gray-700'>
          {label}
        </label>
      )}
      <div className='relative'>
        <div
          className={cn(
            'flex w-full cursor-pointer items-center rounded-2xl bg-white px-4 py-3 text-base text-gray-900 shadow-sm ring-1 ring-black/5',
            isError
              ? 'ring-red-500 focus-within:ring-2 focus-within:ring-red-500'
              : 'focus-within:ring-2 focus-within:ring-sky-300',
            disabled ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''
          )}
          onClick={() => {
            if (!disabled) {
              if (showCalendar) {
                setShowCalendar(false);
                setFocusedInput(null);
              } else {
                setShowCalendar(true);
                setFocusedInput('start');
              }
            }
          }}
        >
          <IoCalendarOutline className='mr-3 h-4 w-4 text-gray-400 sm:h-5 sm:w-5' />
          <div className='min-w-0 flex-1'>
            <div className='flex items-center space-x-2'>
              <span className='block truncate whitespace-nowrap font-medium text-gray-900'>
                <span className='hidden sm:block'>{formatRangeDisplay()}</span>
                <span className='sm:hidden'>{formatMobileRangeDisplay()}</span>
              </span>
              {startDate && endDate && days > 0 && (
                <span className='shrink-0 text-xs text-gray-500 sm:text-sm'>
                  ({days}일)
                </span>
              )}
            </div>
          </div>
          <IoChevronDownOutline
            className={cn(
              'ml-3 h-4 w-4 text-gray-400 sm:h-5 sm:w-5',
              showCalendar ? 'rotate-180' : ''
            )}
          />
        </div>
        {showCalendar && !disabled && (
          <div className='absolute left-1/2 top-full z-50 mt-3 max-w-[95vw] -translate-x-1/2 overflow-x-hidden rounded-3xl bg-white p-3 shadow-xl ring-1 ring-black/5 transition-all duration-200 sm:left-auto sm:right-0 sm:w-auto sm:max-w-none sm:translate-x-0 sm:p-5'>
            <div className='mb-4'>
              <Typography
                variant='body2'
                className='text-sm font-medium text-gray-700 sm:text-base'
              >
                {focusedInput === 'start'
                  ? '시작일을 선택해주세요'
                  : '종료일을 선택해주세요'}
              </Typography>
            </div>
            <CustomCalendar
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              onDateSelect={handleDateSelect}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        )}
      </div>

      {helperText && !errorText && (
        <p className='mt-1.5 text-sm text-gray-500'>{helperText}</p>
      )}
      {errorText && <p className='mt-1.5 text-xs text-red-500'>{errorText}</p>}
    </div>
  );
};

const CustomCalendar = ({
  currentMonth,
  setCurrentMonth,
  onDateSelect,
  startDate,
  endDate,
}: {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  startDate: Date | null;
  endDate: Date | null;
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const gridStartDate = startOfWeek(monthStart);
  const gridEndDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStartDate, end: gridEndDate });
  const today = startOfDay(new Date());

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const isPrevMonthButtonDisabled = isBefore(monthStart, today);

  const getDayClassName = (day: Date) => {
    const isDayStart = startDate && isSameDay(day, startDate);
    const isDayEnd = endDate && isSameDay(day, endDate);
    const isInRange =
      startDate &&
      endDate &&
      isBefore(startOfDay(startDate), day) &&
      isBefore(day, startOfDay(endDate));
    const isDayDisabled = isBefore(day, today);
    const isDayInCurrentMonth = isSameMonth(day, currentMonth);

    const classes = [
      'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors duration-150',
    ];

    if (!isDayInCurrentMonth) {
      classes.push('text-gray-300');
    } else if (isDayDisabled) {
      classes.push('text-gray-400', 'cursor-not-allowed');
    } else {
      classes.push('hover:bg-sky-50 active:bg-sky-100 cursor-pointer');
      if (isDayStart || isDayEnd) {
        classes.push('!bg-sky-100 !text-sky-800 !ring-1 !ring-sky-200');
      } else if (isInRange) {
        classes.push('!bg-sky-50 !text-sky-700');
      } else if (day.getDay() === 0 || day.getDay() === 6) {
        classes.push('text-gray-400');
      } else {
        classes.push('text-gray-800');
      }
    }
    return cn(classes);
  };

  return (
    <div className='w-full'>
      <div className='mb-3 flex items-center justify-between px-1'>
        <button
          type='button'
          onClick={handlePrevMonth}
          disabled={isPrevMonthButtonDisabled}
          className='flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-gray-800 ring-1 ring-black/5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-40'
        >
          <IoChevronBackOutline className='h-4 w-4' />
        </button>
        <span className='select-none text-sm font-medium text-gray-800'>
          {format(currentMonth, 'yyyy년 MMMM', { locale: ko })}
        </span>
        <button
          type='button'
          onClick={handleNextMonth}
          className='flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-gray-800 ring-1 ring-black/5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-40'
        >
          <IoChevronForwardOutline className='h-4 w-4' />
        </button>
      </div>
      <div className='grid grid-cols-7 text-center text-sm text-gray-500'>
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className='py-2'>
            {day}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7 place-items-center'>
        {days.map((day) => (
          <div
            key={day.toString()}
            className={getDayClassName(day)}
            onClick={() => {
              if (isBefore(day, today) || !isSameMonth(day, currentMonth))
                return;
              onDateSelect(day);
            }}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelDatePicker;
