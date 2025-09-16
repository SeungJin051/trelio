import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import {
  IoCheckmarkOutline,
  IoChevronDownOutline,
  IoInformationCircleOutline,
  IoTimeOutline,
} from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

import { addMinutes, formatDuration } from '@/lib/block-helpers';
import {
  CURRENCIES,
  CurrencyCode,
  formatCurrencyInput,
  parseCurrencyInput,
} from '@/lib/currency';

interface SmartInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'time' | 'date' | 'textarea';
  placeholder?: string;
  required?: boolean;
  suggestions?: string[];
  className?: string;
  disableLabelAnimation?: boolean;
}

export const SmartInput: React.FC<SmartInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  suggestions = [],
  className = '',
  disableLabelAnimation = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const hasValue = value.length > 0;
  const shouldFloat =
    hasValue || isFocused || type === 'time' || type === 'date';

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const inputElement =
    type === 'textarea' ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => {
          setIsFocused(false);
          setTimeout(() => setShowSuggestions(false), 150);
        }}
        placeholder={shouldFloat ? placeholder : ''}
        rows={3}
        className={`peer w-full resize-none rounded-2xl border-2 bg-gray-50/50 px-4 pb-3 pt-6 text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0 ${
          hasValue ? 'border-gray-300' : 'border-gray-200'
        } ${className}`}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => {
          setIsFocused(false);
          setTimeout(() => setShowSuggestions(false), 150);
        }}
        placeholder={shouldFloat ? placeholder : ''}
        className={`peer w-full rounded-2xl border-2 bg-gray-50/50 px-4 py-4 text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0 ${
          hasValue ? 'border-gray-300' : 'border-gray-200'
        } ${shouldFloat ? 'pb-2 pt-6' : 'pb-4 pt-4'} ${className}`}
      />
    );

  return (
    <div className='relative'>
      {inputElement}

      {/* 플로팅 라벨 */}
      {disableLabelAnimation ? (
        <label className='pointer-events-none absolute left-4 top-2 text-xs font-medium text-gray-500'>
          {label}
          {required && <span className='ml-1 text-red-500'>*</span>}
        </label>
      ) : (
        <motion.label
          animate={{
            top: shouldFloat ? '0.5rem' : '1rem',
            fontSize: shouldFloat ? '0.75rem' : '1rem',
            color: isFocused ? '#3b82f6' : hasValue ? '#6b7280' : '#9ca3af',
          }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className='pointer-events-none absolute left-4 origin-left font-medium'
        >
          {label}
          {required && <span className='ml-1 text-red-500'>*</span>}
        </motion.label>
      )}

      {/* 자동완성 제안 */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className='absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg'
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type='button'
                onClick={() => handleSuggestionClick(suggestion)}
                className='w-full px-4 py-3 text-left text-sm first:rounded-t-xl last:rounded-b-xl hover:bg-gray-50 focus:bg-blue-50 focus:outline-none'
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SmartBudgetInputProps {
  value: string;
  onChange: (value: string) => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  totalBudget?: number;
  className?: string;
}

export const SmartBudgetInput: React.FC<SmartBudgetInputProps> = ({
  value,
  onChange,
  currency,
  onCurrencyChange,
  totalBudget = 0,
  className = '',
}) => {
  const [showCurrencySelect, setShowCurrencySelect] = useState(false);
  const percentage =
    totalBudget > 0 ? (parseCurrencyInput(value) / totalBudget) * 100 : 0;

  const popularCurrencies: CurrencyCode[] = [
    'KRW',
    'USD',
    'JPY',
    'EUR',
    'CNY',
    'THB',
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className='relative'>
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(formatCurrencyInput(e.target.value))}
          className='w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 py-4 pl-16 pr-20 text-lg font-semibold placeholder-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0'
          placeholder='0'
        />

        {/* 통화 심볼 */}
        <div className='absolute left-4 top-1/2 -translate-y-1/2'>
          <span className='text-lg font-bold text-gray-600'>
            {CURRENCIES[currency].symbol}
          </span>
        </div>

        {/* 통화 선택 버튼 */}
        <button
          type='button'
          onClick={() => setShowCurrencySelect(!showCurrencySelect)}
          className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center space-x-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-200'
        >
          <span>{currency}</span>
          <IoChevronDownOutline
            className={`h-4 w-4 transition-transform ${showCurrencySelect ? 'rotate-180' : ''}`}
          />
        </button>

        {/* 통화 선택 드롭다운 */}
        <AnimatePresence>
          {showCurrencySelect && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-gray-200 bg-white shadow-lg'
            >
              {popularCurrencies.map((curr) => (
                <button
                  key={curr}
                  type='button'
                  onClick={() => {
                    onCurrencyChange(curr);
                    setShowCurrencySelect(false);
                  }}
                  className='flex w-full items-center justify-between px-4 py-3 text-left text-sm first:rounded-t-xl last:rounded-b-xl hover:bg-gray-50 focus:bg-blue-50 focus:outline-none'
                >
                  <div className='flex items-center space-x-3'>
                    <span className='font-medium'>
                      {CURRENCIES[curr].symbol}
                    </span>
                    <span>{curr}</span>
                  </div>
                  {currency === curr && (
                    <IoCheckmarkOutline className='h-4 w-4 text-blue-500' />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 예산 비율 표시 */}
      {totalBudget > 0 && parseCurrencyInput(value) > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          className='flex items-center space-x-3'
        >
          <div className='h-2 flex-1 overflow-hidden rounded-full bg-gray-100'>
            <motion.div
              className={`h-full rounded-full ${
                percentage > 100
                  ? 'bg-red-400'
                  : percentage > 70
                    ? 'bg-yellow-400'
                    : 'bg-green-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <Typography
            variant='caption'
            className={`min-w-[3rem] font-medium ${
              percentage > 100 ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            {percentage.toFixed(1)}%
          </Typography>
        </motion.div>
      )}

      {/* 예산 초과 경고 */}
      {percentage > 100 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex items-center space-x-2 rounded-xl bg-red-50 p-3'
        >
          <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100'>
            <IoInformationCircleOutline className='h-3 w-3 text-red-600' />
          </div>
          <Typography variant='caption' className='text-red-700'>
            예산을 초과했습니다. 다른 항목을 조정해보세요.
          </Typography>
        </motion.div>
      )}
    </div>
  );
};

interface SmartTimeInputProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  suggestedDuration?: number;
  className?: string;
}

export const SmartTimeInput: React.FC<SmartTimeInputProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  suggestedDuration = 0,
  className = '',
}) => {
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    // 시작 시간이 있고 종료 시간이 없으며 추천 시간이 있을 때 제안 표시
    setShowSuggestion(Boolean(startTime && !endTime && suggestedDuration > 0));
  }, [startTime, endTime, suggestedDuration]);

  const handleApplySuggestion = () => {
    if (startTime && suggestedDuration > 0) {
      onEndTimeChange(addMinutes(startTime, suggestedDuration));
      setShowSuggestion(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className='grid grid-cols-2 gap-4'>
        <SmartInput
          label='시작 시간'
          value={startTime}
          onChange={onStartTimeChange}
          type='time'
          disableLabelAnimation={true}
        />
        <SmartInput
          label='종료 시간'
          value={endTime}
          onChange={onEndTimeChange}
          type='time'
          disableLabelAnimation={true}
        />
      </div>

      {/* 스마트 시간 제안 */}
      <AnimatePresence>
        {showSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className='flex items-center space-x-3 rounded-2xl bg-blue-50 p-4'
          >
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100'>
              <IoTimeOutline className='h-5 w-5 text-blue-600' />
            </div>
            <div className='flex-1'>
              <Typography
                variant='body2'
                className='font-semibold text-blue-900'
              >
                {formatDuration(suggestedDuration)} 소요 예상
              </Typography>
              <Typography variant='caption' className='text-blue-600'>
                종료 시간을 자동으로 설정할까요?
              </Typography>
            </div>
            <Button
              type='button'
              size='small'
              variant='filled'
              onClick={handleApplySuggestion}
              className='rounded-xl bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
            >
              적용
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
