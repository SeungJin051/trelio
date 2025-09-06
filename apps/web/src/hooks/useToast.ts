'use client';

import { useContext, useMemo } from 'react';

import { ToastType } from '@/components/basic/Toast/Toast';
import { ToastContext } from '@/providers/toast-provider';

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  // toast 메모이제이션 처리
  const toast = useMemo(() => {
    const base = (
      message: string,
      options?: { type?: ToastType; title?: string; duration?: number }
    ) => context.showToast({ message, ...options });

    base.success = (
      message: string,
      options?: { title?: string; duration?: number }
    ) => context.showToast({ message, type: 'success', ...options });

    base.error = (
      message: string,
      options?: { title?: string; duration?: number }
    ) => context.showToast({ message, type: 'error', ...options });

    base.hide = (id: string) => {
      context.hideToast(id);
    };

    base.hideAll = () => {
      context.hideAllToasts();
    };

    return base;
  }, [context]);

  return toast;
};
