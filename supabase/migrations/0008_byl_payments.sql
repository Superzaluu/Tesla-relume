-- Online deposit (урьдчилгаа) for pre-orders, paid through Byl checkout (https://byl.mn/docs/api).
--
-- Flow: /preorder/ creates a Byl checkout server-side and inserts the pre-order with
-- payment_status 'pending'. Only the signed Byl webhook (/api/byl/webhook/, service role)
-- may mark it 'verifying' or 'paid' — visitors can never insert a paid row.

-- Deposit per model; null = no online payment (the pre-order form works as before).
alter table public.models
  add column if not exists deposit_amount bigint check (deposit_amount is null or deposit_amount between 1000 and 100000000);
comment on column public.models.deposit_amount is 'Online pre-order deposit in MNT, paid via Byl. Null = no online payment.';

alter table public.preorders
  add column if not exists last_name       text check (last_name is null or char_length(last_name) between 1 and 80),
  add column if not exists email           text check (email is null or (char_length(email) <= 160 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  add column if not exists facebook        text check (facebook is null or char_length(facebook) <= 120),
  add column if not exists payment_status  text not null default 'none' check (payment_status in ('none', 'pending', 'verifying', 'paid', 'expired')),
  add column if not exists deposit_amount  bigint check (deposit_amount is null or deposit_amount > 0),
  add column if not exists byl_checkout_id bigint unique,
  add column if not exists byl_checkout_url text check (byl_checkout_url is null or byl_checkout_url like 'https://byl.mn/%'),
  add column if not exists paid_amount     numeric,
  add column if not exists paid_at         timestamptz;

-- Visitors may start a payment but never record one as made.
alter policy "Visitors send preorders" on public.preorders
  with check (status = 'new' and payment_status in ('none', 'pending') and paid_at is null and paid_amount is null);

-- Webhook deliveries already handled (Byl retries up to 8 times). Service role only.
create table if not exists public.byl_events (
  id          bigint primary key,
  type        text not null,
  received_at timestamptz not null default now()
);
alter table public.byl_events enable row level security;
revoke all on public.byl_events from anon, authenticated;

-- EC75 is the first model with an online deposit.
update public.models set deposit_amount = 1000000 where slug = 'ec75';
