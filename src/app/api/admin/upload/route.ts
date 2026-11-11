import { requireAdminSession } from '@/lib/cms';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await requireAdminSession();
  if (!user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!isAdmin) {
    return Response.json({ error: 'Admin access denied.' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const folder = String(formData.get('folder') ?? 'uploads').replace(/[^a-z0-9-_]/gi, '');

  if (!(file instanceof File)) {
    return Response.json({ error: 'No image file provided.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: 'Unsupported file type. Upload JPG, PNG, WebP, AVIF, or GIF.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: 'File exceeds the 5 MB upload limit.' },
      { status: 400 }
    );
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const safeBase = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40) || 'media';
  const path = `${folder || 'uploads'}/${Date.now()}-${safeBase}.${ext}`;

  const buffer = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from('cms-media')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('[api/admin/upload] Storage upload error:', uploadError.message);
    return Response.json(
      {
        error:
          uploadError.message.includes('Bucket not found')
            ? 'Storage bucket "cms-media" not found. Run 0002_create_cms_schema.sql in Supabase first.'
            : uploadError.message,
      },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from('cms-media')
    .getPublicUrl(path);

  return Response.json({ url: publicUrlData.publicUrl, path }, { status: 201 });
}

