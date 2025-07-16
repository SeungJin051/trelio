import {
  FaHeart,
  FaMountain,
  FaPlane,
  FaShoppingBag,
  FaUtensils,
  FaWater,
} from 'react-icons/fa';

import type { DestinationInfo, TravelStyleInfo } from '@/types/user/user';

// 회원가입 단계 설정
export const TOTAL_STEPS = 3;

// 선호 여행지 목록
export const DESTINATIONS: DestinationInfo[] = [
  { id: 'southeast-asia', name: '동남아시아', icon: '🌴' },
  { id: 'europe', name: '유럽', icon: '🏰' },
  { id: 'japan', name: '일본', icon: '🗾' },
  { id: 'korea', name: '국내', icon: '🇰🇷' },
  { id: 'americas', name: '미주', icon: '🗽' },
  { id: 'oceania', name: '오세아니아', icon: '🦘' },
  { id: 'china', name: '중국', icon: '🏮' },
  { id: 'middle-east', name: '중동/아프리카', icon: '🐪' },
];

// 여행 스타일 목록
export const TRAVEL_STYLES: TravelStyleInfo[] = [
  {
    id: 'healing',
    name: '힐링여행',
    icon: FaHeart,
    color: 'bg-pink-50 border-pink-200 text-pink-700',
  },
  {
    id: 'activity',
    name: '액티비티',
    icon: FaMountain,
    color: 'bg-green-50 border-green-200 text-green-700',
  },
  {
    id: 'culture',
    name: '문화탐방',
    icon: FaPlane,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  {
    id: 'food',
    name: '맛집투어',
    icon: FaUtensils,
    color: 'bg-orange-50 border-orange-200 text-orange-700',
  },
  {
    id: 'shopping',
    name: '쇼핑',
    icon: FaShoppingBag,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    id: 'nature',
    name: '자연경관',
    icon: FaWater,
    color: 'bg-teal-50 border-teal-200 text-teal-700',
  },
];

// 파일 업로드 제한 설정
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/'],
  CROP_SIZE: 300, // 크롭된 이미지 크기
  JPEG_QUALITY: 0.9,
} as const;
