'use client'; // This is a Client Component

import React from 'react'; // Removed useState, useEffect, useRef

const CRTContainer = ({ children, className = '' }) => {
  // Only apply the hover flicker class and any passed-in className
  const combinedClassName = `crt-flicker-on-hover ${className}`;

  return (
    <div className={combinedClassName.trim()}>
      {children}
    </div>
  );
};

export default CRTContainer;