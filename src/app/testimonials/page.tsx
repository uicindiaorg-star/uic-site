import type { Metadata } from 'next';
import { TestimonialMarquee } from '@/components/testimonials/TestimonialMarquee';
import { SiteThemeStyle } from '@/components/layout/SiteThemeStyle';
import { JsonLd } from '@/components/seo/JsonLd';
import { getCmsContent } from '@/lib/cms';
import { absoluteUrl, SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const testimonialsTitle = 'Client Testimonials — UIC (Unique Identity Craft)';
const testimonialsDescription =
  'Verified client feedback and production testimonials for UIC Studio across brand strategy, web architecture, ERP software, and connected NFC experiences.';

export const metadata: Metadata = {
  title: testimonialsTitle,
  description: testimonialsDescription,
  keywords: [
    'UIC testimonials',
    'UIC Studio reviews',
    'Unique Identity Craft clients',
    'brand agency reviews',
    'web design studio testimonials',
  ],
  alternates: {
    canonical: '/testimonials',
  },
  openGraph: {
    title: testimonialsTitle,
    description: testimonialsDescription,
    url: '/testimonials',
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: testimonialsTitle,
    description: testimonialsDescription,
  },
};

export default async function TestimonialsPage() {
  const cms = await getCmsContent();
  const pageUrl = absoluteUrl('/testimonials');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: testimonialsTitle,
    url: pageUrl,
    description: testimonialsDescription,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: cms.testimonials.map((t, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: t.name,
            jobTitle: t.role,
          },
          reviewBody: t.quote,
          itemReviewed: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: absoluteUrl('/'),
          },
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteThemeStyle settings={cms.settings} />
      <TestimonialMarquee items={cms.testimonials} />
    </>
  );
}
