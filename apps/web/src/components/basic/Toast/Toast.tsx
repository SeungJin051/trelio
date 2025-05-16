'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { IoIosInformationCircle } from 'react-icons/io';
import { IoAlertCircleSharp } from 'react-icons/io5';
import { IoCloseOutline } from 'react-icons/io5';
import { MdCheckCircle } from 'react-icons/md';

import { Button, Typography } from '@ui/components';

export type ToastType = 'default' | 'success' | 'error';

export type ToastPosition =
  | 'top-right'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-center';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  title?: string;
  duration?: number;
  onClose: (id: string) => void;
  position?: ToastPosition;
}

const toastVariants = {
  initial: (position: ToastPosition) => {
    if (position.includes('top')) {
      return { opacity: 0, y: -20 };
    }
    return { opacity: 0, y: 20 };
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: (position: ToastPosition) => {
    if (position.includes('top')) {
      return {
        opacity: 0,
        y: -20,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1],
        },
      };
    }
    return {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 1, 1],
      },
    };
  },
};

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <MdCheckCircle className='h-5 w-5 text-green-500' />;
    case 'error':
      return <IoAlertCircleSharp className='h-5 w-5 text-red-500' />;
    default:
      return <IoIosInformationCircle className='h-5 w-5 text-blue-500' />;
  }
};

const getToastClasses = (type: ToastType) => {
  const baseClasses =
    'flex items-start gap-3 rounded-xl bg-white p-4 shadow-lg border';

  switch (type) {
    case 'success':
      return `${baseClasses} border-green-100`;
    case 'error':
      return `${baseClasses} border-red-100`;
    default:
      return `${baseClasses} border-blue-100`;
  }
};

export const Toast = ({
  id,
  message,
  type = 'default',
  title,
  duration = 4000,
  onClose,
  position = 'top-right',
}: ToastProps) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100 / (duration / 100);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, id, onClose, isPaused]);

  return (
    <motion.div
      layout
      key={id}
      custom={position}
      variants={toastVariants}
      initial='initial'
      animate='animate'
      exit='exit'
      className={`${getToastClasses(type)} relative overflow-hidden`}
      style={{ width: '320px', maxWidth: 'calc(100vw - 32px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className='flex-shrink-0'>{getToastIcon(type)}</div>
      <div className='min-w-0 flex-1'>
        {title && (
          <Typography variant='h6' weight='bold' className='mb-1'>
            {title}
          </Typography>
        )}
        <Typography variant='body2' weight='light' className='text-gray-600'>
          {message}
        </Typography>
      </div>
      <Button
        variant='text'
        size='small'
        onClick={() => onClose(id)}
        className='flex-shrink-0 rounded-full p-1 transition-colors hover:bg-gray-100'
        aria-label='닫기'
      >
        <IoCloseOutline className='h-4 w-4 text-gray-400' />
      </Button>
      <div className='absolute bottom-0 left-0 h-1 w-full bg-gray-100'>
        <div
          className={`h-full ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
        />
      </div>
    </motion.div>
  );
};

Toast.displayName = 'Toast';
