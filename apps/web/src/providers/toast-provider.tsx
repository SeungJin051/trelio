'use client';

import { createContext, type ReactNode, useCallback, useState } from 'react';

import { ToastPosition, ToastType } from '../components/basic/Toast/Toast';
import { ToastContainer } from '../components/basic/Toast/ToastContainer';

// Toast 컨텍스트에서 제공할 함수들의 타입 정의
interface ToastContextProps {
  showToast: (options: {
    message: string; // 토스트에 표시할 메시지
    type?: ToastType; // 토스트 타입 (성공, 에러 등)
    title?: string; // 토스트 제목 (선택사항)
    duration?: number; // 토스트 표시 시간 (밀리초)
  }) => string; // 생성된 토스트의 ID 반환
  hideToast: (id: string) => void; // 특정 ID의 토스트 숨기기
  hideAllToasts: () => void; // 모든 토스트 숨기기
}

// React Context API를 사용하여 ToastContext 생성
export const ToastContext = createContext<ToastContextProps | undefined>(
  undefined
);

// ToastProvider 컴포넌트의 props 타입 정의
interface ToastProviderProps {
  children: ReactNode; // 자식 컴포넌트
  position?: ToastPosition; // 토스트가 표시될 위치
}

// 개별 토스트 아이템의 타입 정의
interface Toast {
  id: string; // 토스트 고유 ID
  message: string; // 표시할 메시지
  type?: ToastType; // 토스트 타입
  title?: string; // 토스트 제목
  duration?: number; // 표시 지속 시간
}

// 고유 ID 생성 함수
let toastIdCounter = 0;
const generateUniqueId = () => `toast-${toastIdCounter++}`;

export const ToastProvider = ({
  children,
  position = 'top-right',
}: ToastProviderProps) => {
  // 현재 표시 중인 토스트 목록 상태 관리
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 새 토스트를 생성하는 함수
  const showToast = useCallback(
    ({
      message,
      type = 'default', // 기본 타입은 'default'
      title,
      duration = 4000, // 기본 지속 시간은 4초
    }: Omit<Toast, 'id'>) => {
      const id = generateUniqueId();
      // 이전 토스트 배열에 새 토스트 추가
      setToasts((prev) => [...prev, { id, message, type, title, duration }]);
      return id; // 생성된 토스트의 ID 반환 (나중에 제거할 때 사용)
    },
    []
  );

  // 특정 ID의 토스트를 제거하는 함수
  const hideToast = useCallback((id: string) => {
    // 해당 ID를 가진 토스트를 필터링하여 제거
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // 모든 토스트를 제거하는 함수
  const hideAllToasts = useCallback(() => {
    setToasts([]); // 토스트 배열을 빈 배열로 설정
  }, []);

  return (
    // Context Provider로 토스트 관련 함수들을 하위 컴포넌트에 제공
    <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts }}>
      {children}
      {/* 토스트 컨테이너 컴포넌트 렌더링 */}
      <ToastContainer toasts={toasts} position={position} onClose={hideToast} />
    </ToastContext.Provider>
  );
};
