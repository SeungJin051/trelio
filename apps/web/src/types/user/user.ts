import type { ElementType } from 'react';

/**
 * 사용자 프로필 관련 타입 정의
 * Supabase user_profiles 테이블과 일치하는 타입들
 */

// 연령대 타입
export type AgeRange = '10대' | '20대' | '30대' | '40대' | '50대' | '60대+';

// 성별 타입
export type Gender = 'male' | 'female' | 'other';

// 프로필 이미지 옵션 타입
export type ProfileImageOption = 'social' | 'upload';

// 선호 여행지 타입
export type PreferredDestination =
  | 'southeast-asia' // 동남아시아
  | 'europe' // 유럽
  | 'japan' // 일본
  | 'korea' // 국내
  | 'americas' // 미주
  | 'oceania' // 오세아니아
  | 'china' // 중국
  | 'middle-east'; // 중동/아프리카

// 여행 스타일 타입
export type TravelStyle =
  | 'healing' // 힐링여행
  | 'activity' // 액티비티
  | 'culture' // 문화탐방
  | 'food' // 맛집투어
  | 'shopping' // 쇼핑
  | 'nature'; // 자연경관

// 인증 제공자 타입
export type AuthProvider = 'kakao' | 'google' | 'unknown';

// 기본 사용자 프로필 인터페이스 (회원가입 폼용)
export interface UserProfile {
  nickname: string;
  age_range?: AgeRange;
  gender?: Gender;
  profile_image_option: ProfileImageOption;
  profile_image_url?: string;
  preferred_destinations: PreferredDestination[];
  travel_styles: TravelStyle[];
}

// 데이터베이스 사용자 프로필 인터페이스 (전체 필드)
export interface UserProfileDB extends UserProfile {
  id: string;
  email: string;
  provider: AuthProvider;
  created_at: string;
  updated_at: string;
}

// 사용자 프로필 생성 요청 타입
export interface CreateUserProfileRequest {
  id: string;
  email: string;
  nickname: string;
  age_range: AgeRange;
  gender: Gender;
  profile_image_option: ProfileImageOption;
  profile_image_url?: string;
  preferred_destinations: PreferredDestination[];
  travel_styles: TravelStyle[];
  provider: AuthProvider;
}

// 사용자 프로필 업데이트 요청 타입 (선택적 필드)
export interface UpdateUserProfileRequest {
  nickname?: string;
  age_range?: AgeRange;
  gender?: Gender;
  profile_image_option?: ProfileImageOption;
  profile_image_url?: string | null;
  preferred_destinations?: PreferredDestination[];
  travel_styles?: TravelStyle[];
}

// 여행지 정보 인터페이스
export interface DestinationInfo {
  id: PreferredDestination;
  name: string;
  icon: string;
}

// 여행 스타일 정보 인터페이스
export interface TravelStyleInfo {
  id: TravelStyle;
  name: string;
  icon: ElementType; // React Icon 컴포넌트
  color: string;
}
