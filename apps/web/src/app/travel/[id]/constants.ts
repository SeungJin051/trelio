// 여행 상세 페이지 상수
export const TRAVEL_DETAIL_CONSTANTS = {
  // 탭 관련
  DASHBOARD_TAB: {
    id: 'dashboard',
    label: '대시보드',
    dayNumber: 0,
  },

  // 애니메이션
  ANIMATION: {
    TAB_TRANSITION: 200,
    MODAL_TRANSITION: 300,
  },

  // 스크롤
  SCROLL: {
    TAB_CONTAINER_HEIGHT: 80,
    TAB_MIN_WIDTH: 120,
  },

  // 권한
  ROLES: {
    OWNER: 'owner',
    EDITOR: 'editor',
    VIEWER: 'viewer',
  },

  // 상태
  STATUS: {
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
    NOT_FOUND: 'not_found',
  },
} as const;

// 탭 타입 정의
export type TabType = 'dashboard' | 'day';

// 탭 인터페이스
export interface TabItem {
  id: string;
  label: string;
  dayNumber: number;
  type: TabType;
  date?: string;
  totalCost?: {
    amount: number;
    currency: string;
  };
}
