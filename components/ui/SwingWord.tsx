'use client';

import { useRef, useState } from 'react';

const COOLDOWN_MS = 1500;

/**
 * The hero's tilted word: swings down on load (`swingDown`), straightens on hover (`pushUp`) with a
 * 1.5 s cooldown, and swings back when the pointer leaves — same as the reference's span.animated.
 */
export function SwingWord({ children, color }: { children: string; color: string }) {
  const [pushed, setPushed] = useState(false);
  const ready = useRef(true);

  return (
    <span
      className={`swing-word ${pushed ? 'push-up' : ''}`}
      style={{ color }}
      onMouseEnter={() => {
        if (!ready.current) return;
        ready.current = false;
        setPushed(true);
        setTimeout(() => (ready.current = true), COOLDOWN_MS);
      }}
      onMouseLeave={() => setPushed(false)}
    >
      {children}
    </span>
  );
}
