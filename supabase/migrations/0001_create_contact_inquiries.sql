-- Migration: Create contact_inquiries table for website client contact form
-- Follows Supabase Postgres best practices & least-privilege RLS

create table if not exists public.contact_inquiries (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  service text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint contact_inquiries_name_len check (char_length(trim(name)) between 1 and 120),
  constraint contact_inquiries_email_len check (char_length(trim(email)) between 3 and 254),
  constraint contact_inquiries_service_len check (char_length(trim(service)) between 1 and 120),
  constraint contact_inquiries_message_len check (char_length(trim(message)) between 1 and 5000),
  constraint contact_inquiries_status_valid check (status in ('new', 'reviewed', 'archived'))
);

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);

alter table public.contact_inquiries enable row level security;

-- Least privilege: public visitors may only insert inquiries, never read/modify/delete them
revoke all on table public.contact_inquiries from anon, authenticated;
grant insert on table public.contact_inquiries to anon, authenticated;

drop policy if exists "Allow public contact form submissions" on public.contact_inquiries;
create policy "Allow public contact form submissions"
  on public.contact_inquiries
  for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) > 0
    and char_length(trim(email)) > 0
    and char_length(trim(message)) > 0
  );
