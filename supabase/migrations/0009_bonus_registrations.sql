-- 100,000 ₮ bonus registrations from /register/ (reached from the savings calculator's "Бонус авах").
-- The bonus is NOT taken off the online deposit; the dealer deducts it from the final vehicle price.
-- A pre-order whose phone matches a registration gets bonus_amount, set by the server only
-- (service role), so the site can show "урьдчилгаа 1,000,000 + бонус 100,000 = нийт 1,100,000 ₮".

create table if not exists public.bonus_registrations (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  name             text not null check (char_length(name) between 2 and 80),
  phone            text not null check (phone ~ '^[0-9+ -]{8,20}$'),
  -- Last 8 digits, so "+976 9911 2233" and "99112233" match.
  phone_digits     text generated always as (right(regexp_replace(phone, '\D', '', 'g'), 8)) stored,
  facebook         text check (facebook is null or char_length(facebook) <= 200),
  models           text[] not null check (cardinality(models) between 1 and 4),
  calc_model       text check (calc_model is null or char_length(calc_model) <= 120),
  calc_compare     text check (calc_compare is null or char_length(calc_compare) <= 120),
  calc_consumption text check (calc_consumption is null or char_length(calc_consumption) <= 40),
  calc_distance    text check (calc_distance is null or char_length(calc_distance) <= 40),
  bonus_amount     bigint not null default 100000 check (bonus_amount = 100000),
  status           text not null default 'new' check (status in ('new', 'contacted', 'used'))
);
create index if not exists bonus_registrations_phone_idx on public.bonus_registrations (phone_digits);
create index if not exists bonus_registrations_created_idx on public.bonus_registrations (created_at desc);

alter table public.bonus_registrations enable row level security;
create policy "Visitors register for the bonus" on public.bonus_registrations
  for insert to anon, authenticated with check (status = 'new');
create policy "Admins read bonus registrations" on public.bonus_registrations
  for select to authenticated using ((select public.is_admin()));
create policy "Admins update bonus registrations" on public.bonus_registrations
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
revoke all on public.bonus_registrations from anon, authenticated;
grant insert on public.bonus_registrations to anon, authenticated;
grant select, update on public.bonus_registrations to authenticated;

-- Bonus credited to a pre-order (set by the server after matching the phone).
alter table public.preorders
  add column if not exists bonus_amount bigint check (bonus_amount is null or bonus_amount between 0 and 1000000);

alter policy "Visitors send preorders" on public.preorders
  with check (status = 'new' and payment_status in ('none', 'pending') and paid_at is null and paid_amount is null and bonus_amount is null);
