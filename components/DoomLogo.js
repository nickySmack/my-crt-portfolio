// DOOM-style title lettering, drawn as SVG so it stays crisp at any size and
// needs no font file. Like the 1993 logo, each letter is a slab with a pointed
// shield bottom and slot counters, rimmed by a bevelled orange-to-yellow frame
// and filled with blue circuitry over gold rock. Glyphs are polygons on an
// 18-unit-tall grid; the word is then warped so the outer letters flare taller.
// GLYPHS covers A-Z (case-insensitive); anything else renders as a space.
// Glyph rules: stems 3.8 wide, bars ~3.4 tall, slots 2.4 wide, and the bottom
// edge tapers from y=15 at the sides to a point at y=18 in the middle.

const CAP = 18; // glyph grid height
const GAP = 0.8; // space between letters
const RISE = 1.5; // how far the outer letters reach above the middle ones
const DROP = 5; // ...and below
const BEVEL = 0.6; // width of the frame around every edge
const DEPTH = 5; // extrusion layers
const DEPTH_STEP = 0.22;

// Each glyph: its width and a list of rings (outer outline, then holes).
const GLYPHS = {
  A: {
    width: 10,
    rings: [
      [[0, 2.4], [2.4, 0], [7.6, 0], [10, 2.4], [10, 15], [6.2, 17.28], [6.2, 11.4], [3.8, 11.4], [3.8, 17.28], [0, 15]],
      [[3.8, 3.6], [6.2, 3.6], [6.2, 8.2], [3.8, 8.2]],
    ],
  },
  B: {
    width: 10,
    rings: [
      [[0, 0], [8.8, 0], [10, 1.2], [10, 7.4], [9, 8.4], [10, 9.4], [10, 15], [5, 18], [0, 15]],
      [[3.8, 3.2], [6.2, 3.2], [6.2, 6.8], [3.8, 6.8]],
      [[3.8, 10], [6.2, 10], [6.2, 12.6], [5, 13.8], [3.8, 12.6]],
    ],
  },
  C: {
    width: 10,
    rings: [
      [[0, 0], [10, 0], [10, 3.6], [3.8, 3.6], [3.8, 12.4], [5, 13.6], [10, 10.6], [10, 15], [5, 18], [0, 15]],
    ],
  },
  D: {
    width: 10,
    rings: [
      [[0, 0], [7.4, 0], [10, 2.6], [10, 15], [5, 18], [0, 15]],
      [[3.8, 3.2], [6.2, 3.2], [6.2, 12.6], [5, 13.8], [3.8, 12.6]],
    ],
  },
  E: {
    width: 9.6,
    rings: [
      [[0, 0], [9.6, 0], [9.6, 3.4], [3.8, 3.4], [3.8, 6.6], [8.2, 6.6], [8.2, 9.6], [3.8, 9.6], [3.8, 12.4], [4.8, 13.5], [9.6, 10.6], [9.6, 15], [4.8, 18], [0, 15]],
    ],
  },
  F: {
    width: 9.6,
    rings: [
      [[0, 0], [9.6, 0], [9.6, 3.4], [3.8, 3.4], [3.8, 6.6], [8.2, 6.6], [8.2, 9.6], [3.8, 9.6], [3.8, 17.3], [0, 15]],
    ],
  },
  G: {
    width: 10,
    rings: [
      [[0, 0], [10, 0], [10, 3.6], [3.8, 3.6], [3.8, 12.4], [5, 13.6], [6.2, 12.9], [6.2, 10.4], [5, 10.4], [5, 7.4], [10, 7.4], [10, 15], [5, 18], [0, 15]],
    ],
  },
  H: {
    width: 10,
    rings: [
      [[0, 0], [3.8, 0], [3.8, 6.6], [6.2, 6.6], [6.2, 0], [10, 0], [10, 15], [6.2, 17.28], [6.2, 9.8], [3.8, 9.8], [3.8, 17.28], [0, 15]],
    ],
  },
  I: {
    width: 3.8,
    rings: [[[0, 0], [3.8, 0], [3.8, 15], [1.9, 18], [0, 15]]],
  },
  J: {
    width: 10,
    rings: [[[6.2, 0], [10, 0], [10, 15], [5, 18], [0, 15], [0, 10.6], [5, 13.6], [6.2, 12.4]]],
  },
  K: {
    width: 10.4,
    rings: [
      [[0, 0], [3.8, 0], [3.8, 6.2], [6.6, 0], [10.4, 0], [6.8, 8.4], [10.4, 15], [6.8, 17.08], [3.8, 11.2], [3.8, 17.19], [0, 15]],
    ],
  },
  L: {
    width: 9,
    rings: [[[0, 0], [3.8, 0], [3.8, 12.4], [4.5, 13.2], [9, 10.5], [9, 15], [4.5, 18], [0, 15]]],
  },
  M: {
    width: 14,
    rings: [
      [[0, 0], [5.4, 0], [7, 4.6], [8.6, 0], [14, 0], [14, 15.4], [10.2, 17.6], [10.2, 7.6], [7, 11.8], [3.8, 7.6], [3.8, 17.6], [0, 15.4]],
    ],
  },
  N: {
    width: 10,
    rings: [
      [[0, 0], [4, 0], [6.2, 5.4], [6.2, 0], [10, 0], [10, 15], [6.2, 17.28], [3.8, 11.4], [3.8, 17.28], [0, 15]],
    ],
  },
  O: {
    width: 10,
    rings: [
      [[0, 0], [10, 0], [10, 15], [5, 18], [0, 15]],
      [[3.8, 3.2], [6.2, 3.2], [6.2, 12.6], [5, 13.8], [3.8, 12.6]],
    ],
  },
  P: {
    width: 10,
    rings: [
      [[0, 0], [10, 0], [10, 10.4], [3.8, 10.4], [3.8, 17.3], [0, 15]],
      [[3.8, 3.2], [6.2, 3.2], [6.2, 7.2], [3.8, 7.2]],
    ],
  },
  Q: {
    width: 11.6,
    rings: [
      [[0, 0], [10, 0], [10, 13], [11.6, 17], [8, 17], [5, 18], [0, 15]],
      [[3.8, 3.2], [6.2, 3.2], [6.2, 12.6], [5, 13.8], [3.8, 12.6]],
    ],
  },
  R: {
    width: 10,
    rings: [
      [[0, 0], [8.8, 0], [10, 1.2], [10, 8.4], [9, 9.4], [10, 10.4], [10, 15], [6.2, 17.28], [6.2, 10.4], [3.8, 10.4], [3.8, 17.28], [0, 15]],
      [[3.8, 3.2], [6.2, 3.2], [6.2, 7.2], [3.8, 7.2]],
    ],
  },
  S: {
    width: 10,
    rings: [
      [[2.4, 0], [10, 0], [10, 3.4], [3.8, 3.4], [3.8, 6.4], [7.8, 6.4], [10, 8.6], [10, 15], [5, 18], [0, 15], [0, 10.6], [5, 13.6], [6.2, 12.4], [6.2, 9.6], [2.2, 9.6], [0, 7.4], [0, 2.4]],
    ],
  },
  T: {
    width: 11,
    rings: [[[0, 0], [11, 0], [11, 3.6], [7.4, 3.6], [7.4, 16.96], [5.5, 18], [3.6, 16.96], [3.6, 3.6], [0, 3.6]]],
  },
  U: {
    width: 10,
    rings: [[[0, 0], [3.8, 0], [3.8, 12.6], [5, 13.8], [6.2, 12.6], [6.2, 0], [10, 0], [10, 15], [5, 18], [0, 15]]],
  },
  V: {
    width: 10,
    rings: [[[0, 0], [3.8, 0], [3.8, 8.6], [5, 11], [6.2, 8.6], [6.2, 0], [10, 0], [10, 10.4], [5, 18], [0, 10.4]]],
  },
  W: {
    width: 14,
    rings: [
      [[0, 0], [3.8, 0], [3.8, 11.8], [4.65, 13], [5.5, 11.8], [5.5, 2.8], [8.5, 2.8], [8.5, 11.8], [9.35, 13], [10.2, 11.8], [10.2, 0], [14, 0], [14, 15], [7, 18], [0, 15]],
    ],
  },
  X: {
    width: 10,
    rings: [
      [[0, 0], [3.8, 0], [5, 4.2], [6.2, 0], [10, 0], [7.4, 8.6], [10, 15], [6.4, 17.16], [5, 12.8], [3.6, 17.16], [0, 15], [2.6, 8.6]],
    ],
  },
  Y: {
    width: 10,
    rings: [
      [[0, 0], [3.8, 0], [5, 5.2], [6.2, 0], [10, 0], [10, 4], [6.9, 9.4], [6.9, 16.86], [5, 18], [3.1, 16.86], [3.1, 9.4], [0, 4]],
    ],
  },
  Z: {
    width: 10,
    rings: [
      [[0, 0], [10, 0], [10, 3.6], [4.4, 12.6], [5, 13.6], [10, 10.6], [10, 15], [5, 18], [0, 15], [0, 11.6], [5.6, 3.6], [0, 3.6]],
    ],
  },
  ' ': { width: 4, rings: [] },
};

