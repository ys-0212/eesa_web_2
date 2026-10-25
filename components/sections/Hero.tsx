import { hero } from '@/src/content';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { RiveCanvas } from '@/components/ui/RiveCanvas';
import { SwingWord } from '@/components/ui/SwingWord';

export function Hero() {
  const { promo, headline, subtitle, ctas, animation } = hero;
  return (
    <section className="relative overflow-x-clip z-0 pb-4 lg:pb-16" aria-labelledby="hero-heading">
      <div className="relative">
        <div className="site-container pt-8 md:pt-16 pb-8 md:pb-16">
          <div className="flex flex-col gap-4 items-center">
            <ButtonLink variant="snackbar" href={promo.href} external={promo.external} style={{ marginBottom: '2rem' }}>
              {promo.label}
            </ButtonLink>
            <h1 id="hero-heading" className="mb-6 text-white text-center text-hero-h1-mobile md:text-hero-h1 font-bold font-dammit-sans text-balance">
              {headline.before} <SwingWord color="#fd44b0">{headline.swing}</SwingWord> {headline.after}
            </h1>
            <p className="text-white text-center text-xl md:text-3xl font-normal md:max-w-[60%] md:mb-[2.8125rem]">{subtitle}</p>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <ButtonLink variant="primary-dark" href={ctas.primary.href}>
                {ctas.primary.label}
              </ButtonLink>
              <ButtonLink variant="secondary-dark" href={ctas.secondary.href}>
                {ctas.secondary.label}
              </ButtonLink>
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-center flex-row -mx-8">
            <RiveCanvas
              src={animation.src}
              stateMachine={animation.stateMachine}
              poster={animation.poster}
              posterAlt={animation.posterAlt}
              width={animation.width}
              height={animation.height}
              viewportThreshold={animation.viewportThreshold}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
