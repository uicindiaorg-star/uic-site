import type { Metadata } from 'next';
import { TestimonialMarquee } from '@/components/testimonials/TestimonialMarquee';
import { SiteThemeStyle } from '@/components/layout/SiteThemeStyle';
import { getCmsContent } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Testimonials — UIC Studio',
  description:
    'Client feedback and production testimonials across brand strategy, web architecture, and connected experiences.',
};

export default async function TestimonialsPage() {
  const cms = await getCmsContent();
  return (
    <>
      <SiteThemeStyle settings={cms.settings} />
      <TestimonialMarquee items={cms.testimonials} />
    </>
  );
}
