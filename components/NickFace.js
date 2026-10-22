'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// DOOM-style "invite Nick to a meeting" face. Each invite thrown at Nick costs
// health; at 0% he types IDDQD: health resets to 100, eyes go gold, and invites
// bounce off. Hovering (or keyboard-focusing) the face makes Nick wink once.
// Sheet: 48px cells; rows = damage tiers 0-4 + god mode (5);
// cols = neutral, look-left, look-right, wince, wink.
// Feedback is game-style: combat text floats up off the face, the face flashes
// red on a hit (gold on god mode) like DOOM's palette flash, and a one-line
// caption shows the latest event and then fades.
// With prefers-reduced-motion, invites land instantly: no throw, shake or flash,
// and the floating text fades in place.

const SHEET = '/doomface/nick-face-sheet.png';
const INVITE = '/doomface/meeting-invite.png';
const CELL = 48;
const PAD = 4; // trim empty margin so the head fills the frame
const VIEW = CELL - PAD * 2;
const GOD_ROW = 5;
const COL = { neutral: 0, left: 1, right: 2, wince: 3, wink: 4 };

const BOB = [0, -1, 0, 1, 1, 1, 1, 0];
const BOB_MS = [4300, 100, 100, 100, 100, 100, 100, 100];
const CHEAT = 'iddqd';
const WINK_MS = 400;
const FLOAT_MAX = 6; // combat text on screen at once
const HURT = 'sepia(1) saturate(6) hue-rotate(-40deg)';
const GOLD = 'sepia(1) saturate(4) brightness(1.2)';

const MEETINGS = [
  ['Quick sync', 30],
  ['Touch base', 30],
  ['Circle back on the circle back', 60],
  ['Pre-meeting for the meeting', 45],
  ['Alignment session', 60],
  ['Could this be an email?', 30],
  ['Status update on status updates', 60],
  ['Brainstorm (cameras on)', 90],
  ['Working session (no agenda)', 120],
  ['Friday 4:45 PM check-in', 15],
  ['Prod defect triage (all hands)', 45],
  ['Change control pre-meeting', 30],
  ['Troubleshooting the printer', 60],
  ['CAB review: bring your rollback plan', 60],
  ['Sev 1 bridge (just listening in)', 90],
  ['Post-mortem for the post-mortem', 60],
  ['Why is the chatbot saying that?', 30],
  ['Hold music selection committee', 45],
  ['IVR prompt wording review, round 7', 60],
  ['Who owns this server?', 30],
  ['Vendor demo (mandatory)', 90],
  ['Budget reforecast reforecast', 60],
  ['Sprint planning planning', 60],
  ['Lunch & learn (lunch not provided)', 60],
  ['Reply-all storm recap', 15],
  ['Q3 goals retro (it is Q4)', 45],
  ['Teams or Zoom? Sync to decide', 15],
  ['Password policy feedback session', 45],
  ['Org chart walkthrough v4', 30],
  ['Mandatory fun', 60],
];

const tierFor = (hp) => (hp >= 80 ? 0 : hp >= 60 ? 1 : hp >= 40 ? 2 : hp >= 20 ? 3 : 4);
// A random meeting index, never the same one twice in a row.
const nextMeeting = (prev) => {
  let i;
  do i = Math.floor(Math.random() * MEETINGS.length);
  while (i === prev);
  return i;
};
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const flash = (el, filter) => {
  if (!reducedMotion()) el?.animate([{ filter }, { filter: 'none' }], { duration: 200, easing: 'steps(2)' });
};

let nextId = 0;

