import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '@web/components/layout/Header';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
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
      <Header />
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

// 스크롤 가능한 콘텐츠 헤더
export const WithScrollableContent: Story = {
  render: () => (
    <div className='h-auto'>
      <Header />
      <div className='bg-gray-100 pt-24'>
        <div className='mx-auto max-w-2xl px-4 py-12'>
          <h1 className='mb-6 text-3xl font-bold'>스크롤 가능한 페이지</h1>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className='mb-8'>
              <h2 className='mb-4 text-2xl font-semibold'>섹션 {index + 1}</h2>
              <p className='mb-4 text-gray-600'>
                이 페이지를 스크롤하면 헤더가 상단에 고정되어 있는 것을 확인할
                수 있습니다. Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Vivamus lacinia odio vitae vestibulum vestibulum.
              </p>
              <p className='text-gray-600'>
                Nullam elementum blandit nulla, in pulvinar nunc iaculis ac.
                Phasellus vulputate, tortor nec rhoncus cursus, velit nibh
                pellentesque sapien, at blandit lectus quam non dolor.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

// 전체 레이아웃 예시 (헤더 + 컨텐츠 + 푸터)
export const FullLayoutExample: Story = {
  render: () => {
    return (
      <div className='flex min-h-screen flex-col'>
        <Header />
        <main className='flex-1 bg-gray-100 pt-24'>
          <div className='mx-auto max-w-2xl px-4 py-12'>
            <h1 className='mb-6 text-3xl font-bold'>전체 레이아웃 예시</h1>
            <p className='mb-8 text-gray-600'>
              이 예시는 헤더, 메인 콘텐츠, 푸터를 포함한 전체 레이아웃을
              보여줍니다. 실제 애플리케이션에서 페이지가 어떻게 구성되는지
              확인할 수 있습니다.
            </p>
            <div className='mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <h2 className='mb-4 text-2xl font-medium'>콘텐츠 섹션</h2>
              <p className='text-gray-600'>
                이것은 페이지 내의 콘텐츠 섹션입니다. 실제 애플리케이션에서는
                다양한 컴포넌트와 데이터가 이곳에 표시됩니다.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  },
};
