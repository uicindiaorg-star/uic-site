import { requireAdminSession } from '@/lib/cms';

const ALLOWED_STATUS = new Set(['new', 'reviewed', 'archived']);

export async function PATCH(request: Request) {
  const { supabase, user, isAdmin } = await requireAdminSession();
  if (!user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!isAdmin) {
    return Response.json({ error: 'Admin access denied.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    id?: number;
    status?: string;
  } | null;

  if (!body || typeof body.id !== 'number' || !body.status || !ALLOWED_STATUS.has(body.status)) {
    return Response.json({ error: 'Valid inquiry id and status are required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('contact_inquiries')
    .update({ status: body.status })
    .eq('id', body.id)
    .select('*')
    .single();

  if (error || !data) {
    return Response.json(
      { error: error?.message ?? 'Failed to update inquiry.' },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, inquiry: data });
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
  const rawId = searchParams.get('id');
  const id = rawId ? Number(rawId) : NaN;
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: 'Valid inquiry id is required.' }, { status: 400 });
  }

  const { error } = await supabase.from('contact_inquiries').delete().eq('id', id);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

