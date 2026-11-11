-- Fix public SELECT policies on cms_projects, cms_services, and cms_testimonials
-- Split anon/authenticated published read from admin draft read so anon never hits admin_users

drop policy if exists "Public can read published projects" on public.cms_projects;
create policy "Public can read published projects"
  on public.cms_projects
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Admins can read all projects" on public.cms_projects;
create policy "Admins can read all projects"
  on public.cms_projects
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "Public can read published services" on public.cms_services;
create policy "Public can read published services"
  on public.cms_services
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Admins can read all services" on public.cms_services;
create policy "Admins can read all services"
  on public.cms_services
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "Public can read published testimonials" on public.cms_testimonials;
create policy "Public can read published testimonials"
  on public.cms_testimonials
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Admins can read all testimonials" on public.cms_testimonials;
create policy "Admins can read all testimonials"
  on public.cms_testimonials
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

