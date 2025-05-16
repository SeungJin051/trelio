import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import {
  Toast,
  ToastContainer,
  ToastPosition,
  ToastType,
} from '@web/components/basic/Toast';
import type { ToastProps } from '@web/components/basic/Toast/Toast';

import { Button } from '@ui/components';

const meta: Meta<typeof Toast> = {
  title: 'Basic/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['default', 'success', 'error'],
      description: '토스트 타입',
    },
    title: {
      control: 'text',
      description: '토스트 제목',
    },
    message: {
      control: 'text',
      description: '토스트 메시지',
    },
    duration: {
      control: { type: 'number', min: 1000, max: 10000, step: 500 },
      description: '토스트 표시 시간(ms)',
    },
    position: {
      control: { type: 'select' },
      options: ['top-right', 'top-center', 'bottom-right', 'bottom-center'],
      description: '토스트 표시 위치',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

// 기본 토스트
export const Default: Story = {
  render: (args) => (
    <div className='relative h-[300px] w-[400px] overflow-hidden rounded border'>
      <ToastContainer
        toasts={[
          {
            id: '1',
            type: args.type,
            title: args.title,
            message: args.message,
            duration: args.duration,
          },
        ]}
        position={args.position}
        onClose={() => {}}
      />
    </div>
  ),
  args: {
    id: '1',
    type: 'default',
    title: '알림',
    message: '이것은 기본 토스트 메시지입니다.',
    duration: 5000,
    position: 'top-right',
    onClose: () => {},
  },
};

// 성공 토스트
export const Success: Story = {
  render: (args) => (
    <div className='relative h-[300px] w-[400px] overflow-hidden rounded border'>
      <ToastContainer
        toasts={[
          {
            id: '1',
            type: 'success',
            title: args.title,
            message: args.message,
            duration: args.duration,
          },
        ]}
        position={args.position}
        onClose={() => {}}
      />
    </div>
  ),
  args: {
    title: '성공',
    message: '작업이 성공적으로 완료되었습니다.',
    duration: 5000,
    position: 'top-right',
  },
};

// 오류 토스트
export const Error: Story = {
  render: (args) => (
    <div className='relative h-[300px] w-[400px] overflow-hidden rounded border'>
      <ToastContainer
        toasts={[
          {
            id: '1',
            type: 'error',
            title: args.title,
            message: args.message,
            duration: args.duration,
          },
        ]}
        position={args.position}
        onClose={() => {}}
      />
    </div>
  ),
  args: {
    title: '오류',
    message: '작업 처리 중 오류가 발생했습니다.',
    duration: 5000,
    position: 'top-right',
  },
};

// 여러 토스트
export const MultipleToasts: Story = {
  render: () => (
    <div className='relative h-[400px] w-[400px] overflow-hidden rounded border'>
      <ToastContainer
        toasts={[
          {
            id: '1',
            type: 'default',
            title: '정보',
            message: '새로운 알림이 도착했습니다.',
            duration: 100000,
          },
          {
            id: '2',
            type: 'success',
            title: '성공',
            message: '파일 업로드가 완료되었습니다.',
            duration: 100000,
          },
          {
            id: '3',
            type: 'error',
            title: '오류',
            message: '연결이 끊어졌습니다. 다시 시도해주세요.',
            duration: 100000,
          },
        ]}
        position='top-right'
        onClose={() => {}}
      />
    </div>
  ),
};

// 상호작용 토스트
export const Interactive = () => {
  const [toasts, setToasts] = useState<Array<Omit<ToastProps, 'onClose'>>>([]);
  const [counter, setCounter] = useState(0);
  const [position, setPosition] = useState<ToastPosition>('top-right');

  const addToast = (type: ToastType) => {
    const id = `toast-${counter}`;
    setCounter((prev) => prev + 1);

    let title = '알림';
    let message = '새로운 메시지가 도착했습니다.';

    if (type === 'success') {
      title = '성공';
      message = '작업이 성공적으로 완료되었습니다.';
    } else if (type === 'error') {
      title = '오류';
      message = '작업 처리 중 문제가 발생했습니다.';
    }

    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        title,
        message,
        duration: 5000,
      },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h3 className='mb-2 text-lg font-bold'>토스트 추가</h3>
        <div className='flex gap-2'>
          <Button
            onClick={() => addToast('default')}
            variant='filled'
            colorTheme='blue'
          >
            기본
          </Button>
          <Button
            onClick={() => addToast('success')}
            variant='filled'
            colorTheme='green'
          >
            성공
          </Button>
          <Button
            onClick={() => addToast('error')}
            variant='filled'
            colorTheme='red'
          >
            오류
          </Button>
          <Button onClick={clearAllToasts} variant='outlined' colorTheme='gray'>
            모두 지우기
          </Button>
        </div>
      </div>

      <div>
        <h3 className='mb-2 text-lg font-bold'>위치 선택</h3>
        <div className='flex gap-2'>
          <Button
            onClick={() => setPosition('top-right')}
            variant={position === 'top-right' ? 'filled' : 'outlined'}
            colorTheme='blue'
          >
            상단 우측
          </Button>
          <Button
            onClick={() => setPosition('top-center')}
            variant={position === 'top-center' ? 'filled' : 'outlined'}
            colorTheme='blue'
          >
            상단 중앙
          </Button>
          <Button
            onClick={() => setPosition('bottom-right')}
            variant={position === 'bottom-right' ? 'filled' : 'outlined'}
            colorTheme='blue'
          >
            하단 우측
          </Button>
          <Button
            onClick={() => setPosition('bottom-center')}
            variant={position === 'bottom-center' ? 'filled' : 'outlined'}
            colorTheme='blue'
          >
            하단 중앙
          </Button>
        </div>
      </div>

      <div className='relative h-[400px] w-[600px] overflow-hidden rounded-lg border'>
        <div className='absolute left-0 top-0 p-2 text-sm font-medium'>
          현재 위치: {position} (토스트 개수: {toasts.length})
        </div>
        <ToastContainer
          toasts={toasts}
          position={position}
          onClose={removeToast}
        />
      </div>
    </div>
  );
};
