import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { Modal, ModalType } from '@web/components/basic/Modal';

import { Button } from '@ui/components';

const meta: Meta<typeof Modal> = {
  title: 'Basic/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: '모달 표시 여부',
    },
    modalType: {
      control: { type: 'select' },
      options: [
        'default',
        'component',
        'horizontal',
        'vertical',
        'alert',
        'confirm',
      ],
      description: '모달 레이아웃 타입',
    },
    title: {
      control: 'text',
      description: '모달 제목',
    },
    description: {
      control: 'text',
      description: '모달 설명',
    },
    width: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: '모달 너비',
    },
    primaryButtonText: {
      control: 'text',
      description: '주 버튼 텍스트',
    },
    secondaryButtonText: {
      control: 'text',
      description: '보조 버튼 텍스트',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// 기본 모달
export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button
          onClick={() => setIsOpen(true)}
          variant='filled'
          colorTheme='blue'
        >
          모달 열기
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={args.title}
          description={args.description}
          modalType={args.modalType}
          width={args.width}
          primaryButtonText={args.primaryButtonText}
          secondaryButtonText={args.secondaryButtonText}
          onPrimaryAction={() => {
            setIsOpen(false);
            alert('확인 버튼이 클릭되었습니다.');
          }}
          onSecondaryAction={() => setIsOpen(false)}
        />
      </div>
    );
  },
  args: {
    title: '기본 모달',
    description:
      '이것은 기본 모달입니다. 다양한 설정을 통해 모달을 변경할 수 있습니다.',
    modalType: 'default',
    width: 'md',
    primaryButtonText: '확인',
    secondaryButtonText: '취소',
  },
};

// 모달 타입
export const ModalTypes = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('default');

  const openModal = (type: ModalType) => {
    setModalType(type);
    setIsOpen(true);
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap gap-2'>
        <Button
          onClick={() => openModal('default')}
          variant='filled'
          colorTheme='blue'
        >
          기본 모달
        </Button>
        <Button
          onClick={() => openModal('horizontal')}
          variant='filled'
          colorTheme='green'
        >
          수평 레이아웃
        </Button>
        <Button
          onClick={() => openModal('vertical')}
          variant='filled'
          colorTheme='yellow'
        >
          수직 레이아웃
        </Button>
        <Button
          onClick={() => openModal('alert')}
          variant='filled'
          colorTheme='red'
        >
          알림 모달
        </Button>
        <Button
          onClick={() => openModal('confirm')}
          variant='filled'
          colorTheme='purple'
        >
          확인 모달
        </Button>
        <Button
          onClick={() => openModal('component')}
          variant='filled'
          colorTheme='gray'
        >
          컴포넌트 모달
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} 모달`}
        description={`이것은 ${modalType} 타입의 모달입니다.`}
        modalType={modalType}
        width='md'
        primaryButtonText='확인'
        secondaryButtonText='취소'
        onPrimaryAction={() => setIsOpen(false)}
        onSecondaryAction={() => setIsOpen(false)}
      />
    </div>
  );
};

// 이미지가 포함된 모달
export const WithImage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        onClick={() => setIsOpen(true)}
        variant='filled'
        colorTheme='blue'
      >
        이미지 모달 열기
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='이미지 모달'
        description='모달에 이미지를 포함하여 더욱 시각적으로 정보를 전달할 수 있습니다.'
        modalType='horizontal'
        width='lg'
        image='https://picsum.photos/400/300'
        primaryButtonText='확인'
        secondaryButtonText='취소'
        onPrimaryAction={() => setIsOpen(false)}
        onSecondaryAction={() => setIsOpen(false)}
      />
    </div>
  );
};

// 크기 옵션
export const Sizes = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');

  const openModalWithSize = (size: typeof width) => {
    setWidth(size);
    setIsOpen(true);
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap gap-2'>
        {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
          <Button
            key={size}
            onClick={() => openModalWithSize(size)}
            variant='outlined'
            colorTheme='blue'
          >
            {size} 크기
          </Button>
        ))}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`${width} 크기 모달`}
        description={`이 모달은 ${width} 너비 옵션을 사용합니다.`}
        modalType='default'
        width={width}
        primaryButtonText='확인'
        secondaryButtonText='취소'
        onPrimaryAction={() => setIsOpen(false)}
        onSecondaryAction={() => setIsOpen(false)}
      />
    </div>
  );
};

// 커스텀 컨텐츠 모달
export const CustomContent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        onClick={() => setIsOpen(true)}
        variant='filled'
        colorTheme='blue'
      >
        커스텀 컨텐츠 모달
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='커스텀 컨텐츠'
        modalType='component'
        width='lg'
      >
        <div className='flex flex-col gap-4'>
          <h3 className='text-xl font-bold'>커스텀 모달 내용</h3>
          <p className='text-gray-600'>
            모달 내부에 원하는 컨텐츠를 자유롭게 구성할 수 있습니다. 다양한
            레이아웃과 컴포넌트를 조합하여 사용자 경험을 향상시켜보세요.
          </p>

          <div className='mt-4 grid grid-cols-2 gap-4'>
            <div className='rounded-lg bg-blue-50 p-4'>
              <h4 className='font-medium'>섹션 1</h4>
              <p className='text-sm text-gray-600'>첫 번째 섹션 내용입니다.</p>
            </div>
            <div className='rounded-lg bg-green-50 p-4'>
              <h4 className='font-medium'>섹션 2</h4>
              <p className='text-sm text-gray-600'>두 번째 섹션 내용입니다.</p>
            </div>
            <div className='rounded-lg bg-yellow-50 p-4'>
              <h4 className='font-medium'>섹션 3</h4>
              <p className='text-sm text-gray-600'>세 번째 섹션 내용입니다.</p>
            </div>
            <div className='rounded-lg bg-purple-50 p-4'>
              <h4 className='font-medium'>섹션 4</h4>
              <p className='text-sm text-gray-600'>네 번째 섹션 내용입니다.</p>
            </div>
          </div>

          <div className='mt-6 flex justify-end gap-2'>
            <Button
              onClick={() => setIsOpen(false)}
              variant='outlined'
              colorTheme='gray'
            >
              취소
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant='filled'
              colorTheme='blue'
            >
              확인
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// 다중 모달
export const NestedModals = () => {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);

  return (
    <div>
      <Button
        onClick={() => setIsFirstModalOpen(true)}
        variant='filled'
        colorTheme='blue'
      >
        첫 번째 모달 열기
      </Button>

      <Modal
        isOpen={isFirstModalOpen}
        onClose={() => setIsFirstModalOpen(false)}
        title='첫 번째 모달'
        description='이 모달에서 다른 모달을 열 수 있습니다.'
        modalType='default'
        width='md'
        primaryButtonText='다음 모달 열기'
        secondaryButtonText='취소'
        onPrimaryAction={() => {
          setIsSecondModalOpen(true);
        }}
        onSecondaryAction={() => setIsFirstModalOpen(false)}
      />

      <Modal
        isOpen={isSecondModalOpen}
        onClose={() => setIsSecondModalOpen(false)}
        title='두 번째 모달'
        description='이 모달은 첫 번째 모달 위에 열립니다.'
        modalType='vertical'
        width='sm'
        primaryButtonText='완료'
        secondaryButtonText='취소'
        onPrimaryAction={() => {
          setIsSecondModalOpen(false);
          setIsFirstModalOpen(false);
        }}
        onSecondaryAction={() => setIsSecondModalOpen(false)}
      />
    </div>
  );
};
