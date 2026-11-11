import type { Project, ProjectKind, ProjectMetric } from '@/data/projects';

export interface SiteSettings {
  id: string;
  hero_kicker: string;
  hero_headline: string;
  hero_highlight: string;
  hero_copy: string;
  hero_image_url: string;
  studio_kicker: string;
  studio_headline_prefix: string;
  studio_headline_em: string;
  studio_p1: string;
  studio_p2: string;
  nfc_eyebrow: string;
  nfc_headline_prefix: string;
  nfc_headline_em: string;
  nfc_copy: string;
  contact_kicker: string;
  logo_image_url: string;
  logo_text: string;
  logo_mark: string;
  brand_wordmark: string;
  nav_link_1_label: string;
  nav_link_1_href: string;
  nav_link_2_label: string;
  nav_link_2_href: string;
  nav_link_3_label: string;
  nav_link_3_href: string;
  nav_cta_label: string;
  nav_cta_href: string;
  footer_tagline: string;
  footer_copyright: string;
  footer_top_label: string;
  portfolio_headline_prefix: string;
  portfolio_headline_em: string;
  portfolio_sub_1: string;
  portfolio_sub_2: string;
  process_kicker: string;
  process_headline_prefix: string;
  process_headline_em: string;
  testimonials_kicker: string;
  color_accent: string;
  color_paper: string;
  color_ink: string;
  color_muted: string;
  color_dark_bg: string;
  color_dark_text: string;
  color_header_bg: string;
  color_header_text: string;
  color_footer_bg: string;
  color_footer_text: string;
  color_work_bg: string;
  color_nfc_bg: string;
  color_contact_bg: string;
  nfc_page_bg: string;
  nfc_preview_bg: string;
  nfc_panel_bg: string;
  nfc_page_ink: string;
  nfc_page_tagline: string;
  nfc_page_title_prefix: string;
  nfc_page_title_em: string;
  nfc_page_subtitle: string;
  nfc_page_footer_tagline: string;
  nfc_finishes_json: NfcFinishPreset[];
  updated_at?: string;
}

export type NfcLayoutVariant = 'minimal' | 'orbit' | 'statement' | 'framed' | 'split' | 'grid';
export type NfcFontVariant = 'sans' | 'serif' | 'mono';

export interface NfcFinishPreset {
  name: string;
  background: string;
  ink: string;
}

export interface CmsNfcStyle {
  id: number | string;
  name: string;
  description: string;
  layout_variant: NfcLayoutVariant;
  font_variant: NfcFontVariant;
  default_bg: string;
  default_ink: string;
  corner_radius: number;
  card_footer_text: string;
  card_badge_text: string;
  back_headline: string;
  back_footer_text: string;
  artwork_url: string;
  show_signal: boolean;
  sort_order: number;
  is_published: boolean;
}

export interface CmsProject extends Project {
  sort_order?: number;
  is_published?: boolean;
}

export interface CmsService {
  id: number | string;
  number_label: string;
  title: string;
  description: string;
  tags: string;
  is_default_open: boolean;
  sort_order: number;
  is_published: boolean;
}

export interface CmsTestimonial {
  id: number | string;
  name: string;
  role: string;
  company: string;
  quote: string;
  tag: string;
  initials: string;
  avatar_url?: string | null;
  row_group: 1 | 2;
  sort_order: number;
  is_published: boolean;
}

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  service: string;
  message: string;
  status: 'new' | 'reviewed' | 'archived';
  created_at: string;
}

