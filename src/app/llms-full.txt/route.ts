import { getCmsContent } from '@/lib/cms';
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cms = await getCmsContent();
  const { settings, services, projects, testimonials, nfcStyles } = cms;

  const lines: string[] = [
    `# ${SITE_NAME} — Complete Reference for AI Search & Browsing`,
    '',
    `Canonical URL: ${absoluteUrl('/')}`,
    `Summary Endpoint: ${absoluteUrl('/llms.txt')}`,
    `Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    '',
    '## About UIC (Unique Identity Craft)',
    `${settings.studio_p1} ${settings.studio_p2}`,
    '',
    `Hero Headline: ${settings.hero_headline} ${settings.hero_highlight}`,
    `Studio Focus: ${settings.hero_copy || SITE_DESCRIPTION}`,
    '',
    '## Services Catalog',
    ...services.flatMap((s) => [
      `### ${s.number_label}. ${s.title}`,
      `${s.description}`,
      `Capabilities: ${s.tags}`,
      '',
    ]),
    '## Portfolio Case Studies & Studio Concepts',
    ...projects.flatMap((p) => {
      const items = [
        `### ${p.client} — ${p.title} (${p.year})`,
        `Kind: ${p.kind} | Category: ${p.category} | Badge: ${p.badge}`,
        `${p.description}`,
      ];
      if (p.challenge) items.push(`Challenge: ${p.challenge}`);
      if (p.solution) items.push(`Solution: ${p.solution}`);
      if (p.deliverables && p.deliverables.length > 0) {
        items.push(`Deliverables: ${p.deliverables.join(', ')}`);
      }
      if (p.metrics && p.metrics.length > 0) {
        items.push(
          `Metrics: ${p.metrics.map((m) => `${m.label}: ${m.value}`).join(' | ')}`
        );
      }
      if (p.externalUrl) {
        items.push(`Live Link: ${p.externalUrl}`);
      }
      items.push('');
      return items;
    }),
    '## UIC Connect — Smart NFC Card Studio (/nfc)',
    `Studio URL: ${absoluteUrl('/nfc')}`,
    `Overview: ${settings.nfc_copy}`,
    'Available Card Styles:',
    ...nfcStyles.map(
      (st) =>
        `- **${st.name}** (Layout: ${st.layout_variant}, Font: ${st.font_variant}): ${st.description}`
    ),
    'Available Color Finishes:',
    ...(settings.nfc_finishes_json ?? []).map(
      (f) => `- ${f.name} (${f.background}, ink ${f.ink})`
    ),
    '',
    '## Client Testimonials (/testimonials)',
    `URL: ${absoluteUrl('/testimonials')}`,
    ...testimonials.map(
      (t) => `- "${t.quote}" — ${t.name}, ${t.role} at ${t.company} (${t.tag})`
    ),
    '',
    '## Frequently Asked Questions (FAQ)',
    'Q: What is UIC?',
    'A: UIC stands for Unique Identity Craft, a creative and technology studio specializing in brand identity systems, custom websites and web applications, ERP and business automation software, and contactless NFC digital business cards (UIC Connect).',
    '',
    'Q: What can I do on /nfc?',
    'A: Visitors can design their own UIC Connect NFC card live in the browser without signing up — choosing colors, custom artwork, typography/layout styles, and exporting high-resolution 4x PNG artwork.',
    '',
    'Q: How can clients contact UIC to start a project?',
    `A: Visit ${absoluteUrl('/#contact')} to submit your name, email, service interest, and project message directly to the studio.`,
  ];

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

