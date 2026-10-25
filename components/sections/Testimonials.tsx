/* eslint-disable @next/next/no-img-element */
import { media, testimonials } from '@/src/content';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Testimonials() {
  const { heading, items, quoteMarkAlt } = testimonials;
  return (
    <section className="relative overflow-x-clip z-0 pb-12 md:pb-20 lg:pb-32" aria-labelledby="testimonials-heading">
      <div className="site-container">
        <SectionHeading id="testimonials-heading" main={heading.main} accent={heading.accent} />
        <div className="flex flex-wrap items-start justify-center flex-row lg:-mr-8">
          {items.map((t) => (
            <figure key={t.name} className="w-full xl:w-1/3 m-0">
              <div className="flex flex-col gap-5 items-start relative w-full py-6 xl:pr-8 rounded-lg">
                <blockquote className="flex flex-col gap-2 items-start relative w-full m-0">
                  <div className="w-[1.5rem] h-auto mb-2">
                    <img src={media.quoteMark} alt={quoteMarkAlt} className="w-full h-full object-contain" width={23} height={16} />
                  </div>
                  <p className="italic leading-tight text-xl text-white w-full m-0">{t.quote}</p>
                </blockquote>
                <figcaption className="flex gap-4 items-center relative w-full">
                  <div className="bg-white flex items-center justify-center rounded-full p-1 relative">
                    <div className="w-10 h-10">
                      <img src={t.logo} alt={t.logoAlt} loading="lazy" decoding="async" width={40} height={40} className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-1 text-white">
                    <div className="font-medium text-base">
                      <p className="leading-none mb-0">{t.name}</p>
                    </div>
                    <div className="font-normal text-sm opacity-90">
                      <p className="leading-6">{t.role}</p>
                    </div>
                  </div>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
