import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteThemeStyle } from '@/components/layout/SiteThemeStyle';
import { JsonLd } from '@/components/seo/JsonLd';
import { CinematicHero } from '@/components/sections/CinematicHero';
import { StudioSection } from '@/components/sections/StudioSection';
import { PortfolioSection } from '@/components/sections/PortfolioSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { NfcSection } from '@/components/sections/NfcSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { RevealObserver } from '@/components/motion/RevealObserver';
import { getCmsContent } from '@/lib/cms';
import {
  absoluteUrl,
  SITE_ALTERNATE_NAMES,
  SITE_DESCRIPTION,
  SITE_NAME,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCmsContent();
  const { settings } = cms;
  const brand = settings.logo_text ? settings.logo_text.toUpperCase() : 'UIC';
  const title = `${brand} — ${settings.hero_kicker || 'Unique Identity Craft'} | Brand, Web, ERP & NFC Studio`;
  const description = settings.hero_copy || SITE_DESCRIPTION;

  return {
    title,
    description,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title,
      description,
      url: '/',
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function HomePage() {
  const cms = await getCmsContent();
  const homeUrl = absoluteUrl('/');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': `${homeUrl}#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: homeUrl,
        logo: cms.settings.logo_image_url || absoluteUrl('/icon'),
        description: cms.settings.hero_copy || SITE_DESCRIPTION,
        knowsAbout: [
          'Brand Identity Design',
          'Web Architecture and Development',
          'Custom ERP and Business Systems',
          'Contactless NFC Business Cards',
          'Digital Product Experiences',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'UIC Studio Capabilities',
          itemListElement: cms.services.map((service) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: service.title,
              description: service.description,
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${homeUrl}#website`,
        url: homeUrl,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        publisher: {
          '@id': `${homeUrl}#organization`,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${homeUrl}#portfolio`,
        name: 'UIC Selected Work & Client Systems',
        itemListElement: cms.projects.map((project, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'CreativeWork',
            name: `${project.client} — ${project.title}`,
            description: project.description,
            url: project.externalUrl || `${homeUrl}#work`,
          },
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${homeUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is UIC (Unique Identity Craft)?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${cms.settings.studio_p1} ${cms.settings.studio_p2}`,
            },
          },
          {
            '@type': 'Question',
            name: 'What services does UIC Studio provide?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: cms.services.map((s) => `${s.title}: ${s.description}`).join(' '),
            },
          },
          {
            '@type': 'Question',
            name: 'What is UIC Connect NFC Card Studio?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${cms.settings.nfc_copy} Visit ${absoluteUrl('/nfc')} to customize finishes, layout styles, artwork, and export your card design directly in the browser without signing up.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
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
