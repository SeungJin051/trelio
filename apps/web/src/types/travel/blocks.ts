// 블록 타입 열거형 - 여행 일정의 카테고리 분류
export type BlockType =
  | 'flight' // 항공
  | 'move' // 교통/이동
  | 'food' // 식사
  | 'hotel' // 숙소
  | 'activity' // 관광/액티비티
  | 'memo'; // 메모/기타

// 기본 위치 정보 인터페이스
export interface Location {
  address: string; // 주소 또는 장소명
  latitude?: number; // 위도 (Google Maps 연동용)
  longitude?: number; // 경도 (Google Maps 연동용)
  placeId?: string; // Google Places API ID (고유 식별자)
}

// 시간 정보 인터페이스
export interface TimeRange {
  startTime?: string; // 시작 시간 (HH:MM 형식)
  endTime?: string; // 종료 시간 (HH:MM 형식)
  duration?: number; // 소요 시간 (분 단위)
}

// 비용 정보 인터페이스
export interface Cost {
  amount: number; // 금액
  currency: // 통화 코드
  | 'KRW' // 한국 원화
    | 'USD' // 미국 달러
    | 'JPY' // 일본 엔
    | 'EUR' // 유럽 유로
    | 'CNY' // 중국 위안
    | 'THB' // 태국 바트
    | 'VND' // 베트남 동
    | 'SGD' // 싱가포르 달러
    | 'GBP' // 영국 파운드
    | 'CAD' // 캐나다 달러
    | 'AUD' // 호주 달러
    | 'TWD' // 대만 달러
    | 'HKD' // 홍콩 달러
    | 'MYR' // 말레이시아 링깃
    | 'PHP' // 필리핀 페소
    | 'IDR'; // 인도네시아 루피아
}

// 블록별 메타데이터 인터페이스 (타입별 추가 정보)
export interface BlockMeta {
  // 항공 블록 전용 메타데이터
  flightNumber?: string; // 항공편명 (예: KE123)
  departureAirport?: string; // 출발 공항명/코드
  arrivalAirport?: string; // 도착 공항명/코드
  seatNumber?: string; // 좌석 번호 (예: 12A)

  // 이동 블록 전용 메타데이터
  transportType?: // 교통수단 종류
  | 'walk' // 도보
    | 'car' // 자동차
    | 'bus' // 버스
    | 'subway' // 지하철
    | 'taxi' // 택시
    | 'plane' // 비행기
    | 'train'; // 기차
  fromLocation?: Location; // 출발지 정보
  toLocation?: Location; // 도착지 정보

  // 숙소 블록 전용 메타데이터
  checkIn?: string; // 체크인 날짜 (YYYY-MM-DD)
  checkOut?: string; // 체크아웃 날짜 (YYYY-MM-DD)
  roomType?: string; // 객실 타입 (예: 디럭스 더블룸)

  // 식사 블록 전용 메타데이터
  mealType?: // 식사 종류
  | 'breakfast' // 아침식사
    | 'lunch' // 점심식사
    | 'dinner' // 저녁식사
    | 'snack'; // 간식
  cuisine?: string; // 요리 종류 (예: 일식, 한식, 중식)

  // 액티비티 블록 전용 메타데이터
  activityType?: // 액티비티 종류
  | 'sightseeing' // 관광
    | 'shopping' // 쇼핑
    | 'entertainment' // 엔터테인먼트
    | 'sports' // 스포츠
    | 'culture'; // 문화
  reservationRequired?: boolean; // 예약 필요 여부

  // 공통 메타데이터 (모든 블록 타입에서 사용 가능)
  website?: string; // 관련 웹사이트 URL
  phone?: string; // 연락처
  notes?: string; // 추가 메모
  tags?: string[]; // 태그 목록
  rating?: number; // 평점 (1-5)
  photos?: string[]; // 사진 URL 목록
}

// 핵심 블록 인터페이스 - 여행 일정의 기본 단위
export interface TravelBlock {
  id: string; // 고유 식별자
  planId: string; // 소속 여행 계획 ID
  dayNumber: number; // 여행 일차 (1부터 시작)
  orderIndex: number; // 해당 날짜 내 순서 (0부터 시작)

  // 기본 정보
  blockType: BlockType; // 블록 타입
  title: string; // 제목 (필수)
  description?: string; // 설명 (선택)
  location?: Location; // 위치 정보 (선택)
  timeRange?: TimeRange; // 시간 정보 (선택)
  cost?: Cost; // 비용 정보 (선택)

  // 확장 메타데이터
  meta?: BlockMeta; // 타입별 추가 정보

  // 시스템 정보
  createdBy: string; // 생성자 ID
  createdAt: string; // 생성 시간 (ISO 8601)
  updatedAt: string; // 수정 시간 (ISO 8601)

  // 실시간 협업 정보
  isBeingEdited?: boolean; // 현재 편집 중인지 여부
  editingBy?: {
    // 편집자 정보
    userId: string; // 편집자 ID
    userName: string; // 편집자 이름
    startedAt: string; // 편집 시작 시간
  };
}

// 블록 생성 요청 타입 (API 요청용)
export interface CreateBlockRequest {
  planId: string;
  dayNumber: number;
  blockType: BlockType;
  title: string;
  description?: string;
  location?: Location;
  timeRange?: TimeRange;
  cost?: Cost;
  meta?: BlockMeta;
}

// 블록 업데이트 요청 타입 (API 요청용)
export interface UpdateBlockRequest extends Partial<CreateBlockRequest> {
  id: string; // 업데이트할 블록 ID
}

// 블록 이동 요청 타입 (API 요청용)
export interface MoveBlockRequest {
  id: string; // 이동할 블록 ID
  newDayNumber: number; // 새로운 날짜
  newOrderIndex: number; // 새로운 순서
}

// 실시간 이벤트 타입 (Socket.IO 협업 기능용)
export type BlockEvent =
  | { type: 'CREATE_BLOCK'; payload: TravelBlock } // 블록 생성
  | { type: 'UPDATE_BLOCK'; payload: TravelBlock } // 블록 수정
  | { type: 'DELETE_BLOCK'; payload: { id: string } } // 블록 삭제
  | { type: 'MOVE_BLOCK'; payload: MoveBlockRequest & { block: TravelBlock } } // 블록 이동
  | {
      // 편집 시작
      type: 'START_EDITING';
      payload: { blockId: string; user: { id: string; name: string } };
    }
  | { type: 'STOP_EDITING'; payload: { blockId: string; userId: string } } // 편집 종료
  | {
      // 커서 이동
      type: 'CURSOR_MOVE';
      payload: { userId: string; x: number; y: number; userName: string };
    };

// 일별 블록 그룹 인터페이스 (타임라인 구성용)
export interface DayBlocks {
  dayNumber: number; // 일차
  date: string; // 날짜 (YYYY-MM-DD)
  blocks: TravelBlock[]; // 해당 날짜의 블록 목록
  totalCost: Cost; // 해당 날짜의 총 비용
  totalDuration: number; // 해당 날짜의 총 소요 시간 (분 단위)
}

// 전체 여행 타임라인 인터페이스
export interface TravelTimeline {
  planId: string; // 여행 계획 ID
  days: DayBlocks[]; // 일별 블록 그룹 목록
  totalCost: Cost; // 전체 여행의 총 비용
  lastUpdated: string; // 마지막 업데이트 시간
}
