/* eslint-disable @next/next/no-img-element */
import { footer } from '@/src/content';
import { InlineSvg } from '@/components/ui/InlineSvg';

export function SiteFooter() {
  return (
    <footer aria-label="Site footer" className="relative z-10 bg-rich-black">
      <section className="relative overflow-x-clip z-[10]">
        <div className="site-container">
          <nav aria-label="footer navigation">
            <div className="flex flex-col md:flex-row md:flex-nowrap gap-4 md:gap-0 lg:gap-[3rem] py-16 md:pb-12">
              {footer.columns.map((col) => (
                <div key={col.heading} className="mb-4 md:mb-0 md:flex-1 lg:flex-1 lg:px-0">
                  <div className="linklist-dark">
                    <h3 className="text-base leading-6 mb-4 font-semibold text-hot-pink xl:pl-0 pl-5">{col.heading}</h3>
                    <ul className="list-none p-0 m-0 grid gap-y-5 mt-4 xl:mt-0">
                      {col.links.map((l) => (
                        <li key={l.label} className="pb-1 pl-6 xl:pl-0">
                          <a
                            href={l.href}
                            className="no-underline font-medium text-sm leading-[18px] uppercase whitespace-nowrap flex items-center gap-x-1.5 w-full min-h-[18px] py-0.5 hover:underline xl:w-max transition-colors duration-200 font-sans text-white hover:text-white"
                          >
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <InlineSvg name="footerWave" className="block text-white" aria-hidden="true" />
            <div className="flex flex-col lg:flex-row items-center justify-between py-8 gap-8 lg:gap-0">
              <div className="w-full lg:w-5/12 flex items-center justify-start mt-[1rem]">
                <div className="flex gap-6 items-center">
                  {footer.legal.map((l) => (
                    <a key={l.label} href={l.href} className="no-underline font-medium text-sm leading-[18px] uppercase hover:underline font-sans text-white">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-7/12 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {footer.marks.map((m) => (
                    <a key={m.href} href={m.href} aria-label={m.ariaLabel} className="text-white block" {...(m.external ? { target: '_blank', rel: 'noopener' } : {})}>
                      <InlineSvg name={m.svg} className="contents" aria-hidden="true" />
                    </a>
                  ))}
                </div>
                <div className="flex gap-6 items-center">
                  {footer.social.map((s) => (
                    <a key={s.href} href={s.href} target="_blank" rel="noopener" aria-label={s.label} className="h-6 w-6 flex items-center justify-center">
                      <img src={s.icon} alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6 brightness-0 invert" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </nav>
          <div className="text-center mb-4">
            <span className="text-sm font-normal leading-tight text-gray-3">{footer.copyright}</span>
          </div>
        </div>
      </section>
    </footer>
  );
}
