'use client'; // This is a Client Component

import React from 'react';

const CRTContainer = ({ children, className = '' }) => {
  // Add the custom class for flicker effect on hover
  const combinedClassName = `crt-flicker-on-hover ${className}`;

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
};

export default CRTContainer;