'use client';

import React, { useEffect, useRef, useState } from 'react';

import { IoCloseOutline, IoLocationOutline } from 'react-icons/io5';

import { Typography } from '@ui/components';
import { cn } from '@ui/utils/cn';

interface LocationSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  label,
  helperText,
  errorText,
  placeholder = '예: 대한민국, 제주도 / 프랑스, 파리',
  disabled = false,
  className,
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Google Places API 호출 함수 (실제 구현에서는 서버를 통해 API 키를 보호해야 함)
  const fetchPlaceSuggestions = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // 실제 구현에서는 서버 API를 통해 Google Places API를 호출해야 합니다
      // 여기서는 더미 데이터로 대체
      await new Promise((resolve) => setTimeout(resolve, 300)); // 실제 API 호출 시뮬레이션

      const mockSuggestions: LocationSuggestion[] = [
        {
          place_id: '1',
          description: '대한민국, 제주도',
          main_text: '제주도',
          secondary_text: '대한민국',
        },
        {
          place_id: '2',
          description: '대한민국, 서울특별시',
          main_text: '서울특별시',
          secondary_text: '대한민국',
        },
        {
          place_id: '3',
          description: '프랑스, 파리',
          main_text: '파리',
          secondary_text: '프랑스',
        },
        {
          place_id: '4',
          description: '일본, 도쿄',
          main_text: '도쿄',
          secondary_text: '일본',
        },
      ].filter((suggestion) =>
        suggestion.description.toLowerCase().includes(input.toLowerCase())
      );

      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to fetch place suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 디바운스된 검색
  const debouncedSearch = (input: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchPlaceSuggestions(input);
    }, 300); // 300ms 디바운스
  };

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.trim()) {
      debouncedSearch(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 제안 항목 선택
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.description);
    onChange(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // value prop 변경 시 inputValue 동기화
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 컴포넌트 언마운트 시 디바운스 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // 폼 제출 시 onChange 호출
  const handleBlur = () => {
    onChange(inputValue);
  };

  const isError = !!errorText;
  const hasValue = inputValue.trim().length > 0;

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className='mb-1.5 block text-sm font-medium text-gray-700'>
          {label}
        </label>
      )}

      <div className='relative'>
        {/* 입력 필드 */}
        <div className='relative'>
          <IoLocationOutline className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />

          <input
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full rounded-lg border bg-white py-3 pl-10 pr-10 text-base text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400',
              isError
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
                : 'border-gray-200 focus:border-[#3182F6] focus:ring-2 focus:ring-[#3182F6]/10',
              disabled ? 'cursor-not-allowed bg-gray-50 opacity-50' : ''
            )}
          />

          {hasValue && !disabled && (
            <button
              type='button'
              onClick={handleClear}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none'
              aria-label='입력 내용 지우기'
            >
              <IoCloseOutline className='h-5 w-5' />
            </button>
          )}
        </div>

        {/* 자동완성 제안 목록 */}
        {showSuggestions &&
          (suggestions.length > 0 || loading) &&
          !disabled && (
            <div className='absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg'>
              {loading ? (
                <div className='flex items-center justify-center p-4'>
                  <div className='h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
                  <span className='ml-2 text-sm text-gray-600'>검색 중...</span>
                </div>
              ) : (
                <ul className='max-h-60 overflow-y-auto py-2'>
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.place_id}>
                      <button
                        type='button'
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className='flex w-full items-center px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none'
                      >
                        <IoLocationOutline className='mr-3 h-4 w-4 flex-shrink-0 text-gray-400' />
                        <div className='min-w-0 flex-1'>
                          <div className='truncate text-sm font-medium text-gray-900'>
                            {suggestion.main_text}
                          </div>
                          <div className='truncate text-xs text-gray-500'>
                            {suggestion.secondary_text}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

        {/* 제안이 없을 때 직접 입력 안내 */}
        {showSuggestions &&
          suggestions.length === 0 &&
          !loading &&
          inputValue.length >= 2 && (
            <div className='absolute z-50 mt-1 w-full rounded-lg border bg-white p-4 shadow-lg'>
              <div className='text-center'>
                <Typography variant='body2' className='mb-2 text-gray-600'>
                  검색 결과가 없습니다
                </Typography>
                <Typography variant='caption' className='text-gray-500'>
                  직접 입력하여 계속 진행하실 수 있습니다
                </Typography>
              </div>
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

export default LocationInput;