const round = (n) => Math.round(n * 100) / 100;

function layout(text) {
  const glyphs = [...text.toUpperCase()].map((ch) => {
    if (!GLYPHS[ch] && process.env.NODE_ENV !== 'production') {
      console.warn(`<DoomLogo> has no glyph for "${ch}"; drawing a space.`);
    }
    return GLYPHS[ch] ?? GLYPHS[' '];
  });
  const width = glyphs.reduce((sum, g) => sum + g.width, 0) + GAP * (glyphs.length - 1);

  // Stretch each column vertically by its distance from the centre of the word.
  const warp = (x, y) => {
    const u = (x - width / 2) / (width / 2);
    const top = -RISE * u * u;
    const bottom = CAP + DROP * u * u;
    return `${round(x)} ${round(top + (y / CAP) * (bottom - top))}`;
  };

  let x = 0;
  let d = '';
  for (const g of glyphs) {
    for (const ring of g.rings) {
      d += `M${ring.map(([gx, gy]) => warp(x + gx, gy)).join('L')}Z`;
    }
    x += g.width + GAP;
  }

  // A jagged mountain ridge across the word: circuitry above it, rock below.
  const ridge = [];
  for (let rx = -2; rx <= width + 2; rx += 0.8) {
    const ry = 9.4 + 1.8 * Math.sin(0.7 * rx) + Math.sin(1.9 * rx + 1.3) + 0.5 * Math.sin(4.3 * rx + 0.4);
    ridge.push(warp(rx, ry));
  }
  const sky = `M-2 ${-RISE - 3}L${ridge.join('L')}L${round(width + 2)} ${-RISE - 3}Z`;

  return { d, sky, width };
}

