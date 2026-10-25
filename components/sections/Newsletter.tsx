'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, type FormEvent } from 'react';
import { newsletter } from '@/src/content';
import { SectionHeading } from '@/components/ui/SectionHeading';

/**
 * Visual equivalent of the reference's dark Marketo form. Native validation still runs, but submit
 * is intercepted: nothing is sent anywhere (no Marketo, no reCAPTCHA).
 */
export function Newsletter() {
  const n = newsletter;
  const [done, setDone] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.checkValidity()) setDone(true);
  };

  return (
    <section id="newsletter" className="relative overflow-x-clip z-0" aria-labelledby="newsletter-heading">
      <div className="site-container">
        <SectionHeading id="newsletter-heading" main={n.heading.main} accent={n.heading.accent} />
      </div>
      <div className="site-container">
        <div className="relative mb-[10rem] lg:flex lg:items-start lg:justify-between">
          <div className="flex flex-wrap items-start justify-start flex-row w-full lg:max-w-[41rem]">
            <div className="px-0 relative w-full">
              <div className="newsletter-form p-6">
                <form onSubmit={onSubmit} aria-describedby="newsletter-legal">
                  <div className="grid gap-4">
                    <div>
                      <label htmlFor="newsletter-email" className="field-label">
                        {n.emailLabel}
                      </label>
                      <input id="newsletter-email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <div>
                      <label className="checkbox-label">
                        <input type="checkbox" name="consent" required value="yes" />
                        <span>{n.consentLabel}</span>
                      </label>
                    </div>
                    <div id="newsletter-legal" className="form-text" dangerouslySetInnerHTML={{ __html: n.legalHtml }} />
                    <div className="flex justify-start items-center gap-4">
                      <button type="submit" className="btn-new submit">
                        <span className="label">{n.submitLabel}</span>
                      </button>
                      <span role="status" className="text-sm text-white">
                        {done ? n.localSubmitMessage : ''}
                      </span>
                    </div>
                  </div>
                </form>
              </div>
              <img src={n.image} alt="" aria-hidden="true" loading="lazy" decoding="async" width={300} height={160} className="absolute -bottom-[11rem] -right-[6rem] h-auto lg:hidden pointer-events-none" />
            </div>
          </div>
          <img
            src={n.image}
            alt={n.imageAlt}
            loading="lazy"
            decoding="async"
            width={600}
            height={320}
            className="hidden lg:block lg:absolute lg:right-[5rem] max-w-[18.375rem] lg:max-w-[50.18038rem] h-auto lg:translate-x-[calc(50%-1rem)] lg:-bottom-[12rem] xl:-bottom-[15rem] pointer-events-none xl:right-[15rem]"
          />
        </div>
      </div>
    </section>
  );
}
