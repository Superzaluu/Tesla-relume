-- /admin editing. Applied to "Test Ruichi" on 2026-11-12 (migrations admin_write_access,
-- models_inline_stats_spec_and_images, is_admin_security_invoker).
-- Rows are never deleted from /admin: cards and slides are hidden with active = false.

-- Admin users (Supabase Auth) who may edit the website content.
create table public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
create policy "Admins see themselves" on public.admins for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.admins from anon;

create or replace function public.is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Insert/update: only admins.
do $$
declare t text;
begin
  foreach t in array array['categories','models','model_stats','model_listings','hero_slides','spec_rows'] loop
    execute format('create policy "Admin insert" on public.%I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format('create policy "Admin update" on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('grant select, insert, update on public.%I to authenticated', t);
  end loop;
end $$;

-- A model's stats and spec table live on the model row (edited as one unit in /admin),
-- plus an optional page photo for models added in /admin.
alter table public.models
  add column stats        jsonb not null default '[]'::jsonb,
  add column spec         jsonb,
  add column tagline      text,
  add column image_src    text,
  add column image_width  int,
  add column image_height int;
alter table public.model_listings add column thumb text;
-- (Data copied from model_stats / spec_rows, which are no longer read by the site.)

-- Public image bucket for photos uploaded in /admin (max 4 MB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 4194304, array['image/jpeg', 'image/png', 'image/webp']);
create policy "Admins upload site images" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and (select public.is_admin()));

------------------------------------------------------------------------------
-- Optional clean-up, run by hand in Supabase → SQL Editor (contains DROP/DELETE,
-- which the Claude connection may not run):
------------------------------------------------------------------------------
-- drop policy if exists "temp seed insert" on public.categories;
-- drop policy if exists "temp seed insert" on public.models;
-- drop policy if exists "temp seed insert" on public.model_stats;
-- drop policy if exists "temp seed insert" on public.model_listings;
-- drop policy if exists "temp seed insert" on public.hero_slides;
-- drop policy if exists "temp seed insert" on public.spec_rows;
-- drop table public.model_stats;
-- drop table public.spec_rows;
-- delete from public.model_listings where key = 'zz-test';
-- delete from public.models where slug = 'zz-test';
-- delete from auth.users where email = 'claude-test-admin@example.com';
