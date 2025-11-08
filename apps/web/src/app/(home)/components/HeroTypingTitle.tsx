'use client';

import React from 'react';

import { Typography } from '@ui/components';

const HeroTypingTitle: React.FC = () => {
  const words = ['더 쉽게', '편하게', '간단하게', '빠르게'];
  const [index, setIndex] = React.useState(0);
  const [display, setDisplay] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const current = words[index % words.length];
    const typingSpeed = isDeleting ? 50 : 90;
    const pauseTime = 3500;

    const tick = () => {
      if (!isDeleting) {
        const next = current.slice(0, display.length + 1);
        setDisplay(next);
        if (next === current) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        const next = current.slice(0, Math.max(0, display.length - 1));
        setDisplay(next);
        if (next === '') {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const timer = setTimeout(tick, typingSpeed);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, isDeleting, index]);

  return (
    <Typography variant='title2'>
      여행을{' '}
      <span className='relative inline-block'>
        <span className=''>{display || ' '}</span>
        <span className='ml-1 inline-block h-8 w-[2px] animate-pulse bg-blue-600 align-middle sm:h-9 md:h-10 lg:h-12' />
      </span>
      ,
      <br />
      <span className='text-blue-600'>함께 계획하세요</span>
    </Typography>
  );
};

export default HeroTypingTitle;