export const DEFAULT_NFC_FINISHES: NfcFinishPreset[] = [
  { name: 'Midnight', background: '#222b28', ink: '#e3ff97' },
  { name: 'Lime', background: '#2CFF05', ink: '#0A0C0E' },
  { name: 'Bone', background: '#ede9df', ink: '#203027' },
  { name: 'Obsidian', background: '#121614', ink: '#ede7dc' },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'default',
  hero_kicker: 'Unique Identity Craft',
  hero_headline: 'Forging digital presence that',
  hero_highlight: 'refuses to be overlooked.',
  hero_copy:
    'Independent creative studio building memorable identities, high-conversion digital experiences, and contactless NFC systems for ambitious companies.',
  hero_image_url: '/images/hero-noir-figure.jpg',
  studio_kicker: 'STRATEGY MEETS SOUL.',
  studio_headline_prefix: 'Good businesses deserve',
  studio_headline_em: 'an identity of their own.',
  studio_p1:
    'Not another logo. Not another website. A considered presence that connects who you are with where you want to go.',
  studio_p2:
    'We’re UIC. A creative and technology studio bringing brands, digital experiences and business systems together — with intention, craft and a little audacity.',
  nfc_eyebrow: 'UIC CONNECT',
  nfc_headline_prefix: 'Your next connection is',
  nfc_headline_em: 'one tap away.',
  nfc_copy:
    'A beautifully crafted NFC card. A personal digital profile. A seamless way to share your world — without an app.',
  contact_kicker: 'START WITH A CONVERSATION.',
  logo_image_url: '',
  logo_text: 'uic',
  logo_mark: '®',
  brand_wordmark: 'UNIQUE IDENTITY\nCRAFT',
  nav_link_1_label: 'Work',
  nav_link_1_href: '#work',
  nav_link_2_label: 'Expertise',
  nav_link_2_href: '#services',
  nav_link_3_label: 'Beyond digital',
  nav_link_3_href: '#nfc',
  nav_cta_label: 'Let’s talk',
  nav_cta_href: '#contact',
  footer_tagline: 'Unique Identity Craft.\nDistinctive by intention.',
  footer_copyright: 'UIC',
  footer_top_label: 'BACK TO TOP ↑',
  portfolio_headline_prefix: 'Proof of',
  portfolio_headline_em: 'possibility.',
  portfolio_sub_1: 'Real client systems and studio directions.',
  portfolio_sub_2: 'Every project begins with a distinct point of view.',
  process_kicker: 'COLLABORATIVE BY DESIGN.',
  process_headline_prefix: 'From the first conversation\nto',
  process_headline_em: 'what comes next.',
  testimonials_kicker: 'PROVEN IN PRODUCTION · CLIENT FEEDBACK',
  color_accent: '#2CFF05',
  color_paper: '#f4f3ee',
  color_ink: '#202323',
  color_muted: '#6b6d67',
  color_dark_bg: '#0A0C0E',
  color_dark_text: '#EDE7DC',
  color_header_bg: '#EDE7DC',
  color_header_text: '#0A0C0E',
  color_footer_bg: '#17201C',
  color_footer_text: '#DCE5DC',
  color_work_bg: '#E9EAE3',
  color_nfc_bg: '#E5E9DF',
  color_contact_bg: '#2CFF05',
  nfc_page_bg: '#f4f3ee',
  nfc_preview_bg: '#e3e8da',
  nfc_panel_bg: '#fffefa',
  nfc_page_ink: '#242c27',
  nfc_page_tagline: 'CONNECT / A BETTER HELLO',
  nfc_page_title_prefix: 'Small card.',
  nfc_page_title_em: 'Big first impression.',
  nfc_page_subtitle: 'Make it yours. Give it a spin. See what a single tap can do.',
  nfc_page_footer_tagline: 'UNIQUE IDENTITY. EVERY CONNECTION.',
  nfc_finishes_json: DEFAULT_NFC_FINISHES,
};

export const DEFAULT_NFC_STYLES: CmsNfcStyle[] = [
  {
    id: 'nfc-minimal',
    name: 'Minimal',
    description: 'Clean architectural face with balanced hierarchy.',
    layout_variant: 'minimal',
    font_variant: 'sans',
    default_bg: '#222b28',
    default_ink: '#e3ff97',
    corner_radius: 16,
    card_footer_text: 'A CONNECTION WORTH MAKING.',
    card_badge_text: 'uic / connect',
    back_headline: 'A little tap.\nA whole new connection.',
    back_footer_text: 'HOLD NEAR AN NFC-ENABLED PHONE.',
    artwork_url: '',
    show_signal: true,
    sort_order: 1,
    is_published: true,
  },
  {
    id: 'nfc-orbit',
    name: 'Orbit',
    description: 'Signature concentric radar geometry on front face.',
    layout_variant: 'orbit',
    font_variant: 'sans',
    default_bg: '#222b28',
    default_ink: '#e3ff97',
    corner_radius: 16,
    card_footer_text: 'A CONNECTION WORTH MAKING.',
    card_badge_text: 'uic / connect',
    back_headline: 'A little tap.\nA whole new connection.',
    back_footer_text: 'HOLD NEAR AN NFC-ENABLED PHONE.',
    artwork_url: '',
    show_signal: true,
    sort_order: 2,
    is_published: true,
  },
  {
    id: 'nfc-statement',
    name: 'Statement',
    description: 'Editorial serif typography with oversized monogram mark.',
    layout_variant: 'statement',
    font_variant: 'serif',
    default_bg: '#121614',
    default_ink: '#ede7dc',
    corner_radius: 16,
    card_footer_text: 'A CONNECTION WORTH MAKING.',
    card_badge_text: 'uic / connect',
    back_headline: 'A little tap.\nA whole new connection.',
    back_footer_text: 'HOLD NEAR AN NFC-ENABLED PHONE.',
    artwork_url: '',
    show_signal: true,
    sort_order: 3,
    is_published: true,
  },
];

