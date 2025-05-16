import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from '@ui/components/badge';

// 메타데이터 정의
const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text', description: '뱃지 내용' },
    colorTheme: {
      control: { type: 'select' },
      options: ['red', 'blue', 'green', 'yellow', 'purple', 'gray', 'black'],
      description: '뱃지 색상 테마',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: '뱃지 크기',
    },
    variant: {
      control: { type: 'radio' },
      options: ['filled', 'outlined'],
      description: '뱃지 스타일 변형',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// 기본 뱃지
export const Default: Story = {
  args: {
    children: '기본',
    colorTheme: 'blue',
    size: 'medium',
    variant: 'filled',
  },
};

// 색상별 뱃지 (filled)
export const FilledColors: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <Badge colorTheme='red' variant='filled'>
        빨강
      </Badge>
      <Badge colorTheme='blue' variant='filled'>
        파랑
      </Badge>
      <Badge colorTheme='green' variant='filled'>
        초록
      </Badge>
      <Badge colorTheme='yellow' variant='filled'>
        노랑
      </Badge>
      <Badge colorTheme='purple' variant='filled'>
        보라
      </Badge>
      <Badge colorTheme='gray' variant='filled'>
        회색
      </Badge>
      <Badge colorTheme='black' variant='filled'>
        검정
      </Badge>
    </div>
  ),
};

// 색상별 뱃지 (outlined)
export const OutlinedColors: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <Badge colorTheme='red' variant='outlined'>
        빨강
      </Badge>
      <Badge colorTheme='blue' variant='outlined'>
        파랑
      </Badge>
      <Badge colorTheme='green' variant='outlined'>
        초록
      </Badge>
      <Badge colorTheme='yellow' variant='outlined'>
        노랑
      </Badge>
      <Badge colorTheme='purple' variant='outlined'>
        보라
      </Badge>
      <Badge colorTheme='gray' variant='outlined'>
        회색
      </Badge>
      <Badge colorTheme='black' variant='outlined'>
        검정
      </Badge>
    </div>
  ),
};

// 크기별 뱃지
export const Sizes: Story = {
  render: () => (
    <div className='flex flex-wrap items-center gap-2'>
      <Badge colorTheme='blue' size='small'>
        작은
      </Badge>
      <Badge colorTheme='blue' size='medium'>
        중간
      </Badge>
      <Badge colorTheme='blue' size='large'>
        큰
      </Badge>
    </div>
  ),
};

// 다양한 콘텐츠
export const Content: Story = {
  render: () => (
    <div className='space-y-4'>
      {/* 텍스트만 있는 기본 뱃지 */}
      <div className='flex flex-wrap gap-2'>
        <Badge colorTheme='red'>new</Badge>
        <Badge colorTheme='green'>완료</Badge>
        <Badge colorTheme='blue'>진행중</Badge>
        <Badge colorTheme='yellow'>검토중</Badge>
        <Badge colorTheme='purple'>보류</Badge>
      </div>

      {/* 숫자 표시 */}
      <div className='flex flex-wrap gap-2'>
        <Badge colorTheme='red' variant='outlined'>
          12
        </Badge>
        <Badge colorTheme='blue' variant='outlined'>
          24
        </Badge>
        <Badge colorTheme='green' variant='outlined'>
          99+
        </Badge>
      </div>

      {/* 상태 표시 */}
      <div className='flex flex-wrap gap-2'>
        <Badge colorTheme='green'>✓ 성공</Badge>
        <Badge colorTheme='red'>✗ 실패</Badge>
        <Badge colorTheme='yellow'>⚠ 경고</Badge>
        <Badge colorTheme='blue'>ℹ 정보</Badge>
      </div>
    </div>
  ),
};

// 사용 예시
export const Examples: Story = {
  render: () => (
    <div className='max-w-md space-y-6 p-4'>
      {/* 제품 카드에서의 사용 */}
      <div className='relative rounded-md border p-3'>
        <div className='absolute right-2 top-2'>
          <Badge colorTheme='red' size='small'>
            NEW
          </Badge>
        </div>
        <div className='mb-2 mt-4 font-bold'>최신 스마트폰</div>
        <div className='text-sm text-gray-600'>
          신제품 출시 특가 이벤트 진행중
        </div>
        <div className='mt-2'>
          <Badge colorTheme='green' variant='outlined' size='small'>
            특가
          </Badge>
          <div className='ml-1 inline-block'>
            <Badge colorTheme='blue' variant='outlined' size='small'>
              무료배송
            </Badge>
          </div>
        </div>
      </div>

      {/* 알림에서의 사용 */}
      <div className='flex items-center justify-between border-b pb-3'>
        <div className='flex items-center gap-2'>
          <div className='h-10 w-10 rounded-full bg-gray-200'></div>
          <div>
            <div className='font-medium'>시스템 알림</div>
            <div className='text-sm text-gray-600'>
              서버 업데이트가 완료되었습니다.
            </div>
          </div>
        </div>
        <Badge colorTheme='green' size='small'>
          완료
        </Badge>
      </div>

      <div className='flex items-center justify-between border-b pb-3'>
        <div className='flex items-center gap-2'>
          <div className='h-10 w-10 rounded-full bg-gray-200'></div>
          <div>
            <div className='font-medium'>시스템 알림</div>
            <div className='text-sm text-gray-600'>
              서버 업데이트가 필요합니다.
            </div>
          </div>
        </div>
        <Badge colorTheme='red' size='small'>
          긴급
        </Badge>
      </div>
    </div>
  ),
};
