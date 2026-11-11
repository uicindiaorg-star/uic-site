import { getCmsContent } from '@/lib/cms';
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cms = await getCmsContent();
  const { settings, services, projects, nfcStyles } = cms;

  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    `> ${settings.hero_headline} ${settings.hero_highlight} ${settings.hero_copy || SITE_DESCRIPTION}`,
    '',
    '## Studio Identity & Aliases',
    '- Primary Brand: UIC (Unique Identity Craft)',
    '- Also Known As: UIC Studio, Unique Identity Craft, UIC Connect',
    `- Tagline: ${settings.hero_kicker}`,
    `- Homepage: ${absoluteUrl('/')}`,
    `- NFC Card Customizer: ${absoluteUrl('/nfc')}`,
    `- Client Testimonials: ${absoluteUrl('/testimonials')}`,
    `- Full AI Knowledge Base: ${absoluteUrl('/llms-full.txt')}`,
    '',
    '## Core Pages',
    `- [Home — ${SITE_NAME}](${absoluteUrl('/')}): Main studio landing page covering brand identity, web systems, selected work, process, and project contact form.`,
    `- [UIC Connect — Interactive NFC Card Studio](${absoluteUrl('/nfc')}): Customizer for smart NFC business cards with ${nfcStyles.length} card styles (${nfcStyles.map((s) => s.name).join(', ')}).`,
    `- [Client Testimonials](${absoluteUrl('/testimonials')}): Proven client feedback across brand identity, web architecture, mobility, and QSR platforms.`,
    '',
    '## Services',
    ...services.map(
      (s) => `- **${s.title}** (${s.number_label}): ${s.description} [Tags: ${s.tags}]`
    ),
    '',
    '## Featured Portfolio Work',
    ...projects.slice(0, 8).map(
      (p) =>
        `- **${p.client} — ${p.title}** (${p.category}, ${p.year}): ${p.subtitle || p.description}`
    ),
    '',
    '## Contact & Inquiries',
    `- Project inquiries can be submitted directly via the contact section on ${absoluteUrl('/#contact')} (POST endpoint: ${absoluteUrl('/api/contact')}).`,
  ];

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

