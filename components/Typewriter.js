'use client';

import { useEffect, useRef } from 'react';
import { melt } from '../lib/melt';

const DEFAULT_SPEED = 15; // ms per character
const BLOCK_PAUSE = 120; // ms between blocks

function bootLines() {
  const theme = document.documentElement.dataset.theme || 'green';
  return [
    'HERREWYN BIOS v2.6  (C) 1986-2026',
    'CPU: Z80 @ 4.00MHz ............. OK',
    'MEMORY TEST: 640K .............. OK',
    `PHOSPHOR: ${theme.toUpperCase().padEnd(21, '.')} OK`,
    'MOUNTING /home/nick ............ OK',
    'LOADING portfolio.exe',
  ];
}

// Server-rendered children are always complete in the HTML (SEO, screen readers,
// no-JS). On a first visit this blanks their text nodes after hydration and types
// them back in, reserving the final height so nothing below shifts. React never
// re-renders this static content, so the temporary text edits are safe; every
// exit path restores the full text. Armed by the pre-paint script in app/layout.js.
export default function Typewriter({ children }) {
  const textRef = useRef(null);
  const cursorRef = useRef(null);
  const bootRef = useRef(null);
  const screenRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('intro')) return;
    root.dataset.introClaimed = '1';
    root.classList.add('booting');

    const container = textRef.current;
    const cursor = cursorRef.current;
    const boot = bootRef.current;
    const screen = screenRef.current;
    const timers = [];
    let frame;
    let stopMelt;
    let finished = false;

    // Every non-blank text node, with the typing speed of its block.
    const segments = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const block = node.parentElement.closest('[data-type-speed]');
      segments.push({
        node,
        full: node.nodeValue,
        block,
        li: node.parentElement.closest('li'),
        speed: Number(block?.dataset.typeSpeed) || DEFAULT_SPEED,
      });
    }
    if (!segments.length) return;

    container.style.minHeight = `${container.offsetHeight}px`;
    segments.forEach((s) => (s.node.nodeValue = ''));
    container.dataset.twActive = '';
    container.setAttribute('aria-busy', 'true');

    const restore = () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      segments.forEach((s) => (s.node.nodeValue = s.full));
      container.style.minHeight = '';
      delete container.dataset.twActive;
      container.removeAttribute('aria-busy');
      container.querySelectorAll('li[data-typed]').forEach((li) => li.removeAttribute('data-typed'));
      cursor.hidden = true;
    };

    // Melt the boot screen away to reveal the page, the way DOOM changes screens.
    const dropBootScreen = () => {
      if (!root.classList.contains('booting')) return;
      stopMelt = melt(screen);
      root.classList.remove('booting');
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      dropBootScreen();
      restore();
      root.classList.remove('intro');
      try {
        sessionStorage.setItem('intro-seen', '1');
      } catch {}
      window.dispatchEvent(new Event('intro:done'));
    };

    const placeCursor = (node, offset) => {
      const caret = new Range();
      caret.setStart(node, offset);
      caret.collapse(true);
      const rect = caret.getClientRects()[0] ?? caret.getBoundingClientRect();
      const origin = cursor.parentElement.getBoundingClientRect();
      cursor.style.transform = `translate(${rect.left - origin.left}px, ${rect.top - origin.top}px)`;
      cursor.style.height = `${rect.height}px`;
    };

    const type = () => {
      dropBootScreen();
      cursor.hidden = false;
      let seg = 0;
      let offset = 0;
      let budget = 0;
      let last = performance.now();

      const tick = (now) => {
        budget += now - last;
        last = now;
        while (seg < segments.length) {
          const s = segments[seg];
          if (offset === 0) s.li?.setAttribute('data-typed', '');
          const n = Math.min(s.full.length - offset, Math.floor(budget / s.speed));
          if (n <= 0) break;
          offset += n;
          budget -= n * s.speed;
          s.node.nodeValue = s.full.slice(0, offset);
          if (offset >= s.full.length) {
            seg += 1;
            offset = 0;
            if (segments[seg] && segments[seg].block !== s.block) budget -= BLOCK_PAUSE;
          }
        }
        if (seg >= segments.length) return finish();
        // An empty text node has no box; park the cursor after the last typed char.
        if (offset > 0) placeCursor(segments[seg].node, offset);
        else if (seg > 0) placeCursor(segments[seg - 1].node, segments[seg - 1].full.length);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    // Boot screen: print lines on a short schedule, then start typing.
    boot.textContent = '';
    let at = 150;
    for (const line of bootLines()) {
      timers.push(setTimeout(() => (boot.textContent += `${line}\n`), at));
      at += 170;
    }
    timers.push(setTimeout(type, at + 250));

    const skip = (e) => {
      if (e.type === 'keydown') {
        if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
        // Don't let the skip keystroke land in the terminal prompt.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) e.preventDefault();
      }
      finish();
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);

    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      if (!finished) {
        // Unmounted mid-intro (or StrictMode's dev re-run): undo, but leave the
        // `intro` class so a re-mount can start over.
        restore();
        stopMelt?.();
        root.classList.remove('booting');
      }
    };
  }, []);

  return (
    <>
      <div ref={screenRef} className="boot-screen" aria-hidden="true">
        <pre ref={bootRef} className="m-0 font-[inherit] whitespace-pre-wrap" />
        <p className="boot-hint">Press any key to skip</p>
      </div>
      <div className="relative">
        <div ref={textRef} data-typewriter="">
          {children}
        </div>
        <span ref={cursorRef} className="tw-cursor blink" hidden aria-hidden="true" />
      </div>
    </>
  );
}
