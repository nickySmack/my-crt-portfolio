// DOOM's screen wipe (f_wipe.c): the old screen slides down in thin columns,
// each starting after a short random delay that wanders from its neighbour's.
// Copies `source` into columns laid over the page (hiding the original is up to
// the caller) and removes them once all have fallen. Returns a stop function.

const TICK = 1000 / 35; // DOOM's game tic
const LINES = 200; // the original screen height, in rows

export function melt(source, { columns = 160 } = {}) {
  const { width, height } = source.getBoundingClientRect();
  const columnWidth = Math.ceil(width / columns);
  const count = Math.ceil(width / columnWidth);

  const overlay = document.createElement('div');
  overlay.className = 'melt';
  overlay.setAttribute('aria-hidden', 'true');
  const cols = [];
  for (let i = 0; i < count; i++) {
    const col = document.createElement('div');
    col.className = 'melt-col';
    col.style.left = `${i * columnWidth}px`;
    col.style.width = `${columnWidth}px`;
    const copy = source.cloneNode(true);
    copy.removeAttribute('id');
    copy.style.left = `${-i * columnWidth}px`;
    copy.style.width = `${width}px`;
    copy.style.height = `${height}px`;
    col.append(copy);
    overlay.append(col);
    cols.push(col);
  }
  document.body.append(overlay);

  // Negative = tics left to wait; then the row the column has fallen to.
  const y = [-Math.floor(Math.random() * 16)];
  for (let i = 1; i < count; i++) {
    y[i] = Math.min(0, Math.max(-15, y[i - 1] + Math.floor(Math.random() * 3) - 1));
  }

  let frame;
  let last = performance.now();
  let pending = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    overlay.remove();
  };

  const step = (now) => {
    pending += now - last;
    last = now;
    for (; pending >= TICK; pending -= TICK) {
      for (let i = 0; i < count; i++) {
        if (y[i] < 0) y[i] += 1;
        else if (y[i] < LINES) y[i] = Math.min(LINES, y[i] + (y[i] < 16 ? y[i] + 1 : 8));
      }
    }
    cols.forEach((col, i) => {
      col.style.transform = `translateY(${(Math.max(0, y[i]) / LINES) * height}px)`;
    });
    if (y.every((row) => row >= LINES)) return stop();
    frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);

  return stop;
}
