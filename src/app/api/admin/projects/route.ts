import { revalidatePath } from 'next/cache';
import { projects as defaultProjects } from '@/data/projects';
import { requireAdminSession } from '@/lib/cms';
import { mapDbProjectToProject, type CmsProject, type DbProjectRow } from '@/lib/cms-types';

function slugifyId(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await requireAdminSession();
  if (!user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!isAdmin) {
    return Response.json({ error: 'Admin access denied.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | ({ action?: string } & Partial<CmsProject>)
    | null;
  if (!body) {
    return Response.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  if (body.action === 'seed') {
    const seedRows = defaultProjects.map((project, index) => ({
      id: project.id,
      kind: project.kind,
      client: project.client,
      title: project.title,
      subtitle: project.subtitle,
      category: project.category,
      tags: project.tags,
      description: project.description,
      cover_image: project.coverImage ?? null,
      challenge: project.challenge ?? null,
      solution: project.solution ?? null,
      deliverables: project.deliverables ?? [],
      metrics: project.metrics ?? [],
      external_url: project.externalUrl ?? null,
      external_label: project.externalLabel ?? null,
      badge: project.badge,
      year: project.year,
      accent: project.accent,
      mockup_type: project.mockupType,
      sort_order: index + 1,
      is_published: true,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('cms_projects')
      .upsert(seedRows, { onConflict: 'id' })
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/');
    return Response.json({
      ok: true,
      projects: ((data ?? []) as DbProjectRow[]).map(mapDbProjectToProject),
    });
  }

  const client = String(body.client ?? '').trim();
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();

  if (!client || !title || !description) {
    return Response.json(
      { error: 'Client, title, and description are required.' },
      { status: 400 }
    );
  }

  const id = slugifyId(String(body.id || title || `project-${Date.now()}`)) || `project-${Date.now()}`;
  const row = {
    id,
    kind: body.kind === 'concept' ? 'concept' : 'client',
    client,
    title,
    subtitle: String(body.subtitle ?? '').trim(),
    category: String(body.category ?? 'DIGITAL / WEB ARCHITECTURE').trim(),
    tags: String(body.tags ?? '').trim(),
    description,
    cover_image: body.coverImage ? String(body.coverImage).trim() : null,
    challenge: body.challenge ? String(body.challenge).trim() : null,
    solution: body.solution ? String(body.solution).trim() : null,
    deliverables: Array.isArray(body.deliverables) ? body.deliverables.filter(Boolean) : [],
    metrics: Array.isArray(body.metrics)
      ? body.metrics.filter((m) => m && m.label && m.value)
      : [],
    external_url: body.externalUrl ? String(body.externalUrl).trim() : null,
    external_label: body.externalLabel ? String(body.externalLabel).trim() : null,
    badge: String(body.badge ?? 'LIVE CLIENT WEBSITE').trim(),
    year: String(body.year ?? String(new Date().getFullYear())).trim(),
    accent: String(body.accent ?? '#2CFF05').trim(),
    mockup_type: String(body.mockupType ?? 'pixpil').trim(),
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    is_published: body.is_published !== false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('cms_projects')
    .upsert(row, { onConflict: 'id' })
    .select('*')
    .single();

  if (error || !data) {
    return Response.json(
      { error: error?.message ?? 'Failed to save project.' },
      { status: 500 }
    );
  }

  revalidatePath('/');
  return Response.json({ ok: true, project: mapDbProjectToProject(data as DbProjectRow) });
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
  const id = searchParams.get('id')?.trim();
  if (!id) {
    return Response.json({ error: 'Missing project id.' }, { status: 400 });
  }

  const { error } = await supabase.from('cms_projects').delete().eq('id', id);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  return Response.json({ ok: true });
}

