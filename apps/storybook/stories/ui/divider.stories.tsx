import type { Meta, StoryObj } from '@storybook/react';

import { Divider } from '@ui/components/divider';

// 메타데이터 정의
const meta: Meta<typeof Divider> = {
  title: 'UI/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    colorTheme: {
      control: { type: 'select' },
      options: [
        'gray',
        'white',
        'black',
        'blue',
        'green',
        'red',
        'yellow',
        'purple',
      ],
      description: '구분선 색상',
    },
    height: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: '구분선 높이',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

// 기본 구분선
export const Default: Story = {
  args: {
    colorTheme: 'gray',
    height: 'small',
  },
  decorators: [
    (Story) => (
      <div className='w-80'>
        <Story />
      </div>
    ),
  ],
};

// 색상별 구분선
export const Colors: Story = {
  render: () => (
    <div className='flex w-80 flex-col gap-6'>
      <div>
        <p className='mb-2'>회색 (기본)</p>
        <Divider colorTheme='gray' height='medium' />
      </div>
      <div>
        <p className='mb-2'>검정</p>
        <Divider colorTheme='black' height='medium' />
      </div>
      <div>
        <p className='mb-2'>파랑</p>
        <Divider colorTheme='blue' height='medium' />
      </div>
      <div>
        <p className='mb-2'>초록</p>
        <Divider colorTheme='green' height='medium' />
      </div>
      <div>
        <p className='mb-2'>빨강</p>
        <Divider colorTheme='red' height='medium' />
      </div>
      <div>
        <p className='mb-2'>노랑</p>
        <Divider colorTheme='yellow' height='medium' />
      </div>
      <div>
        <p className='mb-2'>보라</p>
        <Divider colorTheme='purple' height='medium' />
      </div>
    </div>
  ),
};

// 높이별 구분선
export const Heights: Story = {
  render: () => (
    <div className='flex w-80 flex-col gap-6'>
      <div>
        <p className='mb-2'>작은 높이 (1px)</p>
        <Divider colorTheme='black' height='small' />
      </div>
      <div>
        <p className='mb-2'>중간 높이 (2px)</p>
        <Divider colorTheme='black' height='medium' />
      </div>
      <div>
        <p className='mb-2'>큰 높이 (3px)</p>
        <Divider colorTheme='black' height='large' />
      </div>
    </div>
  ),
};

// 사용 예시
export const Examples: Story = {
  render: () => (
    <div className='w-80 space-y-4'>
      {/* 헤더와 본문 사이의 구분선 */}
      <div>
        <h2 className='text-xl font-bold'>문서 제목</h2>
        <Divider colorTheme='gray' height='small' />
        <p className='mt-3'>
          여기에 본문 내용이 들어갑니다. 구분선은 헤더와 본문 사이에 시각적인
          구분을 제공합니다.
        </p>
      </div>

      {/* 카드 내부 요소 구분 */}
      <div className='rounded-lg border border-gray-200 p-4'>
        <div className='font-medium'>섹션 1</div>
        <p className='mt-1 text-sm text-gray-600'>첫 번째 섹션 내용입니다.</p>

        <div className='my-3'>
          <Divider colorTheme='gray' height='small' />
        </div>

        <div className='font-medium'>섹션 2</div>
        <p className='mt-1 text-sm text-gray-600'>두 번째 섹션 내용입니다.</p>

        <div className='my-3'>
          <Divider colorTheme='gray' height='small' />
        </div>

        <div className='font-medium'>섹션 3</div>
        <p className='mt-1 text-sm text-gray-600'>세 번째 섹션 내용입니다.</p>
      </div>

      {/* 강조된 구분선 */}
      <div className='rounded-lg border border-gray-200 p-4'>
        <h3 className='text-lg font-bold'>중요 섹션</h3>
        <Divider colorTheme='red' height='medium' />
        <p className='mt-3 text-sm'>
          색상과 두께를 활용하여 중요 섹션을 강조할 수 있습니다.
        </p>
      </div>

      {/* 목록 아이템 구분 */}
      <div className='rounded-lg border border-gray-200 p-4'>
        <div className='py-2'>항목 1</div>
        <Divider colorTheme='blue' height='small' />
        <div className='py-2'>항목 2</div>
        <Divider colorTheme='blue' height='small' />
        <div className='py-2'>항목 3</div>
      </div>
    </div>
  ),
};
