/**
 * 블록 생성 관련 헬퍼 함수들
 * 통화 로직, 시간 계산, 공항 제안 등의 스마트 기능
 */
import { CURRENCIES, CurrencyCode } from '@/lib/currency';
import { BlockType } from '@/types/travel/blocks';

// 사용자 국적별 기본 통화 매핑
const NATIONALITY_CURRENCY_MAP: Record<string, CurrencyCode> = {
  KR: 'KRW',
  US: 'USD',
  JP: 'JPY',
  CN: 'CNY',
  GB: 'GBP',
  EU: 'EUR',
  TH: 'THB',
  VN: 'VND',
  TW: 'TWD',
  HK: 'HKD',
  SG: 'SGD',
  MY: 'MYR',
  PH: 'PHP',
  ID: 'IDR',
  AU: 'AUD',
  CA: 'CAD',
};

/**
 * 사용자 국적에 따른 통화 반환
 */
export const getCurrencyFromNationality = (
  nationality?: string
): CurrencyCode => {
  if (!nationality) return 'KRW';
  return NATIONALITY_CURRENCY_MAP[nationality.toUpperCase()] || 'KRW';
};

/**
 * 블록 타입별 기본 통화 결정 로직
 * 항공료는 출발국(사용자 국적) 기준, 나머지는 목적지 기준
 */
export const getDefaultCurrencyForBlock = (
  blockType: BlockType,
  userNationality?: string,
  planLocation?: string
): CurrencyCode => {
  switch (blockType) {
    case 'flight':
      // 항공료는 사용자 국적 기준 (한국인이면 KRW로 결제)
      return getCurrencyFromNationality(userNationality);
    case 'hotel':
    case 'food':
    case 'activity':
    case 'move':
    case 'memo':
    default:
      // 현지 활동은 목적지 통화 (없으면 사용자 국적 기준)
      return (
        getCurrencyFromLocation(planLocation) ||
        getCurrencyFromNationality(userNationality)
      );
  }
};

/**
 * 위치에 따른 통화 추론 (기존 함수 확장)
 */
const getCurrencyFromLocation = (location?: string): CurrencyCode | null => {
  if (!location) return null;

  const locationLower = location.toLowerCase();

  // 주요 국가/도시별 통화 매핑
  const locationCurrencyMap: Record<string, CurrencyCode> = {
    // 일본
    japan: 'JPY',
    tokyo: 'JPY',
    osaka: 'JPY',
    kyoto: 'JPY',
    일본: 'JPY',
    도쿄: 'JPY',
    오사카: 'JPY',
    교토: 'JPY',

    // 미국
    usa: 'USD',
    america: 'USD',
    'new york': 'USD',
    'los angeles': 'USD',
    미국: 'USD',
    뉴욕: 'USD',

    // 유럽
    paris: 'EUR',
    london: 'GBP',
    rome: 'EUR',
    berlin: 'EUR',
    파리: 'EUR',
    런던: 'GBP',
    로마: 'EUR',
    베를린: 'EUR',

    // 동남아시아
    thailand: 'THB',
    bangkok: 'THB',
    태국: 'THB',
    방콕: 'THB',
    vietnam: 'VND',
    'ho chi minh': 'VND',
    베트남: 'VND',
    호치민: 'VND',
    singapore: 'SGD',
    싱가포르: 'SGD',
    malaysia: 'MYR',
    'kuala lumpur': 'MYR',
    말레이시아: 'MYR',

    // 중국
    china: 'CNY',
    beijing: 'CNY',
    shanghai: 'CNY',
    중국: 'CNY',
    베이징: 'CNY',
    상하이: 'CNY',

    // 기타
    taiwan: 'TWD',
    taipei: 'TWD',
    대만: 'TWD',
    타이베이: 'TWD',
    'hong kong': 'HKD',
    홍콩: 'HKD',
    australia: 'AUD',
    sydney: 'AUD',
    호주: 'AUD',
    시드니: 'AUD',
  };

  for (const [key, currency] of Object.entries(locationCurrencyMap)) {
    if (locationLower.includes(key)) {
      return currency;
    }
  }

  return null;
};

/**
 * 블록 타입별 기본 소요시간 (분 단위)
 */
export const getDefaultDuration = (blockType: BlockType): number => {
  const durations: Record<BlockType, number> = {
    flight: 120, // 2시간 (평균 국제선)
    hotel: 0, // 체크인만 (시간 범위 없음)
    food: 90, // 1시간 30분
    activity: 180, // 3시간
    move: 30, // 30분
    memo: 0, // 메모는 시간 없음
  };

  return durations[blockType] || 0;
};

