import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@ui/components';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '버튼 크기',
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
      description: '버튼 스타일 변형',
    },
    colorTheme: {
      control: 'select',
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
    disabled: {
      control: 'boolean',
      description: '버튼 비활성화 상태',
    },
    active: {
      control: 'boolean',
      description: '버튼 활성화 상태',
    },
    fullWidth: {
      control: 'boolean',
      description: '너비 100% 설정',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const WithCustomText: Story = {
  args: {
    children: 'Click me!',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Button size='small'>Small</Button>
      <Button size='medium'>Medium</Button>
      <Button size='large'>Large</Button>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Button variant='filled'>Filled</Button>
      <Button variant='outlined'>Outlined</Button>
      <Button variant='text'>Text</Button>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className='flex flex-wrap items-center gap-4'>
      <Button colorTheme='blue'>Blue</Button>
      <Button colorTheme='purple'>Purple</Button>
      <Button colorTheme='pink'>Pink</Button>
      <Button colorTheme='orange'>Orange</Button>
      <Button colorTheme='green'>Green</Button>
      <Button colorTheme='yellow'>Yellow</Button>
      <Button colorTheme='gray'>Gray</Button>
      <Button colorTheme='red'>Red</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
};

export const Active: Story = {
  args: {
    children: 'Active Button',
    active: true,
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Button leftIcon={<span>👈</span>}>Left Icon</Button>
      <Button rightIcon={<span>👉</span>}>Right Icon</Button>
      <Button leftIcon={<span>🔍</span>} rightIcon={<span>✓</span>}>
        Both Icons
      </Button>
    </div>
  ),
};
