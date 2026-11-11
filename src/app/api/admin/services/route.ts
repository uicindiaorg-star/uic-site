import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/cms';
import type { CmsService } from '@/lib/cms-types';

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

  const body = (await request.json().catch(() => null)) as Partial<CmsService> | null;
  if (!body) {
    return Response.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const number_label = String(body.number_label ?? '').trim();
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();
  const tags = String(body.tags ?? '').trim();

  if (!number_label || !title || !description) {
    return Response.json(
      { error: 'Number label, title, and description are required.' },
      { status: 400 }
    );
  }

  const payload = {
    number_label,
    title,
    description,
    tags,
    is_default_open: Boolean(body.is_default_open),
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    is_published: body.is_published !== false,
    updated_at: new Date().toISOString(),
  };

  const numericId = parseNumericId(body.id);
  const query = numericId
    ? supabase.from('cms_services').update(payload).eq('id', numericId).select('*').single()
    : supabase.from('cms_services').insert(payload).select('*').single();

  const { data, error } = await query;
  if (error || !data) {
    return Response.json(
      { error: error?.message ?? 'Failed to save service.' },
      { status: 500 }
    );
  }

  revalidatePath('/');
  return Response.json({ ok: true, service: data });
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
    return Response.json({ error: 'Valid numeric service id is required.' }, { status: 400 });
  }

  const { error } = await supabase.from('cms_services').delete().eq('id', numericId);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  return Response.json({ ok: true });
}

