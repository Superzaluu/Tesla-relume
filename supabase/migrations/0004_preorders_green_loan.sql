-- Green loan requests from /green-loan/ go to the same inbox as pre-orders
-- (payment = 'green_loan', source = 'green_loan') with the calculator values.

alter table public.preorders
  add column source          text not null default 'preorder' check (source in ('preorder', 'green_loan')),
  add column income_type     text check (income_type in ('salary', 'business')),
  add column vehicle_price   bigint check (vehicle_price > 0 and vehicle_price <= 2000000000),
  add column down_payment    bigint check (down_payment >= 0),
  add column term_months     int check (term_months between 1 and 96),
  add column monthly_payment bigint check (monthly_payment >= 0);
