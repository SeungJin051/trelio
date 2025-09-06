import {
  differenceInCalendarDays,
  differenceInDays,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';

import type { TravelStatus } from '@/types/travel';

/**
 * 날짜를 한국어로 포맷팅합니다.
 */
export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'yyyy년 M월 d일', { locale: ko });
};

/**
 * 여행 기간을 문자열로 반환합니다.
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

/**
 * D-Day를 계산합니다.
 */
export const calculateDDay = (startDate: string): string => {
  const today = new Date();
  const start = parseISO(startDate);
  const days = differenceInDays(start, today);

  if (days === 0) return 'D-Day';
  if (days > 0) return `D-${days}`;
  return `D+${Math.abs(days)}`;
};

/**
 * 여행 시작/종료일을 고려한 D-Day를 계산합니다.
 * - 시작 전: D-{n}
 * - 시작일: D-Day
 * - 진행 중: D+{시작 이후 경과일}
 * - 종료 후: 여행 종료 D+{종료 이후 경과일}일
 */
export const calculateDDayWithEnd = (
  startDate: string,
  endDate: string
): string => {
  const today = new Date();
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // 날짜 단위 비교를 위해 캘린더 일수 기반으로 계산
  const daysUntilStart = differenceInCalendarDays(start, today);
  if (daysUntilStart > 0) return `D-${daysUntilStart}`;
  if (daysUntilStart === 0) return 'D-Day';

  const daysUntilEnd = differenceInCalendarDays(today, end);
  // 진행 중 (오늘이 종료일 이전 또는 같은 날)
  if (differenceInCalendarDays(today, start) >= 0 && daysUntilEnd <= 0) {
    const daysSinceStart = Math.abs(daysUntilStart);
    return daysSinceStart === 0 ? 'D-Day' : `D+${daysSinceStart}`;
  }

  // 종료 후
  const daysSinceEnd = differenceInCalendarDays(today, end);
  return `여행 종료 D+${daysSinceEnd}일`;
};

/**
 * "X박 Y일" 형식의 여행 기간 문자열을 반환합니다.
 */
export const formatTripNightsDays = (
  startDate: string,
  endDate: string
): string => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = differenceInCalendarDays(end, start) + 1;
  const nights = Math.max(0, days - 1);
  return `${nights}박 ${days}일`;
};

/**
 * 상대적 시간을 한국어로 반환합니다.
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ko,
  });
};

/**
 * 여행 상태를 계산합니다.
 */
export const calculateTravelStatus = (
  startDate: string,
  endDate: string
): TravelStatus => {
  const today = new Date();
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isBefore(today, start)) {
    return 'upcoming';
  } else if (isAfter(today, end)) {
    return 'completed';
  } else {
    return 'in_progress';
  }
};

/**
 * 여행 상태에 따른 한국어 라벨을 반환합니다.
 */
export const getTravelStatusLabel = (status: TravelStatus): string => {
  switch (status) {
    case 'upcoming':
      return '예정';
    case 'in_progress':
      return '진행 중';
    case 'completed':
      return '완료';
    default:
      return '알 수 없음';
  }
};

/**
 * 여행 상태에 따른 색상 클래스를 반환합니다.
 */
export const getTravelStatusColor = (status: TravelStatus): string => {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * 사용자 이름을 반환합니다 (닉네임 우선, 없으면 이메일).
 */
export const getUserDisplayName = (user: {
  nickname?: string;
  email: string;
}): string => {
  return user.nickname || user.email.split('@')[0];
};