export const DEFAULT_SERVICES: CmsService[] = [
  {
    id: 's1',
    number_label: '01',
    title: 'Brand & identity',
    description:
      'A clear story. A distinctive visual language. An identity that feels unmistakably yours.',
    tags: 'STRATEGY · NAMING · VISUAL IDENTITY · BRAND GUIDELINES',
    is_default_open: true,
    sort_order: 1,
    is_published: true,
  },
  {
    id: 's2',
    number_label: '02',
    title: 'Websites & experiences',
    description:
      'Fast, intuitive digital spaces that make your brand tangible and turn interest into action.',
    tags: 'UX/UI · DEVELOPMENT · E-COMMERCE · WEB APPLICATIONS',
    is_default_open: false,
    sort_order: 2,
    is_published: true,
  },
  {
    id: 's3',
    number_label: '03',
    title: 'ERP & business systems',
    description:
      'Bring your operations together with useful tools, connected data and workflows built for your team.',
    tags: 'CUSTOM ERP · DASHBOARDS · INTEGRATIONS · AUTOMATION',
    is_default_open: false,
    sort_order: 3,
    is_published: true,
  },
  {
    id: 's4',
    number_label: '04',
    title: 'NFC & connected products',
    description:
      'Bridge the physical and digital with a simple tap — from smart business cards to product experiences.',
    tags: 'NFC CARDS · DIGITAL PROFILES · SMART TOUCHPOINTS',
    is_default_open: false,
    sort_order: 4,
    is_published: true,
  },
];

