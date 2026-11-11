import type { Metadata } from 'next';
import { CardStudio } from '@/components/nfc/CardStudio';
import { SiteThemeStyle } from '@/components/layout/SiteThemeStyle';
import { getCmsContent } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'UIC Connect — Your card. Your character.',
  description:
    'Create your own NFC card concept. Explore colors, customize your identity, and preview the tap-to-connect experience. No account needed.',
};

export default async function NfcPage() {
  const cms = await getCmsContent();
  return (
    <>
      <SiteThemeStyle settings={cms.settings} />
      <CardStudio settings={cms.settings} cardStyles={cms.nfcStyles} />
    </>
  );
}