export default function NickFace({ size = 192 }) {
  const canvasRef = useRef(null);
  const cellRef = useRef(null);
  const sheetRef = useRef(null);
  const healthRef = useRef(100);
  const winkTimer = useRef(null);
  const lastMeeting = useRef(-1);
  const [loaded, setLoaded] = useState(false);
  const [health, setHealth] = useState(100);
  const [count, setCount] = useState(0);
  const [god, setGod] = useState(false);
  const [typing, setTyping] = useState(false);
  const [mood, setMood] = useState('neutral'); // neutral | left | right
  const [wincing, setWincing] = useState(false);
  const [winking, setWinking] = useState(false);
  const [bob, setBob] = useState(0);
  // The intro caption stays put; every later one fades out on its own.
  const [caption, setCaption] = useState({ id: -1, text: 'Nick is focused. Calendar is clear.', stay: true });
  const [floats, setFloats] = useState([]); // combat text drifting up off the face
  const [cheat, setCheat] = useState(''); // IDDQD as Nick types it over his face
  const [throws, setThrows] = useState(0); // key that restarts the throw animation

  const row = god ? GOD_ROW : tierFor(health);

  useEffect(() => {
    const img = new window.Image();
    img.src = SHEET;
    img.onload = () => {
      sheetRef.current = img;
      setLoaded(true);
    };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const sheet = sheetRef.current;
    if (!ctx || !sheet) return;
    // A hit beats a wink; god mode only has neutral + wink frames.
    const col = wincing ? COL.wince : winking ? COL.wink : god ? COL.neutral : COL[mood];
    ctx.clearRect(0, 0, VIEW, VIEW);
    ctx.drawImage(sheet, col * CELL, row * CELL, CELL, CELL, -PAD, -PAD + bob, CELL, CELL);
  }, [loaded, row, god, mood, wincing, winking, bob]);

  // Idle bob (timing from the original .aseprite) + random glances.
  useEffect(() => {
    let i = 0;
    let bobTimer;
    let glanceTimer;
    const stepBob = () => {
      setBob(BOB[i]);
      bobTimer = setTimeout(stepBob, BOB_MS[i]);
      i = (i + 1) % BOB.length;
    };
    const glance = () => {
      const r = Math.random();
      setMood(r < 0.5 ? 'neutral' : r < 0.75 ? 'left' : 'right');
      glanceTimer = setTimeout(glance, 900 + Math.random() * 1600);
    };
    stepBob();
    glance();
    return () => {
      clearTimeout(bobTimer);
      clearTimeout(glanceTimer);
    };
  }, []);

  const say = useCallback((text, tone) => setCaption({ id: nextId++, text, tone }), []);

  const float = useCallback((text, kind) => {
    const dx = Math.round((Math.random() - 0.5) * (kind === 'block' ? 90 : 30));
    setFloats((f) => [...f, { id: nextId++, text, kind, dx }].slice(-FLOAT_MAX));
  }, []);

  // IDDQD types out big over the face, then bursts up and scatters.
  const typeCheat = useCallback(() => {
    setTyping(true);
    [...CHEAT].forEach((_, i) =>
      setTimeout(() => setCheat(CHEAT.slice(0, i + 1)), 180 + i * 140)
    );
    setTimeout(() => {
      healthRef.current = 100;
      setHealth(100);
      setGod(true);
      setTyping(false);
      setWincing(false);
      setCheat('');
      float(CHEAT, 'cheat');
      say('GOD MODE ON', 'gold');
      flash(canvasRef.current, GOLD);
    }, 180 + CHEAT.length * 140 + 250);
  }, [float, say]);

  const impact = useCallback(() => {
    if (typing) return;
    lastMeeting.current = nextMeeting(lastMeeting.current);
    const [title, mins] = MEETINGS[lastMeeting.current];
    setCount((c) => c + 1);

    if (god) {
      say(`Declined: "${title}" bounced off`, 'gold');
      float('BLOCKED', 'block');
      return;
    }

    const next = Math.max(0, healthRef.current - (8 + Math.floor(Math.random() * 15)));
    float(`-${healthRef.current - next}`, 'damage');
    healthRef.current = next;
    setHealth(next);
    say(`Nick picked up: "${title}" (${mins} min)`);
    flash(canvasRef.current, HURT);
    setWincing(true);
    setTimeout(() => setWincing(false), 450);
    if (!reducedMotion()) {
      cellRef.current?.animate(
        [{ transform: 'translateX(5%)' }, { transform: 'translateX(-3%)' }, { transform: 'none' }],
        { duration: 300, easing: 'steps(3)' }
      );
    }
    if (next <= 0) typeCheat();
  }, [god, typing, typeCheat, say, float]);

  // One wink per hover/focus; the eyes reopen even if the pointer stays put.
  const wink = () => {
    clearTimeout(winkTimer.current);
    setWinking(true);
    winkTimer.current = setTimeout(() => setWinking(false), WINK_MS);
  };

  const invite = () => {
    if (reducedMotion()) impact();
    else setThrows((t) => t + 1);
  };

  const disableGod = () => {
    healthRef.current = 100;
    setHealth(100);
    setCount(0);
    setGod(false);
    say('GOD MODE OFF');
  };

  return (
    <div data-type-speed="30" className="nick-face grid justify-items-center gap-3 overflow-x-clip text-center">
      <div className="flex items-center gap-4 sm:gap-6">
        <Stat label="HEALTH">
          {health}
          <PercentGlyph />
        </Stat>
        <div
          ref={cellRef}
          tabIndex={0}
          onPointerEnter={wink}
          onFocus={wink}
          className="relative aspect-square"
          style={{ width: `min(${size}px, 40vw)` }}
        >
          <canvas
            ref={canvasRef}
            width={VIEW}
            height={VIEW}
            role="img"
            aria-label={god ? 'Pixel portrait of Nick with glowing gold eyes' : 'Pixel portrait of Nick'}
            className="pixelated block size-full"
          />
          {throws > 0 && (
            <Image
              key={throws}
              src={INVITE}
              alt=""
              width={16}
              height={16}
              unoptimized
              loading="eager"
              onAnimationEnd={impact}
              className="pixelated nick-face-invite"
            />
          )}
          {floats.map((f) => (
            <span
              key={f.id}
              aria-hidden="true"
              className="nick-face-float"
              data-kind={f.kind}
              style={{ '--dx': `${f.dx}px` }}
              onAnimationEnd={() => setFloats((fs) => fs.filter((x) => x.id !== f.id))}
            >
              {f.text}
            </span>
          ))}
          {cheat && (
            <span aria-hidden="true" className="nick-face-float" data-kind="cheat" data-typing="">
              {cheat}
            </span>
          )}
        </div>
        <Stat label="MEETINGS">{count}</Stat>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={invite}>
          Invite Nick to a meeting
        </button>
        {god && (
          <button type="button" onClick={disableGod}>
            Turn off god mode
          </button>
        )}
      </div>

      {/* Two lines reserved on phones so a long meeting title doesn't shift the page. */}
      <p className="my-0 min-h-[2.7em] sm:min-h-[1.35em]" aria-live="polite">
        <span
          key={caption.id}
          className={caption.stay ? undefined : 'nick-face-caption'}
          data-tone={caption.tone}
        >
          {caption.text}
        </span>
      </p>
    </div>
  );
}

function Stat({ label, children }) {
  return (
    <div className="grid justify-items-center">
      <span className="text-[2.5rem] leading-none tabular-nums">{children}</span>
      <span className="text-base tracking-[0.12em]">{label}</span>
    </div>
  );
}

// Pixel-drawn % so it can't be misread as a letter in pixel fonts.
function PercentGlyph() {
  return (
    <svg
      viewBox="0 0 5 7"
      role="img"
      aria-label="percent"
      className="ml-[0.1em] h-[0.72em] fill-current [shape-rendering:crispEdges]"
    >
      <path d="M0 0h2v2H0zM4 1h1v1H4zM3 2h1v1H3zM2 3h1v1H2zM1 4h1v1H1zM0 5h1v1H0zM3 5h2v2H3z" />
    </svg>
  );
}
