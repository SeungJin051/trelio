import type { Meta, StoryObj } from '@storybook/react';
import { IoAddOutline, IoNotificationsOutline } from 'react-icons/io5';

import { Button } from '@ui/components/button';
import { Icon } from '@ui/components/icon';

// 메타데이터 정의
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['filled', 'text', 'outlined', 'ghost'],
      description: '버튼 스타일 변형',
    },
    colorTheme: {
      control: { type: 'select' },
      options: [
        'blue',
        'purple',
        'pink',
        'orange',
        'green',
        'yellow',
        'gray',
        'red',
      ],
      description: '버튼 색상 테마',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: '버튼 크기',
    },
    disabled: { control: 'boolean', description: '비활성화 상태' },
    fullWidth: { control: 'boolean', description: '너비 100% 설정' },
    active: { control: 'boolean', description: '활성화 상태 (시각적 강조)' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// 기본 버튼
export const Default: Story = {
  args: {
    children: '버튼',
    variant: 'filled',
    colorTheme: 'blue',
    size: 'medium',
  },
};

// 아웃라인 버튼
export const Outlined: Story = {
  args: {
    children: '아웃라인 버튼',
    variant: 'outlined',
    colorTheme: 'blue',
    size: 'medium',
  },
};

// 텍스트 버튼
export const Text: Story = {
  args: {
    children: '텍스트 버튼',
    variant: 'text',
    colorTheme: 'blue',
    size: 'medium',
  },
};

// 다양한 크기
export const Sizes: Story = {
  render: (args) => (
    <div className='flex items-center gap-4'>
      <Button {...args} size='small'>
        작게
      </Button>
      <Button {...args} size='medium'>
        중간
      </Button>
      <Button {...args} size='large'>
        크게
      </Button>
    </div>
  ),
  args: {
    variant: 'filled',
    colorTheme: 'blue',
  },
};

// 다양한 색상
export const Colors: Story = {
  render: (args) => (
    <div className='flex flex-wrap gap-2'>
      <Button {...args} colorTheme='blue'>
        파랑
      </Button>
      <Button {...args} colorTheme='purple'>
        보라
      </Button>
      <Button {...args} colorTheme='pink'>
        분홍
      </Button>
      <Button {...args} colorTheme='orange'>
        주황
      </Button>
      <Button {...args} colorTheme='green'>
        초록
      </Button>
      <Button {...args} colorTheme='yellow'>
        노랑
      </Button>
      <Button {...args} colorTheme='gray'>
        회색
      </Button>
      <Button {...args} colorTheme='red'>
        빨강
      </Button>
    </div>
  ),
  args: {
    variant: 'filled',
    size: 'medium',
  },
};

// 비활성화 버튼
export const Disabled: Story = {
  args: {
    children: '비활성화 버튼',
    variant: 'filled',
    colorTheme: 'blue',
    size: 'medium',
    disabled: true,
  },
};

// 아이콘이 있는 버튼
export const WithIcons: Story = {
  render: (args) => (
    <div className='flex flex-col gap-2'>
      <Button {...args} leftIcon={<span>👈</span>}>
        왼쪽 아이콘
      </Button>
      <Button {...args} rightIcon={<span>👉</span>}>
        오른쪽 아이콘
      </Button>
      <Button {...args} leftIcon={<span>👈</span>} rightIcon={<span>👉</span>}>
        양쪽 아이콘
      </Button>
    </div>
  ),
  args: {
    variant: 'filled',
    colorTheme: 'blue',
    size: 'medium',
  },
};

// 전체 너비 버튼
export const FullWidth: Story = {
  args: {
    children: '전체 너비 버튼',
    variant: 'filled',
    colorTheme: 'blue',
    size: 'medium',
    fullWidth: true,
  },
};

// 클릭 이벤트 테스트
export const WithClickEvent: Story = {
  args: {
    children: '클릭해보세요',
    variant: 'filled',
    colorTheme: 'green',
    size: 'medium',
    onClick: () => alert('버튼이 클릭되었습니다!'),
  },
};

// Ghost 버튼
export const Ghost: Story = {
  args: {
    children: 'Ghost 버튼',
    variant: 'ghost',
    colorTheme: 'gray',
    size: 'medium',
  },
};

// Ghost 버튼 with 아이콘
export const GhostWithIcon: Story = {
  render: (args) => (
    <div className='flex gap-4'>
      <Button {...args} leftIcon={<Icon as={IoAddOutline} size={20} />}>
        추가
      </Button>
      <Button
        {...args}
        leftIcon={<Icon as={IoNotificationsOutline} size={20} />}
      >
        알림
      </Button>
    </div>
  ),
  args: {
    variant: 'ghost',
    colorTheme: 'gray',
    size: 'medium',
  },
};

// 모든 Variant 비교
export const AllVariants: Story = {
  render: (args) => (
    <div className='grid grid-cols-4 gap-4'>
      <div className='text-center'>
        <h4 className='mb-2 text-sm font-medium'>Filled</h4>
        <Button {...args} variant='filled'>
          Filled
        </Button>
      </div>
      <div className='text-center'>
        <h4 className='mb-2 text-sm font-medium'>Outlined</h4>
        <Button {...args} variant='outlined'>
          Outlined
        </Button>
      </div>
      <div className='text-center'>
        <h4 className='mb-2 text-sm font-medium'>Text</h4>
        <Button {...args} variant='text'>
          Text
        </Button>
      </div>
      <div className='text-center'>
        <h4 className='mb-2 text-sm font-medium'>Ghost</h4>
        <Button {...args} variant='ghost'>
          Ghost
        </Button>
      </div>
    </div>
  ),
  args: {
    colorTheme: 'blue',
    size: 'medium',
  },
};
