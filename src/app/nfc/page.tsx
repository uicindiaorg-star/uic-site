import type { Metadata } from 'next';
import { CardStudio } from '@/components/nfc/CardStudio';
import { SiteThemeStyle } from '@/components/layout/SiteThemeStyle';
import { JsonLd } from '@/components/seo/JsonLd';
import { getCmsContent } from '@/lib/cms';
import { absoluteUrl, SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const nfcTitle = 'UIC Connect NFC Card Studio — Custom Smart Business Cards';
const nfcDescription =
  'Design your own UIC Connect NFC business card live in the browser. Choose custom colors, artwork, card styles, and preview the tap-to-connect digital profile experience.';

export const metadata: Metadata = {
  title: nfcTitle,
  description: nfcDescription,
  keywords: [
    'UIC Connect',
    'UIC NFC card',
    'smart NFC business card',
    'custom NFC card studio',
    'digital business card',
    'tap to connect',
  ],
  alternates: {
    canonical: '/nfc',
  },
  openGraph: {
    title: nfcTitle,
    description: nfcDescription,
    url: '/nfc',
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: nfcTitle,
    description: nfcDescription,
  },
};

export default async function NfcPage() {
  const cms = await getCmsContent();
  const nfcUrl = absoluteUrl('/nfc');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'UIC Connect NFC Card Studio',
        url: nfcUrl,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        description: nfcDescription,
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: absoluteUrl('/'),
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'Product',
        name: 'UIC Connect Smart NFC Card',
        brand: {
          '@type': 'Brand',
          name: 'UIC',
        },
        description: `Custom contactless NFC business card available in multiple styles including ${cms.nfcStyles
          .map((s) => s.name)
          .join(', ')}.`,
        url: nfcUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteThemeStyle settings={cms.settings} />
      <CardStudio settings={cms.settings} cardStyles={cms.nfcStyles} />
    </>
  );
}
