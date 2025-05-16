'use client';

import { useContext } from 'react';

import { ToastType } from '@/components/basic/Toast/Toast';
import { ToastContext } from '@/providers/toast-provider';

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const toast = (
    message: string,
    options?: { type?: ToastType; title?: string; duration?: number }
  ) => {
    return context.showToast({ message, ...options });
  };

  toast.success = (
    message: string,
    options?: { title?: string; duration?: number }
  ) => {
    return context.showToast({ message, type: 'success', ...options });
  };

  toast.error = (
    message: string,
    options?: { title?: string; duration?: number }
  ) => {
    return context.showToast({ message, type: 'error', ...options });
  };

  toast.hide = (id: string) => {
    context.hideToast(id);
  };

  toast.hideAll = () => {
    context.hideAllToasts();
  };

  return toast;
};
