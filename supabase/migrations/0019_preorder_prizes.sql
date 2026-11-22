-- «Азын хүрд» prize per pre-order (user test #1, 2026-11-23, item 8). Set by the server only (service role) on the
-- first spin; the prize and code are an HMAC of the pre-order id (src/lib/voucher.ts), so a re-spin cannot change them.
-- Additive: safe to run before or after the deploy (the site works without these columns, in test mode).
alter table public.preorders
  add column if not exists prize_key text check (prize_key is null or prize_key in ('cash50', 'cash100', 'polish', 'keys')),
  add column if not exists prize_label text check (prize_label is null or char_length(prize_label) <= 80),
  add column if not exists voucher_code text check (voucher_code is null or voucher_code ~ '^RC-[0-9A-Z]{4}-[0-9A-Z]{4}$'),
  add column if not exists prize_at timestamptz,
  -- Ticked in /admin when the prize is handed over with the vehicle.
  add column if not exists prize_claimed_at timestamptz;

create unique index if not exists preorders_voucher_code_idx on public.preorders (voucher_code) where voucher_code is not null;
