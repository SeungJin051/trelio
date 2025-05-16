'use client';

import React, { forwardRef, useState } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { FaEye } from 'react-icons/fa';
import { IoIosEyeOff } from 'react-icons/io';
import { IoIosClose } from 'react-icons/io';

import { cn } from '@ui/utils/cn';

const inputVariants = cva(
  'w-full rounded-lg border bg-white px-4 py-3 text-base text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400',
  {
    variants: {
      variant: {
        default:
          'border-gray-200 focus:border-[#3182F6] focus:ring-2 focus:ring-[#3182F6]/10',
        error:
          'border-red-500 text-red-500 placeholder:text-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10',
        success:
          'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/10',
      },
      size: {
        sm: 'py-2 text-sm',
        default: 'py-3',
        lg: 'py-4 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: true,
    },
  }
);

// 기존 HTMLInputElement의 size를 제외하고 커스텀 size를 사용하기 위한 타입 정의
type InputPropsWithoutSize = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
>;

export interface InputProps
  extends InputPropsWithoutSize,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  // 커스텀 size 속성 (HTML size가 아닌 디자인 시스템의 size)
  size?: 'sm' | 'default' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      size,
      fullWidth,
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      clearable = false,
      onClear,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      setInputValue('');
      onClear?.();

      // 입력 필드에 포커스 유지
      const inputElement = ref as React.RefObject<HTMLInputElement>;
      inputElement.current?.focus();
    };

    const isPasswordType = type === 'password';
    const effectiveType = isPasswordType && showPassword ? 'text' : type;
    const hasValue = inputValue !== '' && inputValue !== undefined;
    const showClearButton = clearable && hasValue && !disabled;

    // 오류가 있으면 variant를 error로 설정
    const effectiveVariant = errorText ? 'error' : variant;

    return (
      <div className={cn('w-full', fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <label className='mb-1.5 block text-sm font-medium text-gray-700'>
            {label}
          </label>
        )}
        <div className='relative'>
          {leftIcon && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
              {leftIcon}
            </div>
          )}
          <input
            type={effectiveType}
            className={cn(
              inputVariants({
                variant: effectiveVariant,
                size,
                fullWidth,
              }),
              leftIcon && 'pl-10',
              (rightIcon || isPasswordType || showClearButton) && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            value={inputValue}
            onChange={handleChange}
            aria-invalid={!!errorText}
            aria-describedby={
              errorText
                ? `${props.id || ''}-error`
                : helperText
                  ? `${props.id || ''}-helper`
                  : undefined
            }
            {...props}
          />
          <div className='absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2'>
            {showClearButton && (
              <button
                type='button'
                onClick={handleClear}
                className='text-gray-400 hover:text-gray-600 focus:outline-none'
                aria-label='입력 내용 지우기'
              >
                <IoIosClose size={18} />
              </button>
            )}
            {isPasswordType && (
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='text-gray-400 hover:text-gray-600 focus:outline-none'
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              >
                {showPassword ? <IoIosEyeOff size={18} /> : <FaEye size={18} />}
              </button>
            )}
            {rightIcon && !isPasswordType && (
              <div className='text-gray-500'>{rightIcon}</div>
            )}
          </div>
        </div>
        {helperText && !errorText && (
          <p
            id={`${props.id || ''}-helper`}
            className='mt-1.5 text-xs text-gray-500'
          >
            {helperText}
          </p>
        )}
        {errorText && (
          <p
            id={`${props.id || ''}-error`}
            className='mt-1.5 text-xs text-red-500'
          >
            {errorText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
