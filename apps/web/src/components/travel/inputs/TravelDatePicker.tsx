'use client';

import React, { useEffect, useRef, useState } from 'react';

import { ko } from 'date-fns/locale';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  IoCalendarOutline,
  IoChevronBackOutline,
  IoChevronDownOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';

import { Typography } from '@ui/components';
import { cn } from '@ui/utils/cn';

registerLocale('ko', ko);

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
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleDateSelect = (date: Date | null, type: 'start' | 'end') => {
    if (type === 'start') {
      if (endDate && date && date > endDate) {
        onDateChange(date, date);
      } else {
        onDateChange(date, endDate);
      }
      setFocusedInput('end');
    } else {
      if (startDate && date && date < startDate) {
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
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    if (isMobile) {
      return `${startDate.getFullYear()}.${pad(startDate.getMonth() + 1)}.${pad(
        startDate.getDate()
      )} ~ ${pad(endDate.getMonth() + 1)}.${pad(endDate.getDate())}`;
    }
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };
  const startOfDay = (d: Date) => {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  };
  const isSameDay = (a?: Date | null, b?: Date | null) => {
    if (!a || !b) return false;
    return startOfDay(a).getTime() === startOfDay(b).getTime();
  };
  const isInRange = (d: Date) => {
    if (!startDate || !endDate) return false;
    const t = startOfDay(d).getTime();
    return (
      t > startOfDay(startDate).getTime() && t < startOfDay(endDate).getTime()
    );
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
                {formatRangeDisplay()}
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
            <DatePicker
              selected={focusedInput === 'start' ? startDate : endDate}
              onChange={(date: Date | null) =>
                handleDateSelect(date, focusedInput!)
              }
              minDate={new Date()}
              startDate={startDate}
              endDate={endDate}
              selectsStart={focusedInput === 'start'}
              selectsEnd={focusedInput === 'end'}
              inline
              monthsShown={1}
              calendarClassName='!bg-transparent !border-0 !shadow-none'
              locale='ko'
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className='mb-3 flex items-center justify-between px-1'>
                  <button
                    type='button'
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    className='flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-gray-800 ring-1 ring-black/5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-40 sm:h-10 sm:w-10'
                  >
                    <IoChevronBackOutline className='h-3 w-3 sm:h-4 sm:w-4' />
                  </button>
                  <span className='select-none text-xs font-medium text-gray-800 sm:text-sm'>
                    {date.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                  <button
                    type='button'
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    className='flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-gray-800 ring-1 ring-black/5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-40 sm:h-10 sm:w-10'
                  >
                    <IoChevronForwardOutline className='h-3 w-3 sm:h-4 sm:w-4' />
                  </button>
                </div>
              )}
              dayClassName={(date: Date) => {
                const isStart = isSameDay(date, startDate);
                const isEnd = isSameDay(date, endDate);
                const inRange = isInRange(date);
                const day = date.getDay();
                const classes = [
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors duration-150 hover:bg-sky-50 active:bg-sky-100 sm:h-10 sm:w-10 sm:text-sm',
                ];
                if (isStart || isEnd) {
                  classes.push(
                    '!bg-sky-100 !text-sky-800 !ring-1 !ring-sky-200'
                  );
                } else if (inRange) {
                  classes.push('!bg-sky-50 !text-sky-700');
                } else {
                  if (day === 0) classes.push('text-gray-400');
                  if (day === 6) classes.push('text-gray-400');
                }
                return classes.join(' ');
              }}
            />
          </div>
        )}
      </div>
      {helperText && !errorText && (
        <p className='mt-1.5 text-xs text-gray-500'>{helperText}</p>
      )}
      {errorText && <p className='mt-1.5 text-xs text-red-500'>{errorText}</p>}
    </div>
  );
};

export default TravelDatePicker;
