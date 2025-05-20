import type { Meta, StoryObj } from '@storybook/react';
import { Header, SimpleHeader } from '@web/components/layout/Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/SimpleHeader',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Header>;

// 기본 헤더
export const Default: Story = {
  render: () => (
    <div className='h-screen'>
      <SimpleHeader />
      <div className='flex h-screen items-center justify-center bg-gray-100 pt-24'>
        <div className='max-w-2xl px-4 text-center'>
          <h1 className='mb-6 text-3xl font-bold'>메인 페이지 콘텐츠</h1>
          <p className='text-xl text-gray-600'>
            이것은 헤더 아래에 표시되는 콘텐츠입니다. 헤더는 상단에 고정되어
            있습니다.
          </p>
        </div>
      </div>
    </div>
  ),
};
