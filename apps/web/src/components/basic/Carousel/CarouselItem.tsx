import type React from 'react';

import { cn } from '@ui/utils/cn';

export interface CarouselItemProps {
  children: React.ReactNode;
  className?: string;
}

export const CarouselItem = ({ children, className }: CarouselItemProps) => {
  return (
    <div className={cn('h-full w-full flex-shrink-0', className)}>
      {children}
    </div>
  );
};
