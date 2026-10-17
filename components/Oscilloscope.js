'use client';

import { useEffect, useRef } from 'react';

// Draws live audio data in the current phosphor color. `getData` returns a
// Uint8Array: frequency bins for mode="bars", time-domain samples for mode="wave".
export default function Oscilloscope({ getData, active, mode = 'wave', className = '' }) {
  const canvasRef = useRef(null);
  const getDataRef = useRef(getData);

  useEffect(() => {
    getDataRef.current = getData;
  }, [getData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const color = getComputedStyle(canvas).getPropertyValue('--phosphor').trim() || '#33ff66';
    let frame;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8 * devicePixelRatio;
      ctx.lineWidth = 2 * devicePixelRatio;

      const data = active ? getDataRef.current?.() : null;

      if (mode === 'bars' && data?.length) {
        const bins = 48;
        const step = Math.floor(data.length / 2 / bins) || 1; // upper half is mostly empty
        const barWidth = w / bins;
        for (let i = 0; i < bins; i++) {
          const v = data[i * step] / 255;
          const barHeight = Math.max(2 * devicePixelRatio, v * h * 0.9);
          ctx.fillRect(i * barWidth + 1, (h - barHeight) / 2, barWidth - 3, barHeight);
        }
      } else {
        ctx.beginPath();
        const n = data?.length || 2;
        for (let i = 0; i < n; i++) {
          const v = data ? data[i] / 128 - 1 : 0;
          const x = (i / (n - 1)) * w;
          const y = h / 2 + v * h * 0.45;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [active, mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`w-full h-24 border border-[var(--phosphor-dim)] ${className}`}
    />
  );
}
