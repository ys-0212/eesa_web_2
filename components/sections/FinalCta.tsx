import { finalCta } from '@/src/content';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function FinalCta() {
  return (
    <section className="relative overflow-x-clip z-0 pt-12 md:pt-20 lg:pt-32 pb-12 md:pb-20 lg:pb-32 text-white overflow-hidden" aria-labelledby="final-cta-heading">
      <div className="site-container">
        <div className="flex flex-wrap items-start justify-center flex-row -mx-8">
          <div className="w-full lg:w-2/3 px-8">
            <SectionHeading id="final-cta-heading" main={finalCta.heading} className="text-center" />
            <div className="text-center text-[1.6875rem] leading-[1.25] mb-[2.5rem]">{finalCta.body}</div>
            <div className="flex flex-wrap items-center justify-center flex-row -mx-8 gap-6">
              <ButtonLink variant="primary-dark" href={finalCta.primary.href}>
                {finalCta.primary.label}
              </ButtonLink>
              <ButtonLink variant="secondary-dark" href={finalCta.secondary.href}>
                {finalCta.secondary.label}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
