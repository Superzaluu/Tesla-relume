-- Website content tables (Supabase project "Test Ruichi").
-- Applied 2026-11-12. Initial rows: ../seed.sql.
-- Read-only for the public (anon) role; edit content in the Supabase dashboard (Table Editor).

create table public.categories (
  id    text primary key,
  label text not null,
  sort  int  not null default 0
);
comment on table public.categories is 'Цэсний ангилал (Зорчигч тээвэр, Фургон ...). sort = дараалал.';

create table public.models (
  slug        text primary key,
  name        text not null,
  description text not null,
  quick_type  text check (quick_type in ('van','flatbed','flatbed4','box','refrigerator')),
  quick_label text,
  drive       text check (drive in ('FWD','RWD','AWD')),
  fuel        text,
  size        text,
  range       text,
  doors       text,
  door_label  text,
  charge      text,
  seats       text,
  payload     text,
  engine      text,
  updated_at  timestamptz not null default now()
);
comment on table public.models is 'Загвар бүрийн нэр, тайлбар, icon-той үзүүлэлтүүд (hero болон карт дээр). quick_type хоосон бол icon мөр харагдахгүй.';

create table public.model_stats (
  id         bigint generated always as identity primary key,
  model_slug text not null references public.models(slug) on update cascade on delete cascade,
  sort       int  not null,
  variant    text check (variant in ('cargo','passenger')),
  value      text not null,
  unit       text not null default '',
  label      text not null,
  note       int
);
create index model_stats_model_slug_idx on public.model_stats(model_slug, sort);
comment on table public.model_stats is 'Гол үзүүлэлтүүд (430 км ...). variant хоосон = бүх хувилбарт; ачааны/зорчигчийн ялгаатай бол ижил sort-той cargo, passenger 2 мөр.';

create table public.model_listings (
  key         text primary key,
  category_id text not null references public.categories(id) on update cascade on delete cascade,
  model_slug  text not null references public.models(slug) on update cascade on delete cascade,
  variant     text check (variant in ('cargo','passenger')),
  description text,
  sort        int  not null default 0,
  active      boolean not null default true
);
create index model_listings_category_idx on public.model_listings(category_id, sort);
create index model_listings_model_idx on public.model_listings(model_slug);
comment on table public.model_listings is 'Цэс, footer, "Бүх загвар" картад аль ангилалд аль загвар ямар дарааллаар гарах. active=false бол нуугдана.';

create table public.hero_slides (
  model_slug     text primary key references public.models(slug) on update cascade on delete cascade,
  sort           int  not null default 0,
  active         boolean not null default true,
  theme          text not null default 'light' check (theme in ('light','dark')),
  theme_sm       text check (theme_sm in ('light','dark')),
  sky            text not null default '#d7e4ec',
  eyebrow        text,
  subtitle       text,
  href           text,
  image_src      text not null,
  image_width    int  not null,
  image_height   int  not null,
  image_alt      text,
  image_position text,
  messages       text[]
);
comment on table public.hero_slides is 'Нүүр хуудасны hero слайд. eyebrow/subtitle/href хоосон бол ангилал, загварын тайлбар, загварын хуудас ашиглагдана.';

create table public.spec_rows (
  id         bigint generated always as identity primary key,
  model_slug text not null references public.models(slug) on update cascade on delete cascade,
  sort       int  not null,
  cells      text[] not null
);
create index spec_rows_model_slug_idx on public.spec_rows(model_slug, sort);
comment on table public.spec_rows is 'Техникийн үзүүлэлтийн хүснэгт. cells[1] = мөрийн нэр, бусад нь тохиргоо бүрийн утга. Утгагүй мөр = бүлгийн гарчиг, эхний утгатай мөр = толгой.';

-- Public read-only access.
alter table public.categories     enable row level security;
alter table public.models         enable row level security;
alter table public.model_stats    enable row level security;
alter table public.model_listings enable row level security;
alter table public.hero_slides    enable row level security;
alter table public.spec_rows      enable row level security;

create policy "Public read" on public.categories     for select to anon, authenticated using (true);
create policy "Public read" on public.models         for select to anon, authenticated using (true);
create policy "Public read" on public.model_stats    for select to anon, authenticated using (true);
create policy "Public read" on public.model_listings for select to anon, authenticated using (true);
create policy "Public read" on public.hero_slides    for select to anon, authenticated using (true);
create policy "Public read" on public.spec_rows      for select to anon, authenticated using (true);

revoke insert, update, delete, truncate on public.categories, public.models, public.model_stats, public.model_listings, public.hero_slides, public.spec_rows from anon;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger models_touch_updated_at before update on public.models
  for each row execute function public.touch_updated_at();
