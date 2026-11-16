import { useState } from 'react';

interface MediaCropProps {
  src: string;
  alt: string;
  photoX?: number;
  photoY?: number;
  photoSize?: string;
  objectFit?: 'cover' | 'contain';
  isAtlas?: boolean;
  className?: string;
}

export function MediaCrop({
  src,
  alt,
  photoX = 50,
  photoY = 50,
  photoSize,
  objectFit = 'cover',
  isAtlas = false,
  className = '',
}: MediaCropProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center bg-[#EFECE5] text-[#6B6A65] ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg viewBox="0 0 64 64" className="h-10 w-10 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 26h26v14a13 13 0 0 1-26 0V26Z" />
          <path d="M42 29h4a5 5 0 0 1 0 10h-4" />
          <path d="M12 52h34" />
          <path d="M24 18c0-3 2-4 2-7M31 18c0-3 2-4 2-7" />
        </svg>
      </div>
    );
  }

  if (isAtlas) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-no-repeat transition-transform duration-500 ${className}`}
        style={{
          backgroundImage: `url('${src}')`,
          backgroundPosition: `${photoX}% ${photoY}%`,
          backgroundSize: photoSize ?? '400% 400%',
        }}
      >
        {/* Hidden probe image to detect load error without affecting layout */}
        <img
          src={src}
          alt=""
          className="sr-only"
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={`${objectFit === 'contain' ? 'object-contain p-2 bg-[#EFE6DA]' : 'object-cover'} ${className}`}
    />
  );
}
