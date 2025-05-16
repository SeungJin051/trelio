'use client';

import { AnimatePresence } from 'framer-motion';

import { Toast, ToastPosition, ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  position?: ToastPosition;
  onClose: (id: string) => void;
}

const getPositionClasses = (position: ToastPosition) => {
  switch (position) {
    case 'top-right':
      return 'top-0 right-0 p-4';
    case 'top-center':
      return 'top-0 left-1/2 -translate-x-1/2 p-4';
    case 'bottom-right':
      return 'bottom-0 right-0 p-4';
    case 'bottom-center':
      return 'bottom-0 left-1/2 -translate-x-1/2 p-4';
    default:
      return 'top-0 right-0 p-4';
  }
};

export const ToastContainer = ({
  toasts,
  position = 'top-right',
  onClose,
}: ToastContainerProps) => {
  const positionClasses = getPositionClasses(position);

  return (
    <div className={`fixed z-50 flex flex-col gap-3 ${positionClasses}`}>
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onClose}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