export default function DoomLogo({ text = 'WELCOME', className = '' }) {
  const { d, sky, width } = layout(text);
  const top = -RISE;
  const bottom = CAP + DROP;
  const pad = 2.5;
  const box = { x: -pad, y: top - pad, w: width + pad * 2, h: bottom - top + DEPTH * DEPTH_STEP + pad * 2 };
  const viewBox = [box.x, box.y, box.w, box.h].map(round).join(' ');
  const word = <use href="#doom-word" />;

  return (
    <svg viewBox={viewBox} className={`doom-logo ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <path id="doom-word" d={d} fillRule="evenodd" clipRule="evenodd" />
        <clipPath id="doom-clip">{word}</clipPath>

        {/* Top-facing edges: inside the word, but not once it shifts down by a bevel. */}
        <mask id="doom-top" maskUnits="userSpaceOnUse" x={box.x} y={box.y} width={box.w} height={box.h}>
          <use href="#doom-word" fill="#fff" />
          <use href="#doom-word" fill="#000" transform={`translate(0 ${BEVEL})`} />
        </mask>

        <linearGradient id="doom-frame" gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={bottom}>
          <stop offset="0" stopColor="#ff8a24" />
          <stop offset="0.35" stopColor="#ea5a0e" />
          <stop offset="0.62" stopColor="#f89a1c" />
          <stop offset="0.82" stopColor="#ffd040" />
          <stop offset="1" stopColor="#fff18a" />
        </linearGradient>

        <linearGradient id="doom-rock-tone" gradientUnits="userSpaceOnUse" x1="0" y1={CAP * 0.4} x2="0" y2={bottom}>
          <stop offset="0" stopColor="#6e4812" />
          <stop offset="0.5" stopColor="#b08028" />
          <stop offset="1" stopColor="#f0c858" />
        </linearGradient>

        {/* Blue tech-panel circuitry, flecked with the odd red and green light. */}
        <pattern id="doom-circuit" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="scale(0.55)">
          <rect width="6" height="6" fill="#2222b4" />
          <path
            d="M0.5 0.8H2.6V2.2M3.6 0V1.4H5.4M1.2 3.4V5.2H2.8M4.2 2.6V4.4H6M0 4.2H0.6M3.4 5.4V6"
            fill="none"
            stroke="#06066e"
            strokeWidth="0.3"
          />
          <path d="M0.4 2.6H1.6M2.2 4H3.6M4.6 5.4H5.6M5 1.8V2.4" fill="none" stroke="#5252f4" strokeWidth="0.18" />
          <rect x="2.9" y="2.9" width="0.3" height="0.3" fill="#d42020" />
          <rect x="5.2" y="0.4" width="0.3" height="0.3" fill="#22a844" />
        </pattern>

        <filter id="doom-rock" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="4" seed="4" result="noise" />
          <feDiffuseLighting in="noise" surfaceScale="2" diffuseConstant="1.2" lightingColor="#fff" result="relief">
            <feDistantLight azimuth="235" elevation="50" />
          </feDiffuseLighting>
          <feBlend in="SourceGraphic" in2="relief" mode="multiply" />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>

        <filter id="doom-glow" x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Hellfire glow behind everything. */}
      <use href="#doom-word" fill="#ff3000" opacity="0.4" filter="url(#doom-glow)" />

      {/* Extrusion, with the heavy black outline around the deepest layer. */}
      {Array.from({ length: DEPTH }, (_, i) => DEPTH - i).map((step) => (
        <use
          key={step}
          href="#doom-word"
          transform={`translate(0 ${round(step * DEPTH_STEP)})`}
          fill={step === DEPTH ? '#000' : '#4a0c02'}
          stroke="#000"
          strokeWidth={step === DEPTH ? 1.4 : 0.3}
        />
      ))}
      <use href="#doom-word" fill="none" stroke="#000" strokeWidth="1.4" />

      <g clipPath="url(#doom-clip)">
        <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="url(#doom-rock-tone)" filter="url(#doom-rock)" />
        <path d={sky} fill="url(#doom-circuit)" />
        {/* Bevelled frame: a dark seam, the gradient rim, then a lavender lip on top-facing edges. */}
        <use href="#doom-word" fill="none" stroke="#2a0600" strokeWidth={round(BEVEL * 2 + 0.45)} />
        <use href="#doom-word" fill="none" stroke="url(#doom-frame)" strokeWidth={BEVEL * 2} />
        <use href="#doom-word" fill="#c8bcff" mask="url(#doom-top)" />
      </g>

      <use href="#doom-word" fill="none" stroke="#000" strokeWidth="0.3" />
    </svg>
  );
}
