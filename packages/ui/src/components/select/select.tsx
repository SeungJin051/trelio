'use client';

import * as React from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@ui/utils/cn';

// 아이콘 컴포넌트 (가독성을 위해 내부에 정의)
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='16'
    height='16'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='3'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <polyline points='20 6 9 17 4 12' />
  </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='16'
    height='16'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path d='m6 9 6 6 6-6' />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='12'
    height='12'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.5'
    strokeLinecap='round'
    strokeLinejoin='round'
    {...props}
  >
    <path d='M18 6 6 18' />
    <path d='m6 6 12 12' />
  </svg>
);

// 컴포넌트 타입 정의
export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface MultiSelectProps {
  /** 라벨 텍스트 */
  label: string;
  /** 선택된 값들의 배열 */
  value: string[];
  /** 값 변경 시 호출되는 콜백 함수 */
  onChange: (value: string[]) => void;
  /** 선택 가능한 옵션 목록 */
  options: SelectOption[];
  /** 아무것도 선택되지 않았을 때 표시될 텍스트 */
  placeholder?: string;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 컴포넌트 비활성화 여부 */
  disabled?: boolean;
  /** 에러 메시지 */
  error?: string;
  /** 추가적인 Tailwind CSS 클래스 */
  className?: string;
  /** 라벨 애니메이션 비활성화 */
  disableLabelAnimation?: boolean;
  /** 선택된 항목을 보여주는 최대 개수. 초과 시 "+N"으로 표시됩니다. */
  maxDisplay?: number;
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (props, ref) => {
    const {
      label,
      value = [],
      onChange,
      options,
      placeholder = '선택...',
      required = false,
      disabled,
      error,
      className,
      disableLabelAnimation = false,
      maxDisplay = 3,
    } = props;

    const [isFocused, setIsFocused] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const hasValue = value.length > 0;
    const shouldFloat = hasValue || isFocused || isOpen;

    // 외부 클릭 감지하여 드롭다운 닫기
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setIsFocused(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // 옵션 선택/해제 핸들러
    const handleSelect = (optionValue: string) => {
      if (disabled) return;
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    };

    // 칩(Chip)의 'x' 버튼 클릭 핸들러
    const handleRemove = (
      e: React.MouseEvent<HTMLButtonElement>,
      valueToRemove: string
    ) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      if (disabled) return;
      onChange(value.filter((v) => v !== valueToRemove));
    };

    const selectedOptions = React.useMemo(
      () => options.filter((opt) => value.includes(opt.value)),
      [options, value]
    );

    return (
      <div className={cn('relative', className)} ref={containerRef}>
        {/* 선택 영역 (Trigger) */}
        <button
          type='button'
          ref={ref as React.Ref<HTMLButtonElement>}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setIsOpen(false), 150);
          }}
          className={cn(
            'peer w-full rounded-2xl border-2 bg-gray-50/50 px-4 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0',
            shouldFloat ? 'pb-2 pt-6' : 'pb-4 pt-4',
            hasValue ? 'border-gray-300' : 'border-gray-200',
            disabled
              ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
              : 'hover:border-gray-300',
            error && 'border-red-500 focus:border-red-500'
          )}
        >
          <div className='flex flex-wrap items-center gap-1.5'>
            {selectedOptions.length === 0 ? (
              <span
                className={cn(
                  'text-left',
                  !hasValue && !isFocused && 'text-gray-400'
                )}
              >
                {placeholder}
              </span>
            ) : (
              <>
                {selectedOptions.slice(0, maxDisplay).map((opt) => (
                  <div
                    key={opt.value}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700',
                      { 'bg-gray-100 text-gray-500': disabled }
                    )}
                  >
                    {opt.label}
                    {!disabled && (
                      <button
                        type='button'
                        onClick={(e) => handleRemove(e, opt.value)}
                        className='rounded-full hover:bg-blue-200'
                      >
                        <XIcon className='h-3 w-3 text-blue-700' />
                      </button>
                    )}
                  </div>
                ))}
                {selectedOptions.length > maxDisplay && (
                  <div className='rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-600'>
                    +{selectedOptions.length - maxDisplay}
                  </div>
                )}
              </>
            )}
          </div>
          <ChevronDownIcon
            className={cn(
              'absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

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

        {/* 드롭다운 메뉴 */}
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className='absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg'
            >
              {options.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                    disabled={opt.disabled}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl',
                      {
                        'bg-blue-50 text-blue-700': isSelected,
                        'hover:bg-gray-50 focus:bg-blue-50 focus:outline-none':
                          !opt.disabled && !isSelected,
                        'cursor-not-allowed text-gray-400': opt.disabled,
                      }
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <CheckIcon className='h-4 w-4 text-blue-700' />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 에러 메시지 */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className='mt-1 text-xs text-red-600'
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

// [시작] Select 컴포넌트 수정 영역
export interface SelectProps {
  label: string;
  value: string | undefined;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  // disableLabelAnimation prop 제거
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      value,
      onChange,
      options,
      placeholder,
      required = false,
      disabled = false,
      error,
      className = '',
      // disableLabelAnimation prop 제거
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const hasValue = Boolean(value);
    const shouldFloat = hasValue || isFocused || isOpen;

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setIsFocused(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleSelect = (optionValue: string) => {
      if (disabled) return;
      onChange?.(optionValue);
      setIsOpen(false);
      setIsFocused(false);
    };

    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div className={cn('relative', className)} ref={containerRef}>
        {/* 선택 영역 (Trigger) */}
        <button
          type='button'
          ref={ref as React.Ref<HTMLButtonElement>}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setIsOpen(false), 150);
          }}
          className={cn(
            'peer w-full rounded-2xl border-2 bg-gray-50/50 px-4 text-left text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0',
            'pb-2 pt-6',
            hasValue ? 'border-gray-300' : 'border-gray-200',
            disabled
              ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
              : 'hover:border-gray-300',
            error && 'border-red-500 focus:border-red-500'
          )}
        >
          <div className='flex items-center justify-between'>
            <span className={cn('text-left', !hasValue && 'text-gray-400')}>
              {selectedOption?.label ||
                (shouldFloat ? placeholder || '선택하세요' : <>&nbsp;</>)}
            </span>
            <ChevronDownIcon
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        <label className='pointer-events-none absolute left-4 top-2 text-xs font-medium text-gray-500'>
          {label}
          {required && <span className='ml-1 text-red-500'>*</span>}
        </label>

        {/* 드롭다운 메뉴 */}
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className='absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg'
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => !opt.disabled && handleSelect(opt.value)}
                  disabled={opt.disabled}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors first:rounded-t-xl last:rounded-b-xl',
                    {
                      'bg-blue-50 text-blue-700': value === opt.value,
                      'hover:bg-gray-50 focus:bg-blue-50 focus:outline-none':
                        !opt.disabled && value !== opt.value,
                      'cursor-not-allowed text-gray-400': opt.disabled,
                    }
                  )}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && (
                    <CheckIcon className='h-4 w-4 text-blue-700' />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 에러 메시지 */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className='mt-1 text-xs text-red-600'
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
