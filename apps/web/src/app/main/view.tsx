'use client';

import { useState } from 'react';

import Image from 'next/image';

import { FaBeer } from 'react-icons/fa';

import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Checkbox,
  Divider,
  Icon,
  Spinner,
  Switch,
  Typography,
} from '@ui/components';

import { Card, Modal, ModalType } from '@/components';
import { Carousel, CarouselItem } from '@/components/basic/Carousel';
import { useToast } from '@/hooks';

// 이미지 경로 상수
const PLACEHOLDER_IMAGES = [
  'https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600',
  'https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600',
  'https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600',
];

const MainView = () => {
  const [isSmallChecked, setIsSmallChecked] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('default');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (type: ModalType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toast = useToast();

  const showToast = (type: 'default' | 'success' | 'error') => {
    switch (type) {
      case 'success':
        toast.success('성공적으로 처리되었습니다!', {
          title: '성공',
        });
        break;
      case 'error':
        toast.error('오류가 발생했습니다.', {
          title: '오류',
          duration: 5000,
        });
        break;
      default:
        toast('알림 메시지입니다.', {
          title: '알림',
          duration: 4000,
        });
    }
  };

  return (
    <div className='flex flex-col items-center gap-8 p-8'>
      {/* 캐러셀 컴포넌트 */}
      <div className='w-full max-w-3xl'>
        <Typography variant='h4' weight='bold' className='mb-4 text-center'>
          이미지 캐러셀
        </Typography>
        <Carousel autoPlay={true} interval={3000} className='aspect-[16/9]'>
          {PLACEHOLDER_IMAGES.map((src, index) => (
            <CarouselItem key={index}>
              <div className='relative h-full w-full'>
                <Image
                  src={src}
                  alt={`슬라이드 이미지 ${index + 1}`}
                  fill
                  className='object-cover'
                  priority={index === 0}
                  draggable={false}
                />
              </div>
            </CarouselItem>
          ))}
        </Carousel>
      </div>

      <div className='mb-8 flex flex-wrap justify-center gap-4'>
        <Button onClick={() => showToast('default')} className='w-40'>
          기본 토스트
        </Button>
        <Button onClick={() => showToast('success')} className='w-40'>
          성공 토스트
        </Button>
        <Button onClick={() => showToast('error')} className='w-40'>
          오류 토스트
        </Button>
        <Button onClick={() => toast.hideAll()} className='w-40'>
          모든 토스트 닫기
        </Button>
      </div>

      <div className='mb-8 flex flex-wrap justify-center gap-4'>
        <Button onClick={() => openModal('default')} className='w-40'>
          기본 모달
        </Button>
        <Button onClick={() => openModal('horizontal')} className='w-40'>
          가로형 모달
        </Button>
        <Button onClick={() => openModal('vertical')} className='w-40'>
          세로형 모달
        </Button>
        <Button onClick={() => openModal('alert')} className='w-40'>
          알림 모달
        </Button>
        <Button onClick={() => openModal('confirm')} className='w-40'>
          확인 모달
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`${modalType} 모달`}
        description={`이것은 ${modalType} 타입의 모달 설명입니다.`}
        modalType={modalType}
        primaryButtonText='확인'
        secondaryButtonText='취소'
        onPrimaryAction={closeModal}
        onSecondaryAction={closeModal}
        image={
          modalType === 'horizontal' || modalType === 'vertical'
            ? 'https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600'
            : undefined
        }
        width={modalType === 'horizontal' ? 'lg' : 'md'}
      ></Modal>

      {/* 기본 카드 */}
      <Card
        title='기본 카드'
        description='이것은 기본 스타일의 카드 컴포넌트입니다. 간단한 정보를 표시하는 데 사용됩니다.'
        cardType='default'
      />

      {/* 버튼이 있는 카드 */}
      <Card
        title='버튼 카드'
        description='이 카드에는 사용자가 클릭할 수 있는 버튼이 포함되어 있습니다.'
        cardType='button'
        buttonText='자세히 보기'
        onClick={() => alert('버튼 클릭됨!')}
      />

      {/* 링크가 있는 카드 */}
      <Card
        title='링크 카드'
        description='이 카드에는 다른 페이지로 이동할 수 있는 링크가 포함되어 있습니다.'
        cardType='link'
        linkText='더 알아보기'
        linkHref='/about'
      />

      {/* 이미지가 있는 카드 */}
      <Card
        title='이미지 카드'
        description='이 카드는 상단에 이미지가 포함된 카드 스타일입니다.'
        cardType='image'
        image='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600'
        buttonText='더 보기'
      />

      {/* 가로형 카드 */}
      <Card
        title='가로형 카드'
        description='이 카드는 이미지와 텍스트가 가로로 배치된 레이아웃을 가집니다. 반응형으로 화면 크기가 작아지면 세로로 변경됩니다.'
        cardType='horizontal'
        image='https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600'
      />

      {/* 가격 정보 카드 */}
      <Card
        title='프로 플랜'
        description='개인 및 소규모 팀을 위한 최적의 플랜'
        cardType='pricing'
        price='₩29,000'
        period='월'
        features={[
          '개인 사용자 10명',
          '무제한 프로젝트',
          '우선 지원',
          '고급 분석',
        ]}
        buttonText='프로 시작하기'
      />

      {/* 호출 유도 카드 */}
      <Card
        title='무료 체험 시작하기'
        description='지금 가입하고 14일 동안 모든 기능을 무료로 사용해보세요. 신용카드가 필요하지 않습니다.'
        cardType='cta'
        buttonText='무료 체험 시작'
      />

      <div className='mt-8 w-full'>
        <Typography variant='h4' weight='bold' className='mb-4 text-center'>
          기존 UI 컴포넌트
        </Typography>
        <div className='flex flex-col items-center gap-4'>
          <Button colorTheme='red' variant='filled'>
            Click me1
          </Button>
          <Button colorTheme='purple' variant='outlined'>
            Click me1
          </Button>
          <Checkbox checked={false} onChange={() => {}} label='Checkbox' />
          <Checkbox
            checked={true}
            onChange={() => {}}
            label='Checkbox'
            isRadio={true}
          />
          <Typography variant='h1' weight='bold'>
            Hello
          </Typography>
          <Divider colorTheme='red' />
          <Switch
            checked={isSmallChecked}
            onChange={setIsSmallChecked}
            label='Small Switch'
            size='small'
          />
          <Icon as={FaBeer} size={100} />
          <Badge colorTheme='blue' size='small' variant='outlined'>
            asdf
          </Badge>
          <Badge colorTheme='blue' size='medium' variant='outlined'>
            asdf
          </Badge>
          <Badge colorTheme='blue' size='large' variant='outlined'>
            asdf
          </Badge>
          <Badge colorTheme='blue' size='small' variant='filled'>
            asdf
          </Badge>
          <Badge colorTheme='blue' size='medium' variant='filled'>
            asdf
          </Badge>
          <Spinner size='medium' />
          <AvatarGroup>
            <Avatar size='small' />
            <Avatar size='small' />
            <Avatar size='small' />
          </AvatarGroup>
        </div>
      </div>
    </div>
  );
};

export default MainView;
