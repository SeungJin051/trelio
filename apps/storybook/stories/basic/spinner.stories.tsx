import type { Meta, StoryObj } from '@storybook/react';

import { Spinner } from '@ui/components/spinner';

// 메타데이터 정의
const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: '스피너 크기',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

// 기본 스피너
export const Default: Story = {
  args: {
    size: 'medium',
  },
};

// 작은 크기 스피너
export const Small: Story = {
  args: {
    size: 'small',
  },
};

// 중간 크기 스피너
export const Medium: Story = {
  args: {
    size: 'medium',
  },
};

// 큰 크기 스피너
export const Large: Story = {
  args: {
    size: 'large',
  },
};

// 다양한 크기 비교
export const AllSizes: Story = {
  render: () => (
    <div className='flex items-center justify-center gap-4'>
      <Spinner size='small' />
      <Spinner size='medium' />
      <Spinner size='large' />
    </div>
  ),
};

// 로딩 상태 컨텍스트 예시
export const LoadingContext: Story = {
  render: () => (
    <div className='w-full max-w-md'>
      {/* 버튼 내부에 스피너 */}
      <button className='flex items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white'>
        <Spinner size='small' />
        <span>로딩 중...</span>
      </button>

      {/* 카드 내부에 로딩 상태 */}
      <div className='mt-4 rounded-lg border border-gray-200 p-6'>
        <div className='flex h-40 flex-col items-center justify-center'>
          <Spinner size='large' />
          <p className='mt-4 text-gray-500'>데이터를 불러오는 중입니다</p>
        </div>
      </div>

      {/* 인라인 텍스트 로딩 */}
      <div className='mt-4 flex items-center gap-2'>
        <span>결과</span>
        <Spinner size='small' />
        <span>검색 중</span>
      </div>
    </div>
  ),
};
