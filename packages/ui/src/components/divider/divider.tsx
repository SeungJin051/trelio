import { cn } from '@ui/utils/cn';

// Divider 컴포넌트의 props 타입을 정의합니다.
// colorTheme: 구분선의 색상을 지정하는 선택적 prop입니다.
// height: 구분선의 높이를 지정하는 선택적 prop입니다.
interface DividerProps {
  colorTheme?: string;
  height?: string;
}

// 각 색상 테마별 Tailwind CSS 클래스를 정의합니다.
// bg-{color}-200: 배경색을 지정하는 Tailwind 클래스입니다.
const themeStyles = {
  gray: 'bg-gray-200',
  white: 'bg-white',
  black: 'bg-black',
  blue: 'bg-blue-200',
  green: 'bg-green-200',
  red: 'bg-red-200',
  yellow: 'bg-yellow-200',
  purple: 'bg-purple-200',
};

const heightStyles = {
  small: 'h-[1px]',
  medium: 'h-[2px]',
  large: 'h-[3px]',
};

// Divider 컴포넌트를 정의합니다.
export const Divider = ({
  colorTheme = 'gray',
  height = 'small',
}: DividerProps) => {
  return (
    <div
      className={cn(
        'w-full', // 너비 100%로 설정
        themeStyles[colorTheme as keyof typeof themeStyles], // 선택된 색상 테마 적용
        heightStyles[height as keyof typeof heightStyles] // 선택된 높이 테마 적용
      )}
    />
  );
};

// React DevTools에서 컴포넌트 이름을 표시하기 위한 설정입니다.
Divider.displayName = 'Divider';
