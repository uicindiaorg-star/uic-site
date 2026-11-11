import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  service?: unknown;
  message?: unknown;
}

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return Response.json(
      { error: 'Contact service is not configured yet.' },
      { status: 503 }
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const service =
    typeof payload.service === 'string' && payload.service.trim()
      ? payload.service.trim()
      : 'Brand & identity';
  const message =
    typeof payload.message === 'string' ? payload.message.trim() : '';

  if (!name || name.length > 120) {
    return Response.json(
      { error: 'Please enter your name (up to 120 characters).' },
      { status: 400 }
    );
  }

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return Response.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  if (service.length > 120) {
    return Response.json(
      { error: 'Selected service value is too long.' },
      { status: 400 }
    );
  }

  if (!message || message.length > 5000) {
    return Response.json(
      { error: 'Please include a short message (up to 5000 characters).' },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('contact_inquiries')
    .insert({ name, email, service, message });

  if (error) {
    console.error('[api/contact] Supabase insert failed:', error.code, error.message);
    const errorMessage =
      error.code === 'PGRST205'
        ? 'Contact database table is not set up yet. Run 0001_create_contact_inquiries.sql in Supabase SQL Editor.'
        : error.message || 'Unable to send your inquiry right now. Please try again.';
    return Response.json({ error: errorMessage }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}

