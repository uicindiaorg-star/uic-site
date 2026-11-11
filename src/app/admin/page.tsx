import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { normalizeNfcFinishes, requireAdminSession } from '@/lib/cms';
import {
  DEFAULT_NFC_STYLES,
  DEFAULT_SITE_SETTINGS,
  mapDbProjectToProject,
  type CmsNfcStyle,
  type CmsService,
  type CmsTestimonial,
  type ContactInquiry,
  type DbProjectRow,
  type SiteSettings,
} from '@/lib/cms-types';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminSetupCard } from '@/components/admin/AdminSetupCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard — UIC Studio CMS',
  description: 'Manage client contact inquiries, website content, projects, services, and media.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const { supabase, user, isAdmin, schemaReady } = await requireAdminSession();

  if (!user) {
    redirect('/login');
  }

  if (!schemaReady || !isAdmin) {
    return (
      <AdminSetupCard
        userId={user.id}
        email={user.email ?? 'admin@uic.studio'}
        schemaReady={schemaReady}
      />
    );
  }

  const [inquiriesRes, settingsRes, projectsRes, servicesRes, testimonialsRes, nfcStylesRes] =
    await Promise.all([
      supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
      supabase
        .from('cms_projects')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true }),
      supabase
        .from('cms_services')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true }),
      supabase
        .from('cms_testimonials')
        .select('*')
        .order('row_group', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true }),
      supabase
        .from('cms_nfc_styles')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true }),
    ]);

  const initialInquiries = (inquiriesRes.data ?? []) as ContactInquiry[];
  const mergedSettings: SiteSettings = settingsRes.data
    ? { ...DEFAULT_SITE_SETTINGS, ...(settingsRes.data as Partial<SiteSettings>) }
    : DEFAULT_SITE_SETTINGS;
  const initialSettings: SiteSettings = {
    ...mergedSettings,
    nfc_finishes_json: normalizeNfcFinishes(mergedSettings.nfc_finishes_json),
  };
  const initialProjects = ((projectsRes.data ?? []) as DbProjectRow[]).map(
    mapDbProjectToProject
  );
  const initialServices = (servicesRes.data ?? []) as CmsService[];
  const initialTestimonials = (testimonialsRes.data ?? []) as CmsTestimonial[];
  const initialNfcStyles =
    !nfcStylesRes.error && Array.isArray(nfcStylesRes.data) && nfcStylesRes.data.length > 0
      ? (nfcStylesRes.data as CmsNfcStyle[])
      : DEFAULT_NFC_STYLES;

  return (
    <AdminDashboard
      adminEmail={user.email ?? 'admin@uic.studio'}
      initialInquiries={initialInquiries}
      initialSettings={initialSettings}
      initialProjects={initialProjects}
      initialServices={initialServices}
      initialTestimonials={initialTestimonials}
      initialNfcStyles={initialNfcStyles}
    />
  );
}

