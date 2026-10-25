'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type KeyboardEvent } from 'react';
import type { TabbedSectionContent } from '@/src/content';
import { SectionHeading } from '@/components/ui/SectionHeading';

/**
 * Click-to-switch feature list (no autoplay, as in the reference). Desktop: list left, image right
 * with a 300 ms crossfade. Mobile: accordion with each image expanding under its item.
 * Every switch replays a 1 s "float" on the image column.
 */
export function TabbedFeature({ content }: { content: TabbedSectionContent }) {
  const [active, setActive] = useState(0);
  const floatRef = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const { id, heading, subtitleHtml, subheading, tabs } = content;

  const select = (i: number) => {
    setActive(i);
    // Restart the float animation (remove, force reflow, re-add) like the reference.
    const el = floatRef.current;
    if (el) {
      el.classList.remove('float-active');
      void el.offsetWidth;
      el.classList.add('float-active');
    }
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const next = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : -1;
    if (next < 0) return;
    e.preventDefault();
    buttons.current[next]?.focus();
    select(next);
  };

  return (
    <section className="relative overflow-x-clip z-0 pb-12 md:pb-20 lg:pb-32" aria-labelledby={`${id}-heading`}>
      <div className="site-container">
        <div className="w-full">
          <SectionHeading id={`${id}-heading`} main={heading.main} accent={heading.accent} />
          <div className="overflow-visible mx-auto mb-[4rem] md:mb-16">
            <div className="rich-links text-[1.6875rem] font-medium text-white leading-[1.25] mb-[3rem] md:max-w-[70%] md:mb-[5.1875rem]">
              <p className="m-0 inline" dangerouslySetInnerHTML={{ __html: subtitleHtml }} />
            </div>
            <div className="flex items-start justify-between flex-col md:flex-row flex-nowrap md:gap-[4rem]">
              <div className="w-full md:w-[58.3333%] px-0 pb-12 order-1 md:order-2 self-start">
                <div ref={floatRef} className="relative overflow-visible">
                  {tabs.map((t, i) => (
                    <img
                      key={t.image}
                      src={t.image}
                      alt={t.alt}
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={400}
                      aria-hidden={i !== active}
                      className={`tab-desktop-img ${i === active ? 'active' : ''} hidden md:block shrink-0 object-contain object-top transition-opacity duration-300 ease-in-out rounded-[1.125rem] top-0 left-0 w-full h-auto`}
                    />
                  ))}
                </div>
              </div>
              <div className="w-full md:w-[41.6667%] px-0 order-2 md:order-1">
                {subheading ? (
                  <div className="mb-[2.5rem] hidden md:block">
                    <h3 className="text-2xl leading-[1.25] font-medium mb-4">{subheading}</h3>
                  </div>
                ) : null}
                <div className="md:mr-[1rem]">
                  <div className="flex flex-col self-start gap-[2.5rem] h-full">
                    {tabs.map((t, i) => (
                      <div key={t.text} className={`tab-item relative overflow-hidden ${i === active ? 'active' : ''}`}>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-inactive-rail transition-opacity duration-300" />
                        <div className="tab-gradient absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FD44B0] to-[#C2EF4E] opacity-0 transition-opacity duration-300" />
                        <button
                          ref={(el) => {
                            buttons.current[i] = el;
                          }}
                          type="button"
                          aria-pressed={i === active}
                          onClick={() => select(i)}
                          onKeyDown={(e) => onKey(e, i)}
                          className="w-full bg-transparent border-none pl-4 text-left cursor-pointer transition-all duration-300 focus:outline-none focus-visible:outline-2 focus-visible:outline-lt-orange"
                        >
                          <span className="tab-label text-[1.275rem] lg:text-[1.5rem] leading-[1.25] text-white transition-opacity duration-300 opacity-40">{t.text}</span>
                        </button>
                        <div className={`tab-mobile-img-wrapper ${i === active ? 'active' : ''} block md:hidden`} aria-hidden={i !== active}>
                          <img src={t.image} alt={t.alt} loading="lazy" decoding="async" width={600} height={400} className="shrink-0 object-contain object-top rounded-[1.125rem] w-full h-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
