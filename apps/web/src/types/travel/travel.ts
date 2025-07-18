/**
 * 여행 계획 관련 타입 정의
 * Supabase travel_plans 및 travel_plan_participants 테이블과 일치하는 타입들
 */

// 참여자 권한 타입
export type ParticipantRole = 'owner' | 'editor' | 'viewer';

// 여행 계획 기본 인터페이스
export interface TravelPlan {
  id: string;
  owner_id: string;
  title: string;
  location: string;
  start_date: string; // YYYY-MM-DD 형식
  end_date: string; // YYYY-MM-DD 형식
  share_link_id: string;
  default_permission: 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

// 여행 계획 생성 요청 타입
export interface CreateTravelPlanRequest {
  owner_id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  share_link_id: string;
  default_permission: 'editor' | 'viewer';
}

// 여행 계획 참여자 인터페이스
export interface TravelPlanParticipant {
  id: string;
  plan_id: string;
  user_id: string;
  role: ParticipantRole;
  joined_at: string;
}

// 여행 계획 참여자 생성 요청 타입
export interface CreateParticipantRequest {
  plan_id: string;
  user_id: string;
  role: ParticipantRole;
}

// 여행 계획 목록 아이템 (UI용)
export interface TravelPlanListItem {
  id: string;
  title: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
  participantCount: number;
  isOwner: boolean;
  role: ParticipantRole;
}

// 여행 계획 상세 정보 (UI용)
export interface TravelPlanDetail extends TravelPlan {
  participants: Array<{
    id: string;
    user_id: string;
    role: ParticipantRole;
    nickname?: string;
    profile_image_url?: string;
    joined_at: string;
  }>;
  dayCount: number;
  isOwner: boolean;
  currentUserRole: ParticipantRole;
}
