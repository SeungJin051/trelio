import type { Meta, StoryObj } from '@storybook/react';

import { Avatar, AvatarGroup } from '@ui/components/avatar';

// 메타데이터 정의
const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: '아바타 크기',
    },
    src: { control: 'text', description: '이미지 소스 URL' },
    alt: {
      control: 'text',
      description: '이미지 대체 텍스트. 이미지가 없을 때 첫글자를 표시합니다.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// 기본 아바타 (이미지 없음)
export const Default: Story = {
  args: {
    alt: '사용자',
    size: 'medium',
  },
};

// 이미지 있는 아바타
export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/300?img=1',
    alt: '사용자 이미지',
    size: 'medium',
  },
};

// 이니셜이 있는 아바타
export const WithInitials: Story = {
  args: {
    alt: '홍길동',
    size: 'medium',
  },
};

// 다양한 크기
export const Sizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Avatar size='small' alt='S' />
      <Avatar size='medium' alt='M' />
      <Avatar size='large' alt='L' />
    </div>
  ),
};

// 이미지 있는 다양한 크기
export const ImageSizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Avatar
        size='small'
        src='https://i.pravatar.cc/300?img=2'
        alt='작은 크기'
      />
      <Avatar
        size='medium'
        src='https://i.pravatar.cc/300?img=3'
        alt='중간 크기'
      />
      <Avatar
        size='large'
        src='https://i.pravatar.cc/300?img=4'
        alt='큰 크기'
      />
    </div>
  ),
};

// 아바타 그룹
export const Group: Story = {
  render: () => (
    <div className='p-4'>
      <AvatarGroup>
        <Avatar src='https://i.pravatar.cc/300?img=5' alt='사용자1' />
        <Avatar src='https://i.pravatar.cc/300?img=6' alt='사용자2' />
        <Avatar src='https://i.pravatar.cc/300?img=7' alt='사용자3' />
        <Avatar alt='홍길동' />
        <Avatar alt='김철수' />
      </AvatarGroup>
    </div>
  ),
};

// 다양한 사용 예시
export const Examples: Story = {
  render: () => (
    <div className='space-y-8'>
      {/* 사용자 프로필 */}
      <div className='flex items-center gap-4'>
        <Avatar
          size='large'
          src='https://i.pravatar.cc/300?img=8'
          alt='사용자 이미지'
        />
        <div>
          <div className='font-bold'>홍길동</div>
          <div className='text-sm text-gray-600'>프로필 관리자</div>
        </div>
      </div>

      {/* 댓글 예시 */}
      <div className='space-y-4'>
        <div className='flex items-start gap-3'>
          <Avatar
            size='small'
            src='https://i.pravatar.cc/300?img=9'
            alt='김철수'
          />
          <div>
            <div className='font-medium'>김철수</div>
            <div className='text-sm'>정말 좋은 아이디어네요! 응원합니다.</div>
            <div className='mt-1 text-xs text-gray-500'>5분 전</div>
          </div>
        </div>

        <div className='flex items-start gap-3'>
          <Avatar size='small' alt='이영희' />
          <div>
            <div className='font-medium'>이영희</div>
            <div className='text-sm'>
              저도 같은 생각입니다. 다음 업데이트가 기대됩니다.
            </div>
            <div className='mt-1 text-xs text-gray-500'>10분 전</div>
          </div>
        </div>
      </div>

      {/* 참가자 목록 */}
      <div>
        <div className='mb-2 font-medium'>참가자 (5명)</div>
        <AvatarGroup>
          <Avatar src='https://i.pravatar.cc/300?img=10' alt='참가자1' />
          <Avatar src='https://i.pravatar.cc/300?img=11' alt='참가자2' />
          <Avatar src='https://i.pravatar.cc/300?img=12' alt='참가자3' />
          <Avatar src='https://i.pravatar.cc/300?img=13' alt='참가자4' />
          <Avatar alt='참가자5' />
        </AvatarGroup>
      </div>
    </div>
  ),
};
