/**
 * 여행 계획 관련 타입 정의
 * Supabase travel_plans 및 travel_plan_participants 테이블과 일치하는 타입들
 */

// 참여자 권한 타입
export type ParticipantRole = 'owner' | 'editor' | 'viewer';

// 여행 상태 타입
export type TravelStatus = 'upcoming' | 'in_progress' | 'completed';

// 필터 타입
export type FilterType = 'all' | 'upcoming' | 'in_progress' | 'completed';

// 정렬 타입
export type SortType = 'newest' | 'oldest' | 'alphabetical';

// 여행 계획 기본 인터페이스
export interface TravelPlan {
  id: string;
  owner_id: string;
  title: string;
  location: string;
  start_date: string; // YYYY-MM-DD 형식
  end_date: string; // YYYY-MM-DD 형식
  target_budget: number; // 목표 예산
  budget_currency: string; // 예산 통화 (KRW, USD, JPY 등)
  destination_country?: string; // 목적지 국가 코드 (ISO 3166-1 alpha-3)
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
  target_budget?: number;
  budget_currency?: string;
  destination_country?: string;
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

// 참여자 정보 (UI용)
export interface Participant {
  id: string;
  user_id: string;
  role: ParticipantRole;
  joined_at: string;
  user: {
    id: string;
    nickname?: string;
    email: string;
    avatar_url?: string;
  };
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

// 여행 투두 우선순위 타입
export type TodoPriority = 0 | 1 | 2 | 3 | 4 | 5;

// 여행 투두 인터페이스
export interface TravelTodo {
  id: string;
  plan_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  assigned_user_id?: string;
  created_by: string;
  due_date?: string; // YYYY-MM-DD 형식
  priority: TodoPriority;
  created_at: string;
  updated_at: string;
}

// 여행 투두 생성 요청 타입
export interface CreateTodoRequest {
  plan_id: string;
  title: string;
  description?: string;
  assigned_user_id?: string;
  due_date?: string;
  priority?: TodoPriority;
}

// 여행 투두 업데이트 요청 타입
export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  is_completed?: boolean;
  assigned_user_id?: string;
  due_date?: string;
  priority?: TodoPriority;
}

// UI용 투두 인터페이스 (담당자 정보 포함)
export interface TodoWithAssignee extends TravelTodo {
  assignee?: {
    id: string;
    nickname: string;
    profile_image_url?: string;
  };
  creator: {
    id: string;
    nickname: string;
    profile_image_url?: string;
  };
}

// 여행 활동 인터페이스
export interface Activity {
  id: string;
  travel_plan_id: string;
  user_id: string;
  action_type: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  user?: {
    nickname?: string;
    email?: string;
  };
  travel_plan?: {
    title: string;
  };
}
