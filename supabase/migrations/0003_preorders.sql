-- Pre-orders sent from /preorder/. Visitors may only add a new request; they can
-- never read requests (their own or anyone else's). Admins read them and set the status in /admin/preorders/.

create table public.preorders (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  model_slug text not null check (char_length(model_slug) between 1 and 80),
  model_name text not null check (char_length(model_name) between 1 and 120),
  variant    text check (variant in ('cargo', 'passenger')),
  name       text not null check (char_length(name) between 2 and 80),
  phone      text not null check (phone ~ '^[0-9+ -]{8,20}$'),
  payment    text not null check (payment in ('cash', 'green_loan', 'leasing')),
  note       text check (char_length(note) <= 1000),
  status     text not null default 'new' check (status in ('new', 'contacted', 'closed'))
);
create index preorders_created_at_idx on public.preorders (created_at desc);

alter table public.preorders enable row level security;

-- Visitors: insert only, and only as a new request.
create policy "Visitors send preorders" on public.preorders
  for insert to anon, authenticated with check (status = 'new');
-- Admins: read and change the status.
create policy "Admins read preorders" on public.preorders
  for select to authenticated using ((select public.is_admin()));
create policy "Admins update preorders" on public.preorders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

revoke all on public.preorders from anon, authenticated;
grant insert on public.preorders to anon, authenticated;
grant select, update on public.preorders to authenticated;
