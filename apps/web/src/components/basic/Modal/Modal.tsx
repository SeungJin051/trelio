'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { createPortal } from 'react-dom';
import { IoCloseOutline } from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

export type ModalType =
  | 'default'
  | 'component'
  | 'horizontal'
  | 'vertical'
  | 'alert'
  | 'confirm';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  image?: string;
  modalType?: ModalType;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  children?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'responsive';
}

const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
    },
  },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
  responsive: 'sm:max-w-xl md:max-w-2xl lg:max-w-3xl',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  image,
  modalType = 'default',
  primaryButtonText,
  secondaryButtonText,
  onPrimaryAction,
  onSecondaryAction,
  children,
  width = 'md',
}: ModalProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 포커스 트랩 구현
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  const renderModalContent = () => {
    switch (modalType) {
      case 'horizontal':
        return (
          <div className='flex flex-col overflow-hidden md:flex-row'>
            {image && (
              <div className='relative h-48 md:h-auto md:w-1/2'>
                <Image
                  src={image || '/placeholder.svg'}
                  alt={title || ''}
                  fill
                  className='object-cover'
                />
              </div>
            )}
            <div
              className={`flex flex-col p-6 ${image ? 'md:w-1/2' : 'w-full'}`}
            >
              <Typography variant='h6' weight='bold' className='mb-2'>
                {title}
              </Typography>
              {description && (
                <Typography variant='body2' weight='light' className='mb-6'>
                  {description}
                </Typography>
              )}
              {children}
              <div className='mt-auto flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row'>
                {secondaryButtonText && (
                  <Button
                    variant='outlined'
                    onClick={onSecondaryAction || onClose}
                    className='w-full sm:w-auto'
                  >
                    {secondaryButtonText}
                  </Button>
                )}
                {primaryButtonText && (
                  <Button
                    onClick={onPrimaryAction}
                    className='w-full bg-[#3182F6] hover:bg-[#1b64da] sm:w-auto'
                  >
                    {primaryButtonText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case 'vertical':
        return (
          <div className='flex flex-col overflow-hidden'>
            {image && (
              <div className='relative h-48 w-full'>
                <Image
                  src={image || '/placeholder.svg'}
                  alt={title || ''}
                  fill
                  className='object-cover'
                />
              </div>
            )}
            <div className='flex flex-col p-6'>
              <h2 className='mb-2 text-xl font-semibold text-gray-900'>
                {title}
              </h2>
              {description && (
                <Typography variant='body2' weight='light' className='mb-6'>
                  {description}
                </Typography>
              )}
              {children}
              <div className='mt-auto flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row'>
                {secondaryButtonText && (
                  <Button
                    variant='outlined'
                    onClick={onSecondaryAction || onClose}
                    className='w-full sm:w-auto'
                  >
                    {secondaryButtonText}
                  </Button>
                )}
                {primaryButtonText && (
                  <Button
                    onClick={onPrimaryAction}
                    className='w-full bg-[#3182F6] hover:bg-[#1b64da] sm:w-auto'
                  >
                    {primaryButtonText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case 'alert':
        return (
          <div className='p-6'>
            <div className='mb-4 flex items-center justify-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100'>
                <svg
                  className='h-6 w-6 text-yellow-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                  />
                </svg>
              </div>
            </div>
            <Typography className='mb-2 text-center text-xl font-semibold text-gray-900'>
              {title}
            </Typography>
            {description && (
              <Typography variant='body2' weight='light' className='mb-6'>
                {description}
              </Typography>
            )}
            {children}
            <div className='mt-6 flex justify-center'>
              <Button
                onClick={onPrimaryAction || onClose}
                className='w-full bg-[#3182F6] hover:bg-[#1b64da] sm:w-auto'
              >
                {primaryButtonText || '확인'}
              </Button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className='p-6'>
            <div className='mb-4 flex items-center justify-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
                <svg
                  className='h-6 w-6 text-blue-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            </div>
            <Typography variant='h6' weight='bold' className='mb-2 text-center'>
              {title}
            </Typography>
            {description && (
              <Typography variant='body2' weight='light' className='mb-6'>
                {description}
              </Typography>
            )}
            {children}
            <div className='mt-6 flex flex-col-reverse justify-center gap-3 sm:flex-row'>
              <Button
                variant='outlined'
                onClick={onSecondaryAction || onClose}
                className='w-full sm:w-auto'
              >
                {secondaryButtonText || '취소'}
              </Button>
              <Button
                onClick={onPrimaryAction}
                className='w-full bg-[#3182F6] hover:bg-[#1b64da] sm:w-auto'
              >
                {primaryButtonText || '확인'}
              </Button>
            </div>
          </div>
        );

      case 'component':
        return (
          <div className='p-6'>
            <Typography variant='h6' weight='bold' className='mb-2'>
              {title}
            </Typography>
            {children}
          </div>
        );

      default:
        return (
          <div className='p-6'>
            <Typography className='mb-2 text-xl font-semibold text-gray-900'>
              {title}
            </Typography>
            {description && (
              <Typography variant='body2' weight='light' className='mb-6'>
                {description}
              </Typography>
            )}
            {children}
          </div>
        );
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm'
            initial='hidden'
            animate='visible'
            exit='exit'
            variants={overlayVariants}
          >
            <motion.div
              ref={modalRef}
              className={`relative w-full overflow-hidden rounded-2xl bg-white shadow-xl ${widthClasses[width]}`}
              variants={modalVariants}
              role='dialog'
              aria-modal='true'
              aria-labelledby='modal-title'
            >
              <div className='absolute right-4 top-4 z-10'>
                <Button
                  variant='text'
                  size='small'
                  onClick={onClose}
                  aria-label='닫기'
                >
                  <IoCloseOutline className='h-5 w-5 text-gray-500' />
                </Button>
              </div>
              {renderModalContent()}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

Modal.displayName = 'Modal';
