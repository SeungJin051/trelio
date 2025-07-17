import {
  MdOutlineAccessTime,
  MdOutlineCheckCircle,
  MdOutlineList,
} from 'react-icons/md';

// 네비게이션 메뉴 아이템
export interface NavItem {
  name: string;
  href: string;
}

export const navigation: NavItem[] = [
  { name: '여행 목록', href: '/travel-list' },
  { name: '요금제', href: '/price' },
  { name: 'FAQ', href: '/faq' },
  { name: '문의하기', href: '/contact' },
];

// 여행 계획 필터 옵션
export const filterOptions = [
  { key: 'all', label: '전체', icon: MdOutlineList },
  { key: 'in-progress', label: '진행 중', icon: MdOutlineAccessTime },
  { key: 'completed', label: '완료', icon: MdOutlineCheckCircle },
] as const;

// 여행 계획 데이터 타입
export interface TravelPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'all' | 'in-progress' | 'completed';
  participantAvatars: string[];
}

// 임시 여행 계획 데이터
export const mockTravelPlans: TravelPlan[] = [
  {
    id: '1',
    title: '제주도 여행',
    startDate: '2024-03-15',
    endDate: '2024-03-18',
    status: 'in-progress',
    participantAvatars: ['/avatar1.jpg', '/avatar2.jpg'],
  },
];
