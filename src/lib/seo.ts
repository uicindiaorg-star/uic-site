export const SITE_NAME = 'UIC — Unique Identity Craft';
export const SITE_SHORT_NAME = 'UIC';
export const SITE_TAGLINE = 'Forging digital presence that refuses to be overlooked.';
export const SITE_DESCRIPTION =
  'UIC (Unique Identity Craft) is an independent creative and technology studio crafting brand identities, custom websites, ERP & business systems, and UIC Connect contactless NFC card experiences.';

export const SITE_ALTERNATE_NAMES = [
  'UIC',
  'UIC Studio',
  'Unique Identity Craft',
  'UIC Connect',
];

export const SITE_KEYWORDS = [
  'UIC',
  'UIC Studio',
  'Unique Identity Craft',
  'UIC Connect',
  'UIC NFC',
  'UIC agency',
  'brand identity studio',
  'custom web development',
  'web architecture',
  'custom ERP software',
  'business automation systems',
  'smart NFC business cards',
  'contactless digital profile',
];

export function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    'https://uic.studio';

  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(normalized.replace(/\/+$/, ''));
  } catch {
    return new URL('https://uic.studio');
  }
}

export function getSiteOrigin(): string {
  return getSiteUrl().origin;
}

export function absoluteUrl(path: string): string {
  const origin = getSiteOrigin();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${cleanPath}`;
}

