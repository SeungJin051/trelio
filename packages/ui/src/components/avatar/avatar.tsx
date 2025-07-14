interface AvatarProps {
  size?: 'small' | 'medium' | 'large';
  src?: string;
  alt?: string;
}

export const Avatar = ({ size = 'medium', src, alt }: AvatarProps) => {
  const sizeClass =
    size === 'small'
      ? 'h-8 w-8 text-xs'
      : size === 'large'
        ? 'h-14 w-14 text-xl'
        : 'h-10 w-10 text-base';

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-200 text-gray-500 ${sizeClass}`}
    >
      {src ? (
        <img src={src} alt={alt} className='h-full w-full object-cover' />
      ) : (
        <span>{alt ? alt[0] : '?'}</span>
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';