/**
 * 시간에 분 추가하는 헬퍼 함수
 */
export const addMinutes = (timeString: string, minutes: number): string => {
  if (!timeString) return '';

  const [hours, mins] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;

  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;

  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

/**
 * 소요시간을 사람이 읽기 쉬운 형태로 포맷
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
};

/**
 * 블록 타입별 설정 정보
 */
export const blockTypeConfigs = [
  {
    type: 'flight' as BlockType,
    label: '항공',
    icon: '✈️',
    gradient: 'from-sky-400 to-blue-500',
    description: '항공편 예약',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
  },
  {
    type: 'hotel' as BlockType,
    label: '숙소',
    icon: '🏨',
    gradient: 'from-purple-400 to-pink-500',
    description: '호텔 & 숙박',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    type: 'food' as BlockType,
    label: '식사',
    icon: '🍽️',
    gradient: 'from-orange-400 to-red-500',
    description: '맛집 & 레스토랑',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    type: 'activity' as BlockType,
    label: '관광',
    icon: '🎯',
    gradient: 'from-green-400 to-emerald-500',
    description: '관광 & 액티비티',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    type: 'move' as BlockType,
    label: '이동',
    icon: '🚗',
    gradient: 'from-blue-400 to-indigo-500',
    description: '교통 & 이동',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    type: 'memo' as BlockType,
    label: '메모',
    icon: '📝',
    gradient: 'from-gray-400 to-gray-500',
    description: '메모 & 참고사항',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
];

/**
 * 블록 타입별 라벨 반환
 */
export const getBlockTypeLabel = (blockType: BlockType): string => {
  const config = blockTypeConfigs.find((c) => c.type === blockType);
  return config?.label || blockType;
};

/**
 * 사용자 국적별 주요 출발 공항 제안
 */
export const getDepartureAirportSuggestions = (
  nationality?: string
): string[] => {
  const suggestions: Record<string, string[]> = {
    KR: [
      '인천국제공항 (ICN)',
      '김포공항 (GMP)',
      '부산 김해공항 (PUS)',
      '제주공항 (CJU)',
    ],
    JP: [
      '나리타공항 (NRT)',
      '하네다공항 (HND)',
      '간사이공항 (KIX)',
      '주부공항 (NGO)',
    ],
    US: [
      'JFK공항 (JFK)',
      'LAX공항 (LAX)',
      '오헤어공항 (ORD)',
      '마이애미공항 (MIA)',
    ],
    CN: [
      '베이징 수도공항 (PEK)',
      '상하이 푸동공항 (PVG)',
      '광저우공항 (CAN)',
      '선전공항 (SZX)',
    ],
  };

  return suggestions[nationality?.toUpperCase() || 'KR'] || suggestions.KR;
};

/**
 * 목적지별 주요 도착 공항 제안
 */
export const getArrivalAirportSuggestions = (location?: string): string[] => {
  if (!location) return [];

  const locationLower = location.toLowerCase();

  const suggestions: Record<string, string[]> = {
    japan: [
      '나리타공항 (NRT)',
      '하네다공항 (HND)',
      '간사이공항 (KIX)',
      '주부공항 (NGO)',
    ],
    일본: [
      '나리타공항 (NRT)',
      '하네다공항 (HND)',
      '간사이공항 (KIX)',
      '주부공항 (NGO)',
    ],
    thailand: [
      '수완나품공항 (BKK)',
      '돈므앙공항 (DMK)',
      '푸켓공항 (HKT)',
      '치앙마이공항 (CNX)',
    ],
    태국: [
      '수완나품공항 (BKK)',
      '돈므앙공항 (DMK)',
      '푸켓공항 (HKT)',
      '치앙마이공항 (CNX)',
    ],
    vietnam: ['탄손낫공항 (SGN)', '노이바이공항 (HAN)', '다낭공항 (DAD)'],
    베트남: ['탄손낫공항 (SGN)', '노이바이공항 (HAN)', '다낭공항 (DAD)'],
    usa: [
      'JFK공항 (JFK)',
      'LAX공항 (LAX)',
      '오헤어공항 (ORD)',
      '마이애미공항 (MIA)',
    ],
    미국: [
      'JFK공항 (JFK)',
      'LAX공항 (LAX)',
      '오헤어공항 (ORD)',
      '마이애미공항 (MIA)',
    ],
  };

  for (const [key, airports] of Object.entries(suggestions)) {
    if (locationLower.includes(key)) {
      return airports;
    }
  }

  return [];
};
