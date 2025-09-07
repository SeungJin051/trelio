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

export const navigation: NavItem[] = [];

// 여행 계획 필터 옵션
export const filterOptions = [
  { key: 'all', label: '전체', icon: MdOutlineList },
  { key: 'in-progress', label: '진행', icon: MdOutlineAccessTime },
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
