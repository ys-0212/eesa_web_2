'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { InlineSvg } from './InlineSvg';

const GAP = 16;

/**
 * Horizontal scroll-snap carousel used below 992px (reference FeatureCarousel): prev/next buttons
 * step by one item width (disabled at either end) and a polite live region announces the first
 * visible item. The reference script toggles edge-gradient classes but ships no gradient elements,
 * so none are rendered here either.
 */
export function FeatureCarousel({ label, children, count }: { label: string; children: ReactNode; count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ atStart: true, atEnd: false, first: 0 });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const box = el.getBoundingClientRect();
    const items = [...el.querySelectorAll<HTMLElement>('.carousel-item')];
    let first = -1;
    items.forEach((it, i) => {
      const r = it.getBoundingClientRect();
      const visible = r.right > box.left && r.left < box.right;
      it.setAttribute('aria-hidden', String(!visible));
      it.querySelectorAll('a').forEach((a) => (visible ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
      if (visible && first === -1) first = i;
    });
    const itemW = (items[0]?.getBoundingClientRect().width ?? 0) + GAP;
    // Snap alignment leaves scrollLeft at the track padding (24px) on the first item, so use the index.
    setState({ atStart: Math.round(el.scrollLeft / Math.max(itemW, 1)) <= 0, atEnd: el.scrollLeft + itemW >= max, first: Math.max(first, 0) });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(update, 100);
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      clearTimeout(t);
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    const item = el?.querySelector<HTMLElement>('.carousel-item');
    if (!el || !item) return;
    const w = item.getBoundingClientRect().width + GAP;
    const index = Math.round(el.scrollLeft / w) + dir;
    el.scrollTo({ left: Math.max(0, index * w), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div className="relative" role="region" aria-label={label} aria-roledescription="carousel">
      <div className="relative">
        <div ref={ref} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-4 pl-6 pr-6">
          {children}
        </div>
        <div className="sr-only" aria-live="polite" aria-atomic="true">{`Showing item ${state.first + 1} of ${count}`}</div>
      </div>
      <div className="flex gap-4 justify-center mt-6">
        {(['Previous', 'Next'] as const).map((name) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            disabled={name === 'Previous' ? state.atStart : state.atEnd}
            onClick={() => step(name === 'Previous' ? -1 : 1)}
            className="w-12 h-12 flex items-center justify-center bg-[#2d2340] border-2 border-[#433458] rounded-2xl text-center disabled:opacity-25 disabled:cursor-not-allowed transition-all ease-in-out duration-300 hover:bg-[#362d4a] hover:border-[#4d3f5f] cursor-pointer"
          >
            <InlineSvg name={name === 'Previous' ? 'carouselPrev' : 'carouselNext'} className="flex" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
