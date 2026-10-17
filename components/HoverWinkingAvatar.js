'use client';

import { useState } from 'react';
import Image from 'next/image';

// Swaps to the animated GIF on hover, and on tap for touch screens.
const HoverWinkingAvatar = ({
  staticSrc,
  animatedSrc,
  alt = '8-bit avatar',
  width = 64,
  height = 64,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsAnimating(true)}
      onMouseLeave={() => setIsAnimating(false)}
      onClick={() => setIsAnimating((a) => !a)}
      className={`inline-block shrink-0 ${className}`}
    >
      <Image
        src={isAnimating ? animatedSrc : staticSrc}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        loading="eager"
      />
      {/* Warm the cache so the first hover doesn't flash. */}
      <link rel="preload" as="image" href={animatedSrc} />
    </div>
  );
};

export default HoverWinkingAvatar;
