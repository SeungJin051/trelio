'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

import { cn } from '@ui/utils/cn';

export interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  infiniteLoop?: boolean;
  className?: string;
  indicatorClassName?: string;
  controlClassName?: string;
  slideClassName?: string;
}

export const Carousel = ({
  children,
  autoPlay = true,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  infiniteLoop = true,
  className,
  indicatorClassName,
  controlClassName,
  slideClassName,
}: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const items = React.Children.toArray(children);
  const itemsCount = items.length;

  const [slideWidth, setSlideWidth] = useState(0);
  useEffect(() => {
    const updateSlideWidth = () => {
      if (carouselRef.current) {
        setSlideWidth(carouselRef.current.offsetWidth);
      }
    };

    updateSlideWidth();
    window.addEventListener('resize', updateSlideWidth);
    return () => window.removeEventListener('resize', updateSlideWidth);
  }, []);

  const goToNext = useCallback(() => {
    setDirection(1);
    if (currentIndex === itemsCount - 1) {
      if (infiniteLoop) {
        setCurrentIndex(0);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, itemsCount, infiniteLoop]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    if (currentIndex === 0) {
      if (infiniteLoop) {
        setCurrentIndex(itemsCount - 1);
      }
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, itemsCount, infiniteLoop]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const autoPlayInterval = setInterval(() => {
      goToNext();
    }, interval);

    return () => {
      clearInterval(autoPlayInterval);
    };
  }, [autoPlay, isPaused, goToNext, interval]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === carouselRef.current) {
        if (e.key === 'ArrowLeft') {
          goToPrev();
        } else if (e.key === 'ArrowRight') {
          goToNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrev]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? slideWidth : -slideWidth,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -slideWidth : slideWidth,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl bg-white',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={carouselRef}
      tabIndex={0}
      aria-roledescription='carousel'
      aria-label='이미지 캐러셀'
    >
      <div className='relative h-full w-full'>
        <AnimatePresence initial={false} custom={direction} mode='popLayout'>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial='enter'
            animate='center'
            exit='exit'
            className={cn('h-full w-full', slideClassName)}
            aria-roledescription='slide'
            aria-label={`슬라이드 ${currentIndex + 1}/${itemsCount}`}
          >
            {items[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {showControls && itemsCount > 1 && (
        <>
          <button
            className={cn(
              'absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-gray-800 shadow-sm backdrop-blur-sm transition-all hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-1',
              controlClassName
            )}
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label='이전 슬라이드'
            disabled={!infiniteLoop && currentIndex === 0}
          >
            <BsChevronLeft className='h-5 w-5' />
          </button>
          <button
            className={cn(
              'absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-gray-800 shadow-sm backdrop-blur-sm transition-all hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:ring-offset-1',
              controlClassName
            )}
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label='다음 슬라이드'
            disabled={!infiniteLoop && currentIndex === itemsCount - 1}
          >
            <BsChevronRight className='h-5 w-5' />
          </button>
        </>
      )}

      {showIndicators && itemsCount > 1 && (
        <div
          className={cn(
            'absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5',
            indicatorClassName
          )}
          role='tablist'
          aria-label='캐러셀 인디케이터'
          onClick={(e) => e.stopPropagation()}
        >
          {Array.from({ length: itemsCount }).map((_, index) => (
            <button
              key={index}
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === currentIndex
                  ? 'w-5 bg-[#3182F6]'
                  : 'w-1.5 bg-gray-300/80 hover:bg-gray-400/80'
              )}
              onClick={() => goToSlide(index)}
              aria-label={`슬라이드 ${index + 1} 보기`}
              aria-selected={index === currentIndex}
              role='tab'
            />
          ))}
        </div>
      )}
    </div>
  );
};
