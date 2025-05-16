import type { Meta, StoryObj } from '@storybook/react';

import { Typography } from '@ui/components/typography';

// 메타데이터 정의
const meta: Meta<typeof Typography> = {
  title: 'UI/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'subtitle1',
        'subtitle2',
        'body1',
        'body2',
        'caption',
        'overline',
      ],
      description: '텍스트 변형 스타일',
    },
    weight: {
      control: { type: 'select' },
      options: [
        'thin',
        'extraLight',
        'light',
        'regular',
        'medium',
        'semiBold',
        'bold',
        'extraBold',
        'black',
      ],
      description: '폰트 두께',
    },
    as: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'],
      description: '렌더링할 HTML 요소 타입',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

// 기본 타이포그래피
export const Default: Story = {
  args: {
    children: '기본 타이포그래피 텍스트',
    variant: 'body1',
    weight: 'regular',
  },
};

// 제목 타이포그래피
export const Headings: Story = {
  render: () => (
    <div className='space-y-4'>
      <Typography variant='h1'>H1 제목 (2.25rem)</Typography>
      <Typography variant='h2'>H2 제목 (1.875rem)</Typography>
      <Typography variant='h3'>H3 제목 (1.5rem)</Typography>
      <Typography variant='h4'>H4 제목 (1.25rem)</Typography>
      <Typography variant='h5'>H5 제목 (1.125rem)</Typography>
      <Typography variant='h6'>H6 제목 (1rem)</Typography>
    </div>
  ),
};

// 부제목 타이포그래피
export const Subtitles: Story = {
  render: () => (
    <div className='space-y-2'>
      <Typography variant='subtitle1'>부제목 1 (1rem)</Typography>
      <Typography variant='subtitle2'>부제목 2 (0.875rem)</Typography>
    </div>
  ),
};

// 본문 타이포그래피
export const BodyText: Story = {
  render: () => (
    <div className='space-y-4'>
      <Typography variant='body1'>
        본문 텍스트 1 (1rem) - 이것은 기본 본문 텍스트입니다. 일반적인 단락과
        내용을 표시하는 데 사용됩니다. 최적의 가독성을 위해 조정된 크기와 줄
        높이를 가지고 있습니다.
      </Typography>
      <Typography variant='body2'>
        본문 텍스트 2 (0.875rem) - 이것은 더 작은 본문 텍스트입니다. 덜 중요한
        정보나 더 많은 텍스트를 제한된 공간에 표시해야 할 때 사용됩니다.
      </Typography>
    </div>
  ),
};

// 기타 타이포그래피
export const UtilityText: Story = {
  render: () => (
    <div className='space-y-4'>
      <Typography variant='caption'>
        캡션 텍스트 (0.75rem) - 이미지 캡션이나 작은 설명에 사용됩니다.
      </Typography>
      <Typography variant='overline'>
        오버라인 텍스트 (0.75rem, 대문자, 넓은 자간)
      </Typography>
    </div>
  ),
};

// 폰트 두께 타이포그래피
export const FontWeights: Story = {
  render: () => (
    <div className='space-y-2'>
      <Typography variant='body1' weight='thin'>
        Thin (100) - 가장 가벼운 두께
      </Typography>
      <Typography variant='body1' weight='extraLight'>
        Extra Light (200) - 매우 가벼운 두께
      </Typography>
      <Typography variant='body1' weight='light'>
        Light (300) - 가벼운 두께
      </Typography>
      <Typography variant='body1' weight='regular'>
        Regular (400) - 일반 두께 (기본값)
      </Typography>
      <Typography variant='body1' weight='medium'>
        Medium (500) - 중간 두께
      </Typography>
      <Typography variant='body1' weight='semiBold'>
        Semi Bold (600) - 약간 굵은 두께
      </Typography>
      <Typography variant='body1' weight='bold'>
        Bold (700) - 굵은 두께
      </Typography>
      <Typography variant='body1' weight='extraBold'>
        Extra Bold (800) - 매우 굵은 두께
      </Typography>
      <Typography variant='body1' weight='black'>
        Black (900) - 가장 굵은 두께
      </Typography>
    </div>
  ),
};

// 사용 예시
export const Examples: Story = {
  render: () => (
    <div className='max-w-md space-y-6'>
      {/* 블로그 포스트 제목 예시 */}
      <div>
        <Typography
          variant='overline'
          weight='medium'
          className='mb-1 text-blue-600'
        >
          블로그
        </Typography>
        <Typography variant='h3' weight='bold' className='mb-2'>
          타이포그래피 시스템의 중요성
        </Typography>
        <Typography
          variant='subtitle2'
          weight='medium'
          className='text-gray-600'
        >
          작성자: 홍길동 • 2023년 5월 20일
        </Typography>
      </div>

      {/* 카드 UI 예시 */}
      <div className='rounded-lg border p-4'>
        <Typography variant='h5' weight='semiBold' className='mb-2'>
          프리미엄 요금제
        </Typography>
        <Typography variant='h3' weight='bold' className='mb-2'>
          ₩19,000
          <Typography as='span' variant='body2'>
            /월
          </Typography>
        </Typography>
        <Typography variant='body2' className='mb-4 text-gray-600'>
          모든 기능을 포함한 프리미엄 요금제입니다. 다양한 추가 기능을
          이용해보세요.
        </Typography>
        <div className='rounded bg-blue-500 p-2 text-center text-white'>
          <Typography variant='body2' weight='medium'>
            시작하기
          </Typography>
        </div>
      </div>
    </div>
  ),
};
