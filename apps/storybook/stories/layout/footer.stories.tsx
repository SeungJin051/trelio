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

// 짧은 페이지에서의 푸터
export const ShortPage: Story = {
  render: () => (
    <div className='flex h-auto min-h-screen flex-col'>
      <div className='flex flex-1 items-center justify-center bg-gray-100 p-8'>
        <p className='text-xl text-gray-500'>짧은 콘텐츠</p>
      </div>
      <Footer />
    </div>
  ),
};

// 긴 페이지에서의 푸터
export const LongPage: Story = {
  render: () => (
    <div className='h-auto'>
      <div className='bg-gray-100 p-8'>
        <div className='mx-auto max-w-screen-md'>
          <h1 className='mb-6 text-3xl font-bold'>긴 콘텐츠 페이지</h1>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='mb-8'>
              <h2 className='mb-4 text-2xl font-semibold'>섹션 {index + 1}</h2>
              <p className='mb-4 text-gray-600'>
                이것은 긴 콘텐츠 페이지의 예시입니다. 푸터가 어떻게 표시되는지
                확인할 수 있습니다. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Vivamus lacinia odio vitae vestibulum
                vestibulum.
              </p>
              <p className='mb-4 text-gray-600'>
                Nullam elementum blandit nulla, in pulvinar nunc iaculis ac.
                Phasellus vulputate, tortor nec rhoncus cursus, velit nibh
                pellentesque sapien, at blandit lectus quam non dolor.
              </p>
              <p className='text-gray-600'>
                Pellentesque habitant morbi tristique senectus et netus et
                malesuada fames ac turpis egestas. Vestibulum tortor quam,
                feugiat vitae, ultricies eget, tempor sit amet, ante.
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  ),
};
