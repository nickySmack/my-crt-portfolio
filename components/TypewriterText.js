'use client'; // This is a Client Component

import { useState, useEffect } from 'react';

const TypewriterText = ({ text, delay = 50, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeoutId;
    if (isTyping) {
      if (displayText.length < text.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(text.substring(0, displayText.length + 1));
        }, delay);
      } else {
        setIsTyping(false);
        if (onComplete) {
          onComplete(); // Notify parent when typing is complete
        }
      }
    }

    return () => clearTimeout(timeoutId); // Clean up timeout on unmount or re-render
  }, [displayText, text, delay, isTyping, onComplete]);

  return (
    <>
      {displayText}
      {isTyping && <span className="blink">_</span>} {/* Optional: Add a blinking cursor */}
    </>
  );
};

export default TypewriterText;