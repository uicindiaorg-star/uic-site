import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { projects as defaultProjects } from '@/data/projects';
import {
  DEFAULT_NFC_FINISHES,
  DEFAULT_NFC_STYLES,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TESTIMONIALS,
  mapDbProjectToProject,
  type CmsNfcStyle,
  type CmsProject,
  type CmsService,
  type CmsTestimonial,
  type DbProjectRow,
  type NfcFinishPreset,
  type SiteSettings,
} from './cms-types';

export interface CmsContent {
  settings: SiteSettings;
  projects: CmsProject[];
  services: CmsService[];
  testimonials: CmsTestimonial[];
  nfcStyles: CmsNfcStyle[];
}

export function normalizeNfcFinishes(raw: unknown): NfcFinishPreset[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_NFC_FINISHES;
  const cleaned = raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const obj = item as Partial<NfcFinishPreset>;
      const name = String(obj.name ?? '').trim();
      const background = /^#[0-9a-f]{6}$/i.test(String(obj.background ?? '').trim())
        ? String(obj.background).trim()
        : '';
      const ink = /^#[0-9a-f]{6}$/i.test(String(obj.ink ?? '').trim())
        ? String(obj.ink).trim()
        : '#ffffff';
      if (!name || !background) return null;
      return { name, background, ink };
    })
    .filter((x): x is NfcFinishPreset => x !== null);
  return cleaned.length > 0 ? cleaned : DEFAULT_NFC_FINISHES;
}

export async function getCmsContent(): Promise<CmsContent> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return {
      settings: DEFAULT_SITE_SETTINGS,
      projects: defaultProjects,
      services: DEFAULT_SERVICES,
      testimonials: DEFAULT_TESTIMONIALS,
      nfcStyles: DEFAULT_NFC_STYLES,
    };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const [settingsRes, projectsRes, servicesRes, testimonialsRes, nfcStylesRes] =
      await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
        supabase
          .from('cms_projects')
          .select('*')
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }),
        supabase
          .from('cms_services')
          .select('*')
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }),
        supabase
          .from('cms_testimonials')
          .select('*')
          .eq('is_published', true)
          .order('row_group', { ascending: true })
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }),
        supabase
          .from('cms_nfc_styles')
          .select('*')
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }),
      ]);

    const mergedRaw = settingsRes.data
      ? { ...DEFAULT_SITE_SETTINGS, ...(settingsRes.data as Partial<SiteSettings>) }
      : DEFAULT_SITE_SETTINGS;

    const settings: SiteSettings = {
      ...mergedRaw,
      nfc_finishes_json: normalizeNfcFinishes(mergedRaw.nfc_finishes_json),
    };

    const projects: CmsProject[] =
      projectsRes.data && projectsRes.data.length > 0
        ? (projectsRes.data as DbProjectRow[]).map(mapDbProjectToProject)
        : defaultProjects;

    const services: CmsService[] =
      servicesRes.data && servicesRes.data.length > 0
        ? (servicesRes.data as CmsService[])
        : DEFAULT_SERVICES;

    const testimonials: CmsTestimonial[] =
      testimonialsRes.data && testimonialsRes.data.length > 0
        ? (testimonialsRes.data as CmsTestimonial[])
        : DEFAULT_TESTIMONIALS;

    const nfcStyles: CmsNfcStyle[] =
      !nfcStylesRes.error && nfcStylesRes.data && nfcStylesRes.data.length > 0
        ? (nfcStylesRes.data as CmsNfcStyle[])
        : DEFAULT_NFC_STYLES;

    return { settings, projects, services, testimonials, nfcStyles };
  } catch {
    return {
      settings: DEFAULT_SITE_SETTINGS,
      projects: defaultProjects,
      services: DEFAULT_SERVICES,
      testimonials: DEFAULT_TESTIMONIALS,
      nfcStyles: DEFAULT_NFC_STYLES,
    };
  }
}

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, user: null, isAdmin: false, schemaReady: true };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const schemaReady = !(adminError && adminError.code === 'PGRST205');

  return {
    supabase,
    user,
    isAdmin: Boolean(adminRow),
    schemaReady,
  };
}

