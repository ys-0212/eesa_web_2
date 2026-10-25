import { developerFirst } from '@/src/content';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { FeatureCarousel } from '@/components/ui/FeatureCarousel';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function DeveloperFirst() {
  const { heading, cards, carouselLabel } = developerFirst;
  return (
    <section className="relative overflow-x-clip z-0 pb-12 md:pb-20 lg:pb-32" aria-labelledby="developer-first">
      <div className="site-container">
        <SectionHeading id="developer-first" main={heading.main} accent={heading.accent} />
        <div className="block lg:hidden">
          <FeatureCarousel label={carouselLabel} count={cards.length}>
            {cards.map((c) => (
              <div key={c.title} className="carousel-item self-start snap-start flex-shrink-0">
                <FeatureCard {...c} className="h-full" />
              </div>
            ))}
          </FeatureCarousel>
        </div>
        <div className="hidden lg:block relative">
          <div className="grid grid-cols-2 auto-rows-max gap-x-[3rem] gap-y-[3rem] relative z-10">
            {cards.map((c) => (
              <FeatureCard key={c.title} {...c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
