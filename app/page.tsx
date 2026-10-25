import { media, tabbedSections } from '@/src/content';
import { BackgroundLayer } from '@/components/ui/BackgroundLayer';
import { MarketingToggle } from '@/components/ui/MarketingToggle';
import { SkipLink } from '@/components/ui/SkipLink';
import { SiteHeader } from '@/components/sections/SiteHeader';
import { Hero } from '@/components/sections/Hero';
import { LogoRiver } from '@/components/sections/LogoRiver';
import { DeveloperFirst } from '@/components/sections/DeveloperFirst';
import { TabbedFeature } from '@/components/sections/TabbedFeature';
import { Testimonials } from '@/components/sections/Testimonials';
import { GettingStarted } from '@/components/sections/GettingStarted';
import { Security } from '@/components/sections/Security';
import { Newsletter } from '@/components/sections/Newsletter';
import { FinalCta } from '@/components/sections/FinalCta';
import { SiteFooter } from '@/components/sections/SiteFooter';

// Background groupings and fades measured from the reference (analysis/measurements/backgrounds-1440.json).
const starfield = `url(${media.welcomeBg}) 50% 0 / 65rem auto no-repeat`;
const middle = `linear-gradient(#1F1633 0%, #30145F 52.4%, #30145F 75%, #30145F 100%), url(${media.middleTexture}) 0% 0% / 200px 200px repeat`;
const glow = 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(173, 108, 170, 0.15) 0%, #1F1633 65%)';

export default function Page() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <MarketingToggle />
      <main id="main-content" className="transition-colors duration-200 bg-rich-black">
        <BackgroundLayer background={starfield} fadeBottom gradientHeight="30%">
          <Hero />
          <LogoRiver />
        </BackgroundLayer>
        <BackgroundLayer background={middle} blendMode="darken" fadeTop fadeBottom gradientHeight="30%">
          <DeveloperFirst />
        </BackgroundLayer>
        <BackgroundLayer background={starfield} fadeTop fadeBottom gradientHeight="25%">
          {tabbedSections.map((s) => (
            <TabbedFeature key={s.id} content={s} />
          ))}
        </BackgroundLayer>
        <BackgroundLayer fadeTop gradientHeight="30%">
          <Testimonials />
        </BackgroundLayer>
        <BackgroundLayer background={glow}>
          <GettingStarted />
        </BackgroundLayer>
        <Security />
        <Newsletter />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
