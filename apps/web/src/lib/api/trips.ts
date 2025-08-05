import { createClient } from '@/lib/supabase/client/supabase';

export interface TravelPlanDetail {
  id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
  user_id: string;
  nickname?: string;
  profile_image_url?: string;
  isOnline?: boolean;
}

export interface TravelBlock {
  id: string;
  plan_id: string;
  title: string;
  description?: string;
  day_number: number;
  order_index: number;
  block_type?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  cost?: number;
  currency?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityItem {
  id: string;
  type:
    | 'block_add'
    | 'block_edit'
    | 'block_delete'
    | 'block_move'
    | 'comment'
    | 'participant_join';
  user: {
    id: string;
    nickname: string;
    profile_image_url?: string;
  };
  content: string;
  timestamp: string;
  blockId?: string;
  blockTitle?: string;
}

export interface TravelDetailResponse {
  travelPlan: TravelPlanDetail;
  participants: Participant[];
  blocks: TravelBlock[];
  activities: ActivityItem[];
}

export interface CreateBlockRequest {
  plan_id: string;
  title: string;
  description?: string;
  day_number: number;
  order_index: number;
  block_type?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  cost?: number;
  currency?: string;
}

export interface UpdateBlockRequest {
  title?: string;
  description?: string;
  day_number?: number;
  order_index?: number;
  block_type?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  cost?: number;
  currency?: string;
}

export interface MoveBlockRequest {
  new_day_number: number;
  new_order_index: number;
}

// 여행 상세 정보 조회
export async function fetchTravelDetail(
  planId: string
): Promise<TravelDetailResponse> {
  const response = await fetch(`/api/trips/${planId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch travel detail');
  }

  return response.json();
}

// 블록 생성
export async function createBlock(
  data: CreateBlockRequest
): Promise<TravelBlock> {
  const response = await fetch('/api/blocks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create block');
  }

  return response.json();
}

// 블록 수정
export async function updateBlock(
  blockId: string,
  data: UpdateBlockRequest
): Promise<TravelBlock> {
  const response = await fetch(`/api/blocks/${blockId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update block');
  }

  return response.json();
}

// 블록 삭제
export async function deleteBlock(blockId: string): Promise<void> {
  const response = await fetch(`/api/blocks/${blockId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete block');
  }
}

// 블록 순서 변경
export async function moveBlock(
  blockId: string,
  data: MoveBlockRequest
): Promise<void> {
  const response = await fetch(`/api/blocks/${blockId}/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to move block');
  }
}
