'use client';

import { useEffect, useRef, useState } from 'react';
import { hasWebGL, loadRive, type RiveInstance } from '@/lib/animations/rive';
import { prefersReducedMotion } from '@/lib/animations/reducedMotion';
import { media } from '@/src/content';

type Props = {
  src: string;
  stateMachine: string;
  poster: string;
  posterAlt: string;
  width: number;
  height: number;
  viewportThreshold: number;
};

/**
 * Rive canvas with the reference's lifecycle: poster first, runtime loaded lazily, playback only
 * while ≥ threshold visible, and a 500 ms poster→canvas crossfade once the file has loaded.
 * Reduced motion or missing WebGL keeps the static poster.
 */
export function RiveCanvas({ src, stateMachine, poster, posterAlt, width, height, viewportThreshold }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [posterGone, setPosterGone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion() || !hasWebGL()) return;

    let rive: RiveInstance | null = null;
    let visible = false;
    let ready = false;
    let disposed = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!ready || !rive) return;
        if (visible) rive.play();
        else rive.pause();
      },
      { threshold: viewportThreshold },
    );
    io.observe(canvas);

    const start = () =>
      loadRive(media.riveWasm).then(({ Rive }) => {
        if (disposed) return;
        rive = new Rive({
          src,
          canvas,
          stateMachines: stateMachine,
          autoplay: false,
          onLoad: () => {
            if (disposed || !rive) return;
            rive.resizeDrawingSurfaceToCanvas();
            ready = true;
            if (visible) rive.play();
            requestAnimationFrame(() => setLoaded(true));
          },
          onLoadError: () => {
            // Keep the poster visible.
          },
        });
      });

    // Astro's island used client:idle semantics; mirror that so the runtime never blocks first paint.
    let cancelStart: () => void;
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      cancelStart = () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(start, 200);
      cancelStart = () => clearTimeout(id);
    }

    const onResize = () => rive?.resizeDrawingSurfaceToCanvas();
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      io.disconnect();
      window.removeEventListener('resize', onResize);
      cancelStart();
      rive?.cleanup();
    };
  }, [src, stateMachine, viewportThreshold]);

  return (
    <div className="relative w-full xl:w-[1366px] translate-z-0" style={{ aspectRatio: `${width} / ${height}` }}>
      <div className="absolute inset-0">
        {!posterGone ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={loaded ? '' : posterAlt}
            width={width}
            height={height}
            className={`rive-poster ${loaded ? 'rive-poster--hidden' : ''}`}
            onTransitionEnd={() => loaded && setPosterGone(true)}
          />
        ) : null}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          role="img"
          aria-label={posterAlt}
          className="w-full h-full pointer-events-none lg:pointer-events-auto"
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 500ms ease' }}
        />
      </div>
    </div>
  );
}
