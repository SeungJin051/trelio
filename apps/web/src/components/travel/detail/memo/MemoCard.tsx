import React from 'react';

import { Typography } from '@ui/components';

import { getBlockColor, getBlockLabel } from '../utils/BlockPresentation';

interface MemoCardData {
  title: string;
  description?: string;
  tags?: string[];
}

interface MemoCardProps {
  data: MemoCardData;
  compact?: boolean;
}

export const MemoCard: React.FC<MemoCardProps> = ({
  data,
  compact = false,
}) => {
  const color = getBlockColor('memo');
  const tags = data.tags ?? [];

  return (
    <div className={`overflow-hidden rounded-xl border ${color}`}>
      <div className={`${compact ? 'p-3' : 'p-4'} bg-white`}>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-2'>
            <span className='rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700'>
              {getBlockLabel('memo')}
            </span>
          </div>
        </div>

        <div className='mt-2'>
          <Typography
            variant={compact ? 'body2' : 'body1'}
            className='font-semibold text-gray-900'
          >
            {data.title}
          </Typography>
          {data.description && (
            <Typography variant='body2' className='mt-1 text-gray-700'>
              {data.description}
            </Typography>
          )}
        </div>

        {tags.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {tags.map((tag, idx) => (
              <span
                key={`${tag}-${idx}`}
                className='rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600'
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoCard;
