import type { MetadataRoute } from 'next';
import { absoluteUrl, getSiteOrigin } from '@/lib/seo';

const PUBLIC_PATHS = ['/', '/nfc', '/testimonials', '/llms.txt', '/llms-full.txt'];
const PRIVATE_PATHS = ['/admin', '/admin/', '/login', '/api/admin/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: PUBLIC_PATHS,
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'GPTBot',
          'PerplexityBot',
          'Perplexity-User',
          'ClaudeBot',
          'Claude-Web',
          'anthropic-ai',
          'Google-Extended',
          'Applebot-Extended',
          'DuckAssistBot',
        ],
        allow: PUBLIC_PATHS,
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: getSiteOrigin(),
  };
}

