'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, type CSSProperties } from 'react';
import { logoRiver } from '@/src/content';
import { customerLogoSvgs } from '@/src/svgs';
import { InlineSvg } from '@/components/ui/InlineSvg';
import { startTractorBeam } from '@/lib/animations/tractorBeam';
import { prefersReducedMotion } from '@/lib/animations/reducedMotion';

const logos = logoRiver.logos.map((name) => customerLogoSvgs.find((l) => l.name === name)!).filter(Boolean);

/** Infinite customer-logo river under a UFO whose beam lifts logos as they pass. */
export function LogoRiver() {
  const riverRef = useRef<HTMLDivElement>(null);
  const ufoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let stop: (() => void) | undefined;
    // The reference starts the beam 1.5 s after DOM ready.
    const t = setTimeout(() => {
      const river = riverRef.current;
      const ufo = ufoRef.current;
      if (!river || !ufo) return;
      stop = startTractorBeam(river, ufo, [...river.querySelectorAll<HTMLElement>('.logo-item')]);
    }, 1500);
    return () => {
      clearTimeout(t);
      stop?.();
    };
  }, []);

  const row = (copy: 'a' | 'b') =>
    logos.map((l, i) => (
      <div key={`${copy}-${l.name}`} className="logo-item" data-uid={`0-${i}`} aria-hidden={copy === 'b' ? true : undefined}>
        <span className="logo-content">
          <InlineSvg markup={l.svg} className="logo-svg" style={{ '--logo-max-height': l.maxHeight } as CSSProperties} />
        </span>
      </div>
    ));

  return (
    <section className="relative overflow-x-clip z-0 pt-12 md:pt-20 lg:pt-32 pb-12 md:pb-20 lg:pb-32" aria-label={logoRiver.srLabel}>
      <div className="site-container">
        <div className="logo-grid-wrapper" style={{ '--scroll-speed': `${logoRiver.scrollSeconds}s` } as CSSProperties}>
          <div className="ufo-container" ref={ufoRef}>
            <img src={logoRiver.ufoImage} alt="" aria-hidden="true" className="ufo" width={240} height={307} />
          </div>
          <p className="sr-only">{logos.map((l) => l.name).join(', ')}</p>
          <div className="logo-river-container" ref={riverRef} aria-hidden="true">
            <div className="logo-row-wrapper">
              <div className="logo-row" role="presentation">
                {row('a')}
                {row('b')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
