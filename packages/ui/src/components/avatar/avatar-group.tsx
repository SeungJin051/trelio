import React from 'react';

interface AvatarGroupProps {
  children: React.ReactNode;
}

export const AvatarGroup = ({ children }: AvatarGroupProps) => (
  <div className='flex -space-x-2'>{children}</div>
);

AvatarGroup.displayName = 'AvatarGroup';
