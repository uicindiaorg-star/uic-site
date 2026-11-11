import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/cms';
import type { CmsNfcStyle, NfcFontVariant, NfcLayoutVariant } from '@/lib/cms-types';

const VALID_LAYOUTS = new Set<NfcLayoutVariant>([
  'minimal',
  'orbit',
  'statement',
  'framed',
  'split',
  'grid',
]);
const VALID_FONTS = new Set<NfcFontVariant>(['sans', 'serif', 'mono']);
const HEX_RE = /^#[0-9a-f]{6}$/i;

function parseNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await requireAdminSession();
  if (!user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!isAdmin) {
    return Response.json({ error: 'Admin access denied.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Partial<CmsNfcStyle> | null;
  if (!body) {
    return Response.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  if (!name) {
    return Response.json({ error: 'Style name is required.' }, { status: 400 });
  }

  const rawLayout = String(body.layout_variant ?? 'minimal').trim() as NfcLayoutVariant;
  const layout_variant: NfcLayoutVariant = VALID_LAYOUTS.has(rawLayout) ? rawLayout : 'minimal';

  const rawFont = String(body.font_variant ?? 'sans').trim() as NfcFontVariant;
  const font_variant: NfcFontVariant = VALID_FONTS.has(rawFont) ? rawFont : 'sans';

  const rawBg = String(body.default_bg ?? '#222b28').trim();
  const rawInk = String(body.default_ink ?? '#e3ff97').trim();
  const default_bg = HEX_RE.test(rawBg) ? rawBg : '#222b28';
  const default_ink = HEX_RE.test(rawInk) ? rawInk : '#e3ff97';

  const rawRadius = Number(body.corner_radius);
  const corner_radius = Number.isFinite(rawRadius)
    ? Math.max(0, Math.min(32, Math.round(rawRadius)))
    : 16;

  const payload = {
    name,
    description: String(body.description ?? '').trim(),
    layout_variant,
    font_variant,
    default_bg,
    default_ink,
    corner_radius,
    card_footer_text: String(body.card_footer_text ?? 'A CONNECTION WORTH MAKING.').trim(),
    card_badge_text: String(body.card_badge_text ?? 'uic / connect').trim(),
    back_headline: String(body.back_headline ?? 'A little tap.\nA whole new connection.').trim(),
    back_footer_text: String(body.back_footer_text ?? 'HOLD NEAR AN NFC-ENABLED PHONE.').trim(),
    artwork_url: String(body.artwork_url ?? '').trim(),
    show_signal: body.show_signal !== false,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    is_published: body.is_published !== false,
    updated_at: new Date().toISOString(),
  };

  const numericId = parseNumericId(body.id);
  const query = numericId
    ? supabase.from('cms_nfc_styles').update(payload).eq('id', numericId).select('*').single()
    : supabase.from('cms_nfc_styles').insert(payload).select('*').single();

  const { data, error } = await query;
  if (error || !data) {
    return Response.json(
      { error: error?.message ?? 'Failed to save NFC card style.' },
      { status: 500 }
    );
  }

  revalidatePath('/nfc');
  revalidatePath('/admin');
  return Response.json({ ok: true, nfcStyle: data });
}

export async function DELETE(request: Request) {
  const { supabase, user, isAdmin } = await requireAdminSession();
  if (!user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!isAdmin) {
    return Response.json({ error: 'Admin access denied.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const numericId = parseNumericId(searchParams.get('id'));
  if (!numericId) {
    return Response.json({ error: 'Valid numeric style id is required.' }, { status: 400 });
  }

  const { error } = await supabase.from('cms_nfc_styles').delete().eq('id', numericId);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/nfc');
  revalidatePath('/admin');
  return Response.json({ ok: true });
}

