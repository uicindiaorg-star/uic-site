-- Add optional client avatar/photo URL to cms_testimonials
alter table public.cms_testimonials
  add column if not exists avatar_url text;

