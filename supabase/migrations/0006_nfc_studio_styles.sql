-- Full /nfc Card Studio customization: dynamic card styles (add/edit/remove) + /nfc page design & swatches

create table if not exists public.cms_nfc_styles (
  id bigint generated always as identity primary key,
  name text not null,
  description text not null default '',
  layout_variant text not null default 'orbit',
  font_variant text not null default 'sans',
  default_bg text not null default '#222b28',
  default_ink text not null default '#e3ff97',
  corner_radius integer not null default 16,
  card_footer_text text not null default 'A CONNECTION WORTH MAKING.',
  card_badge_text text not null default 'uic / connect',
  back_headline text not null default E'A little tap.\nA whole new connection.',
  back_footer_text text not null default 'HOLD NEAR AN NFC-ENABLED PHONE.',
  artwork_url text not null default '',
  show_signal boolean not null default true,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cms_nfc_styles_published_order
  on public.cms_nfc_styles (is_published, sort_order, id);

alter table public.cms_nfc_styles enable row level security;

drop policy if exists "Public can read published nfc styles" on public.cms_nfc_styles;
create policy "Public can read published nfc styles"
  on public.cms_nfc_styles
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Admins can read all nfc styles" on public.cms_nfc_styles;
create policy "Admins can read all nfc styles"
  on public.cms_nfc_styles
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "Admins can insert nfc styles" on public.cms_nfc_styles;
create policy "Admins can insert nfc styles"
  on public.cms_nfc_styles
  for insert
  to authenticated
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "Admins can update nfc styles" on public.cms_nfc_styles;
create policy "Admins can update nfc styles"
  on public.cms_nfc_styles
  for update
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "Admins can delete nfc styles" on public.cms_nfc_styles;
create policy "Admins can delete nfc styles"
  on public.cms_nfc_styles
  for delete
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

insert into public.cms_nfc_styles (
  name,
  description,
  layout_variant,
  font_variant,
  default_bg,
  default_ink,
  corner_radius,
  card_footer_text,
  card_badge_text,
  back_headline,
  back_footer_text,
  artwork_url,
  show_signal,
  sort_order,
  is_published
)
select * from (
  values
    (
      'Minimal',
      'Clean architectural face with balanced hierarchy.',
      'minimal',
      'sans',
      '#222b28',
      '#e3ff97',
      16,
      'A CONNECTION WORTH MAKING.',
      'uic / connect',
      E'A little tap.\nA whole new connection.',
      'HOLD NEAR AN NFC-ENABLED PHONE.',
      '',
      true,
      1,
      true
    ),
    (
      'Orbit',
      'Signature concentric radar geometry on front face.',
      'orbit',
      'sans',
      '#222b28',
      '#e3ff97',
      16,
      'A CONNECTION WORTH MAKING.',
      'uic / connect',
      E'A little tap.\nA whole new connection.',
      'HOLD NEAR AN NFC-ENABLED PHONE.',
      '',
      true,
      2,
      true
    ),
    (
      'Statement',
      'Editorial serif typography with oversized monogram mark.',
      'statement',
      'serif',
      '#121614',
      '#ede7dc',
      16,
      'A CONNECTION WORTH MAKING.',
      'uic / connect',
      E'A little tap.\nA whole new connection.',
      'HOLD NEAR AN NFC-ENABLED PHONE.',
      '',
      true,
      3,
      true
    )
) as seed (
  name,
  description,
  layout_variant,
  font_variant,
  default_bg,
  default_ink,
  corner_radius,
  card_footer_text,
  card_badge_text,
  back_headline,
  back_footer_text,
  artwork_url,
  show_signal,
  sort_order,
  is_published
)
where not exists (select 1 from public.cms_nfc_styles);

alter table public.site_settings
  add column if not exists nfc_page_bg text not null default '#f4f3ee',
  add column if not exists nfc_preview_bg text not null default '#e3e8da',
  add column if not exists nfc_panel_bg text not null default '#fffefa',
  add column if not exists nfc_page_ink text not null default '#242c27',
  add column if not exists nfc_page_tagline text not null default 'CONNECT / A BETTER HELLO',
  add column if not exists nfc_page_title_prefix text not null default 'Small card.',
  add column if not exists nfc_page_title_em text not null default 'Big first impression.',
  add column if not exists nfc_page_subtitle text not null default 'Make it yours. Give it a spin. See what a single tap can do.',
  add column if not exists nfc_page_footer_tagline text not null default 'UNIQUE IDENTITY. EVERY CONNECTION.',
  add column if not exists nfc_finishes_json jsonb not null default '[{"name":"Midnight","background":"#222b28","ink":"#e3ff97"},{"name":"Lime","background":"#2CFF05","ink":"#0A0C0E"},{"name":"Bone","background":"#ede9df","ink":"#203027"},{"name":"Obsidian","background":"#121614","ink":"#ede7dc"}]'::jsonb;

