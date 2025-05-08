'use client'; // This component needs client-side interactivity

import { useState } from 'react';
import Image from 'next/image'; // Using Next.js Image component is recommended for optimization

const HoverWavingAvatar = ({
  staticSrc,
  animatedSrc,
  alt = '8-bit avatar', // Add a default alt text for accessibility
  width = 64, // Default width
  height = 64, // Default height
  className = '', // Allows adding custom classes
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Determine which source to use based on hover state
  const currentSrc = isHovered ? animatedSrc : staticSrc;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Optional: Add classes to the container div for layout/positioning
      className={`inline-block ${className}`}
    >
      {/* Using Next.js Image component for optimized images */}
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        // Optional: Add classes directly to the Image tag if needed
        // className="some-image-class"
      />
    </div>
  );
};

export default HoverWavingAvatar;