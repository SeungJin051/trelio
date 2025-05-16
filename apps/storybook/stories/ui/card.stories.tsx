import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '@web/components/basic/Card';

const meta: Meta<typeof Card> = {
  title: 'Basic/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    cardType: {
      control: { type: 'select' },
      options: [
        'default',
        'button',
        'link',
        'image',
        'horizontal',
        'pricing',
        'cta',
      ],
      description: '카드 타입',
    },
    title: {
      control: 'text',
      description: '카드 제목',
    },
    description: {
      control: 'text',
      description: '카드 설명',
    },
    slug: {
      control: 'text',
      description: '카드 링크',
    },
    image: {
      control: 'text',
      description: '카드 이미지 URL',
    },
    buttonText: {
      control: 'text',
      description: '버튼 텍스트',
    },
    linkText: {
      control: 'text',
      description: '링크 텍스트',
    },
    linkHref: {
      control: 'text',
      description: '링크 URL',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// 기본 카드
export const Default: Story = {
  args: {
    cardType: 'default',
    title: '기본 카드',
    description:
      '이것은 기본 카드 컴포넌트입니다. 다양한 콘텐츠를 표시할 수 있습니다.',
  },
};

// 이미지 카드
export const ImageCard: Story = {
  args: {
    cardType: 'image',
    title: '이미지 카드',
    description: '이미지가 포함된 카드 컴포넌트입니다.',
    image: 'https://picsum.photos/400/250',
  },
};

// 버튼 카드
export const ButtonCard: Story = {
  args: {
    cardType: 'button',
    title: '버튼 카드',
    description:
      '버튼이 포함된 카드 컴포넌트입니다. 클릭 시 지정된 동작을 수행합니다.',
    buttonText: '자세히 보기',
    onClick: () => alert('버튼이 클릭되었습니다!'),
  },
};

// 링크 카드
export const LinkCard: Story = {
  args: {
    cardType: 'link',
    title: '링크 카드',
    description:
      '링크가 포함된 카드 컴포넌트입니다. 클릭 시 지정된 링크로 이동합니다.',
    linkText: '자세히 보기',
    linkHref: 'https://example.com',
  },
};

// 수평 카드
export const HorizontalCard: Story = {
  args: {
    cardType: 'horizontal',
    title: '수평 카드',
    description: '이미지와 콘텐츠가 수평으로 배치된 카드 컴포넌트입니다.',
    image: 'https://picsum.photos/300/300',
    buttonText: '더 알아보기',
    onClick: () => alert('버튼이 클릭되었습니다!'),
  },
};

// 가격표 카드
export const PricingCard: Story = {
  args: {
    cardType: 'pricing',
    title: '스탠다드 플랜',
    price: '19,900원',
    period: '월간',
    description: '개인 사용자를 위한 기본 플랜',
    features: [
      '모든 기본 기능 포함',
      '월 100GB 스토리지',
      '5명까지 팀원 초대',
      '이메일 지원',
      '데스크톱 앱 제공',
    ],
    buttonText: '구독 신청하기',
    onClick: () => alert('구독 신청이 완료되었습니다!'),
  },
};

// CTA 카드
export const CTACard: Story = {
  args: {
    cardType: 'cta',
    title: '지금 시작하세요',
    description:
      '무료 체험판으로 서비스를 경험해보세요. 신용카드가 필요하지 않습니다.',
    buttonText: '무료로 시작하기',
    onClick: () => alert('무료 체험이 시작되었습니다!'),
  },
};

// 저자 정보가 있는 카드
export const CardWithAuthor: Story = {
  args: {
    cardType: 'default',
    title: '블로그 포스트 제목',
    description: '이 글은 최신 기술 트렌드에 대한 내용을 담고 있습니다.',
    avatarSrc: 'https://i.pravatar.cc/40',
    authorName: '홍길동',
    authorRole: '기술 블로거',
  },
};

// 모든 카드 타입
export const AllCardTypes = () => {
  const cardContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
  };

  return (
    <div style={cardContainerStyle}>
      <Card
        cardType='default'
        title='기본 카드'
        description='기본 정보를 표시하는 카드입니다.'
      />

      <Card
        cardType='image'
        title='이미지 카드'
        description='상단에 이미지를 포함하는 카드입니다.'
        image='https://picsum.photos/400/250'
      />

      <Card
        cardType='button'
        title='버튼 카드'
        description='하단에 버튼이 있는 카드입니다.'
        buttonText='자세히 보기'
        onClick={() => alert('버튼 카드 클릭!')}
      />

      <Card
        cardType='link'
        title='링크 카드'
        description='하단에 링크가 있는 카드입니다.'
        linkText='자세히 보기'
        linkHref='https://pack-and-go-web.vercel.app/'
      />

      <Card
        cardType='horizontal'
        title='수평 카드'
        description='이미지와 콘텐츠가 수평으로 배치된 카드입니다.'
        image='https://picsum.photos/300/300'
        buttonText='더 알아보기'
        onClick={() => alert('수평 카드 클릭!')}
      />

      <Card
        cardType='pricing'
        title='프리미엄 플랜'
        price='49,900원'
        period='월간'
        description='비즈니스 사용자를 위한 고급 플랜'
        features={[
          '모든 스탠다드 기능 포함',
          '월 500GB 스토리지',
          '무제한 팀원 초대',
          '24/7 우선 지원',
          '고급 통계 기능 제공',
        ]}
        buttonText='구독 신청하기'
        onClick={() => alert('프리미엄 구독 신청!')}
      />

      <div style={{ gridColumn: '1 / -1' }}>
        <Card
          cardType='cta'
          title='지금 시작하세요'
          description='무료 체험판으로 서비스를 경험해보세요.'
          buttonText='무료로 시작하기'
          onClick={() => alert('무료 체험 시작!')}
        />
      </div>
    </div>
  );
};
