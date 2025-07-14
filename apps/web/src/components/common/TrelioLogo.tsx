import React from 'react';

interface TrelioLogoProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  accentColor?: string;
}

export const TrelioLogo: React.FC<TrelioLogoProps> = ({
  width = 40,
  height = 40,
  className = '',
  color = '#4F46E5',
  accentColor = '#60A5FA',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 40 40'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path
        d='M 8 28 
           C 12 20 20 12 32 12'
        stroke={color}
        strokeWidth='6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M 20 8 
           C 20 16 20 24 20 32'
        stroke={accentColor}
        strokeWidth='6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default TrelioLogo;
