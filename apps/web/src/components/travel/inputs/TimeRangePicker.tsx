'use client';

import React, { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { IoChevronDownOutline, IoTimeOutline } from 'react-icons/io5';

import { Typography } from '@ui/components';
import { cn } from '@ui/utils/cn';

type TimeRangePickerProps = {
  label?: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  suggestedDuration?: number; // 분 단위
  disabled?: boolean;
  className?: string;
  errorText?: string;
  helperText?: string;
};

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toMinutes = (hhmm?: string) => {
  if (!hhmm) return undefined;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return undefined;
  return h * 60 + m;
};
const toHHMM = (mins?: number) => {
  if (mins === undefined) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad(h)}:${pad(m)}`;
};

const QUICK_PRESETS = [30, 60, 90, 120];
const nowHHMM = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const next30MinHHMM = () => {
  const d = new Date();
  const mins = d.getMinutes();
  const add = 30 - (mins % 30 || 30);
  d.setMinutes(mins + add);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  label = '시간',
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  suggestedDuration = 0,
  disabled,
  className,
  errorText,
  helperText,
}) => {
  const [open, setOpen] = useState(false);
  const [, setFocused] = useState<'start' | 'end' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isError = !!errorText;
  const startMins = toMinutes(startTime);
  const endMins = toMinutes(endTime);
  const hasBoth = startMins !== undefined && endMins !== undefined;
  const duration = hasBoth ? endMins! - startMins! : undefined;
  const showSuggestion = Boolean(
    startMins !== undefined &&
      suggestedDuration > 0 &&
      (endMins === undefined || endMins <= startMins)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const applySuggested = () => {
    if (startMins === undefined || suggestedDuration <= 0) return;
    onEndTimeChange(toHHMM(startMins + suggestedDuration));
    setOpen(false);
    setFocused(null);
  };

  const applyPreset = (mins: number) => {
    if (startMins === undefined) return;
    onEndTimeChange(toHHMM(startMins + mins));
    setOpen(false);
    setFocused(null);
  };

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className='mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm'>
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative flex w-full items-center rounded-2xl bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-black/5 sm:px-4 sm:py-3 sm:text-base',
          isError
            ? 'ring-red-500 focus-within:ring-2 focus-within:ring-red-500'
            : 'focus-within:ring-2 focus-within:ring-sky-300',
          disabled ? 'cursor-not-allowed bg-gray-50 opacity-70' : 'cursor-text'
        )}
        onClick={() => {
          if (!disabled) {
            setOpen((v) => !v);
            setFocused('start');
          }
        }}
      >
        <IoTimeOutline className='mr-2 h-4 w-4 text-gray-400 sm:mr-3 sm:h-5 sm:w-5' />
        <div className='grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3'>
          <input
            type='time'
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            onFocus={() => setFocused('start')}
            className='w-full min-w-0 rounded-xl border-0 bg-transparent p-0 text-sm text-gray-900 outline-none focus:outline-none sm:text-base'
            disabled={disabled}
          />
          <span className='select-none text-gray-400'>~</span>
          <input
            type='time'
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            onFocus={() => setFocused('end')}
            className='w-full min-w-0 rounded-xl border-0 bg-transparent p-0 text-sm text-gray-900 outline-none focus:outline-none sm:text-base'
            disabled={disabled}
          />
        </div>
        <IoChevronDownOutline
          className={cn(
            'ml-2 h-4 w-4 text-gray-400 transition-transform sm:ml-3 sm:h-5 sm:w-5',
            open && 'rotate-180'
          )}
        />
      </div>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className='mt-2 w-full max-w-full overflow-x-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-lg sm:p-3'
          >
            {startMins === undefined ? (
              <div className='flex flex-wrap items-center gap-2'>
                <span className='select-none text-[11px] text-gray-500 sm:text-xs'>
                  시작 시간을 먼저 선택하세요
                </span>
                <button
                  type='button'
                  onClick={() => onStartTimeChange(nowHHMM())}
                  className='rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 sm:px-3 sm:text-sm'
                >
                  지금으로 설정
                </button>
                <button
                  type='button'
                  onClick={() => onStartTimeChange(next30MinHHMM())}
                  className='rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 sm:px-3 sm:text-sm'
                >
                  다음 30분으로 설정
                </button>
              </div>
            ) : (
              <>
                {/* 추천 길이 안내 및 적용 */}
                {showSuggestion && (
                  <div className='mb-2 flex items-center justify-between rounded-xl bg-sky-50 p-2 sm:p-3'>
                    <div>
                      <Typography
                        variant='body2'
                        className='text-sm font-medium text-sky-900 sm:text-base'
                      >
                        추천 소요시간 적용 ({suggestedDuration}분)
                      </Typography>
                      <Typography
                        variant='caption'
                        className='text-[11px] text-sky-700 sm:text-xs'
                      >
                        시작 시간 기준으로 종료 시간을 자동 설정합니다
                      </Typography>
                    </div>
                    <button
                      type='button'
                      onClick={applySuggested}
                      className='rounded-lg bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 sm:px-3 sm:text-sm'
                    >
                      적용
                    </button>
                  </div>
                )}

                {/* 빠른 선택 프리셋 */}
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='select-none text-[11px] text-gray-500 sm:text-xs'>
                    빠른 선택
                  </span>
                  {QUICK_PRESETS.map((m) => (
                    <button
                      key={m}
                      type='button'
                      onClick={() => applyPreset(m)}
                      className='rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 sm:px-3 sm:text-sm'
                    >
                      +{m}분
                    </button>
                  ))}
                  {hasBoth && duration !== undefined && (
                    <span className='ml-auto select-none text-[11px] text-gray-500 sm:text-xs'>
                      현재 소요시간: {duration}분
                    </span>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {helperText && !errorText && (
        <p className='mt-1.5 text-[11px] text-gray-500 sm:text-xs'>
          {helperText}
        </p>
      )}
      {errorText && (
        <p className='mt-1.5 text-[11px] text-red-500 sm:text-xs'>
          {errorText}
        </p>
      )}
    </div>
  );
};

export default TimeRangePicker;
