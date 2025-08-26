import { io, Socket } from 'socket.io-client';

import { BlockEvent } from '@/types/travel/blocks';

/**
 * Socket.IO 클라이언트 관리 클래스
 * 실시간 협업 기능을 위한 웹소켓 연결을 담당
 * 싱글톤 패턴으로 구현하여 앱 전체에서 하나의 연결만 유지
 */
class SocketManager {
  private socket: Socket | null = null;
  private currentTravelPlanId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initSocket();
  }

  /**
   * Socket.IO 연결 초기화
   * 개발환경과 프로덕션환경에서 다른 서버 URL 사용
   */
  private initSocket() {
    // 개발환경에서는 Next.js dev 서버와 별도 Socket.IO 서버 필요
    const serverUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001' // Socket.IO 서버 별도 포트
        : window.location.origin; // 프로덕션에서는 같은 도메인

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'], // WebSocket 우선, 실패 시 polling으로 fallback
      timeout: 20000, // 연결 타임아웃 20초
      forceNew: true, // 새로운 연결 강제 생성
    });

    this.setupEventListeners();
  }

  /**
   * Socket.IO 이벤트 리스너 설정
   * 연결, 연결 해제, 에러 처리 등을 담당
   */
  private setupEventListeners() {
    if (!this.socket) return;

    // 연결 성공 시
    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;

      // 현재 여행 계획에 재참여 (재연결 시)
      if (this.currentTravelPlanId) {
        this.joinTravelPlan(this.currentTravelPlanId);
      }
    });

    // 연결 해제 시
    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // 서버에서 연결을 끊은 경우 재연결 시도
        this.handleReconnect();
      }
    });

    // 연결 에러 시
    this.socket.on('connect_error', (error) => {
      console.error('🔥 Socket 연결 오류:', error);
      this.handleReconnect();
    });
  }

  /**
   * 재연결 처리 (Exponential Backoff 적용)
   * 연결 실패 시 지수적으로 증가하는 지연 시간으로 재시도
   */
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error('💥 최대 재연결 시도 횟수 초과');
    }
  }

  /**
   * 여행 계획 채널 참여
   * 특정 여행 계획의 실시간 이벤트를 수신하기 위해 채널에 참여
   * @param planId - 참여할 여행 계획 ID
   */
  joinTravelPlan(planId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('⚠️ Socket이 연결되지 않음');
      return;
    }

    // 이전 채널에서 나가기 (채널 전환 시)
    if (this.currentTravelPlanId) {
      this.socket.emit('leave_travel_plan', this.currentTravelPlanId);
    }

    // 새 채널 참여
    this.currentTravelPlanId = planId;
    this.socket.emit('join_travel_plan', planId);
  }

  /**
   * 여행 계획 채널 나가기
   * 현재 참여 중인 채널에서 나가고 이벤트 수신 중단
   */
  leaveTravelPlan() {
    if (!this.socket || !this.currentTravelPlanId) return;

    this.socket.emit('leave_travel_plan', this.currentTravelPlanId);
    this.currentTravelPlanId = null;
  }

  /**
   * 블록 이벤트 전송
   * 다른 사용자에게 블록 변경사항을 실시간으로 전송
   * @param event - 전송할 블록 이벤트
   */
  emitBlockEvent(event: BlockEvent) {
    if (!this.socket || !this.currentTravelPlanId) {
      console.warn('⚠️ Socket 또는 여행 계획 ID가 없음');
      return;
    }

    this.socket.emit('block_event', {
      planId: this.currentTravelPlanId,
      event,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 블록 이벤트 수신 리스너 등록
   * 다른 사용자의 블록 변경사항을 실시간으로 수신
   * @param callback - 이벤트 수신 시 호출될 콜백 함수
   */
  onBlockEvent(callback: (event: BlockEvent) => void) {
    if (!this.socket) return;

    this.socket.on('block_event', callback);
  }

  /**
   * 블록 이벤트 리스너 제거
   * 메모리 누수 방지를 위해 이벤트 리스너 정리
   * @param callback - 제거할 콜백 함수 (없으면 모든 리스너 제거)
   */
  offBlockEvent(callback?: (event: BlockEvent) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off('block_event', callback);
    } else {
      this.socket.off('block_event');
    }
  }

  /**
   * 커서 위치 전송
   * 다른 사용자에게 현재 커서 위치를 실시간으로 전송 (협업 기능)
   * @param x - 커서 X 좌표
   * @param y - 커서 Y 좌표
   * @param userName - 사용자 이름
   */
  emitCursorMove(x: number, y: number, userName: string) {
    if (!this.socket || !this.currentTravelPlanId) return;

    this.socket.emit('cursor_move', {
      planId: this.currentTravelPlanId,
      x,
      y,
      userName,
      timestamp: Date.now(),
    });
  }

  /**
   * 커서 이동 이벤트 수신
   * 다른 사용자의 커서 위치 변경을 실시간으로 수신
   * @param callback - 커서 이동 시 호출될 콜백 함수
   */
  onCursorMove(
    callback: (data: {
      userId: string;
      x: number;
      y: number;
      userName: string;
    }) => void
  ) {
    if (!this.socket) return;

    this.socket.on('cursor_move', callback);
  }

  /**
   * 참여자 상태 변경 수신
   * 다른 사용자의 온라인/오프라인 상태 변경을 수신
   * @param callback - 상태 변경 시 호출될 콜백 함수
   */
  onParticipantStatusChange(
    callback: (data: {
      userId: string;
      status: 'online' | 'offline';
      userName: string;
    }) => void
  ) {
    if (!this.socket) return;

    this.socket.on('participant_status_change', callback);
  }

  /**
   * 연결 상태 확인
   * @returns 현재 Socket.IO 연결 상태
   */
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * 현재 여행 계획 ID
   * @returns 현재 참여 중인 여행 계획 ID
   */
  get currentPlanId(): string | null {
    return this.currentTravelPlanId;
  }

  /**
   * Socket 정리
   * 컴포넌트 언마운트 시 호출하여 연결 정리
   */
  disconnect() {
    if (this.socket) {
      this.leaveTravelPlan();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// 싱글톤 인스턴스 생성
export const socketManager = new SocketManager();

/**
 * React Hook으로 사용하기 위한 유틸리티
 * 컴포넌트에서 Socket.IO 기능을 쉽게 사용할 수 있도록 래핑
 * @returns SocketManager 인스턴스
 */
export const useSocket = () => {
  return socketManager;
};
