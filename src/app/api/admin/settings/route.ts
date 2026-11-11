import { revalidatePath } from 'next/cache';
import { normalizeNfcFinishes, requireAdminSession } from '@/lib/cms';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/cms-types';

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function sanitizeColor(value: unknown, fallback: string): string {
  const s = typeof value === 'string' ? value.trim() : '';
  return HEX_COLOR_RE.test(s) ? s : fallback;
}

function cleanText(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

export async function PUT(request: Request) {
  const { supabase, user, isAdmin } = await requireAdminSession();
  if (!user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!isAdmin) {
    return Response.json({ error: 'Admin access denied.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Partial<SiteSettings> | null;
  if (!body) {
    return Response.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const d = DEFAULT_SITE_SETTINGS;
  const updateRow: SiteSettings = {
    id: 'default',
    hero_kicker: cleanText(body.hero_kicker, d.hero_kicker),
    hero_headline: cleanText(body.hero_headline, d.hero_headline),
    hero_highlight: cleanText(body.hero_highlight, d.hero_highlight),
    hero_copy: cleanText(body.hero_copy, d.hero_copy),
    hero_image_url: cleanText(body.hero_image_url, d.hero_image_url) || d.hero_image_url,
    studio_kicker: cleanText(body.studio_kicker, d.studio_kicker),
    studio_headline_prefix: cleanText(body.studio_headline_prefix, d.studio_headline_prefix),
    studio_headline_em: cleanText(body.studio_headline_em, d.studio_headline_em),
    studio_p1: cleanText(body.studio_p1, d.studio_p1),
    studio_p2: cleanText(body.studio_p2, d.studio_p2),
    nfc_eyebrow: cleanText(body.nfc_eyebrow, d.nfc_eyebrow),
    nfc_headline_prefix: cleanText(body.nfc_headline_prefix, d.nfc_headline_prefix),
    nfc_headline_em: cleanText(body.nfc_headline_em, d.nfc_headline_em),
    nfc_copy: cleanText(body.nfc_copy, d.nfc_copy),
    contact_kicker: cleanText(body.contact_kicker, d.contact_kicker),
    logo_image_url: cleanText(body.logo_image_url, ''),
    logo_text: cleanText(body.logo_text, d.logo_text) || d.logo_text,
    logo_mark: cleanText(body.logo_mark, d.logo_mark),
    brand_wordmark: cleanText(body.brand_wordmark, d.brand_wordmark),
    nav_link_1_label: cleanText(body.nav_link_1_label, d.nav_link_1_label),
    nav_link_1_href: cleanText(body.nav_link_1_href, d.nav_link_1_href),
    nav_link_2_label: cleanText(body.nav_link_2_label, d.nav_link_2_label),
    nav_link_2_href: cleanText(body.nav_link_2_href, d.nav_link_2_href),
    nav_link_3_label: cleanText(body.nav_link_3_label, d.nav_link_3_label),
    nav_link_3_href: cleanText(body.nav_link_3_href, d.nav_link_3_href),
    nav_cta_label: cleanText(body.nav_cta_label, d.nav_cta_label),
    nav_cta_href: cleanText(body.nav_cta_href, d.nav_cta_href),
    footer_tagline: cleanText(body.footer_tagline, d.footer_tagline),
    footer_copyright: cleanText(body.footer_copyright, d.footer_copyright),
    footer_top_label: cleanText(body.footer_top_label, d.footer_top_label),
    portfolio_headline_prefix: cleanText(
      body.portfolio_headline_prefix,
      d.portfolio_headline_prefix
    ),
    portfolio_headline_em: cleanText(body.portfolio_headline_em, d.portfolio_headline_em),
    portfolio_sub_1: cleanText(body.portfolio_sub_1, d.portfolio_sub_1),
    portfolio_sub_2: cleanText(body.portfolio_sub_2, d.portfolio_sub_2),
    process_kicker: cleanText(body.process_kicker, d.process_kicker),
    process_headline_prefix: cleanText(body.process_headline_prefix, d.process_headline_prefix),
    process_headline_em: cleanText(body.process_headline_em, d.process_headline_em),
    testimonials_kicker: cleanText(body.testimonials_kicker, d.testimonials_kicker),
    color_accent: sanitizeColor(body.color_accent, d.color_accent),
    color_paper: sanitizeColor(body.color_paper, d.color_paper),
    color_ink: sanitizeColor(body.color_ink, d.color_ink),
    color_muted: sanitizeColor(body.color_muted, d.color_muted),
    color_dark_bg: sanitizeColor(body.color_dark_bg, d.color_dark_bg),
    color_dark_text: sanitizeColor(body.color_dark_text, d.color_dark_text),
    color_header_bg: sanitizeColor(body.color_header_bg, d.color_header_bg),
    color_header_text: sanitizeColor(body.color_header_text, d.color_header_text),
    color_footer_bg: sanitizeColor(body.color_footer_bg, d.color_footer_bg),
    color_footer_text: sanitizeColor(body.color_footer_text, d.color_footer_text),
    color_work_bg: sanitizeColor(body.color_work_bg, d.color_work_bg),
    color_nfc_bg: sanitizeColor(body.color_nfc_bg, d.color_nfc_bg),
    color_contact_bg: sanitizeColor(body.color_contact_bg, d.color_contact_bg),
    nfc_page_bg: sanitizeColor(body.nfc_page_bg, d.nfc_page_bg),
    nfc_preview_bg: sanitizeColor(body.nfc_preview_bg, d.nfc_preview_bg),
    nfc_panel_bg: sanitizeColor(body.nfc_panel_bg, d.nfc_panel_bg),
    nfc_page_ink: sanitizeColor(body.nfc_page_ink, d.nfc_page_ink),
    nfc_page_tagline: cleanText(body.nfc_page_tagline, d.nfc_page_tagline),
    nfc_page_title_prefix: cleanText(body.nfc_page_title_prefix, d.nfc_page_title_prefix),
    nfc_page_title_em: cleanText(body.nfc_page_title_em, d.nfc_page_title_em),
    nfc_page_subtitle: cleanText(body.nfc_page_subtitle, d.nfc_page_subtitle),
    nfc_page_footer_tagline: cleanText(body.nfc_page_footer_tagline, d.nfc_page_footer_tagline),
    nfc_finishes_json: normalizeNfcFinishes(body.nfc_finishes_json),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('site_settings')
    .upsert(updateRow, { onConflict: 'id' });

  if (error) {
    console.error('[api/admin/settings] Save failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/testimonials');
  revalidatePath('/nfc');
  return Response.json({ ok: true, settings: updateRow });
}
