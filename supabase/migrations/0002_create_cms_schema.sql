-- Migration: UIC Studio CMS schema, admin access control, and media storage
-- Run this in Supabase Dashboard -> SQL Editor after 0001_create_contact_inquiries.sql
-- 1. Admin allowlist (only users listed here can modify CMS data or read client inquiries)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on table public.admin_users
from anon;
grant select on table public.admin_users to authenticated;
drop policy if exists "Users can read own admin status" on public.admin_users;
create policy "Users can read own admin status" on public.admin_users for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
-- Grant admin SELECT / UPDATE / DELETE on contact_inquiries
grant select,
  update,
  delete on table public.contact_inquiries to authenticated;
drop policy if exists "Admins can view contact inquiries" on public.contact_inquiries;
create policy "Admins can view contact inquiries" on public.contact_inquiries for
select to authenticated using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can update contact inquiries" on public.contact_inquiries;
create policy "Admins can update contact inquiries" on public.contact_inquiries for
update to authenticated using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can delete contact inquiries" on public.contact_inquiries;
create policy "Admins can delete contact inquiries" on public.contact_inquiries for delete to authenticated using (
  exists (
    select 1
    from public.admin_users a
    where a.user_id = (
        select auth.uid()
      )
  )
);
-- 2. Global Site Copy & Settings
create table if not exists public.site_settings (
  id text primary key default 'default',
  hero_kicker text not null default 'Unique Identity Craft',
  hero_headline text not null default 'Forging digital presence that',
  hero_highlight text not null default 'refuses to be overlooked.',
  hero_copy text not null default 'Independent creative studio building memorable identities, high-conversion digital experiences, and contactless NFC systems for ambitious companies.',
  hero_image_url text not null default '/images/hero-noir-figure.jpg',
  studio_kicker text not null default 'STRATEGY MEETS SOUL.',
  studio_headline_prefix text not null default 'Good businesses deserve',
  studio_headline_em text not null default 'an identity of their own.',
  studio_p1 text not null default 'Not another logo. Not another website. A considered presence that connects who you are with where you want to go.',
  studio_p2 text not null default 'We’re UIC. A creative and technology studio bringing brands, digital experiences and business systems together — with intention, craft and a little audacity.',
  nfc_eyebrow text not null default 'UIC CONNECT',
  nfc_headline_prefix text not null default 'Your next connection is',
  nfc_headline_em text not null default 'one tap away.',
  nfc_copy text not null default 'A beautifully crafted NFC card. A personal digital profile. A seamless way to share your world — without an app.',
  contact_kicker text not null default 'START WITH A CONVERSATION.',
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
grant select on table public.site_settings to anon,
  authenticated;
grant insert,
  update,
  delete on table public.site_settings to authenticated;
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings for
select to anon,
  authenticated using (true);
drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings" on public.site_settings for all to authenticated using (
  exists (
    select 1
    from public.admin_users a
    where a.user_id = (
        select auth.uid()
      )
  )
) with check (
  exists (
    select 1
    from public.admin_users a
    where a.user_id = (
        select auth.uid()
      )
  )
);
insert into public.site_settings (id)
values ('default') on conflict (id) do nothing;
-- 3. Portfolio Projects
create table if not exists public.cms_projects (
  id text primary key,
  kind text not null default 'client' check (kind in ('client', 'concept')),
  client text not null,
  title text not null,
  subtitle text not null default '',
  category text not null default 'DIGITAL / WEB ARCHITECTURE',
  tags text not null default '',
  description text not null,
  cover_image text,
  challenge text,
  solution text,
  deliverables jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '[]'::jsonb,
  external_url text,
  external_label text,
  badge text not null default 'LIVE CLIENT WEBSITE',
  year text not null default '2025',
  accent text not null default '#2CFF05',
  mockup_type text not null default 'pixpil',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists cms_projects_sort_idx on public.cms_projects (sort_order asc, id asc);
alter table public.cms_projects enable row level security;
grant select on table public.cms_projects to anon,
  authenticated;
grant insert,
  update,
  delete on table public.cms_projects to authenticated;
drop policy if exists "Public can read published projects" on public.cms_projects;
create policy "Public can read published projects" on public.cms_projects for
select to anon,
  authenticated using (is_published = true);

drop policy if exists "Admins can read all projects" on public.cms_projects;
create policy "Admins can read all projects" on public.cms_projects for
select to authenticated using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can insert projects" on public.cms_projects;
create policy "Admins can insert projects" on public.cms_projects for
insert to authenticated with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can update projects" on public.cms_projects;
create policy "Admins can update projects" on public.cms_projects for
update to authenticated using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can delete projects" on public.cms_projects;
create policy "Admins can delete projects" on public.cms_projects for delete to authenticated using (
  exists (
    select 1
    from public.admin_users a
    where a.user_id = (
        select auth.uid()
      )
  )
);
-- 4. Services Accordion Items
create table if not exists public.cms_services (
  id bigint generated always as identity primary key,
  number_label text not null,
  title text not null,
  description text not null,
  tags text not null,
  is_default_open boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists cms_services_sort_idx on public.cms_services (sort_order asc, id asc);
alter table public.cms_services enable row level security;
grant select on table public.cms_services to anon,
  authenticated;
grant insert,
  update,
  delete on table public.cms_services to authenticated;
drop policy if exists "Public can read published services" on public.cms_services;
create policy "Public can read published services" on public.cms_services for
select to anon,
  authenticated using (is_published = true);

drop policy if exists "Admins can read all services" on public.cms_services;
create policy "Admins can read all services" on public.cms_services for
select to authenticated using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can insert services" on public.cms_services;
create policy "Admins can insert services" on public.cms_services for
insert to authenticated with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can update services" on public.cms_services;
create policy "Admins can update services" on public.cms_services for
update to authenticated using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can delete services" on public.cms_services;
create policy "Admins can delete services" on public.cms_services for delete to authenticated using (
  exists (
    select 1
    from public.admin_users a
    where a.user_id = (
        select auth.uid()
      )
  )
);
-- 5. Client Testimonials
create table if not exists public.cms_testimonials (
  id bigint generated always as identity primary key,
  name text not null,
  role text not null,
  company text not null,
  quote text not null,
  tag text not null,
  initials text not null,
  avatar_url text,
  row_group integer not null default 1 check (row_group in (1, 2)),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists cms_testimonials_sort_idx on public.cms_testimonials (row_group asc, sort_order asc, id asc);
alter table public.cms_testimonials enable row level security;
grant select on table public.cms_testimonials to anon,
  authenticated;
grant insert,
  update,
  delete on table public.cms_testimonials to authenticated;
drop policy if exists "Public can read published testimonials" on public.cms_testimonials;
create policy "Public can read published testimonials" on public.cms_testimonials for
select to anon,
  authenticated using (is_published = true);

drop policy if exists "Admins can read all testimonials" on public.cms_testimonials;
create policy "Admins can read all testimonials" on public.cms_testimonials for
select to authenticated using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can insert testimonials" on public.cms_testimonials;
create policy "Admins can insert testimonials" on public.cms_testimonials for
insert to authenticated with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can update testimonials" on public.cms_testimonials;
create policy "Admins can update testimonials" on public.cms_testimonials for
update to authenticated using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can delete testimonials" on public.cms_testimonials;
create policy "Admins can delete testimonials" on public.cms_testimonials for delete to authenticated using (
  exists (
    select 1
    from public.admin_users a
    where a.user_id = (
        select auth.uid()
      )
  )
);
-- 6. Storage Bucket for CMS Media Uploads (Hero image, project covers, assets)
insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true) on conflict (id) do
update
set public = true;
drop policy if exists "Public can view cms media" on storage.objects;
create policy "Public can view cms media" on storage.objects for
select to anon,
  authenticated using (bucket_id = 'cms-media');
drop policy if exists "Admins can upload cms media" on storage.objects;
create policy "Admins can upload cms media" on storage.objects for
insert to authenticated with check (
    bucket_id = 'cms-media'
    and exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can update cms media" on storage.objects;
create policy "Admins can update cms media" on storage.objects for
update to authenticated using (
    bucket_id = 'cms-media'
    and exists (
      select 1
      from public.admin_users a
      where a.user_id = (
          select auth.uid()
        )
    )
  );
drop policy if exists "Admins can delete cms media" on storage.objects;
create policy "Admins can delete cms media" on storage.objects for delete to authenticated using (
  bucket_id = 'cms-media'
  and exists (
    select 1
    from public.admin_users a
    where a.user_id = (
        select auth.uid()
      )
  )
);
-- 7. Seed default Services & Testimonials once if empty
insert into public.cms_services (
    number_label,
    title,
    description,
    tags,
    is_default_open,
    sort_order
  )
select *
from (
    values (
        '01',
        'Brand & identity',
        'A clear story. A distinctive visual language. An identity that feels unmistakably yours.',
        'STRATEGY · NAMING · VISUAL IDENTITY · BRAND GUIDELINES',
        true,
        1
      ),
      (
        '02',
        'Websites & experiences',
        'Fast, intuitive digital spaces that make your brand tangible and turn interest into action.',
        'UX/UI · DEVELOPMENT · E-COMMERCE · WEB APPLICATIONS',
        false,
        2
      ),
      (
        '03',
        'ERP & business systems',
        'Bring your operations together with useful tools, connected data and workflows built for your team.',
        'CUSTOM ERP · DASHBOARDS · INTEGRATIONS · AUTOMATION',
        false,
        3
      ),
      (
        '04',
        'NFC & connected products',
        'Bridge the physical and digital with a simple tap — from smart business cards to product experiences.',
        'NFC CARDS · DIGITAL PROFILES · SMART TOUCHPOINTS',
        false,
        4
      )
  ) as v(
    number_label,
    title,
    description,
    tags,
    is_default_open,
    sort_order
  )
where not exists (
    select 1
    from public.cms_services
  );
insert into public.cms_testimonials (
    name,
    role,
    company,
    quote,
    tag,
    initials,
    row_group,
    sort_order
  )
select *
from (
    values (
        'Elena Rostova',
        'Design Director',
        'Pixpil Design (Shanghai)',
        'UIC engineered an ultra-refined editorial architecture that elevated how brand leaders discover our BX framework.',
        'Web Architecture',
        'ER',
        1,
        1
      ),
      (
        'Arjun Menon',
        'Founder & CEO',
        'Dafy Mobility',
        'The 3-tap booking flow eliminated customer churn during peak hours. Our driver dispatch scaled 10x in 6 months.',
        'Mobility Platform',
        'AM',
        1,
        2
      ),
      (
        'Kavya Pillai',
        'Brand Partner',
        'Luv Cutlet QSR',
        'From 3-wheeler street food heritage to institutional international funding. The digital presence captured our identity.',
        'QSR Brand Experience',
        'KP',
        1,
        3
      ),
      (
        'Marcus Vance',
        'Principal Architect',
        'Forma Space Studio',
        'Rare to find a studio that treats digital negative space with the same sculptural reverence as physical limestone.',
        'Architectural Identity',
        'MV',
        1,
        4
      ),
      (
        'Sarah Chen',
        'Head of Product',
        'Connect Ecosystem',
        'The contactless handshake protocol and instant mobile profile fallback made physical introductions effortless.',
        'NFC Connected Lab',
        'SC',
        1,
        5
      ),
      (
        'Vikramaditya Nair',
        'VP Operations',
        'Flow Intelligence',
        'Unified our telemetry and multi-warehouse operations into a calm, focused executive workspace.',
        'Systems Intelligence',
        'VN',
        1,
        6
      ),
      (
        'Sophie Martin',
        'Creative Technologist',
        'Studio Aether (Paris)',
        'The motion pacing is dialed to perfection. Every micro-interaction feels deliberate, weighted, and remarkably fluid.',
        'Motion & Pacing',
        'SM',
        2,
        1
      ),
      (
        'Devon Archer',
        'Brand Strategy Lead',
        'Koco Treat',
        'The visual storytelling bridged our street-to-store retail expansion effortlessly. Customers instantly trusted the brand.',
        'Retail Expansion',
        'DA',
        2,
        2
      ),
      (
        'Tanya Deshmukh',
        'Design Operations',
        'Archetype Studio',
        'UIC understands that bold editorial craft and commercial conversion aren’t enemies. They made both sing.',
        'Digital Strategy',
        'TD',
        2,
        3
      ),
      (
        'Kenji Takahashi',
        'Managing Director',
        'Vertex Tokyo',
        'Our European and Asian enterprise partners remarked that the identity felt distinctly ahead of the curve.',
        'Global Presence',
        'KT',
        2,
        4
      ),
      (
        'Rohan Varma',
        'Hardware Engineer',
        'Touchpoint Labs',
        'The tactile card and instant web handshake completely replaced conventional business cards for our executive team.',
        'Contactless Hardware',
        'RV',
        2,
        5
      ),
      (
        'Maya Lindqvist',
        'VP Brand Experience',
        'Nordic Modern',
        'Subtle, confident, and utterly free of generic agency fluff. Working with UIC felt like a masterclass in modern digital craft.',
        'Brand Experience',
        'ML',
        2,
        6
      )
  ) as v(
    name,
    role,
    company,
    quote,
    tag,
    initials,
    row_group,
    sort_order
  )
where not exists (
    select 1
    from public.cms_testimonials
  );
-- AFTER creating your admin account in Supabase Auth -> Users, promote them with:
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where email = 'your-admin@email.com';