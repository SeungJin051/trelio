import { cn } from '@ui/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  colorTheme: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray' | 'black';
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined';
}
export const Badge = ({
  children,
  colorTheme,
  size = 'medium',
  variant = 'filled',
}: BadgeProps) => {
  // 각 테마와 배리언트에 대한 스타일 (배경, 텍스트, 테두리 포함)
  const themeStyles = {
    filled: {
      red: 'bg-red-100 text-red-700',
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      purple: 'bg-purple-100 text-purple-700',
      gray: 'bg-gray-100 text-gray-700',
      black: 'bg-black text-white',
    },
    outlined: {
      red: 'bg-white text-red-600 border border-red-500',
      blue: 'bg-white text-blue-600 border border-blue-500',
      green: 'bg-white text-green-600 border border-green-500',
      yellow: 'bg-white text-yellow-600 border border-yellow-500',
      purple: 'bg-white text-purple-600 border border-purple-500',
      gray: 'bg-white text-gray-600 border border-gray-500',
      black: 'bg-white text-black border border-black',
    },
  };

  // 사이즈별 스타일 (텍스트 크기 및 패딩)
  const sizeStyles = {
    small: 'text-xs px-1.5 py-0.5',
    medium: 'text-sm px-2 py-1', // 기존 text-base에서 text-sm으로 변경 제안
    large: 'text-base px-2.5 py-1.5', // 기존 text-lg에서 text-base으로 변경 제안
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        themeStyles[variant][colorTheme],
        sizeStyles[size]
      )}
    >
      {children}
    </div>
  );
};

Badge.displayName = 'Badge';