export const DEFAULT_TESTIMONIALS: CmsTestimonial[] = [
  {
    id: 't1',
    name: 'Elena Rostova',
    role: 'Design Director',
    company: 'Pixpil Design (Shanghai)',
    quote:
      'UIC engineered an ultra-refined editorial architecture that elevated how brand leaders discover our BX framework.',
    tag: 'Web Architecture',
    initials: 'ER',
    row_group: 1,
    sort_order: 1,
    is_published: true,
  },
  {
    id: 't2',
    name: 'Arjun Menon',
    role: 'Founder & CEO',
    company: 'Dafy Mobility',
    quote:
      'The 3-tap booking flow eliminated customer churn during peak hours. Our driver dispatch scaled 10x in 6 months.',
    tag: 'Mobility Platform',
    initials: 'AM',
    row_group: 1,
    sort_order: 2,
    is_published: true,
  },
  {
    id: 't3',
    name: 'Kavya Pillai',
    role: 'Brand Partner',
    company: 'Luv Cutlet QSR',
    quote:
      'From 3-wheeler street food heritage to institutional international funding. The digital presence captured our identity.',
    tag: 'QSR Brand Experience',
    initials: 'KP',
    row_group: 1,
    sort_order: 3,
    is_published: true,
  },
  {
    id: 't4',
    name: 'Marcus Vance',
    role: 'Principal Architect',
    company: 'Forma Space Studio',
    quote:
      'Rare to find a studio that treats digital negative space with the same sculptural reverence as physical limestone.',
    tag: 'Architectural Identity',
    initials: 'MV',
    row_group: 1,
    sort_order: 4,
    is_published: true,
  },
  {
    id: 't5',
    name: 'Sarah Chen',
    role: 'Head of Product',
    company: 'Connect Ecosystem',
    quote:
      'The contactless handshake protocol and instant mobile profile fallback made physical introductions effortless.',
    tag: 'NFC Connected Lab',
    initials: 'SC',
    row_group: 1,
    sort_order: 5,
    is_published: true,
  },
  {
    id: 't6',
    name: 'Vikramaditya Nair',
    role: 'VP Operations',
    company: 'Flow Intelligence',
    quote:
      'Unified our telemetry and multi-warehouse operations into a calm, focused executive workspace.',
    tag: 'Systems Intelligence',
    initials: 'VN',
    row_group: 1,
    sort_order: 6,
    is_published: true,
  },
  {
    id: 't7',
    name: 'Sophie Martin',
    role: 'Creative Technologist',
    company: 'Studio Aether (Paris)',
    quote:
      'The motion pacing is dialed to perfection. Every micro-interaction feels deliberate, weighted, and remarkably fluid.',
    tag: 'Motion & Pacing',
    initials: 'SM',
    row_group: 2,
    sort_order: 1,
    is_published: true,
  },
  {
    id: 't8',
    name: 'Devon Archer',
    role: 'Brand Strategy Lead',
    company: 'Koco Treat',
    quote:
      'The visual storytelling bridged our street-to-store retail expansion effortlessly. Customers instantly trusted the brand.',
    tag: 'Retail Expansion',
    initials: 'DA',
    row_group: 2,
    sort_order: 2,
    is_published: true,
  },
  {
    id: 't9',
    name: 'Tanya Deshmukh',
    role: 'Design Operations',
    company: 'Archetype Studio',
    quote:
      'UIC understands that bold editorial craft and commercial conversion aren’t enemies. They made both sing.',
    tag: 'Digital Strategy',
    initials: 'TD',
    row_group: 2,
    sort_order: 3,
    is_published: true,
  },
  {
    id: 't10',
    name: 'Kenji Takahashi',
    role: 'Managing Director',
    company: 'Vertex Tokyo',
    quote:
      'Our European and Asian enterprise partners remarked that the identity felt distinctly ahead of the curve.',
    tag: 'Global Presence',
    initials: 'KT',
    row_group: 2,
    sort_order: 4,
    is_published: true,
  },
  {
    id: 't11',
    name: 'Rohan Varma',
    role: 'Hardware Engineer',
    company: 'Touchpoint Labs',
    quote:
      'The tactile card and instant web handshake completely replaced conventional business cards for our executive team.',
    tag: 'Contactless Hardware',
    initials: 'RV',
    row_group: 2,
    sort_order: 5,
    is_published: true,
  },
  {
    id: 't12',
    name: 'Maya Lindqvist',
    role: 'VP Brand Experience',
    company: 'Nordic Modern',
    quote:
      'Subtle, confident, and utterly free of generic agency fluff. Working with UIC felt like a masterclass in modern digital craft.',
    tag: 'Brand Experience',
    initials: 'ML',
    row_group: 2,
    sort_order: 6,
    is_published: true,
  },
];

export type DbProjectRow = {
  id: string;
  kind: string;
  client: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string;
  description: string;
  cover_image: string | null;
  challenge: string | null;
  solution: string | null;
  deliverables: string[] | null;
  metrics: ProjectMetric[] | null;
  external_url: string | null;
  external_label: string | null;
  badge: string;
  year: string;
  accent: string;
  mockup_type: string;
  sort_order: number;
  is_published: boolean;
};

export function mapDbProjectToProject(row: DbProjectRow): CmsProject {
  return {
    id: row.id,
    kind: (row.kind === 'concept' ? 'concept' : 'client') as ProjectKind,
    client: row.client,
    title: row.title,
    subtitle: row.subtitle ?? '',
    category: row.category ?? 'DIGITAL / WEB ARCHITECTURE',
    tags: row.tags ?? '',
    description: row.description,
    coverImage: row.cover_image ?? undefined,
    challenge: row.challenge ?? undefined,
    solution: row.solution ?? undefined,
    deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
    metrics: Array.isArray(row.metrics) ? row.metrics : [],
    externalUrl: row.external_url ?? undefined,
    externalLabel: row.external_label ?? undefined,
    badge: row.badge ?? 'LIVE CLIENT WEBSITE',
    year: row.year ?? '2025',
    accent: row.accent ?? '#2CFF05',
    mockupType: (row.mockup_type || 'pixpil') as Project['mockupType'],
    sort_order: row.sort_order ?? 0,
    is_published: row.is_published ?? true,
  };
}

