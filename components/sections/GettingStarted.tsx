'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { gettingStarted } from '@/src/content';
import { platforms } from '@/src/snippets';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { prefersReducedMotion } from '@/lib/animations/reducedMotion';

const SWAP_MS = 1000;

/**
 * Platform picker. Changing the select shrinks the current snippet for 1 s, then expands the next
 * one for 1 s (reference behaviour); the first render shows the default without animating.
 */
export function GettingStarted() {
  const g = gettingStarted;
  const [value, setValue] = useState(g.defaultPlatform);
  const [active, setActive] = useState<string | null>(g.defaultPlatform);
  const [shrinking, setShrinking] = useState<string | null>(null);
  const [initial, setInitial] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const change = (next: string) => {
    setValue(next);
    setInitial(false);
    if (timer.current) {
      // Finalize an interrupted transition immediately.
      clearTimeout(timer.current);
      timer.current = null;
      setShrinking(null);
    }
    const current = shrinking ? null : active;
    if (!current || current === next) {
      setActive(next);
      return;
    }
    if (prefersReducedMotion()) {
      setActive(next);
      return;
    }
    setShrinking(current);
    setActive(null);
    timer.current = setTimeout(() => {
      timer.current = null;
      setShrinking(null);
      setActive(next);
    }, SWAP_MS);
  };

  return (
    <section className="relative overflow-x-clip z-0 pb-12 md:pb-20 lg:pb-32" aria-labelledby="getting-started-heading">
      <div className="site-container">
        <div>
          <img src={g.imageLeft.src} alt={g.imageLeft.mobileAlt} width={248} height={218} className="md:hidden mx-auto mb-[2.9375rem] pointer-events-none w-[15.5rem]" />
          <SectionHeading id="getting-started-heading" main={g.heading.main} accent={g.heading.accent} className="!text-wrap" />
          <div className="font-medium text-[1.375rem] md:text-[1.6875rem] leading-[125%] text-white w-full md:w-7/12 md:mt-[0.3125rem]">{g.subtitle}</div>
          <div className="flex flex-col items-center mb-[3.25rem] md:mb-[4.5rem] mt-12 md:mt-16 md:min-h-[21rem] overflow-visible relative">
            <div className="select-wrapper mb-[1.79375rem] md:mb-[4.5625rem] relative inline-block md:max-w-[21.8125rem] w-full">
              <label htmlFor="installation-dropdown" className="sr-only">
                {g.selectLabel}
              </label>
              <select
                id="installation-dropdown"
                value={value}
                onChange={(e) => change(e.target.value)}
                className="appearance-none bg-alt-dk-blurple font-medium leading-normal px-4 py-2 rounded-lg text-[0.825rem] md:text-base text-white w-full cursor-pointer focus:outline-2 focus:outline-blue-600 focus:outline-offset-2"
              >
                {platforms.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            {platforms.map((p) => {
              const isActive = active === p.value;
              const isShrinking = shrinking === p.value;
              const cls = ['installation-snippet gap-4 max-w-[59.3125rem] w-full', isActive && 'active', isActive && initial && 'initial-load', isShrinking && 'shrinking'].filter(Boolean).join(' ');
              return (
                <div key={p.value} id={`snippet-${p.value}`} className={cls} aria-hidden={!isActive} data-docs-url={p.docsUrl}>
                  {isActive || isShrinking
                    ? p.blocks.map((b, i) =>
                        b.type === 'code' ? (
                          <CodeBlock key={i} lang={b.lang} lines={b.lines} tabbable={isActive} />
                        ) : (
                          <p key={i} dangerouslySetInnerHTML={{ __html: b.html }} />
                        ),
                      )
                    : null}
                </div>
              );
            })}
            <img src={g.imageLeft.src} alt={g.imageLeft.alt} width={248} height={218} className="hidden md:block md:absolute pointer-events-none top-[10rem] w-[15.5rem] z-10 md:-left-[14rem] xl:-left-[10rem]" />
            <img src={g.imageRight.src} alt={g.imageRight.alt} width={231} height={199} className="relative md:absolute mt-[2.9375rem] md:mt-0 pointer-events-none top-0 md:top-[10rem] w-[14.4375rem] z-10 md:-right-[13.5rem] xl:-right-[9.5rem]" />
          </div>
        </div>
      </div>
    </section>
  );
}
