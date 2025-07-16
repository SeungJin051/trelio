import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from '@web/components/layout/Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: '사이드바 열림 상태',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// 인터랙티브 사이드바
export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className='h-screen bg-gray-50'>
        <Sidebar isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />

        <div
          className={`flex h-screen items-center justify-center bg-gray-100 transition-all duration-300 ${
            isOpen ? 'ml-80' : 'ml-16'
          }`}
        >
          <div className='max-w-2xl px-4 text-center'>
            <h1 className='mb-6 text-3xl font-bold'>인터랙티브 사이드바</h1>
            <p className='mb-6 text-xl text-gray-600'>
              사이드바를 클릭하여 열고 닫을 수 있습니다.
              {isOpen ? ' 현재 열려있습니다.' : ' 현재 닫혀있습니다.'}
            </p>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className='rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600'
            >
              {isOpen ? '사이드바 닫기' : '사이드바 열기'}
            </button>
          </div>
        </div>
      </div>
    );
  },
};

// 기본 사이드바 (닫힌 상태)
export const Closed: Story = {
  render: (args) => (
    <div className='h-screen bg-gray-50'>
      <Sidebar {...args} />

      <div className='ml-16 flex h-screen items-center justify-center bg-gray-100'>
        <div className='max-w-2xl px-4 text-center'>
          <h1 className='mb-6 text-3xl font-bold'>닫힌 사이드바</h1>
          <p className='text-xl text-gray-600'>
            사이드바가 닫힌 상태입니다. 아이콘만 표시되어 최소한의 공간을
            차지합니다.
          </p>
        </div>
      </div>
    </div>
  ),
  args: {
    isOpen: false,
    onToggle: () => {},
  },
};

// 기본 사이드바 (열린 상태)
export const Open: Story = {
  render: (args) => (
    <div className='h-screen bg-gray-50'>
      <Sidebar {...args} />

      <div className='ml-80 flex h-screen items-center justify-center bg-gray-100'>
        <div className='max-w-2xl px-4 text-center'>
          <h1 className='mb-6 text-3xl font-bold'>열린 사이드바</h1>
          <p className='text-xl text-gray-600'>
            사이드바가 열린 상태입니다. 메뉴 항목과 여행 계획 목록을 확인할 수
            있습니다.
          </p>
        </div>
      </div>
    </div>
  ),
  args: {
    isOpen: true,
    onToggle: () => {},
  },
};
