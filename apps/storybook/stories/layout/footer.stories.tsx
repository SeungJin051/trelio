import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from '@web/components/layout/Footer';

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Footer>;

// 기본 푸터
export const Default: Story = {
  render: () => (
    <div className='h-screen'>
      <div className='flex h-[calc(100vh-200px)] items-center justify-center bg-gray-100'>
        <p className='text-xl text-gray-500'>페이지 콘텐츠</p>
      </div>
      <Footer />
    </div>
  ),
};
