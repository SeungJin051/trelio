import type { Meta, StoryObj } from '@storybook/react';
import { Carousel, CarouselItem } from '@web/components/basic/Carousel';

// 테스트용 이미지 URL
const images = [
  'https://picsum.photos/id/1018/1000/600',
  'https://picsum.photos/id/1015/1000/600',
  'https://picsum.photos/id/1019/1000/600',
  'https://picsum.photos/id/1021/1000/600',
];

const meta: Meta<typeof Carousel> = {
  title: 'Basic/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    autoPlay: {
      control: 'boolean',
      description: '자동 슬라이드 재생 여부',
      defaultValue: true,
    },
    interval: {
      control: { type: 'number', min: 1000, max: 10000, step: 500 },
      description: '자동 슬라이드 간격(ms)',
      defaultValue: 5000,
    },
    showControls: {
      control: 'boolean',
      description: '이전/다음 컨트롤 버튼 표시 여부',
      defaultValue: true,
    },
    showIndicators: {
      control: 'boolean',
      description: '인디케이터 표시 여부',
      defaultValue: true,
    },
    infiniteLoop: {
      control: 'boolean',
      description: '무한 슬라이드 여부',
      defaultValue: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

// 기본 이미지 캐러셀
export const Default: Story = {
  render: (args) => (
    <div className='w-full max-w-3xl'>
      <Carousel {...args}>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className='relative h-[400px] w-full'>
              <img
                src={src}
                alt={`슬라이드 ${index + 1}`}
                className='h-full w-full object-cover'
              />
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  ),
  args: {
    autoPlay: true,
    interval: 5000,
    showControls: true,
    showIndicators: true,
    infiniteLoop: true,
  },
};

// 컨트롤만 있는 캐러셀
export const ControlsOnly: Story = {
  render: (args) => (
    <div className='w-full max-w-3xl'>
      <Carousel {...args}>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className='relative h-[400px] w-full'>
              <img
                src={src}
                alt={`슬라이드 ${index + 1}`}
                className='h-full w-full object-cover'
              />
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  ),
  args: {
    autoPlay: false,
    showControls: true,
    showIndicators: false,
    infiniteLoop: true,
  },
};

// 인디케이터만 있는 캐러셀
export const IndicatorsOnly: Story = {
  render: (args) => (
    <div className='w-full max-w-3xl'>
      <Carousel {...args}>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className='relative h-[400px] w-full'>
              <img
                src={src}
                alt={`슬라이드 ${index + 1}`}
                className='h-full w-full object-cover'
              />
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  ),
  args: {
    autoPlay: true,
    interval: 3000,
    showControls: false,
    showIndicators: true,
    infiniteLoop: true,
  },
};

// 상호작용 캐러셀
export const InteractiveCarousel = () => {
  return (
    <div className='w-full max-w-3xl'>
      <Carousel autoPlay={false} showControls={true} showIndicators={true}>
        {images.map((src, index) => (
          <CarouselItem key={index} className='relative'>
            <div className='relative h-[400px] w-full'>
              <img
                src={src}
                alt={`슬라이드 ${index + 1}`}
                className='h-full w-full object-cover'
              />
              <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 text-white'>
                <h3 className='text-xl font-bold'>이미지 제목 {index + 1}</h3>
                <p>이미지 설명이 여기에 표시됩니다.</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  );
};
