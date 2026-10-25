'use client';

import { useEffect, useRef, useState } from 'react';
import { security } from '@/src/content';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { InlineSvg } from '@/components/ui/InlineSvg';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Compliance badges scroll horizontally (with drag + edge fades) below 1024px, like the reference. */
export function Security() {
  const scroller = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => setFade({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 10 });
    const mq = window.matchMedia('(max-width: 1023px)');
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    const down = (e: MouseEvent) => {
      if (!mq.matches) return;
      dragging = true;
      startX = e.pageX;
      startLeft = el.scrollLeft;
      Object.assign(el.style, { cursor: 'grabbing', userSelect: 'none', scrollBehavior: 'auto', scrollSnapType: 'none' });
    };
    const move = (e: MouseEvent) => {
      if (dragging) el.scrollLeft = startLeft - (e.pageX - startX);
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      Object.assign(el.style, { cursor: '', userSelect: '', scrollBehavior: '', scrollSnapType: '' });
    };
    const raf = requestAnimationFrame(update);
    el.addEventListener('scroll', update, { passive: true });
    el.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', update);
      el.removeEventListener('mousedown', down);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section className="relative overflow-x-clip z-0 pb-12 md:pb-20 lg:pb-32" aria-labelledby="security-heading">
      <div className="site-container">
        <SectionHeading id="security-heading" main={security.heading.main} accent={security.heading.accent} />
        <div className="flex flex-wrap items-start justify-start flex-row -mx-8 gap-9">
          <div className="w-full lg:w-[58.3333%] px-8">
            <div>{security.body}</div>
          </div>
          <div className="w-full px-8">
            <div className={`badge-scroll-wrapper ${fade.left ? 'show-fade-left' : ''} ${fade.right ? 'show-fade-right' : ''}`}>
              <div
                ref={scroller}
                className="flex items-center justify-start gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-6 px-6 scroll-pl-6 scroll-pr-6 lg:overflow-x-visible lg:mx-auto lg:px-0 cursor-grab lg:cursor-auto"
              >
                {security.badges.map((b) => (
                  <div key={b.label} className="flex items-center max-h-[6.25rem] w-auto flex-shrink-0 snap-start">
                    <InlineSvg as="div" name={b.svg} role="img" aria-label={b.label} className="badge max-h-[6.25rem] w-auto flex" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full px-8 flex flex-wrap justify-start gap-4">
            <ButtonLink variant="default" href={security.ctas.privacy.href}>
              {security.ctas.privacy.label}
            </ButtonLink>
            <ButtonLink variant="secondary-dark" href={security.ctas.contact.href}>
              {security.ctas.contact.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
