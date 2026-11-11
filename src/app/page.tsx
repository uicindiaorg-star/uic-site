import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteThemeStyle } from '@/components/layout/SiteThemeStyle';
import { CinematicHero } from '@/components/sections/CinematicHero';
import { StudioSection } from '@/components/sections/StudioSection';
import { PortfolioSection } from '@/components/sections/PortfolioSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { NfcSection } from '@/components/sections/NfcSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { RevealObserver } from '@/components/motion/RevealObserver';
import { getCmsContent } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cms = await getCmsContent();

  return (
    <>
      <SiteThemeStyle settings={cms.settings} />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteHeader settings={cms.settings} />
      <main id="main">
        <CinematicHero settings={cms.settings} />
        <StudioSection settings={cms.settings} />
        <PortfolioSection items={cms.projects} settings={cms.settings} />
        <ServicesSection services={cms.services} />
        <NfcSection settings={cms.settings} />
        <ProcessSection settings={cms.settings} />
        <ContactSection settings={cms.settings} testimonials={cms.testimonials} />
      </main>
      <SiteFooter settings={cms.settings} />
      <RevealObserver />
    </>
  );
}
