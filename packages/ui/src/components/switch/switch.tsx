import { useId } from 'react';

import { cn } from '@ui/utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  containerClassName?: string;
  label?: string;
  size?: 'small' | 'medium';
}

export const Switch = ({
  checked,
  onChange,
  containerClassName,
  label,
  size = 'medium',
}: SwitchProps) => {
  const id = useId(); // useId 훅을 통해 고유한 ID 생성

  return (
    <div className={cn('flex items-center gap-2', containerClassName)}>
      <input
        id={id}
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className='peer sr-only'
      />
      <div
        onClick={() => onChange(!checked)} // 시각적 요소를 클릭해도 토글되도록 추가
        className={cn(
          'relative rounded-full bg-gray-200',
          'after:absolute after:rounded-full after:border after:border-gray-300 after:bg-white',
          'after:transition-all after:content-[""]',
          'peer-checked:bg-blue-600 peer-checked:after:translate-x-full',
          'peer-checked:after:border-white',
          'peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300',
          'dark:border-gray-600 dark:bg-gray-700',
          'dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800',
          'rtl:peer-checked:after:-translate-x-full',
          'cursor-pointer',
          // 사이즈별 스타일
          {
            // Medium (기본) 사이즈
            'h-6 w-11 after:start-[2px] after:top-[2px] after:h-5 after:w-5':
              size === 'medium',
            // Small 사이즈
            'h-5 w-9 after:start-[2px] after:top-[2px] after:h-4 after:w-4':
              size === 'small',
          }
        )}
      />
      {label && ( // 레이블이 있을 경우에만 렌더링
        <label htmlFor={id} className='cursor-pointer select-none'>
          {label}
        </label>
      )}
    </div>
  );
};

Switch.displayName = 'Switch';
