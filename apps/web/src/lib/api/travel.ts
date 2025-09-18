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
  meta?: Record<string, unknown>;
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
  order_index?: number;
  block_type?: string;
  location?:
    | string
    | {
        address: string;
        latitude?: number;
        longitude?: number;
        placeId?: string;
      };
  start_time?: string;
  end_time?: string;
  cost?: number;
  currency?: string;
  meta?: Record<string, unknown>;
}

export interface UpdateBlockRequest {
  id: string;
  plan_id?: string;
  title?: string;
  description?: string;
  day_number?: number;
  order_index?: number;
  block_type?: string;
  location?:
    | string
    | {
        address: string;
        latitude?: number;
        longitude?: number;
        placeId?: string;
      };
  start_time?: string;
  end_time?: string;
  cost?: number;
  currency?: string;
  meta?: Record<string, unknown>;
}

export interface UpdateBlockData {
  plan_id?: string;
  title?: string;
  description?: string;
  day_number?: number;
  order_index?: number;
  block_type?: string;
  location?:
    | string
    | {
        address: string;
        latitude?: number;
        longitude?: number;
        placeId?: string;
      };
  start_time?: string;
  end_time?: string;
  cost?: number;
  currency?: string;
  meta?: Record<string, unknown>;
}

export interface MoveBlockRequest {
  new_day_number: number;
  new_order_index: number;
}

export async function fetchTravelDetail(
  planId: string
): Promise<TravelDetailResponse> {
  const response = await fetch(`/api/travel/${planId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // 콘솔 추적용 상세 로깅
    console.error('[fetchTravelDetail] failed', {
      status: response.status,
      statusText: response.statusText,
      error,
      planId,
      endpoint: `/api/travel/${planId}`,
    });
    throw new Error(error.error || 'Failed to fetch travel detail');
  }

  const json = await response.json();
  return json;
}

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
    let parsed: any = {};
    try {
      parsed = await response.json();
    } catch {
      try {
        const text = await response.text();
        parsed = { raw: text };
      } catch {
        parsed = {};
      }
    }
    console.error('[createBlock] failed', {
      status: response.status,
      statusText: response.statusText,
      error: parsed,
    });
    const message =
      parsed?.error ||
      parsed?.details ||
      parsed?.hint ||
      'Failed to create block';
    throw new Error(message);
  }

  const json = (await response.json()) as TravelBlock;
  return json;
}

export async function updateBlock(
  blockId: string,
  data: UpdateBlockData
): Promise<TravelBlock> {
  const response = await fetch(`/api/blocks/${blockId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let error: any = {};
    let errorText = '';
    try {
      error = await response.json();
    } catch (e) {
      errorText = await response.text();
    }
    console.error('[updateBlock] failed', {
      status: response.status,
      statusText: response.statusText,
      error,
      errorText,
      blockId,
    });
    throw new Error(error.error || 'Failed to update block');
  }

  const json = (await response.json()) as TravelBlock;
  return json;
}

export async function deleteBlock(blockId: string): Promise<void> {
  const response = await fetch(`/api/blocks/${blockId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let parsed: any = {};
    try {
      parsed = await response.json();
    } catch {
      try {
        const text = await response.text();
        parsed = { raw: text };
      } catch {
        parsed = {};
      }
    }
    console.error('[deleteBlock] failed', {
      status: response.status,
      statusText: response.statusText,
      error: parsed,
    });
    const message =
      parsed?.error ||
      parsed?.details ||
      parsed?.hint ||
      'Failed to delete block';
    throw new Error(message);
  }
}

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
    const error = await response.json().catch(() => ({}));
    console.error('[moveBlock] failed', { status: response.status, error });
    throw new Error(error.error || 'Failed to move block');
  }
}
