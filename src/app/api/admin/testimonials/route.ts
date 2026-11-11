import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/cms';
import type { CmsTestimonial } from '@/lib/cms-types';

function parseNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'UC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await requireAdminSession();
  if (!user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!isAdmin) {
    return Response.json({ error: 'Admin access denied.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Partial<CmsTestimonial> | null;
  if (!body) {
    return Response.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const role = String(body.role ?? '').trim();
  const company = String(body.company ?? '').trim();
  const quote = String(body.quote ?? '').trim();
  const tag = String(body.tag ?? '').trim();
  const initials = String(body.initials ?? '').trim() || buildInitials(name);

  if (!name || !role || !company || !quote || !tag) {
    return Response.json(
      { error: 'Name, role, company, tag, and quote are required.' },
      { status: 400 }
    );
  }

  const payload = {
    name,
    role,
    company,
    quote,
    tag,
    initials: initials.slice(0, 3).toUpperCase(),
    avatar_url: body.avatar_url ? String(body.avatar_url).trim() : null,
    row_group: body.row_group === 2 ? 2 : 1,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    is_published: body.is_published !== false,
  };

  const numericId = parseNumericId(body.id);
  const query = numericId
    ? supabase.from('cms_testimonials').update(payload).eq('id', numericId).select('*').single()
    : supabase.from('cms_testimonials').insert(payload).select('*').single();

  const { data, error } = await query;
  if (error || !data) {
    return Response.json(
      { error: error?.message ?? 'Failed to save testimonial.' },
      { status: 500 }
    );
  }

  revalidatePath('/');
  revalidatePath('/testimonials');
  return Response.json({ ok: true, testimonial: data });
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
    return Response.json({ error: 'Valid numeric testimonial id is required.' }, { status: 400 });
  }

  const { error } = await supabase.from('cms_testimonials').delete().eq('id', numericId);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/testimonials');
  return Response.json({ ok: true });
}

